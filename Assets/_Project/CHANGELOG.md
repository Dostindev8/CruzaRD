# Changelog — Cruza RD

## [0.2.0] — 2026-07-17 — Estándar v3.0 (Game Feel + Seguridad)

### Added
- AnimationService: única capa gameplay→Animator, set de 9 estados obligatorio (GDD v3 §5.1), squash & stretch procedural, Root Motion off
- FeedbackService: screen shake calibrado, háptica por evento, partículas de juice únicas por categoría de ítem — consumido vía EventBus
- NearMissDetector: esquive por margen mínimo → puntos bonus + micro-shake + reacción (GDD v3 §4)
- Death-cam cinematográfica: cámara lenta 0.8s tras impacto antes de la pantalla de resultado (estándar Temple Run)
- EventBus: NearMissEvent, PlayerImpactEvent, PlayerMoveEvent, PowerUpActivatedEvent
- UI AAA (GDD v3 §11.2): UIButtonJuice (escala 0.95x con easing en todos los botones), AnimatedCounter (conteo animado en HUD y muerte)
- Ajustes de accesibilidad (GDD v3 §11.4): toggles de háptica y reducir movimiento, persistidos en save

### Security (GDD v3 §13)
- SecurityService: validación de rangos plausibles de puntaje/distancia antes de acreditar moneda (anti-cheat cliente), SecureInt con XOR anti memory-editing, heurística anti-tampering
- RunRewardsListener bloquea recompensas de partidas con valores imposibles

### Changed
- PlayerCharacterController ya no toca el Animator directamente (delegado a AnimationService)
- DifficultyCurve respeta el tope `_maxDangerousLaneChance`
- 0 errores y 0 warnings de compilación verificados en batchmode

## [0.1.0] — 2026-07-16

### Added
- Estructura completa `Assets/_Project` según GDD §10.3
- Core: EventBus, GameManager, GameBootstrap, PrototypeSceneBootstrap, ServiceLocator
- Gameplay: grid movement, lane spawner + object pool, difficulty curve, camera follow, collisions, weather, traffic patterns, power-ups
- UI full-responsive: SafeAreaHandler, ResponsiveCanvasScaler, Main Menu, HUD, Death, Settings, Shop, On-screen D-pad, RuntimeUIBuilder
- Services: encrypted SaveService, EconomyService, Ads/Analytics/RemoteConfig stubs
- AudioManager con 4 buses + ducking API
- Editor menus para escena prototipo
- Docs de diseño, privacy, store checklist y scripts de build
- Test: ScoreTracker multiplier

### Security
- Save cifrado AES + integrity hash
- `.gitignore` bloquea keystores y `google-services.json`
- Economía centralizada (UI no muta moneda)
