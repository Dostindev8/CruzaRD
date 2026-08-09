import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Minimal .env loader — no dotenv dependency required. */
export function loadEnv(cwd = process.cwd()): void {
  const path = resolve(cwd, '.env');
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv();

const isProd = process.env.NODE_ENV === 'production';

const DEV_JWT_SECRET = 'dev-only-insecure-secret-change-me';

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (isProd && (!secret || secret === DEV_JWT_SECRET)) {
    // Booting production with a public secret would let anyone forge a player token.
    throw new Error('JWT_SECRET must be set to a strong unique value in production');
  }
  return secret ?? DEV_JWT_SECRET;
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  jwtSecret: resolveJwtSecret(),
  isProd,
  /**
   * Production: 15 minutes.
   * Local DX: 7 days so you are not constantly re-authing while iterating.
   */
  accessTokenTtl: isProd ? '15m' : '7d',
  scoreAnomalyTolerance: 0.05,
  runRateLimitMs: 20_000,
  corsOrigin: process.env.CORS_ORIGIN ?? true,
} as const;
