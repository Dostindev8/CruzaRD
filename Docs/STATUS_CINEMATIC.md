# STATUS — Cinematic + Wheel + Mobile (2026-08-08)

## FASE 0
Stack real = **R3F + Vite + Zustand** (no Phaser). Ver `Docs/FASE0_PREAUDIT_CINEMATIC.md`.

## Entregado
| Fase | DoD |
|---|---|
| 1 Tech preload | ✅ Logo scan reveal + progreso real de assets + ticks 25% + flash 100% |
| 2 Intro | ✅ 3 beats, skip 44px, sessionStorage, reduce-motion |
| 3 Parallax | ✅ `ParallaxBackground` menú/intro/hud |
| 4 Ruleta | ✅ Física 3 fases, premio precalculado, drag, rareza, cooldown 24h, config + test 10k |
| 5-6 QA | ✅ `pnpm build` + `pnpm test` limpios |

## Cómo probar
```powershell
pnpm --filter @cruza-rd/game-client dev
```
Flujo: Tech logo → Intro (1×/sesión) → Onboarding/Home → GIRO DIARIO

Logo: `apps/game-client/public/branding/cruzard-logo.png`
