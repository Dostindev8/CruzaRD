import { Router } from 'express';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { shopPurchaseSchema } from '../schemas.js';
import { listShopItems, purchaseShopItem } from '../services/shopService.js';

export const shopRouter = Router();

shopRouter.get('/items', requireAuth, (_req, res, next) => {
  try {
    res.json(listShopItems());
  } catch (err) {
    next(err);
  }
});

shopRouter.post(
  '/purchase',
  requireAuth,
  validate(shopPurchaseSchema),
  (req: AuthedRequest, res, next) => {
    try {
      res.json(purchaseShopItem(req.auth!.sub, req.body.itemId as string));
    } catch (err) {
      next(err);
    }
  },
);
