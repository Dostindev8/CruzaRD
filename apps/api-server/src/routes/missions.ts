import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { missionIdParamsSchema } from '../schemas.js';
import { claimMission, listMissions } from '../services/missionService.js';

export const missionsRouter = Router();

missionsRouter.get('/', requireAuth, (req: AuthedRequest, res, next) => {
  try {
    res.json(listMissions(req.auth!.sub));
  } catch (err) {
    next(err);
  }
});

missionsRouter.post(
  '/:id/claim',
  requireAuth,
  validate(missionIdParamsSchema, 'params'),
  (req: AuthedRequest, res, next) => {
    try {
      const id = String(req.params.id);
      res.json(claimMission(req.auth!.sub, id));
    } catch (err) {
      next(err);
    }
  },
);
