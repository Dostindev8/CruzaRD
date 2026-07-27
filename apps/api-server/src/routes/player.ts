import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { store } from '../store/index.js';
import { notFound } from '../utils/errors.js';
import { toPublicPlayer } from '../services/playerMapper.js';

export const playerRouter = Router();

playerRouter.get('/me', requireAuth, (req: AuthedRequest, res, next) => {
  try {
    const player = store.getPlayer(req.auth!.sub);
    if (!player) throw notFound('Player not found');
    res.json({ player: toPublicPlayer(player) });
  } catch (err) {
    next(err);
  }
});
