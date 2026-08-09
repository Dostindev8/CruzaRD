# Cómo activar Cruza RD (Flutter)

## Opción A — Chrome (la más rápida ahora)

1. Abre **PowerShell**.
2. Ejecuta:

```powershell
$env:Path = "$env:LOCALAPPDATA\flutter\bin;" + $env:Path
cd "c:\Users\UserGPC\OneDrive\Desktop\DS Projects\Games\CruzaRD\cruza_rd_flutter"
flutter pub get
flutter run -d chrome -t lib/main_dev.dart
```

3. En el juego: espera el splash → **JUGAR** → muévete con **WASD / flechas / swipe**.

## Opción B — Desde VS Code / Cursor

1. Abre la carpeta `cruza_rd_flutter` (no solo la raíz Unity).
2. Instala la extensión **Flutter**.
3. Pulsa **F5** o elige device **Chrome** y run `lib/main_dev.dart`.

## Controles
| Input | Acción |
|---|---|
| ↑ / W / swipe up | Avanzar |
| ↓ / S / swipe down | Retroceder |
| ← → / A D | Cambiar carril |
| Ajustes → D-pad | Controles en pantalla |

## Si `flutter` no se reconoce
```powershell
$env:Path = "$env:LOCALAPPDATA\flutter\bin;" + $env:Path
```
Para hacerlo permanente: agrega `%LOCALAPPDATA%\flutter\bin` a las variables de entorno PATH de Windows.
