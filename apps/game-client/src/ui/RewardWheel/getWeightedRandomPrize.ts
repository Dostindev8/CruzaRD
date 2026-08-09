import type { PrizeDef } from './rewards.config';

/**
 * Weighted pick. Optional pity: after `pityAfter` non-rare+ picks, boost rare/epic weights.
 * Pity OFF by default (pityAfter = Infinity).
 */
export function getWeightedRandomPrize(
  table: PrizeDef[],
  rng: () => number = Math.random,
  opts?: { pityAfter?: number; dryStreak?: number },
): PrizeDef {
  if (!table.length) {
    throw new Error('Empty rewards table');
  }
  const pityAfter = opts?.pityAfter ?? Number.POSITIVE_INFINITY;
  const dry = opts?.dryStreak ?? 0;
  const pityActive = dry >= pityAfter;

  const weighted = table.map((p) => {
    let w = p.weight;
    if (pityActive && (p.rarity === 'rare' || p.rarity === 'epic')) {
      w *= 1.75;
    }
    return { p, w };
  });

  const total = weighted.reduce((s, x) => s + x.w, 0);
  let roll = rng() * total;
  for (const row of weighted) {
    roll -= row.w;
    if (roll <= 0) return row.p;
  }
  return weighted[weighted.length - 1]!.p;
}

/** Distribution check helper for unit tests / QA. */
export function simulateDistribution(
  table: PrizeDef[],
  n: number,
  rng: () => number = Math.random,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of table) counts[p.id] = 0;
  for (let i = 0; i < n; i++) {
    const pick = getWeightedRandomPrize(table, rng);
    counts[pick.id] = (counts[pick.id] ?? 0) + 1;
  }
  return counts;
}
