import type { LeaderboardEntry } from '@cruza-rd/shared-types';
import { store } from '../store/index.js';
import { weekKey } from '../store/seed.js';
import { notFound } from '../utils/errors.js';

export function getLeaderboard(
  scope: 'global' | 'weekly',
  selfPlayerId?: string,
): LeaderboardEntry[] {
  const rivals = store.getSeedLeaderboard();
  const currentWeek = weekKey();

  const live = store.listPlayers().map((p) => {
    const score =
      scope === 'weekly'
        ? p.weeklyScoreWeekKey === currentWeek
          ? p.weeklyScore
          : 0
        : p.leaderboardScore;
    return {
      playerId: p.id,
      displayName: p.displayName,
      bestScore: score,
    };
  });

  const merged = new Map<string, { playerId: string; displayName: string; bestScore: number }>();
  for (const r of rivals) merged.set(r.playerId, r);
  for (const p of live) {
    const existing = merged.get(p.playerId);
    if (!existing || p.bestScore >= existing.bestScore) {
      merged.set(p.playerId, p);
    }
  }

  const sorted = [...merged.values()].sort((a, b) => b.bestScore - a.bestScore);
  return sorted.slice(0, 50).map((entry, i) => ({
    rank: i + 1,
    playerId: entry.playerId,
    displayName: entry.displayName,
    bestScore: entry.bestScore,
    isSelf: selfPlayerId ? entry.playerId === selfPlayerId : false,
  }));
}

export function requirePlayer(playerId: string) {
  const player = store.getPlayer(playerId);
  if (!player) throw notFound('Player not found');
  return player;
}
