import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:encrypt/encrypt.dart' as enc;
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/game_constants.dart';

/// SecurityService v4.0 — cierra hallazgos #1 y #10 del GDD.
/// Clave AES-256 aleatoria en Keychain/Keystore + IV aleatorio por mensaje.
class SecurityService {
  SecurityService({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  static const _keyStorageKey = 'cruza_rd_aes_256_v1';

  final FlutterSecureStorage _storage;
  enc.Key? _aesKey;
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;
    var raw = await _storage.read(key: _keyStorageKey);
    Uint8List keyBytes;
    if (raw == null || raw.isEmpty) {
      keyBytes = Uint8List.fromList(_secureRandomBytes(32));
      await _storage.write(key: _keyStorageKey, value: base64Encode(keyBytes));
    } else {
      keyBytes = Uint8List.fromList(base64Decode(raw));
      if (keyBytes.length != 32) {
        keyBytes = Uint8List.fromList(_secureRandomBytes(32));
        await _storage.write(key: _keyStorageKey, value: base64Encode(keyBytes));
      }
    }
    _aesKey = enc.Key(keyBytes);
    _initialized = true;
  }

  Future<String> encrypt(String plaintext) async {
    await initialize();
    final iv = enc.IV.fromSecureRandom(16);
    final encrypter = enc.Encrypter(enc.AES(_aesKey!, mode: enc.AESMode.cbc));
    final encrypted = encrypter.encrypt(plaintext, iv: iv);
    return base64Encode(iv.bytes + encrypted.bytes);
  }

  Future<String> decrypt(String payload) async {
    await initialize();
    final all = base64Decode(payload);
    final iv = enc.IV(Uint8List.fromList(all.sublist(0, 16)));
    final cipher = enc.Encrypted(Uint8List.fromList(all.sublist(16)));
    final encrypter = enc.Encrypter(enc.AES(_aesKey!, mode: enc.AESMode.cbc));
    return encrypter.decrypt(cipher, iv: iv);
  }

  String integrityHash(String data) =>
      sha256.convert(utf8.encode(data)).toString();

  bool validateRunRewards({
    required int score,
    required double distanceMeters,
    required double runDurationSeconds,
  }) {
    if (score < 0 || distanceMeters < 0 || runDurationSeconds <= 0) return false;
    if (score / runDurationSeconds > GameConstants.maxScorePerSecond) return false;
    if (distanceMeters / runDurationSeconds > GameConstants.maxDistancePerSecond) {
      return false;
    }
    return true;
  }

  Future<bool> isEnvironmentTrusted() async {
    if (kIsWeb || kDebugMode) return true;
    return true;
  }

  List<int> _secureRandomBytes(int length) {
    final rng = Random.secure();
    return List<int>.generate(length, (_) => rng.nextInt(256));
  }
}
