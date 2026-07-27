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

export interface SpinResult {
  prizeType: 'coins' | 'picaPollo' | 'skateboard' | 'skin' | 'spin_again';
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
