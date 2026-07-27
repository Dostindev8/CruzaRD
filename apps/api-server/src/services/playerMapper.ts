import type {
  MissionProgress,
  PlayerProfile,
} from '@cruza-rd/shared-types';
import type { IStore, MissionState, PlayerRecord } from '../store/types.js';

export function toPublicPlayer(player: PlayerRecord): PlayerProfile {
  return {
    id: player.id,
    displayName: player.displayName,
    countryCode: player.countryCode,
    coins: player.coins,
    picaPolloTickets: player.picaPolloTickets,
    skateboardCharges: player.skateboardCharges,
    bestScore: player.bestScore,
    lastScore: player.lastScore,
    lastMultiplier: player.lastMultiplier,
    totalRuns: player.totalRuns,
    totalDistance: player.totalDistance,
    dailyLoginStreak: player.dailyLoginStreak,
    onboardingSeen: player.onboardingSeen,
    isFirstLaunch: player.isFirstLaunch,
    equippedSkins: { ...player.equippedSkins },
    ownedSkins: [...player.ownedSkins],
    adsRemoved: player.adsRemoved,
    spinAvailable: player.spinAvailable,
    loginRewardAvailable: player.loginRewardAvailable,
  };
}

export function toMissionProgress(
  store: IStore,
  states: MissionState[],
): MissionProgress[] {
  return states
    .map((s) => {
      const template = store.getMissionTemplate(s.missionTemplateId);
      if (!template) return null;
      return {
        missionTemplateId: s.missionTemplateId,
        progress: s.progress,
        completed: s.completed,
        claimed: s.claimed,
        template,
      };
    })
    .filter((m): m is MissionProgress => m !== null);
}

export function touchPlayer(player: PlayerRecord): PlayerRecord {
  return { ...player, updatedAt: Date.now() };
}
