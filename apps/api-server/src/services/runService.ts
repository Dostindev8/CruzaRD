import {
  computeServerScore,
  type RunPayload,
  type RunResult,
} from '@cruza-rd/shared-types';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { store } from '../store/index.js';
import { weekKey } from '../store/seed.js';
import type { PlayerRecord, RunRecord } from '../store/types.js';
import { notFound, tooManyRequests } from '../utils/errors.js';
import {
  toMissionProgress,
  toPublicPlayer,
  touchPlayer,
} from './playerMapper.js';

function applyMissionProgress(playerId: string, payload: RunPayload): void {
  const states = store.getPlayerMissions(playerId);
  for (const state of states) {
    if (state.claimed) continue;
    const template = store.getMissionTemplate(state.missionTemplateId);
    if (!template) continue;

    let delta = 0;
    switch (template.type) {
      case 'collect_coins':
        delta = payload.coinsEarned;
        break;
      case 'jump_count':
        delta = payload.jumpsCount;
        break;
      case 'use_powerup':
        delta = payload.powerupUsesCount;
        break;
      case 'run_distance':
        delta = Math.floor(payload.distanceMeters);
        break;
      case 'collect_pica_pollo':
        delta = payload.picaPolloCollected;
        break;
      case 'revive_count':
        delta = payload.revivesUsed;
        break;
      default:
        delta = 0;
    }

    const progress = Math.min(template.target, state.progress + delta);
    store.setPlayerMission(playerId, {
      ...state,
      progress,
      completed: progress >= template.target,
    });
  }
}

/**
 * Conservative coin grant when the client score looks forged:
 * distance-based + banana crumbs, never above client claim.
 */
function conservativeCoins(payload: RunPayload): number {
  const fromDistance = Math.floor(payload.distanceMeters * 0.25);
  const fromBananas = payload.bananasCollected * 2;
  const estimate = fromDistance + fromBananas;
  return Math.max(0, Math.min(payload.coinsEarned, estimate));
}

export function submitRun(playerId: string, payload: RunPayload): RunResult {
  const player = store.getPlayer(playerId);
  if (!player) throw notFound('Player not found');

  const now = Date.now();
  if (player.lastRunAt !== null && now - player.lastRunAt < config.runRateLimitMs) {
    const waitSec = Math.ceil(
      (config.runRateLimitMs - (now - player.lastRunAt)) / 1000,
    );
    throw tooManyRequests(`Run rate limit: wait ${waitSec}s`);
  }

  const validatedScore = computeServerScore({
    distanceMeters: payload.distanceMeters,
    bananasCollected: payload.bananasCollected,
    multiplierMax: payload.multiplierMax,
  });

  const denom = Math.max(validatedScore, 1);
  const relativeDelta = Math.abs(payload.score - validatedScore) / denom;
  const anomalyFlags: string[] = [];

  if (relativeDelta > config.scoreAnomalyTolerance) {
    anomalyFlags.push('SCORE_DELTA_GT_5PCT');
  }
  if (payload.multiplierMax > 8) {
    anomalyFlags.push('MULTIPLIER_OVER_CAP');
  }
  if (payload.coinsEarned > validatedScore + 500) {
    anomalyFlags.push('COINS_INFLATED');
  }

  const anomalous = anomalyFlags.length > 0;
  const coinsGranted = anomalous
    ? conservativeCoins(payload)
    : Math.max(0, payload.coinsEarned);

  let next: PlayerRecord = touchPlayer({
    ...player,
    coins: player.coins + coinsGranted,
    picaPolloTickets: player.picaPolloTickets + payload.picaPolloCollected,
    lastScore: validatedScore,
    lastMultiplier: Math.min(8, payload.multiplierMax),
    bestScore: Math.max(player.bestScore, validatedScore),
    totalRuns: player.totalRuns + 1,
    totalDistance: player.totalDistance + payload.distanceMeters,
    lastRunAt: now,
    isFirstLaunch: false,
  });

  if (!anomalous) {
    const currentWeek = weekKey();
    const weeklyScore =
      next.weeklyScoreWeekKey === currentWeek
        ? Math.max(next.weeklyScore, validatedScore)
        : validatedScore;
    next = {
      ...next,
      leaderboardScore: Math.max(next.leaderboardScore, validatedScore),
      weeklyScore,
      weeklyScoreWeekKey: currentWeek,
    };
  }

  store.upsertPlayer(next);
  applyMissionProgress(playerId, payload);

  const run: RunRecord = {
    id: uuidv4(),
    playerId,
    validatedScore,
    clientScore: payload.score,
    coinsGranted,
    anomalyFlags,
    excludedFromLeaderboard: anomalous,
    distanceMeters: payload.distanceMeters,
    createdAt: now,
  };
  store.saveRun(run);

  const missions = toMissionProgress(store, store.getPlayerMissions(playerId));

  return {
    accepted: true,
    validatedScore,
    coinsGranted,
    anomalyFlags,
    player: toPublicPlayer(next),
    missions,
  };
}
