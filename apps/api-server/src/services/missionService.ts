import { store } from '../store/index.js';
import { conflict, notFound } from '../utils/errors.js';
import {
  toMissionProgress,
  toPublicPlayer,
  touchPlayer,
} from './playerMapper.js';
import { requirePlayer } from './leaderboardService.js';

export function listMissions(playerId: string) {
  requirePlayer(playerId);
  return {
    missions: toMissionProgress(store, store.getPlayerMissions(playerId)),
  };
}

export function claimMission(playerId: string, missionId: string) {
  const player = requirePlayer(playerId);
  const template = store.getMissionTemplate(missionId);
  if (!template) throw notFound('Mission not found');

  const states = store.getPlayerMissions(playerId);
  const state = states.find((s) => s.missionTemplateId === missionId);
  if (!state) throw notFound('Mission progress not found');
  if (!state.completed) throw conflict('Mission not completed yet');
  if (state.claimed) throw conflict('Mission already claimed');

  store.setPlayerMission(playerId, { ...state, claimed: true });

  const next = touchPlayer({
    ...player,
    coins: player.coins + template.rewardCoins,
    picaPolloTickets: player.picaPolloTickets + template.rewardPicaPollo,
  });
  store.upsertPlayer(next);

  return {
    claimed: true,
    rewardCoins: template.rewardCoins,
    rewardPicaPollo: template.rewardPicaPollo,
    player: toPublicPlayer(next),
    missions: toMissionProgress(store, store.getPlayerMissions(playerId)),
  };
}
