# Changelog — Cruza RD

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
