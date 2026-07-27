import type {
  LeaderboardEntry,
  MissionProgress,
  MissionTemplate,
  PlayerProfile,
  ShopItem,
} from '@cruza-rd/shared-types';

/** Internal player row — extends public profile with server-only fields. */
export interface PlayerRecord extends PlayerProfile {
  deviceId: string;
  authProvider: 'guest' | 'google' | 'apple' | 'email';
  /** Scores accepted onto leaderboards (non-anomalous). */
  leaderboardScore: number;
  weeklyScore: number;
  weeklyScoreWeekKey: string;
  lastRunAt: number | null;
  lastSpinAt: number | null;
  lastLoginClaimDate: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface RunRecord {
  id: string;
  playerId: string;
  validatedScore: number;
  clientScore: number;
  coinsGranted: number;
  anomalyFlags: string[];
  excludedFromLeaderboard: boolean;
  distanceMeters: number;
  createdAt: number;
}

export interface MissionState {
  missionTemplateId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

/**
 * Persistence port — MemoryStore today, MongoStore later.
 * Swap the implementation in `store/index.ts` without touching routes/services.
 */
export interface IStore {
  getPlayer(id: string): PlayerRecord | undefined;
  getPlayerByDeviceId(deviceId: string): PlayerRecord | undefined;
  upsertPlayer(player: PlayerRecord): void;
  listPlayers(): PlayerRecord[];

  saveRun(run: RunRecord): void;
  getRun(id: string): RunRecord | undefined;

  getMissionTemplates(): MissionTemplate[];
  getMissionTemplate(id: string): MissionTemplate | undefined;
  getPlayerMissions(playerId: string): MissionState[];
  setPlayerMission(playerId: string, state: MissionState): void;
  ensurePlayerMissions(playerId: string): void;

  getShopItems(): ShopItem[];
  getShopItem(id: string): ShopItem | undefined;

  getIapProductCoins(productId: string): number | undefined;

  /** Fake seeded rivals for leaderboard DoD. */
  getSeedLeaderboard(): Omit<LeaderboardEntry, 'rank' | 'isSelf'>[];
}

export type MissionProgressView = MissionProgress;
