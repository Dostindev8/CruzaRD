# Cómo activar Cruza RD (stack R3F + API)

## Requisitos
- Node.js 20+
- pnpm 9 (`corepack enable`)

## Arranque (ya activo en esta sesión)

```powershell
cd "c:\Users\UserGPC\OneDrive\Desktop\DS Projects\Games\CruzaRD"
pnpm install
pnpm --filter @cruza-rd/api-server dev
# otra terminal:
pnpm --filter @cruza-rd/game-client dev
```

Abre **http://localhost:5173**

- API: **http://localhost:8787** (`/api/v1/health` → `{"ok":true}`)
- Primera visita → Splash → Onboarding → Home (Imagen 2 hub tras jugar)
- Durante partida → HUD Imagen 1 (Pica Pollo / Salta obstáculos)
- `#debug` → kit de UI

## Controles
Swipe / teclas WASD · Space saltar · E patineta

## Builds
```powershell
pnpm build
pnpm --filter @cruza-rd/api-server test
```

## Prompt Maestro v2
Ver `Docs/PROMPT_MAESTRO_V2_EXEC.md` y `Docs/STATUS.md`.

## Legado
- Unity: `Assets/_Project`
- Flutter: `cruza_rd_flutter` (no tocar — EXTEND-NEVER-OVERWRITE)
