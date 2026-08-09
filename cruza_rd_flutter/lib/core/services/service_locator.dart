import 'package:get_it/get_it.dart';

import '../../data/repositories/player_repository.dart';
import 'audio_service.dart';
import 'economy_service.dart';
import 'security_service.dart';
import 'settings_service.dart';

final sl = GetIt.instance;

class ServiceLocator {
  ServiceLocator._();

  static Future<void> initialize({required String flavor}) async {
    if (sl.isRegistered<SecurityService>()) return;

    final security = SecurityService();
    await security.initialize();
    sl.registerSingleton<SecurityService>(security);

    final settings = SettingsService();
    await settings.load();
    sl.registerSingleton<SettingsService>(settings);

    final playerRepo = PlayerRepository(security: security);
    await playerRepo.load();
    sl.registerSingleton<PlayerRepository>(playerRepo);

    sl.registerSingleton<EconomyService>(
      EconomyService(repository: playerRepo, security: security),
    );

    sl.registerSingleton<AudioService>(AudioService(settings: settings));
    sl.registerSingleton<String>(flavor, instanceName: 'flavor');
  }
}
