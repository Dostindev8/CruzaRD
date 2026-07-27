export interface DifficultyStep {
  fromMeters: number;
  speedMult: number;
  obstacleDensity: number;
}

/** Data-driven difficulty — editable without code changes */
export const DIFFICULTY_CURVE: DifficultyStep[] = [
  { fromMeters: 0, speedMult: 1.0, obstacleDensity: 0.35 },
  { fromMeters: 250, speedMult: 1.04, obstacleDensity: 0.42 },
  { fromMeters: 500, speedMult: 1.08, obstacleDensity: 0.5 },
  { fromMeters: 750, speedMult: 1.16, obstacleDensity: 0.58 },
  { fromMeters: 1000, speedMult: 1.28, obstacleDensity: 0.66 },
  { fromMeters: 1500, speedMult: 1.48, obstacleDensity: 0.74 },
  { fromMeters: 2000, speedMult: 1.8, obstacleDensity: 0.85 },
];

export const BASE_SPEED = 12;
export const LANE_WIDTH = 2.4;
export const LANE_COUNT = 3;
export const CHUNK_LENGTH = 40;
export const JUMP_BUFFER_MS = 120;
export const SLIDE_DURATION_MS = 500;
export const LANE_LERP_MS = 180;
export const SKATE_DURATION_S = 6;
export const SKATE_SPEED_BONUS = 1.2;
export const MAX_SKATE_CHARGES = 8;

export function sampleDifficulty(meters: number): DifficultyStep {
  let current = DIFFICULTY_CURVE[0];
  for (const step of DIFFICULTY_CURVE) {
    if (meters >= step.fromMeters) current = step;
  }
  return current;
}

export function laneX(lane: number): number {
  const mid = (LANE_COUNT - 1) / 2;
  return (lane - mid) * LANE_WIDTH;
}
