import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { spinDaily } from '../services/spinService.js';

export const spinRouter = Router();

spinRouter.post('/daily', requireAuth, (req: AuthedRequest, res, next) => {
  try {
    res.json(spinDaily(req.auth!.sub));
  } catch (err) {
    next(err);
  }
});
