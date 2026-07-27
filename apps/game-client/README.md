# Cruza RD — Monorepo (R3F + API)

Endless runner 3D temático República Dominicana · Logic Code Spot / Dostin Santana.

## Stack

| Capa | Tech |
|---|---|
| Cliente | React 19 · Vite 6 · R3F · Zustand · Framer Motion |
| API | Express · TypeScript · JWT · Zod · in-memory store (Mongo-ready) |
| Shared | `@cruza-rd/shared-types` |

Unity (`Assets/_Project`) y Flutter (`cruza_rd_flutter`) se conservan como legado — **extend-never-overwrite**.

## Cómo activar (dev)

```bash
# desde la raíz del repo
corepack enable
pnpm install
pnpm --filter @cruza-rd/api-server dev   # http://localhost:8787
pnpm --filter @cruza-rd/game-client dev  # http://localhost:5173
```

O en paralelo: `pnpm dev`

- UI kit: abrir `http://localhost:5173/#debug`
- Referencias visuales: `apps/game-client/public/reference/{splash,home-hub,gameplay}.png`

## Controles

| Input | Acción |
|---|---|
| Swipe ↑ / W / Space | Saltar |
| Swipe ↓ / S | Agachar |
| Swipe ←→ / A D | Carril |
| Doble tap / E | Patineta |

## Build

```bash
pnpm build
pnpm --filter @cruza-rd/api-server test
```

## Capacitor (fase empaquetado)

```bash
cd apps/game-client
pnpm build
npx cap add android   # cuando toque Fase 14
```
