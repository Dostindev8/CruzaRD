# STATUS — Cruza RD (Mundo Real Deploy)

**Fecha:** 2026-07-26 · God-Stack-Ing · PRODUCCIÓN  
**URL:** https://cruza-rd.vercel.app  
**Repo:** https://github.com/Dostindev8/CruzaRD

## Causa del 404 (resuelta)
GitHub solo tenía `RFADMF.md` (Initial commit). Vercel desplegaba un repo sin `index.html` → **404 NOT_FOUND**.  
Fix: subir monorepo R3F + `vercel.json` con `outputDirectory: apps/game-client/dist`.

## Stack
React 19 + R3F + Vite 6 · offline-first en Vercel (API local opcional)

## QA
- [x] `pnpm build` client PASS
- [x] Anti-cheat API test PASS
- [x] Full responsive + orientation lock
- [x] Splash / Hub / Runner alineados a refs
- [x] vercel.json + security headers

## Arranque local
Ver `README.md` / `Docs/COMO_ACTIVAR.md`
