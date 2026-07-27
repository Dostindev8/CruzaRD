# STATUS — Cruza RD (Mundo Real · LIVE)

**Fecha:** 2026-07-26 · God-Stack-Ing  
**Producción:** https://cruza-rd.vercel.app → **HTTP 200** (404 resuelto)  
**GitHub:** https://github.com/Dostindev8/CruzaRD (`main` @ d459852)

## Causa raíz del 404
El repo solo tenía `RFADMF.md`. Vercel no tenía `index.html` → NOT_FOUND.

## Fix aplicado
1. Subir monorepo R3F (`apps/`, `Packages/shared-types`, `vercel.json`)
2. `outputDirectory: apps/game-client/dist`
3. Workspace case-sensitive: `Packages/shared-types` (Linux)
4. `.vercelignore` excluye Unity `Library/` (upload slim)

## QA producción
| Check | Resultado |
|---|---|
| https://cruza-rd.vercel.app | 200 + HTML del juego |
| /manifest.webmanifest | 200 |
| Build Vercel | PASS (shared-types + client) |
| GitHub main | Force-push juego completo |

## Experiencia
Splash RD · Hub misiones/tabla · Runner 3D OMSA/COLMADO · offline-first · full responsive

## Local
```powershell
pnpm install
pnpm --filter @cruza-rd/api-server dev
pnpm --filter @cruza-rd/game-client dev
```
