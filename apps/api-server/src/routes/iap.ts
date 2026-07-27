import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { iapVerifySchema } from '../schemas.js';
import { verifyIapStub } from '../services/shopService.js';

export const iapRouter = Router();

iapRouter.post(
  '/verify',
  requireAuth,
  validate(iapVerifySchema),
  (req: AuthedRequest, res, next) => {
    try {
      res.json(verifyIapStub(req.auth!.sub, req.body.productId as string));
    } catch (err) {
      next(err);
    }
  },
);
