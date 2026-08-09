import 'settings_service.dart';

/// 4 buses de audio (Música / SFX / Ambiente / Voz) — GDD v4 §15.
/// Listo para clips; sin assets de audio aún, no crashea.
class AudioService {
  AudioService({required this.settings});

  final SettingsService settings;

  void playSfx(String id) {
    // Hook para flame_audio / audioplayers cuando existan clips en assets/audio/sfx/
    if (settings.sfxVolume <= 0) return;
  }

  void playMusic(String id) {
    if (settings.musicVolume <= 0) return;
  }

  void duckMusic({required bool active}) {
    // Snapshot ducking durante cruces de riesgo
  }

  void stopAll() {}
}
