import type { MissionTemplate, ShopItem } from '@cruza-rd/shared-types';
import { FULL_SHOP_CATALOG } from '@cruza-rd/shared-types';
import type { PlayerRecord } from './types.js';

/** ISO week key YYYY-Www for weekly leaderboard buckets. */
export function weekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function localDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export const SEED_MISSIONS: MissionTemplate[] = [
  {
    id: 'daily_collect_500',
    type: 'collect_coins',
    title: { 'es-DO': 'Recoge 500 monedas', en: 'Collect 500 coins' },
    target: 500,
    rewardCoins: 100,
    rewardPicaPollo: 0,
    scope: 'daily',
  },
  {
    id: 'daily_jump_20',
    type: 'jump_count',
    title: { 'es-DO': 'Salta 20 veces', en: 'Jump 20 times' },
    target: 20,
    rewardCoins: 75,
    rewardPicaPollo: 0,
    scope: 'daily',
  },
  {
    id: 'daily_skateboard_5',
    type: 'use_powerup',
    title: { 'es-DO': 'Usa patineta 5 veces', en: 'Use skateboard 5 times' },
    target: 5,
    rewardCoins: 80,
    rewardPicaPollo: 1,
    scope: 'daily',
  },
  {
    id: 'daily_pica_pollo_100',
    type: 'collect_pica_pollo',
    title: { 'es-DO': 'Recoge Pica Pollo', en: 'Collect Pica Pollo' },
    target: 100,
    rewardCoins: 150,
    rewardPicaPollo: 5,
    scope: 'daily',
  },
  {
    id: 'daily_clothes_10',
    type: 'collect_clothes',
    title: { 'es-DO': 'Recoge 10 prendas', en: 'Collect 10 clothes' },
    target: 10,
    rewardCoins: 120,
    rewardPicaPollo: 0,
    scope: 'daily',
  },
  {
    id: 'daily_politician_3',
    type: 'defeat_politician',
    title: { 'es-DO': 'Limpia 3 vías políticas', en: 'Clear 3 political lanes' },
    target: 3,
    rewardCoins: 200,
    rewardPicaPollo: 2,
    scope: 'daily',
  },
];

export const SEED_SHOP_ITEMS: ShopItem[] = FULL_SHOP_CATALOG;
/** Known IAP productId → coin grant (stub verify). */
export const IAP_COIN_GRANTS: Record<string, number> = {
  'com.cruzard.coins_1000': 1000,
  'com.cruzard.coins_5000': 5000,
  'com.cruzard.coins_12000': 12000,
};

export const SEED_LEADERBOARD_RIVALS: Array<{
  playerId: string;
  displayName: string;
  bestScore: number;
}> = [
  { playerId: 'b1', displayName: 'ElMaestro', bestScore: 48200 },
  { playerId: 'b2', displayName: 'QuítateRD', bestScore: 35100 },
  { playerId: 'b4', displayName: 'OMSAKing', bestScore: 9800 },
  { playerId: 'b5', displayName: 'PicaPollo', bestScore: 7600 },
];

export function createGuestPlayer(id: string, deviceId: string): PlayerRecord {
  const now = Date.now();
  return {
    id,
    deviceId,
    displayName: 'Corredor RD',
    countryCode: 'DO',
    coins: 831,
    picaPolloTickets: 78,
    skateboardCharges: 8,
    bestScore: 0,
    lastScore: 0,
    lastMultiplier: 1,
    totalRuns: 0,
    totalDistance: 0,
    dailyLoginStreak: 1,
    onboardingSeen: false,
    isFirstLaunch: true,
    equippedSkins: {
      character: 'skin_char_default',
      backpack: 'skin_backpack_guagua',
      skateboard: 'skin_skate_republica',
    },
    ownedSkins: ['skin_char_default', 'skin_backpack_guagua', 'skin_skate_republica'],
    adsRemoved: false,
    spinAvailable: true,
    loginRewardAvailable: true,
    authProvider: 'guest',
    leaderboardScore: 0,
    weeklyScore: 0,
    weeklyScoreWeekKey: weekKey(),
    lastRunAt: null,
    lastSpinAt: null,
    lastLoginClaimDate: null,
    createdAt: now,
    updatedAt: now,
  };
}
