import type { MissionTemplate, ShopItem } from '@cruza-rd/shared-types';
import {
  IAP_COIN_GRANTS,
  SEED_LEADERBOARD_RIVALS,
  SEED_MISSIONS,
  SEED_SHOP_ITEMS,
} from './seed.js';
import type { IStore, MissionState, PlayerRecord, RunRecord } from './types.js';

/**
 * In-memory Map store for local DoD (no MongoDB required).
 * Replace with MongoStore implementing the same IStore interface.
 */
export class MemoryStore implements IStore {
  private readonly players = new Map<string, PlayerRecord>();
  private readonly playersByDevice = new Map<string, string>();
  private readonly runs = new Map<string, RunRecord>();
  private readonly missionTemplates = new Map<string, MissionTemplate>();
  private readonly playerMissions = new Map<string, Map<string, MissionState>>();
  private readonly shopItems = new Map<string, ShopItem>();
  private readonly iapGrants = new Map<string, number>();

  constructor() {
    for (const m of SEED_MISSIONS) this.missionTemplates.set(m.id, m);
    for (const item of SEED_SHOP_ITEMS) this.shopItems.set(item.id, item);
    for (const [productId, coins] of Object.entries(IAP_COIN_GRANTS)) {
      this.iapGrants.set(productId, coins);
    }
  }

  getPlayer(id: string): PlayerRecord | undefined {
    return this.players.get(id);
  }

  getPlayerByDeviceId(deviceId: string): PlayerRecord | undefined {
    const id = this.playersByDevice.get(deviceId);
    return id ? this.players.get(id) : undefined;
  }

  upsertPlayer(player: PlayerRecord): void {
    this.players.set(player.id, player);
    this.playersByDevice.set(player.deviceId, player.id);
  }

  listPlayers(): PlayerRecord[] {
    return [...this.players.values()];
  }

  saveRun(run: RunRecord): void {
    this.runs.set(run.id, run);
  }

  getRun(id: string): RunRecord | undefined {
    return this.runs.get(id);
  }

  getMissionTemplates(): MissionTemplate[] {
    return [...this.missionTemplates.values()];
  }

  getMissionTemplate(id: string): MissionTemplate | undefined {
    return this.missionTemplates.get(id);
  }

  getPlayerMissions(playerId: string): MissionState[] {
    this.ensurePlayerMissions(playerId);
    return [...(this.playerMissions.get(playerId)?.values() ?? [])];
  }

  setPlayerMission(playerId: string, state: MissionState): void {
    this.ensurePlayerMissions(playerId);
    this.playerMissions.get(playerId)!.set(state.missionTemplateId, state);
  }

  ensurePlayerMissions(playerId: string): void {
    if (!this.playerMissions.has(playerId)) {
      const map = new Map<string, MissionState>();
      for (const t of this.missionTemplates.values()) {
        map.set(t.id, {
          missionTemplateId: t.id,
          progress: 0,
          completed: false,
          claimed: false,
        });
      }
      this.playerMissions.set(playerId, map);
      return;
    }
    const map = this.playerMissions.get(playerId)!;
    for (const t of this.missionTemplates.values()) {
      if (!map.has(t.id)) {
        map.set(t.id, {
          missionTemplateId: t.id,
          progress: 0,
          completed: false,
          claimed: false,
        });
      }
    }
  }

  getShopItems(): ShopItem[] {
    return [...this.shopItems.values()];
  }

  getShopItem(id: string): ShopItem | undefined {
    return this.shopItems.get(id);
  }

  getIapProductCoins(productId: string): number | undefined {
    return this.iapGrants.get(productId);
  }

  getSeedLeaderboard() {
    return SEED_LEADERBOARD_RIVALS.map((r) => ({
      playerId: r.playerId,
      displayName: r.displayName,
      bestScore: r.bestScore,
    }));
  }
}
