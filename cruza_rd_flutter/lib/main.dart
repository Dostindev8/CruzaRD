import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:responsive_framework/responsive_framework.dart';

import 'app_bootstrap.dart';
import 'app_router.dart';
import 'core/services/security_service.dart';
import 'core/services/service_locator.dart';
import 'core/theme/app_theme.dart';

Future<void> main() => bootstrap(flavor: 'dev');

Future<void> bootstrap({required String flavor}) async {
  await runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    try {
      await dotenv.load(fileName: '.env.$flavor');
    } catch (_) {
      // Env opcional en primer arranque
    }

    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

    // Firebase queda opcional hasta configurar google-services (GDD v4 §03).
    // Crashlytics / App Check se conectan en Fase 5+ cuando existan keys.

    await SecurityService().initialize();
    await ServiceLocator.initialize(flavor: flavor);
    await configureDesktopWindowIfNeeded();

    FlutterError.onError = (details) {
      FlutterError.presentError(details);
      debugPrint('FlutterError: ${details.exceptionAsString()}');
    };
    PlatformDispatcher.instance.onError = (error, stack) {
      debugPrint('Uncaught: $error\n$stack');
      return true;
    };

    runApp(const CruzaRDApp());
  }, (error, stack) {
    debugPrint('Zone error: $error\n$stack');
  });
}

class CruzaRDApp extends StatelessWidget {
  const CruzaRDApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Cruza RD',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      routerConfig: appRouter,
      builder: (context, child) => ResponsiveBreakpoints.builder(
        child: child ?? const SizedBox.shrink(),
        breakpoints: const [
          Breakpoint(start: 0, end: 599, name: MOBILE),
          Breakpoint(start: 600, end: 839, name: 'PHONE_LARGE'),
          Breakpoint(start: 840, end: 1023, name: TABLET),
          Breakpoint(start: 1024, end: 1439, name: DESKTOP),
          Breakpoint(start: 1440, end: double.infinity, name: 'DESKTOP_WIDE'),
        ],
      ),
    );
  }
}
