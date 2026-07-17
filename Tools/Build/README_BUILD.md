# Build & Deploy — Cruza RD

## Prerrequisitos

- Unity 6 con módulos Android / iOS
- Android: JDK + SDK via Unity Hub · keystore **fuera del repo**
- iOS: Mac + Xcode + Apple Developer account

## Android AAB (release)

```powershell
.\Tools\Build\Build-Android.ps1 -UnityPath "C:\Program Files\Unity\Hub\Editor\6000.0.32f1\Editor\Unity.exe" -Version "0.9.0-beta.1"
```

Variables de entorno (nunca en git):

- `CRUZARD_KEYSTORE_PATH`
- `CRUZARD_KEYSTORE_PASS`
- `CRUZARD_KEYALIAS`
- `CRUZARD_KEYALIAS_PASS`

## iOS

Abrir en Mac, Switch Platform iOS, Build, firmar en Xcode, subir a TestFlight.

## CI (futuro)

`Tools/CI/` — placeholder para GitHub Actions con Unity license + cache Library.
