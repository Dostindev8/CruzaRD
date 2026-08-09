/**
 * Wheel presentation config. The prize list, weights and rarities come from
 * `@cruza-rd/shared-types` so the server picks winners from the exact same table;
 * this file only adds the client-side visuals (icons, colors) and spin economics.
 */
import {
  EXTRA_SPIN_COST,
  SPIN_COOLDOWN_MS as SHARED_SPIN_COOLDOWN_MS,
  SPIN_PRIZE_TABLE,
  type SpinRarity,
} from '@cruza-rd/shared-types';

export type PrizeRarity = SpinRarity;

export interface PrizeDef {
  id: string;
  name: { 'es-DO': string; en: string };
  rarity: PrizeRarity;
  /** Relative weight in the loot table */
  weight: number;
  icon: string;
  coins?: number;
  picaPollo?: number;
  skateCharges?: number;
  skinId?: string;
}

const PRIZE_ICONS: Record<string, string> = {
  coins_50: '🪙',
  coins_100: '🪙',
  pica_2: '🍗',
  coins_250: '🪙',
  skate_1: '🛹',
  pica_5: '🍗',
  coins_500: '💎',
  spin_again: '🎡',
};

export const REWARDS_TABLE: PrizeDef[] = SPIN_PRIZE_TABLE.map((prize) => ({
  id: prize.id,
  name: prize.label,
  rarity: prize.rarity,
  weight: prize.weight,
  icon: PRIZE_ICONS[prize.id] ?? '🎁',
  coins:
    prize.prizeType === 'coins' || prize.prizeType === 'spin_again'
      ? prize.amount
      : undefined,
  picaPollo: prize.prizeType === 'picaPollo' ? prize.amount : undefined,
  skateCharges: prize.prizeType === 'skateboard' ? prize.amount : undefined,
}));

export const RARITY_COLORS: Record<PrizeRarity, string> = {
  common: '#5a6a7e',
  uncommon: '#2fae47',
  rare: '#1d63c7',
  epic: '#9b59b6',
};

/** Free spin cooldown (24h). Extra spins are paid, see EXTRA_SPIN_PRICE. */
export const SPIN_COOLDOWN_MS = SHARED_SPIN_COOLDOWN_MS;

/** Tunable here without touching wheel logic — Ley: cero economía hardcodeada en la UI. */
export const EXTRA_SPIN_PRICE = EXTRA_SPIN_COST;

export const SPIN_LAST_KEY = 'cruza.spinLastAt';
export const SPIN_HISTORY_KEY = 'cruza.spinHistory';
