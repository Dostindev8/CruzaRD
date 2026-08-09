import 'package:shared_preferences/shared_preferences.dart';

class SettingsService {
  bool hapticsEnabled = true;
  bool reduceMotion = false;
  bool useOnScreenDpad = false;
  bool highContrastHud = false;
  double musicVolume = 0.8;
  double sfxVolume = 1.0;
  double ambienceVolume = 0.7;
  double voiceVolume = 0.9;
  String language = 'es';

  Future<void> load() async {
    final p = await SharedPreferences.getInstance();
    hapticsEnabled = p.getBool('haptics') ?? true;
    reduceMotion = p.getBool('reduce_motion') ?? false;
    useOnScreenDpad = p.getBool('dpad') ?? false;
    highContrastHud = p.getBool('high_contrast') ?? false;
    musicVolume = p.getDouble('music') ?? 0.8;
    sfxVolume = p.getDouble('sfx') ?? 1.0;
    ambienceVolume = p.getDouble('ambience') ?? 0.7;
    voiceVolume = p.getDouble('voice') ?? 0.9;
    language = p.getString('lang') ?? 'es';
  }

  Future<void> save() async {
    final p = await SharedPreferences.getInstance();
    await p.setBool('haptics', hapticsEnabled);
    await p.setBool('reduce_motion', reduceMotion);
    await p.setBool('dpad', useOnScreenDpad);
    await p.setBool('high_contrast', highContrastHud);
    await p.setDouble('music', musicVolume);
    await p.setDouble('sfx', sfxVolume);
    await p.setDouble('ambience', ambienceVolume);
    await p.setDouble('voice', voiceVolume);
    await p.setString('lang', language);
  }
}
