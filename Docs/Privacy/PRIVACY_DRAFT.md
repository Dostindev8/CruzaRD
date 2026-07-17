# Cruza RD — Privacy Draft (Data Safety / App Privacy)

> Reflejar exactamente lo que Firebase / Ads / Analytics recolectan. Actualizar antes de submit.

## Datos recolectados (previsto)

| Dato | Propósito | Compartido con | Opcional |
|---|---|---|---|
| ID de instalación / instancia | Analytics, Remote Config, Crashlytics | Firebase | No (técnico) |
| Eventos de gameplay (score, distancia, bioma) | Balance, KPIs | Firebase Analytics | No |
| Crash logs / stack traces | Estabilidad | Firebase Crashlytics | No |
| Advertising ID (si ads activos) | Rewarded / interstitial | LevelPlay + partners | Sí (ATT / opt-out) |
| Compras IAP (token de recibo) | Validación anti-fraude | Apple/Google + backend propio | Solo si compra |
| Progreso de juego (nube) | Sync multi-dispositivo | Firestore | Si inicia sesión |

## Datos que NO recolectamos

- Nombre real, email (salvo login opcional futuro)
- Ubicación precisa
- Contactos / fotos / micrófono
- Contenido de mensajes

## Menores

Clasificación E / PEGI 3. Si se habilita categoría Kids: cumplimiento COPPA / Families Policy · ads contextuales únicamente.

## Contacto privacidad

`privacy@logiccodespot.com` (actualizar con dominio real)
URL in-app: `https://logiccodespot.com/cruzard/privacy`
