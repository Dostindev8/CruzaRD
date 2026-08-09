import { RunnerHUD } from './RunnerHUD';
import { useAppStore } from '../state/appStore';
import { useRunStore } from '../state/runStore';

interface Props {
  onEliminate: () => void;
}

/** Bridges the throttled run snapshot into the HUD with per-field selectors. */
export function RunnerHUDLive({ onEliminate }: Props) {
  const score = useRunStore((s) => s.score);
  const multiplier = useRunStore((s) => s.multiplier);
  const sessionCoins = useRunStore((s) => s.coins);
  const picaPollo = useRunStore((s) => s.picaPollo);
  const skateCharges = useRunStore((s) => s.skateCharges);
  const distance = useRunStore((s) => s.distance);
  const clothes = useRunStore((s) => s.clothes);
  const weapons = useRunStore((s) => s.weapons);
  const health = useRunStore((s) => s.health);
  const maxHealth = useRunStore((s) => s.maxHealth);
  const lastHitAt = useRunStore((s) => s.lastHitAt);
  const canEliminate = useRunStore((s) => s.canEliminate);
  const nearestLabel = useRunStore((s) => s.nearestLabel);
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <RunnerHUD
      score={score}
      multiplier={multiplier}
      sessionCoins={sessionCoins}
      picaPollo={picaPollo}
      skateCharges={skateCharges}
      distance={distance}
      clothes={clothes}
      weapons={weapons}
      health={health}
      maxHealth={maxHealth}
      lastHitAt={lastHitAt}
      canEliminate={canEliminate}
      nearestLabel={nearestLabel}
      onPause={() => setScreen('pause')}
      onEliminate={onEliminate}
    />
  );
}
