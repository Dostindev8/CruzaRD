import {
  SPIN_COOLDOWN_MS,
  SPIN_PRIZE_TABLE,
  type SpinPrizeDef,
  type SpinResult,
} from '@cruza-rd/shared-types';
import { store } from '../store/index.js';
import { conflict } from '../utils/errors.js';
import { toPublicPlayer, touchPlayer } from './playerMapper.js';
import { requirePlayer } from './leaderboardService.js';

/** Server is the source of truth for which segment wins — the client only animates to it. */
function pickWeighted(): SpinPrizeDef {
  const total = SPIN_PRIZE_TABLE.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * total;
  for (const prize of SPIN_PRIZE_TABLE) {
    roll -= prize.weight;
    if (roll <= 0) return prize;
  }
  return SPIN_PRIZE_TABLE[SPIN_PRIZE_TABLE.length - 1]!;
}

export function spinDaily(playerId: string): SpinResult {
  const player = requirePlayer(playerId);
  const now = Date.now();

  if (
    player.lastSpinAt !== null &&
    now - player.lastSpinAt < SPIN_COOLDOWN_MS &&
    !player.spinAvailable
  ) {
    throw conflict('Daily spin already used. Come back tomorrow.');
  }

  const prize = pickWeighted();
  let next = touchPlayer({ ...player, lastSpinAt: now, spinAvailable: false });

  switch (prize.prizeType) {
    case 'coins':
      next = { ...next, coins: next.coins + prize.amount };
      break;
    case 'picaPollo':
      next = {
        ...next,
        picaPolloTickets: next.picaPolloTickets + prize.amount,
      };
      break;
    case 'skateboard':
      next = {
        ...next,
        skateboardCharges: next.skateboardCharges + prize.amount,
      };
      break;
    case 'spin_again':
      next = { ...next, coins: next.coins + prize.amount, spinAvailable: true };
      break;
    case 'skin':
      break;
  }

  store.upsertPlayer(next);
  return {
    prizeId: prize.id,
    prizeType: prize.prizeType,
    amount: prize.amount,
    label: prize.label['es-DO'],
    player: toPublicPlayer(next),
  };
}
