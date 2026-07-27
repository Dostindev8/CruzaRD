# Cruza RD API Server

Express + TypeScript backend for Cruza RD (`/api/v1`).

## Persistence (no Mongo for local DoD)

This server uses an **in-memory `Map` store** (`src/store/memoryStore.ts`) so it runs **without MongoDB** for local Definition of Done.

- Contract: `IStore` in `src/store/types.ts`
- Wiring: `src/store/index.ts` exports the active store singleton
- To swap later: implement `MongoStore implements IStore` and select it when `MONGODB_URI` is set

## Quick start

```bash
# from monorepo root
pnpm install
cp apps/api-server/.env.example apps/api-server/.env
pnpm --filter @cruza-rd/api-server dev
```

Server listens on `http://localhost:8787` by default.

## Auth

- `POST /api/v1/auth/guest` `{ "deviceId": "..." }` → JWT access token
- Production TTL: **15m**; local (`NODE_ENV !== production`): **7d** for DX (see `src/config.ts`)

## Tests

```bash
pnpm --filter @cruza-rd/api-server test
```

Includes a unit/integration test that posts a forged high score and asserts `anomalyFlags` contains `SCORE_DELTA_GT_5PCT`.

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/guest` | — |
| POST | `/api/v1/auth/upgrade` | Bearer (stub) |
| GET | `/api/v1/player/me` | Bearer |
| POST | `/api/v1/runs` | Bearer (1/20s, server score) |
| GET | `/api/v1/leaderboard?scope=global\|weekly` | Bearer |
| GET | `/api/v1/missions` | Bearer |
| POST | `/api/v1/missions/:id/claim` | Bearer |
| POST | `/api/v1/spin/daily` | Bearer |
| POST | `/api/v1/login-reward/claim` | Bearer |
| GET | `/api/v1/shop/items` | Bearer |
| POST | `/api/v1/shop/purchase` | Bearer |
| POST | `/api/v1/iap/verify` | Bearer (stub) |
