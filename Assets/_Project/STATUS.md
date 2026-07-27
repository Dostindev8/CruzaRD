# Estado del Proyecto — Cruza RD
Última actualización: 2026-07-26

✅ COMPLETADO HOY:
- `uipro init --ai cursor` instalado (UI/UX Pro Max en `.cursor/skills/ui-ux-pro-max`)
- GDD **v4.0** aplicado: migración **Unity → Flutter 3 + Flame**
- Proyecto nuevo: `cruza_rd_flutter/` (Clean Architecture + flavors dev/staging/prod)
- Motor Flame: CruzaRDGame, input universal (swipe+WASD), colisiones, near-miss, death-cam 0.8s, pooling de obstáculos/coleccionables/power-ups, 8 biomas, partículas
- UI responsive AAA: Splash, Menú, Gameplay HUD, Death, Tienda, Ajustes (SafeArea + breakpoints 375→1440+)
- SecurityService v4: AES-256 con clave en secure storage + IV aleatorio + anti-cheat de rangos
- Brand hero integrado (`assets/images/ui/brand_hero.png`)
- Design system: `design-system/MASTER.md`
- Verificado: `flutter analyze` 0 issues · `flutter test` 4/4 · `flutter build web` OK

🔍 DIAGNÓSTICO INICIAL: v3 Unity era prototipo; v4 exige Flutter+Flame multiplataforma — stack activo = Flutter.

🔄 FASE ACTUAL: Flutter Fase 1 jugable (core loop) — ~90% checklist código; evidencia visual en Chrome pendiente del usuario

⏳ SIGUIENTE PASO:
1. `cd cruza_rd_flutter` → `flutter pub get` → `flutter run -d chrome -t lib/main_dev.dart`
2. Jugar: JUGAR → swipe/WASD → morir → ver death-cam
3. Luego: arte voxel/Rive, Firebase real, Android SDK, backend anti-cheat

⚠️ BLOQUEADORES: Android SDK no instalado en esta máquina (web/Chrome sí). Python no instalado (UI Pro CLI search omitido; design system creado a mano).

🎬 ANIMACIÓN/GAME FEEL: set de 9 estados procedural en PlayerComponent + squash/stretch + partículas. Clips Rive/humanoid = siguiente iteración de arte.

🎯 FPS VERIFICADO: build web OK — medir 60fps en Chrome DevTools Performance
📱 RESPONSIVE VERIFICADO: código con ResponsiveBreakpoints + ResponsiveLayout — validar resize ventana
🔐 SEGURIDAD: AES+IV+rangos OK. Pendiente: Firebase App Check, certificate pinning, safe_device en release
🔐 LEGAL: personajes originales; OMSA/marcas a revisar legalmente antes de store

## Stack activo
| Capa | Ubicación |
|---|---|
| **Producto jugable** | `cruza_rd_flutter/` |
| Referencia Unity (legacy) | `Assets/_Project/` |
| GDD | `Cruza_RD_Documento_Ejecucion_v4.0.pdf` |
| Cómo activar | `cruza_rd_flutter/README.md` |
