import { RunnerHUD } from './RunnerHUD';
import { useAppStore } from '../state/appStore';
import { useRunStore } from '../state/runStore';

interface Props {
  onEliminate: () => void;
}

export function RunnerHUDLive({ onEliminate }: Props) {
  const score = useRunStore((s) => s.score);
  const multiplier = useRunStore((s) => s.multiplier);
  const runCoins = useRunStore((s) => s.coins);
  const picaPollo = useRunStore((s) => s.picaPollo);
  const skateCharges = useRunStore((s) => s.skateCharges);
  const distance = useRunStore((s) => s.distance);
  const clothes = useRunStore((s) => s.clothes);
  const weapons = useRunStore((s) => s.weapons);
  const canEliminate = useRunStore((s) => s.canEliminate);
  const nearestLabel = useRunStore((s) => s.nearestLabel);
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
      clothes={clothes}
      weapons={weapons}
      canEliminate={canEliminate}
      nearestLabel={nearestLabel}
      onPause={() => setScreen('pause')}
      onEliminate={onEliminate}
    />
  );
}
