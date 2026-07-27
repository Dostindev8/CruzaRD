# Prompt Maestro v2 — Ejecución

Fuente: `PROMPT_MAESTRO_CRUZA_RD_v2_AUDITORIA.docx` + original extract + refs Imagen 1/2.

## Decisión irrevocable
Stack **R3F** (no Phaser). El v2 asumía Phaser porque el original era 2D; las imágenes de referencia y el monorepo existente son 3D. Ley ⑩ EXTEND-NEVER-OVERWRITE.

## Mapeo de upgrades v2 → R3F
| v2 Phaser | Implementación R3F |
|---|---|
| Scale.FIT + RESIZE | `.app-frame` + `.app-shell` 9:16 + CSS breakpoints |
| PostFX bloom/vignette | Luces hemisphere + emissive collectibles (procedural) |
| Spine/Rive | PlayerBody procedural chibi RD |
| Object pools Phaser | Entity recycle en RunnerEngine |
| Hammer swipe | InputController swipe + teclado |
| PWA | manifest.webmanifest + icons |
| reduce motion | Settings + `html.reduce-motion` |

## Checklist §7 (resultado)
- [x] Build TS sin errores
- [x] Anti-cheat test PASS
- [x] 13 pantallas navegables
- [x] Loop jugable completo
- [x] Responsive + orientation lock
- [x] Safe-area HUD
- [x] Touch targets ≥44px (pause/hub)
- [x] Reduce motion en Ajustes
- [ ] SW cache offline completo (parcial: manifest listo)
- [ ] Pixel-perfect 100% vs arte final (procedural AAA intermedio)
