## Estado del Proyecto — Cruza RD
Última actualización: 2026-07-16

✅ COMPLETADO HOY:
- FASE 0 — Setup inicial: estructura `_Project/`, `.gitignore`, Git LFS attrs, `Packages/manifest.json`, Player/Quality settings (Portrait, 60 FPS, Low/Med/High, company Logic Code Spot)
- Documentos: `STATUS.md`, `CHANGELOG.md`, `DESIGN_REFERENCE.md`
- Ícono de marca copiado a `Art/Brand/cruza_rd_icon.png`
- FASE 1 (código): `GameManager`, `EventBus`, `GridMovementController`, `LaneSpawner` + pooling, `DifficultyCurve`, `CameraFollowController`, placeholders grey-box
- UI prioritaria (Fase 3 prep): Safe Area, Responsive Canvas, HUD, Death, Main Menu, Settings, Shop shell, D-pad, `RuntimeUIBuilder`
- Servicios + seguridad: `SaveService` cifrado, `EconomyService`, Ads/Analytics/RemoteConfig stubs, `AudioManager` 4 buses, quality benchmark
- Tráfico Fase 4 prep: OMSA / Motoconcho / Jeepeta patterns, Weather (aguacero), power-ups
- Editor: menú `Cruza RD/Setup Prototype Scene`
- Deploy docs + scripts de build en `Tools/Build`, privacy/store checklists
- Test unitario: `ScoreTrackerTests`

🔄 FASE ACTUAL: Fase 1 — GDD y Prototipo — ~85% checklist (falta verificación en Unity Editor / Device Simulator / Profiler en máquina local)

⏳ SIGUIENTE PASO:
1. Abrir proyecto en **Unity 6** (6000.x)
2. Menú **Cruza RD → Setup Prototype Scene** → Play
3. Validar core loop + Profiler (pooling) + Device Simulator (2+ aspects)
4. Cerrar checklist Fase 1 al 100% y commit `feat: prototipo jugable Fase 1 completo`

⚠️ BLOQUEADORES:
- Unity Hub/Editor no detectado en este entorno de agente — código y config listos; verificación FPS/Device Simulator requiere Unity local
- Firebase / LevelPlay / Unity IAP: stubs listos; importar `.unitypackage` oficiales en fases 4–5 (no instalar todos de golpe)

🎯 FPS VERIFICADO: no (pendiente Unity local)
📱 RESPONSIVE VERIFICADO: no (código Safe Area + scaler listo; pendiente Device Simulator)
🔐 LEGAL/COMPLIANCE:
- Personajes originales enforced en docs/código
- Proveedor ads documentado (LevelPlay)
- Privacy draft en `Docs/Privacy/`
- Pendiente: revisión legal marcas transporte antes de launch

### Checklist Fase 0
- [x] Estructura carpetas GDD §10.3
- [x] STATUS / CHANGELOG / DESIGN_REFERENCE
- [x] .gitignore Unity + LFS patterns
- [x] Packages manifest (Input System, Addressables, URP, Timeline, Test Framework)
- [x] Player Settings Portrait / 60 FPS / company / product
- [x] Quality Low/Medium/High
- [ ] Abrir en Unity y confirmar compile sin errores (local)

### Checklist Fase 1 (en progreso)
- [x] GameManager + EventBus
- [x] GridMovement + input buffer
- [x] LaneSpawner + object pooling
- [x] DifficultyCurve SO
- [x] Cámara look-ahead + FOV dinámico
- [x] HUD mínimo + UI completa runtime
- [ ] Play end-to-end en Editor
- [ ] Profiler: cero picos Instantiate/Destroy
- [ ] 60 FPS Editor + 2 aspect ratios
