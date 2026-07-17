# Cruza RD — ¡Quítate del Medio!

Endless-crosser 3D low-poly inspirado en República Dominicana.  
**Unity 6 + C#** · Android & iOS · Full Responsive · 60 FPS

Company: **Logic Code Spot** · Bundle: `com.logiccodespot.cruzard`

## Arranque rápido

1. Instala **Unity Hub** + **Unity 6 LTS** (6000.x) con módulos Android e iOS.
2. Abre esta carpeta como proyecto Unity.
3. Espera a que UPM resuelva paquetes (`Packages/manifest.json`).
4. Menú **Cruza RD → Setup Prototype Scene**.
5. Pulsa **Play**. Controles: swipe / WASD / flechas. D-pad opcional en Ajustes.

## Documentación viva

| Archivo | Uso |
|---|---|
| `Assets/_Project/STATUS.md` | Fase actual · checklist · ancla de sesión |
| `Assets/_Project/DESIGN_REFERENCE.md` | Resumen ejecutable del GDD |
| `Assets/_Project/CHANGELOG.md` | Historial de cambios |
| `Docs/Store/STORE_CHECKLIST.md` | Publicación Play / App Store |
| `Docs/Privacy/PRIVACY_DRAFT.md` | Data Safety / App Privacy |

GDD maestro: `Cruza_RD_Documento_de_Ejecucion.pdf`

## Arquitectura

```
Assets/_Project/
  Scripts/{Core,Gameplay,Characters,Economy,Progression,UI,Audio,Services,Infrastructure}
  Art/ · Audio/ · Prefabs/ · ScriptableObjects/ · Addressables/ · Editor/ · Scenes/
```

- Gameplay ↔ UI desacoplados vía **EventBus**
- Persistencia solo por **SaveService** (cifrado)
- Economía solo por **EconomyService**
- Object pooling desde el prototipo

## Seguridad

- No commits de keystores, `google-services.json`, ni secrets
- IAP: stub de validación de recibo — producción requiere backend
- Personajes originales únicamente (GDD §4.1)

## Build

Ver `Tools/Build/README_BUILD.md`. Scripts PowerShell para Android AAB (requiere Unity en PATH).

## Fases

0 Setup → 1 Prototipo → 2 Arte → 3 Mecánicas → 4 IA → 5 Monetización → 6 Beta → 7 Launch
