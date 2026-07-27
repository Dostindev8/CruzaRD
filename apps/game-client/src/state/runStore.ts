import { create } from 'zustand';
import type { WorldEntity } from '../game/RunnerEngine';

/** Lightweight HUD + scene snapshot — updated from the game loop without remounting React trees. */
export interface RunHudState {
  score: number;
  multiplier: number;
  coins: number;
  picaPollo: number;
  bananas: number;
  distance: number;
  skateCharges: number;
  sliding: boolean;
  jumping: boolean;
  skating: boolean;
  dead: boolean;
  x: number;
  y: number;
  z: number;
  entities: WorldEntity[];
  setFromEngine: ( partial: Omit<RunHudState, 'setFromEngine' | 'reset'> ) => void;
  reset: () => void;
}

const empty: Omit<RunHudState, 'setFromEngine' | 'reset'> = {
  score: 0,
  multiplier: 1,
  coins: 0,
  picaPollo: 0,
  bananas: 0,
  distance: 0,
  skateCharges: 8,
  sliding: false,
  jumping: false,
  skating: false,
  dead: false,
  x: 0,
  y: 0,
  z: 0,
  entities: [],
};

export const useRunStore = create<RunHudState>((set) => ({
  ...empty,
  setFromEngine: (partial) => set(partial),
  reset: () => set(empty),
}));
