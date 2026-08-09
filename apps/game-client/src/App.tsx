import { useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { RunnerEngine } from './game/RunnerEngine';
import { InputController } from './game/InputController';
import { triggerHaptic, triggerHitStop, triggerScreenShake } from './game/GameFeel';
import { useAppStore } from './state/appStore';
import { useRunStore } from './state/runStore';
import { Toast } from './ui/Toast';
import { OrientationLock } from './ui/OrientationLock';
import { api } from './services/api';
import { enqueueRun, flushRunQueue } from './services/offlineQueue';
import { DebugUiPage } from './screens/DebugUiPage';
import { RunnerHUDLive } from './screens/RunnerHUDLive';
import {
  TechPreloadScreen,
  IntroCinematicScreen,
  HomeHubScreen,
  OnboardingOverlay,
  PauseMenu,
  GameOverScreen,
  ReviveModal,
  MissionsScreen,
  LeaderboardScreen,
  ShopScreen,
  DailySpinScreen,
  SettingsScreen,
  CharacterSelectScreen,
  HelpScreen,
  OfflineScreen,
} from './screens';
import { hasSeenIntroThisSession } from './screens/IntroCinematicScreen';
import { SceneErrorBoundary } from './ui/SceneErrorBoundary';

/** Three.js/R3F loads on demand so the cinematic boot sequence is not blocked by it. */
const RunnerScene = lazy(() =>
  import('./game/RunnerScene').then((m) => ({ default: m.RunnerScene })),
);

export default function App() {
  const screen = useAppStore((s) => s.screen);
  const overlay = useAppStore((s) => s.overlay);
  const player = useAppStore((s) => s.player);
  const toast = useAppStore((s) => s.toast);
  const pendingRevive = useAppStore((s) => s.pendingRevive);
  const runNonce = useAppStore((s) => s.runNonce);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const vibrationOn = useAppStore((s) => s.vibrationOn);
  const bootstrap = useAppStore((s) => s.bootstrap);
  const setScreen = useAppStore((s) => s.setScreen);
  const setLastRun = useAppStore((s) => s.setLastRun);
  const setPlayer = useAppStore((s) => s.setPlayer);
  const setMissions = useAppStore((s) => s.setMissions);
  const refresh = useAppStore((s) => s.refresh);
  const clearPendingRevive = useAppStore((s) => s.clearPendingRevive);
  const resetHud = useRunStore((s) => s.reset);

  const engineRef = useRef<RunnerEngine | null>(null);
  const inputRef = useRef<InputController | null>(null);
  const gestureRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const submittingRef = useRef(false);
  const deathHandledRef = useRef(false);
  const prevScreenRef = useRef(screen);
  const lastHudPush = useRef(0);
  const lastHitRef = useRef(0);

  const finishRun = useCallback(
    async (goGameOver: boolean) => {
      if (submittingRef.current || !engineRef.current) return;
      submittingRef.current = true;
      const engine = engineRef.current;
      const payload = {
        ...engine.score.snapshot(),
        revivesUsed: useAppStore.getState().revivesUsedThisRun,
        clothesCollected: engine.clothes,
        weaponsCollected: engine.weapons,
        politiciansCleared: engine.politiciansCleared,
      };
      const p = useAppStore.getState().player;
      const isRecord = (p?.bestScore ?? 0) < payload.score;
      setLastRun({
        score: payload.score,
        multiplier: payload.multiplierMax,
        coins: payload.coinsEarned,
        picaPollo: payload.picaPolloCollected,
        distance: payload.distanceMeters,
        isRecord,
      });

      try {
        const result = await api.submitRun(payload);
        setPlayer(result.player);
        setMissions(result.missions ?? []);
      } catch {
        enqueueRun(payload);
        useAppStore.getState().commitRunToWallet({
          score: payload.score,
          multiplier: payload.multiplierMax,
          sessionCoins: payload.coinsEarned,
          picaPollo: payload.picaPolloCollected,
          skateCharges: engine.skateCharges,
        });
      }

      if (goGameOver) setScreen('gameover');
      submittingRef.current = false;
    },
    [setLastRun, setMissions, setPlayer, setScreen],
  );

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    if (location.hash === '#debug') {
      setScreen('debug');
      return;
    }
    void bootstrap().then(() => flushRunQueue());
  }, [bootstrap, setScreen]);

  useEffect(() => {
    const onOnline = () => {
      void flushRunQueue().then(() => refresh());
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [refresh]);

  const lastNonce = useRef(0);
  useEffect(() => {
    if (runNonce === lastNonce.current) return;
    lastNonce.current = runNonce;
    engineRef.current = new RunnerEngine(player?.skateboardCharges ?? 8);
    deathHandledRef.current = false;
    resetHud();
  }, [runNonce, player?.skateboardCharges, resetHud]);

  useEffect(() => {
    const prev = prevScreenRef.current;
    prevScreenRef.current = screen;

    if (screen === 'runner') {
      deathHandledRef.current = false;
      if (pendingRevive && engineRef.current) {
        engineRef.current.revive();
        clearPendingRevive();
        useAppStore.getState().bumpRevive();
      } else if (
        !engineRef.current ||
        prev === 'home' ||
        prev === 'gameover' ||
        prev === 'onboarding' ||
        prev === 'splash'
      ) {
        engineRef.current = new RunnerEngine(player?.skateboardCharges ?? 8);
        useAppStore.getState().resetRunMeta();
        resetHud();
      }
      if (engineRef.current) engineRef.current.paused = false;
    }

    if (screen === 'pause' && engineRef.current) {
      engineRef.current.paused = true;
    }

    if (screen === 'home' && prev === 'pause') {
      void finishRun(false);
      engineRef.current = null;
      resetHud();
    }
  }, [
    screen,
    pendingRevive,
    player?.skateboardCharges,
    clearPendingRevive,
    finishRun,
    resetHud,
  ]);

  useEffect(() => {
    if (screen !== 'runner' && screen !== 'pause') return;
    if (!engineRef.current) {
      engineRef.current = new RunnerEngine(player?.skateboardCharges ?? 8);
    }
    const engine = engineRef.current;
    engine.paused = screen === 'pause' || overlay === 'revive';

    if (!inputRef.current) inputRef.current = new InputController();
    const host = gestureRef.current;
    if (host && screen === 'runner') inputRef.current.attach(host);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (screen === 'runner') {
        const g = inputRef.current?.consume() ?? null;
        engine.applyGesture(g, now);
      }
      const next = engine.tick(dt, now);

      if (now - lastHudPush.current > 66) {
        lastHudPush.current = now;
        useRunStore.getState().setFromEngine({
          score: next.score.score,
          multiplier: next.score.multiplier,
          coins: next.score.coins,
          picaPollo: next.score.picaPollo,
          bananas: next.score.bananas,
          distance: Math.floor(next.score.distance),
          skateCharges: next.skateCharges,
          sliding: next.sliding,
          jumping: next.jumping,
          skating: next.skating,
          dead: next.dead,
          health: next.health,
          maxHealth: next.maxHealth,
          lastHitAt: next.lastHitAt,
          x: next.x,
          y: next.y,
          z: next.z,
          entities: next.entities.map((e) => ({ ...e })),
          clothes: next.clothes,
          weapons: next.weapons,
          politiciansCleared: next.politiciansCleared,
          canEliminate: next.canEliminate,
          nearestLabel: next.nearestPolitician?.label ?? null,
        });
      }

      if (next.lastHitAt && next.lastHitAt !== lastHitRef.current) {
        lastHitRef.current = next.lastHitAt;
        if (!next.dead) {
          triggerScreenShake(shellRef.current, reduceMotion);
          triggerHaptic(vibrationOn, 25);
        }
      }

      if (next.dead && !deathHandledRef.current) {
        deathHandledRef.current = true;
        triggerScreenShake(shellRef.current, reduceMotion);
        triggerHaptic(vibrationOn, [30, 40, 30]);
        void triggerHitStop(reduceMotion ? 0 : 70).then(() => finishRun(true));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      inputRef.current?.detach();
    };
  }, [screen, overlay, player?.skateboardCharges, finishRun, reduceMotion, vibrationOn]);

  const onEliminate = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    const ok = eng.eliminateNearest();
    if (ok) {
      triggerHaptic(vibrationOn, 25);
      useAppStore.getState().showToast('¡Vía libre!');
    }
  }, [vibrationOn]);

  const goPostBoot = useCallback(() => {
    const p = useAppStore.getState().player;
    if (!hasSeenIntroThisSession()) {
      setScreen('intro');
      return;
    }
    if (!p?.onboardingSeen) setScreen('onboarding');
    else setScreen('home');
  }, [setScreen]);

  const onIntroDone = useCallback(() => {
    const p = useAppStore.getState().player;
    if (!p?.onboardingSeen) setScreen('onboarding');
    else setScreen('home');
  }, [setScreen]);

  const runMode = screen === 'runner' || screen === 'pause' || overlay === 'revive';
  const show3d =
    screen === 'runner' ||
    screen === 'pause' ||
    screen === 'gameover' ||
    overlay === 'revive';

  return (
    <div className="app-frame">
      <div className="app-shell" ref={shellRef}>
        <SceneErrorBoundary>
          <Suspense fallback={<div className="scene-layer scene-fallback" aria-hidden="true" />}>
            {show3d || screen === 'home' || screen === 'onboarding' ? (
              <RunnerScene
                mode={runMode ? 'run' : 'idle'}
                engineRef={engineRef}
              />
            ) : null}
          </Suspense>
        </SceneErrorBoundary>

        {screen === 'runner' ? (
          <div className="gesture-layer" ref={gestureRef} aria-hidden />
        ) : (
          <div ref={gestureRef} style={{ display: 'none' }} />
        )}

        <div className="ui-layer">
          {screen === 'splash' && <TechPreloadScreen onDone={goPostBoot} />}
          {screen === 'intro' && <IntroCinematicScreen onDone={onIntroDone} />}
          {screen === 'home' && <HomeHubScreen />}
          {screen === 'onboarding' && <OnboardingOverlay />}
          {screen === 'runner' && <RunnerHUDLive onEliminate={onEliminate} />}
          {screen === 'pause' && <PauseMenu />}
          {screen === 'gameover' && <GameOverScreen />}
          {screen === 'missions' && <MissionsScreen />}
          {screen === 'leaderboard' && <LeaderboardScreen />}
          {screen === 'shop' && <ShopScreen />}
          {screen === 'spin' && <DailySpinScreen />}
          {screen === 'settings' && <SettingsScreen />}
          {screen === 'characters' && <CharacterSelectScreen />}
          {screen === 'help' && <HelpScreen />}
          {screen === 'offline' && <OfflineScreen />}
          {screen === 'debug' && <DebugUiPage />}

          {overlay === 'onboarding' && <OnboardingOverlay />}
          {overlay === 'revive' && <ReviveModal />}
          {overlay === 'settings' && <SettingsScreen />}
        </div>

        <Toast message={toast} />
      </div>
      <OrientationLock />
    </div>
  );
}
