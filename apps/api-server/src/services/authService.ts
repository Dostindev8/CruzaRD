import { v4 as uuidv4 } from 'uuid';
import { store } from '../store/index.js';
import { createGuestPlayer } from '../store/seed.js';
import { badRequest } from '../utils/errors.js';
import { signAccessToken } from '../utils/jwt.js';
import { toPublicPlayer } from './playerMapper.js';

export function guestAuth(deviceId: string) {
  const trimmed = deviceId.trim();
  if (!trimmed) throw badRequest('deviceId is required');

  let player = store.getPlayerByDeviceId(trimmed);
  if (!player) {
    player = createGuestPlayer(uuidv4(), trimmed);
    store.upsertPlayer(player);
    store.ensurePlayerMissions(player.id);
  }

  const accessToken = signAccessToken(player.id, player.deviceId);
  return {
    accessToken,
    tokenType: 'Bearer' as const,
    player: toPublicPlayer(player),
  };
}

export function upgradeAuthStub() {
  return {
    upgraded: false,
    message:
      'Account linking (Google/Apple/email) is stubbed for local DoD. Guest JWT remains valid.',
  };
}
