import { z } from 'zod';

export const guestAuthSchema = z.object({
  deviceId: z.string().min(8).max(128),
});

export const upgradeAuthSchema = z.object({
  provider: z.enum(['google', 'apple', 'email']),
  idToken: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const runPayloadSchema = z.object({
  distanceMeters: z.number().min(0).max(1_000_000),
  score: z.number().min(0).max(50_000_000),
  multiplierMax: z.number().min(1).max(8),
  coinsEarned: z.number().int().min(0).max(1_000_000),
  picaPolloCollected: z.number().int().min(0).max(10_000),
  bananasCollected: z.number().int().min(0).max(100_000),
  jumpsCount: z.number().int().min(0).max(100_000),
  slidesCount: z.number().int().min(0).max(100_000),
  powerupUsesCount: z.number().int().min(0).max(10_000),
  revivesUsed: z.number().int().min(0).max(50),
  clothesCollected: z.number().int().min(0).max(10_000).optional(),
  weaponsCollected: z.number().int().min(0).max(10_000).optional(),
  politiciansCleared: z.number().int().min(0).max(10_000).optional(),
  clientChecksum: z.string().max(256).optional(),
});

export const leaderboardQuerySchema = z.object({
  scope: z.enum(['global', 'weekly']).default('global'),
});

export const missionIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const shopPurchaseSchema = z.object({
  itemId: z.string().min(1),
});

export const iapVerifySchema = z.object({
  productId: z.string().min(1),
  receipt: z.string().min(1).optional(),
  platform: z.enum(['android', 'ios', 'web']).optional(),
});
