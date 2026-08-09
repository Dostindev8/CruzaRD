import { getWeightedRandomPrize, simulateDistribution } from './getWeightedRandomPrize.ts';
import { REWARDS_TABLE } from './rewards.config.ts';

/** Deterministic RNG for tests */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);
const n = 10_000;
const counts = simulateDistribution(REWARDS_TABLE, n, rng);
const totalWeight = REWARDS_TABLE.reduce((s, p) => s + p.weight, 0);

let ok = true;
for (const p of REWARDS_TABLE) {
  const expected = (p.weight / totalWeight) * n;
  const actual = counts[p.id] ?? 0;
  const err = Math.abs(actual - expected) / expected;
  // Allow 35% relative error on rare bins (small samples)
  const tol = p.weight < 5 ? 0.55 : 0.25;
  if (err > tol) {
    console.error(`FAIL ${p.id}: expected~${expected.toFixed(0)} got ${actual} (err ${(err * 100).toFixed(1)}%)`);
    ok = false;
  } else {
    console.log(`OK ${p.id}: ${actual} / ~${expected.toFixed(0)}`);
  }
}

if (!ok) {
  process.exit(1);
}
console.log('getWeightedRandomPrize distribution OK');

// smoke: single pick
const one = getWeightedRandomPrize(REWARDS_TABLE, rng);
if (!one.id) process.exit(1);
