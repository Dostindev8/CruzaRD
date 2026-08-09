import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../core/services/security_service.dart';
import '../models/player_save_data.dart';

class PlayerRepository {
  PlayerRepository({required this.security});

  final SecurityService security;
  PlayerSaveData data = PlayerSaveData();

  static const _prefsKey = 'player_save_v1';

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final payload = prefs.getString(_prefsKey);
    if (payload == null) return;
    try {
      final jsonStr = await security.decrypt(payload);
      final map = jsonDecode(jsonStr) as Map<String, dynamic>;
      final loaded = PlayerSaveData.fromJson(map);
      final expected = security.integrityHash(jsonEncode(loaded.toIntegrityPayload()));
      if (loaded.integrityHash != expected) {
        // Tamper detectado — reset seguro
        data = PlayerSaveData();
        return;
      }
      data = loaded;
    } catch (_) {
      data = PlayerSaveData();
    }
  }

  Future<void> save() async {
    data.integrityHash =
        security.integrityHash(jsonEncode(data.toIntegrityPayload()));
    final jsonStr = jsonEncode(data.toJson());
    final encrypted = await security.encrypt(jsonStr);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, encrypted);
  }
}
