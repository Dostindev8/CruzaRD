import { store } from '../store/index.js';
import { localDateKey } from '../store/seed.js';
import { conflict } from '../utils/errors.js';
import { toPublicPlayer, touchPlayer } from './playerMapper.js';
import { requirePlayer } from './leaderboardService.js';

function rewardForStreak(streak: number): number {
  if (streak <= 1) return 50;
  if (streak === 2) return 75;
  if (streak === 3) return 100;
  if (streak === 4) return 125;
  if (streak === 5) return 150;
  if (streak === 6) return 200;
  return 300;
}

export function claimLoginReward(playerId: string) {
  const player = requirePlayer(playerId);
  const today = localDateKey();

  if (player.lastLoginClaimDate === today) {
    throw conflict('Login reward already claimed today');
  }

  const yesterday = localDateKey(new Date(Date.now() - 86_400_000));
  const streak =
    player.lastLoginClaimDate === yesterday
      ? player.dailyLoginStreak + 1
      : 1;
  const rewardCoins = rewardForStreak(streak);

  const next = touchPlayer({
    ...player,
    dailyLoginStreak: streak,
    lastLoginClaimDate: today,
    loginRewardAvailable: false,
    coins: player.coins + rewardCoins,
  });
  store.upsertPlayer(next);

  return {
    claimed: true,
    streak,
    rewardCoins,
    player: toPublicPlayer(next),
  };
}
