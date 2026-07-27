import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { claimLoginReward } from '../services/loginRewardService.js';

export const loginRewardRouter = Router();

loginRewardRouter.post(
  '/claim',
  requireAuth,
  (req: AuthedRequest, res, next) => {
    try {
      res.json(claimLoginReward(req.auth!.sub));
    } catch (err) {
      next(err);
    }
  },
);
