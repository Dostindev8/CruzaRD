import type { SpinResult } from '@cruza-rd/shared-types';
import { store } from '../store/index.js';
import { conflict } from '../utils/errors.js';
import { toPublicPlayer, touchPlayer } from './playerMapper.js';
import { requirePlayer } from './leaderboardService.js';

const SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const PRIZES: Array<Omit<SpinResult, 'player'>> = [
  { prizeType: 'coins', amount: 50, label: '+50 monedas' },
  { prizeType: 'coins', amount: 100, label: '+100 monedas' },
  { prizeType: 'coins', amount: 250, label: '+250 monedas' },
  { prizeType: 'picaPollo', amount: 1, label: '+1 Pica Pollo' },
  { prizeType: 'skateboard', amount: 1, label: '+1 Skateboard' },
  { prizeType: 'spin_again', amount: 0, label: '¡Gira otra vez!' },
];

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

  const prize = PRIZES[Math.floor(Math.random() * PRIZES.length)]!;
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
      next = { ...next, spinAvailable: true };
      break;
    case 'skin':
      break;
  }

  store.upsertPlayer(next);
  return { ...prize, player: toPublicPlayer(next) };
}
