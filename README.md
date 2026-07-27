# Cruza RD — ¡Quítate del medio!

Endless runner dominicano (estilo Subway Surfers) ambientado en Santo Domingo.  
Esquiva OMSAs, recolecta mangú / pica pollo / monedas, full responsive PWA.

**Stack activo:** TypeScript · React 19 · React Three Fiber · Vite 6 · Zustand · Express API  
**Studio:** Logic Code Spot · Bundle: `com.cruzard.cruza_rd`

## Jugar (producción)

- **Vercel:** https://cruza-rd.vercel.app  
- Offline-first: si la API no está disponible, el juego corre en modo local.

## Arranque local

```powershell
cd CruzaRD
corepack enable
pnpm install
pnpm --filter @cruza-rd/api-server dev
pnpm --filter @cruza-rd/game-client dev
```

Abre http://localhost:5173

## Controles

| Input | Acción |
|---|---|
| Swipe ←→ / A D | Cambiar carril |
| Swipe ↑ / Space / W | Saltar |
| Swipe ↓ / S | Agacharse |
| E | Patineta |

## Monorepo

```
apps/game-client   → Vite + R3F (UI + motor 3D)
apps/api-server    → Express + Zod + JWT + anti-cheat
Packages/shared-types
Docs/              → STATUS, Prompt Maestro exec, store
```

## Deploy Vercel

Root `vercel.json` construye `apps/game-client/dist`.  
Commit a `main` → deploy automático (o `vercel --prod`).

## Referencias visuales

Splash voxel RD · Hub (misiones/tabla/jugar) · Runner HUD (pica pollo / saltos / skate).

## Legado

- Unity: `Assets/_Project` (no borrar)
- Flutter: `cruza_rd_flutter` (no borrar)

## Licencia

Propiedad de Logic Code Spot / Dostin Santana.
