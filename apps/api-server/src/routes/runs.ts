import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { runPayloadSchema } from '../schemas.js';
import { submitRun } from '../services/runService.js';

export const runsRouter = Router();

runsRouter.post(
  '/',
  requireAuth,
  validate(runPayloadSchema),
  (req: AuthedRequest, res, next) => {
    try {
      const result = submitRun(req.auth!.sub, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
);
