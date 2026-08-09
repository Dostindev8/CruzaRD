import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { sfx } from '../../audio/sfx';
import { api, ApiError } from '../../services/api';
import { useAppStore } from '../../state/appStore';
import { GameButton } from '../GameButton';
import { HudPanel } from '../HudPanel';
import {
  EXTRA_SPIN_PRICE,
  REWARDS_TABLE,
  RARITY_COLORS,
  SPIN_COOLDOWN_MS,
  SPIN_HISTORY_KEY,
  SPIN_LAST_KEY,
  type PrizeDef,
} from './rewards.config';
import { getWeightedRandomPrize } from './getWeightedRandomPrize';

const SEG = REWARDS_TABLE.length;
const SEG_DEG = 360 / SEG;
const CALLOUT_TO_MODAL_MS = 480;

function easeInQuad(t: number) {
  return t * t;
}
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

/** 3-phase spin curve: accel → cruise → long decelerate */
function spinProgress(u: number): number {
  if (u < 0.15) return easeInQuad(u / 0.15) * 0.18;
  if (u < 0.7) return 0.18 + ((u - 0.15) / 0.55) * 0.52;
  return 0.7 + easeOutQuint((u - 0.7) / 0.3) * 0.3;
}

function canFreeSpin(): boolean {
  try {
    const last = Number(localStorage.getItem(SPIN_LAST_KEY) || 0);
    return Date.now() - last >= SPIN_COOLDOWN_MS;
  } catch {
    return true;
  }
}

function markSpun(prizeId: string) {
  try {
    localStorage.setItem(SPIN_LAST_KEY, String(Date.now()));
    const hist = JSON.parse(localStorage.getItem(SPIN_HISTORY_KEY) || '[]') as string[];
    hist.push(`${Date.now()}:${prizeId}`);
    localStorage.setItem(SPIN_HISTORY_KEY, JSON.stringify(hist.slice(-40)));
  } catch {
    /* ignore */
  }
}

function clearSpunMark() {
  try {
    localStorage.removeItem(SPIN_LAST_KEY);
  } catch {
    /* ignore */
  }
}

/** Offline path only — online, the server already credited the prize. */
function applyPrizeLocally(prize: PrizeDef) {
  const player = useAppStore.getState().player;
  if (!player) return;
  useAppStore.getState().setPlayer({
    ...player,
    coins: player.coins + (prize.coins ?? 0),
    picaPolloTickets: player.picaPolloTickets + (prize.picaPollo ?? 0),
    skateboardCharges: Math.min(8, player.skateboardCharges + (prize.skateCharges ?? 0)),
    spinAvailable: prize.id === 'spin_again',
    ownedSkins: prize.skinId
      ? Array.from(new Set([...player.ownedSkins, prize.skinId]))
      : player.ownedSkins,
  });
}

interface Props {
  locale?: 'es-DO' | 'en';
  labels: {
    hint: string;
    claimed: string;
    unlocked: string;
    noBalance: string;
    continue: string;
  };
}

export function RewardWheel({ locale = 'es-DO', labels }: Props) {
  const showToast = useAppStore((s) => s.showToast);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const player = useAppStore((s) => s.player);
  const payForExtraSpin = useAppStore((s) => s.payForExtraSpin);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pointerWobble, setPointerWobble] = useState(0);
  const [callout, setCallout] = useState<PrizeDef | null>(null);
  const [winner, setWinner] = useState<PrizeDef | null>(null);
  const [lights, setLights] = useState(0);
  const [freeOk, setFreeOk] = useState(canFreeSpin);

  const animRef = useRef<number | null>(null);
  const modalTimerRef = useRef<number | null>(null);
  const dragRef = useRef<{ y: number; t: number; ang: number } | null>(null);
  const lastSeg = useRef(-1);
  const rotationRef = useRef(0);

  const canAffordExtra =
    !!player &&
    (player.picaPolloTickets >= EXTRA_SPIN_PRICE.tickets ||
      player.coins >= EXTRA_SPIN_PRICE.coins);

  const gradient = useMemo(() => {
    const parts = REWARDS_TABLE.map((p, i) => {
      const a0 = i * SEG_DEG;
      const a1 = (i + 1) * SEG_DEG;
      return `${RARITY_COLORS[p.rarity]} ${a0}deg ${a1}deg`;
    });
    return `conic-gradient(from -90deg, ${parts.join(', ')})`;
  }, []);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    setFreeOk(canFreeSpin());
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      if (modalTimerRef.current !== null) window.clearTimeout(modalTimerRef.current);
    };
  }, []);

  /** Animates to a prize that is already decided — never "spin and see where it lands". */
  const animateTo = useCallback(
    (prize: PrizeDef, impulseBoost: number, onSettled: () => void) => {
      const prizeIndex = REWARDS_TABLE.findIndex((p) => p.id === prize.id);
      const targetMid = prizeIndex * SEG_DEG + SEG_DEG / 2;
      const turns = 4 + Math.floor(Math.random() * 2) + (impulseBoost > 0.5 ? 1 : 0);
      const from = rotationRef.current;
      const start = ((from % 360) + 360) % 360;
      const finalMod = (360 - targetMid) % 360;
      const delta = turns * 360 + ((finalMod - start + 360) % 360);

      const duration = reduceMotion ? 1800 : 4000 + impulseBoost * 400;
      const t0 = performance.now();

      const tick = (now: number) => {
        const u = Math.min(1, (now - t0) / duration);
        const p = spinProgress(u);
        let ang = from + delta * p;

        // Micro vibration in the final stretch — "casi, casi" tension.
        if (u > 0.85 && u < 1 && !reduceMotion) {
          ang += Math.sin(now / 30) * 1.2 * (1 - u);
        }
        setRotation(ang);
        setLights(Math.floor(now / 80) % 12);

        const seg = Math.floor(((360 - (((ang % 360) + 360) % 360)) % 360) / SEG_DEG);
        if (seg !== lastSeg.current) {
          lastSeg.current = seg;
          sfx.spinTick(1.2 - u * 0.7);
          setPointerWobble(6 * (1 - u));
        }

        if (u < 1) {
          animRef.current = requestAnimationFrame(tick);
          return;
        }

        setRotation(from + delta);
        setPointerWobble(0);
        setSpinning(false);
        setCallout(prize);
        if (prize.rarity === 'epic' || prize.rarity === 'rare') sfx.prizeEpic();
        else sfx.prizeCommon();
        modalTimerRef.current = window.setTimeout(() => setWinner(prize), CALLOUT_TO_MODAL_MS);
        onSettled();
      };

      animRef.current = requestAnimationFrame(tick);
    },
    [reduceMotion],
  );

  const runSpin = useCallback(
    async (impulseBoost = 0, opts?: { extra?: boolean }) => {
      if (spinning) return;
      const extra = !!opts?.extra;

      if (!extra && !canFreeSpin()) {
        showToast('Próximo giro gratis en menos de 24h');
        return;
      }
      if (extra && !payForExtraSpin(EXTRA_SPIN_PRICE)) {
        showToast(labels.noBalance);
        return;
      }

      setSpinning(true);
      setCallout(null);
      setWinner(null);
      sfx.unlock();

      // Optimistic local cooldown; reverted if the server rejects the spin.
      if (!extra) {
        markSpun('pending');
        setFreeOk(false);
      }

      let prize: PrizeDef | null = null;
      let creditedByServer = false;

      if (!extra) {
        try {
          const result = await api.spin();
          prize = REWARDS_TABLE.find((p) => p.id === result.prizeId) ?? null;
          if (result.player) useAppStore.getState().setPlayer(result.player);
          creditedByServer = true;
        } catch (err) {
          if (err instanceof ApiError && err.status === 409) {
            clearSpunMark();
            markSpun('server-cooldown');
            setFreeOk(false);
            setSpinning(false);
            showToast(err.message);
            return;
          }
          // Offline / unreachable: local-first fallback.
          prize = null;
        }
      }

      if (!prize) prize = getWeightedRandomPrize(REWARDS_TABLE);

      const settled = prize;
      animateTo(settled, impulseBoost, () => {
        if (!extra) markSpun(settled.id);
        setFreeOk(canFreeSpin());
        if (!creditedByServer) applyPrizeLocally(settled);
      });
    },
    [spinning, showToast, labels.noBalance, payForExtraSpin, animateTo],
  );

  const onPointerDown = (e: ReactPointerEvent) => {
    if (spinning) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { y: e.clientY, t: performance.now(), ang: rotation };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragRef.current || spinning) return;
    const dy = e.clientY - dragRef.current.y;
    setRotation(dragRef.current.ang + dy * 0.6);
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!dragRef.current || spinning) return;
    const dt = Math.max(16, performance.now() - dragRef.current.t);
    const dy = e.clientY - dragRef.current.y;
    const vel = Math.abs(dy) / dt;
    dragRef.current = null;
    // A weak flick still triggers a full spin — never leave the wheel half-turned.
    void runSpin(vel < 0.35 ? 0 : Math.min(1.5, vel), { extra: !canFreeSpin() });
  };

  const closeModal = () => {
    setWinner(null);
    setCallout(null);
  };

  return (
    <div className="reward-wheel-root">
      {callout ? (
        <div className="rw-callout" role="status">
          {callout.name[locale]}
        </div>
      ) : null}

      <div className="rw-lights" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className={`rw-light${lights === i || (spinning && (i + lights) % 3 === 0) ? ' on' : ''}`}
            style={{ transform: `rotate(${i * 30}deg) translateY(-132px)` }}
          />
        ))}
      </div>

      <div
        className="rw-pointer"
        style={{ transform: `translateX(-50%) rotate(${pointerWobble}deg)` }}
      />

      <div
        className="rw-wheel"
        style={{
          background: gradient,
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'none' : 'transform 120ms ease-out',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {REWARDS_TABLE.map((p, i) => {
          const rot = i * SEG_DEG + SEG_DEG / 2;
          return (
            <div
              key={p.id}
              className={`rw-seg-label rarity-${p.rarity}`}
              style={{ transform: `rotate(${rot}deg) translateY(-78px)` }}
            >
              <span>{p.icon}</span>
            </div>
          );
        })}
        <div className="rw-hub">RD</div>
      </div>

      {winner ? (
        <HudPanel className="rw-result-modal">
          <div
            className={`rw-confetti${winner.rarity === 'epic' || winner.rarity === 'rare' ? ' show' : ''}`}
          />
          <div style={{ fontSize: '2.4rem' }}>{winner.icon}</div>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
            {winner.name[locale]}
          </strong>
          <p style={{ margin: '6px 0 12px', opacity: 0.85, fontSize: '0.85rem' }}>
            {winner.rarity === 'epic' || winner.rarity === 'rare'
              ? labels.unlocked
              : labels.claimed}
          </p>
          <GameButton variant="green" onClick={closeModal}>
            {labels.continue}
          </GameButton>
        </HudPanel>
      ) : null}

      <div className="stack-gap" style={{ width: 'min(100%, 320px)', marginTop: 12 }}>
        <GameButton
          variant="gold"
          hero
          disabled={spinning || !freeOk}
          onClick={() => void runSpin(0)}
          style={{ minHeight: 52 }}
        >
          {freeOk ? 'GIRAR GRATIS' : 'Espera el próximo giro gratis'}
        </GameButton>

        <GameButton
          variant="blue"
          disabled={spinning || !canAffordExtra}
          onClick={() => void runSpin(0.2, { extra: true })}
          style={{ minHeight: 48 }}
        >
          GIRAR EXTRA
        </GameButton>
        <p className="rw-extra-note">
          {canAffordExtra
            ? `Costo: ${EXTRA_SPIN_PRICE.tickets} ticket o ${EXTRA_SPIN_PRICE.coins} monedas`
            : labels.noBalance}
        </p>

        <p className="rw-hint">{labels.hint}</p>
      </div>
    </div>
  );
}
