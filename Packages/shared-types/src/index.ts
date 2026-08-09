/** Shared contracts — client + API */

export type AuthProvider = 'guest' | 'google' | 'apple' | 'email';

export interface PlayerEconomy {
  coins: number;
  picaPolloTickets: number;
  skateboardCharges: number;
}

export interface PlayerProfile extends PlayerEconomy {
  id: string;
  displayName: string;
  countryCode: string;
  bestScore: number;
  lastScore: number;
  lastMultiplier: number;
  totalRuns: number;
  totalDistance: number;
  dailyLoginStreak: number;
  onboardingSeen: boolean;
  isFirstLaunch: boolean;
  equippedSkins: {
    character: string;
    backpack: string;
    skateboard: string;
    clothes?: string;
    weapon?: string;
  };
  ownedSkins: string[];
  adsRemoved: boolean;
  spinAvailable: boolean;
  loginRewardAvailable: boolean;
}

export type MissionType =
  | 'collect_coins'
  | 'jump_count'
  | 'use_powerup'
  | 'run_distance'
  | 'collect_pica_pollo'
  | 'revive_count'
  | 'defeat_politician'
  | 'collect_clothes';

export type MissionScope = 'daily' | 'weekly' | 'achievement';

export interface MissionTemplate {
  id: string;
  type: MissionType;
  title: { 'es-DO': string; en: string };
  target: number;
  rewardCoins: number;
  rewardPicaPollo: number;
  scope: MissionScope;
}

export interface MissionProgress {
  missionTemplateId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  template: MissionTemplate;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  bestScore: number;
  isSelf?: boolean;
}

export interface RunPayload {
  distanceMeters: number;
  score: number;
  multiplierMax: number;
  coinsEarned: number;
  picaPolloCollected: number;
  bananasCollected: number;
  jumpsCount: number;
  slidesCount: number;
  powerupUsesCount: number;
  revivesUsed: number;
  clothesCollected?: number;
  weaponsCollected?: number;
  politiciansCleared?: number;
  clientChecksum?: string;
}

export interface RunResult {
  accepted: boolean;
  validatedScore: number;
  coinsGranted: number;
  anomalyFlags: string[];
  player: PlayerProfile;
  missions: MissionProgress[];
}

export type ShopCategory =
  | 'character'
  | 'backpack'
  | 'skateboard'
  | 'clothes'
  | 'weapon'
  | 'coins'
  | 'offer';

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  description?: string;
  priceCoins?: number;
  iapProductId?: string;
  previewColor: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legend';
}

export type SpinPrizeType =
  | 'coins'
  | 'picaPollo'
  | 'skateboard'
  | 'skin'
  | 'spin_again';

export type SpinRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface SpinPrizeDef {
  id: string;
  prizeType: SpinPrizeType;
  amount: number;
  /** Relative weight inside the loot table. */
  weight: number;
  rarity: SpinRarity;
  label: { 'es-DO': string; en: string };
}

/**
 * Canonical daily-spin loot table. Client renders the wheel from this order and
 * the server picks the winner from these weights, so a segment index always means
 * the same prize on both sides.
 */
export const SPIN_PRIZE_TABLE: readonly SpinPrizeDef[] = [
  {
    id: 'coins_50',
    prizeType: 'coins',
    amount: 50,
    weight: 28,
    rarity: 'common',
    label: { 'es-DO': '+50 monedas', en: '+50 coins' },
  },
  {
    id: 'coins_100',
    prizeType: 'coins',
    amount: 100,
    weight: 22,
    rarity: 'common',
    label: { 'es-DO': '+100 monedas', en: '+100 coins' },
  },
  {
    id: 'pica_2',
    prizeType: 'picaPollo',
    amount: 2,
    weight: 16,
    rarity: 'uncommon',
    label: { 'es-DO': '+2 Pica Pollo', en: '+2 Pica Pollo' },
  },
  {
    id: 'coins_250',
    prizeType: 'coins',
    amount: 250,
    weight: 12,
    rarity: 'uncommon',
    label: { 'es-DO': '+250 monedas', en: '+250 coins' },
  },
  {
    id: 'skate_1',
    prizeType: 'skateboard',
    amount: 1,
    weight: 10,
    rarity: 'rare',
    label: { 'es-DO': '+1 Patineta', en: '+1 Skateboard' },
  },
  {
    id: 'pica_5',
    prizeType: 'picaPollo',
    amount: 5,
    weight: 7,
    rarity: 'rare',
    label: { 'es-DO': '+5 Pica Pollo', en: '+5 Pica Pollo' },
  },
  {
    id: 'coins_500',
    prizeType: 'coins',
    amount: 500,
    weight: 3,
    rarity: 'epic',
    label: { 'es-DO': '+500 monedas', en: '+500 coins' },
  },
  {
    id: 'spin_again',
    prizeType: 'spin_again',
    amount: 25,
    weight: 2,
    rarity: 'epic',
    label: { 'es-DO': '¡Vuelve a girar!', en: 'Spin again!' },
  },
] as const;

export const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** Cost of an extra spin once the free daily one is consumed. */
export const EXTRA_SPIN_COST = {
  tickets: 1,
  coins: 50,
} as const;

export interface SpinResult {
  /** Matches an id in SPIN_PRIZE_TABLE so the client can animate to that segment. */
  prizeId?: string;
  prizeType: SpinPrizeType;
  amount: number;
  label: string;
  player: PlayerProfile;
}

export const SCORE_FORMULA = {
  metersWeight: 1,
  bananaBase: 5,
  maxMultiplier: 8,
} as const;

export function computeServerScore(input: {
  distanceMeters: number;
  bananasCollected: number;
  multiplierMax: number;
  bonusPoints?: number;
}): number {
  const mult = Math.min(SCORE_FORMULA.maxMultiplier, Math.max(1, input.multiplierMax));
  return Math.floor(
    input.distanceMeters * SCORE_FORMULA.metersWeight +
      input.bananasCollected * SCORE_FORMULA.bananaBase * mult +
      (input.bonusPoints ?? 0),
  );
}

export function multiplierFromBananaStreak(streak: number): number {
  return Math.min(SCORE_FORMULA.maxMultiplier, 1 + Math.floor(streak / 10));
}

export { FULL_SHOP_CATALOG } from './catalog.js';

/** Satirical arcade NPCs — caricature targets, not photoreal likenesses. */
export const POLITICIAN_ROSTER = [
  { id: 'luis_abinader', name: 'Luis A.', color: '#0033A0' },
  { id: 'danilo', name: 'Danilo', color: '#C1272D' },
  { id: 'leonel', name: 'Leonel', color: '#1D63C7' },
  { id: 'omar_fernandez', name: 'Omar F.', color: '#2FAE47' },
  { id: 'hipolito', name: 'Hipólito', color: '#F5C542' },
  { id: 'carolina_mejia', name: 'Carolina M.', color: '#9B59B6' },
  { id: 'gonzalo', name: 'Gonzalo', color: '#E67E22' },
] as const;

export type PoliticianId = (typeof POLITICIAN_ROSTER)[number]['id'];
