# FASE 0 — Pre-audit Cruza RD (2026-08-08)

## Stack real del repo (no Phaser)

| Prompt asumía | Repo real |
|---|---|
| Phaser 3 scenes | **React 19 + R3F + Vite + Zustand** (`apps/game-client`) |
| Tailwind | CSS tokens (`src/styles/tokens.css`) |
| Deploy Vercel 100% frontend | `vercel.json` → `apps/game-client/dist` (API opcional local) |

Ley ⑩: **EXTEND R3F**, no migrar a Phaser.

## Mapeo de escenas

| Prompt Phaser | Implementación |
|---|---|
| BootScene | `BootGate` mínimo en App |
| PreloadScene | `TechPreloadScreen` |
| IntroCinematicScene | `IntroCinematicScreen` |
| MainMenuScene | `HomeHubScreen` + parallax |
| RewardWheel | `ui/RewardWheel/*` + `DailySpinScreen` |

## Existente a extender
- `SplashScreen` → reemplazar/extender con tech loader
- `DailySpinScreen` → rediseño con config + física 3 fases
- `RunnerScene` idle → base de fondo animado
- `appStore` Zustand → inventario giros / cooldown
- Howler: buses listos en docs; SFX sintéticos WebAudio si no hay assets

## Logo
- Fuente: `CruzaRD.png` → `public/branding/cruzard-logo.png` (activo aprobado, no regenerar)
