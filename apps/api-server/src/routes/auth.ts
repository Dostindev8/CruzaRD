import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { guestAuthSchema, upgradeAuthSchema } from '../schemas.js';
import { guestAuth, upgradeAuthStub } from '../services/authService.js';

export const authRouter = Router();

authRouter.post(
  '/guest',
  authLimiter,
  validate(guestAuthSchema),
  (req, res, next) => {
    try {
      const result = guestAuth(req.body.deviceId as string);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  '/upgrade',
  authLimiter,
  requireAuth,
  validate(upgradeAuthSchema),
  (_req: AuthedRequest, res, next) => {
    try {
      res.status(200).json(upgradeAuthStub());
    } catch (err) {
      next(err);
    }
  },
);
