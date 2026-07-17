# Cruza RD — Design Reference (ejecutable)

Fuente: `Cruza_RD_Documento_de_Ejecucion.pdf` v2.0 · Si hay conflicto, el GDD manda.

## Identidad

| Campo | Valor |
|---|---|
| Nombre | Cruza RD — ¡Quítate del Medio! |
| Company | Logic Code Spot |
| Bundle | `com.logiccodespot.cruzard` |
| Motor | Unity 6 + C# · URP · Portrait |
| Target FPS | **60** (piso) |
| Clasificación | E / PEGI 3 |

## Paleta (GDD §7.2)

- Azul `#002D62` · Rojo `#CE1126` · Dorado `#F5A623`
- Verde `#1E8E5A` · Cian `#2FB6C9`

## Arte — presupuesto técnico (GDD §7.3)

| Asset | Tris | Materiales | Notas |
|---|---|---|---|
| Personajes | 3,000–6,000 | 1 + 1 atlas | LOD no obligatorio en player |
| Vehículos | 1,500–3,000 | 1 | Pool obligatorio |
| Props bioma | 200–1,200 | atlas compartido | LOD desde 15 m |
| Draw calls | <60 / escena | máx 2 atlas 2048² / bioma | |

## Biomas (8)

Zona Colonial · Malecón · Santiago · Punta Cana · Jarabacoa · Barrios · Playas · Montañas

## UI Responsive (GDD §9)

- Safe Area First en todo borde interactivo
- Canvas: Scale With Screen Size · match dinámico por aspect
- Anchors relativos 100% · min touch 48 dp
- Validar: iPhone SE · iPhone 15 Pro Max · Android 20:9 · Tablet 10"

## Monetización ética (GDD §12)

- **Cero pay-to-win** — solo cosméticos / conveniencia
- Rewarded: revivir 1× / partida, doblar reward (opcional)
- Interstitial: máx 1 cada 3–4 partidas · nunca mid-run
- IAP: validación server-side antes de otorgar

## Ads / IAP — elección de proveedor

| Sistema | Proveedor elegido | Estado |
|---|---|---|
| Ads | **Unity LevelPlay (IronSource)** — rewarded + interstitial | Stub listo · importar `.unitypackage` oficial en Fase 5 |
| IAP | **Unity IAP** + validación backend (Firebase Functions / ASP.NET) | Stub `ValidateIapReceiptStub` |
| Backend | Firebase Auth · Analytics · Firestore · Remote Config · Crashlytics · FCM | Importar SDK oficial (no UPM) |

## Legal (GDD §4.1 / §13)

- Solo personajes **originales** (arquetipos: estudiante, colmadero, motoconchista, pelotero de barrio, chef fritura, artista urbano)
- Sin figuras públicas reales sin licencia firmada
- Marcas de transporte: preferir **"Guagua Metro"** hasta autorización OMSA
- Voces: actores contratados · licencia en `/Docs/Licencias/` (sensible, fuera de git si aplica)

## Seguridad

- `SaveService` = única puerta a persistencia
- Save cifrado AES + hash de integridad
- Sin secrets en repo (`.keystore`, `google-services.json` en `.gitignore`)
- Economía centralizada — UI no muta moneda
- Analytics sin PII

## Input

- Swipe (Input System) con umbral = fracción de pantalla
- Buffer 150 ms · move 0.12–0.18 s cubic ease
- D-pad on-screen opcional (Ajustes)

## Remote Config keys

- `base_speed` · `speed_per_meter` · `max_density`
