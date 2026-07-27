import { useAppStore } from '../state/appStore';
import { useRunStore } from '../state/runStore';
import { RunnerHUD } from './RunnerHUD';

/** Subscribes to run HUD store so score updates without remounting App. */
export function RunnerHUDLive() {
  const score = useRunStore((s) => s.score);
  const multiplier = useRunStore((s) => s.multiplier);
  const runCoins = useRunStore((s) => s.coins);
  const picaPollo = useRunStore((s) => s.picaPollo);
  const skateCharges = useRunStore((s) => s.skateCharges);
  const distance = useRunStore((s) => s.distance);
  const wallet = useAppStore((s) => s.player?.coins ?? 0);
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <RunnerHUD
      score={score}
      multiplier={multiplier}
      coins={wallet + runCoins}
      picaPollo={picaPollo}
      skateCharges={skateCharges}
      distance={distance}
      onPause={() => setScreen('pause')}
    />
  );
}
