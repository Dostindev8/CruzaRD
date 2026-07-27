import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { leaderboardQuerySchema } from '../schemas.js';
import { getLeaderboard } from '../services/leaderboardService.js';

export const leaderboardRouter = Router();

leaderboardRouter.get(
  '/',
  requireAuth,
  validate(leaderboardQuerySchema, 'query'),
  (req: AuthedRequest, res, next) => {
    try {
      const scope =
        (req.query.scope as 'global' | 'weekly' | undefined) ?? 'global';
      const entries = getLeaderboard(scope, req.auth!.sub);
      res.json({ scope, entries });
    } catch (err) {
      next(err);
    }
  },
);
