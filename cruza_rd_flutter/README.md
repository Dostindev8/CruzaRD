# Cruza RD — Flutter + Flame (GDD v4.0)

Endless crosser dominicano multiplataforma (Android · iOS · Web · Windows).  
Estudio: **Logic Code Spot** · Package: `com.cruzard.cruza_rd`

## Activar (rápido)

Requisito: Flutter estable en PATH (ya instalado en `%LOCALAPPDATA%\flutter` si usaste este setup).

```powershell
# 1) Ir al proyecto Flutter
cd "c:\Users\UserGPC\OneDrive\Desktop\DS Projects\Games\CruzaRD\cruza_rd_flutter"

# 2) Dependencias
flutter pub get

# 3) Jugar en Chrome (recomendado ahora — no requiere Android SDK)
flutter run -d chrome -t lib/main_dev.dart

# Alternativa: listar dispositivos
flutter devices
```

### Controles
- **Swipe** / arrastre: arriba, abajo, izquierda, derecha  
- **Teclado**: WASD o flechas  
- **D-pad**: activable en Ajustes  

### Qué verás
Splash con marca → Menú → **JUGAR** → carriles, tráfico (OMSA/taxi/motoconcho), recolectables, power-ups culturales, near-miss, death-cam y pantalla de muerte con conteo animado.

## Flavors
| Flavor | Entry |
|---|---|
| dev | `lib/main_dev.dart` |
| staging | `lib/main_staging.dart` |
| prod | `lib/main_prod.dart` |

```powershell
flutter run -d chrome -t lib/main_dev.dart
```

## Tests
```powershell
flutter analyze
flutter test
```

## Build
```powershell
flutter build web --release -t lib/main_prod.dart
# Android (requiere Android Studio/SDK):
flutter build apk --release -t lib/main_prod.dart
```

## Arquitectura
Clean Architecture + Flame game loop:
- `lib/core` — constants, theme, security, DI, responsive  
- `lib/game` — CruzaRDGame, managers, pooling/spawn, biomas, juice  
- `lib/presentation` — Splash, Menú, Gameplay, Tienda, Ajustes  
- Unity legacy queda en `Assets/_Project` (referencia); el producto activo es Flutter.

## Seguridad (v4)
- AES-256 con clave aleatoria en `flutter_secure_storage` (nunca hardcodeada)  
- IV aleatorio por mensaje  
- Validación de rangos de score/distancia antes de acreditar papeletas  
- Firebase / certificate pinning: hooks listos; añadir keys en Fase 5+

## Brand
Assets en `assets/images/ui/` (hero + logo). Design system: `/design-system/MASTER.md`.
