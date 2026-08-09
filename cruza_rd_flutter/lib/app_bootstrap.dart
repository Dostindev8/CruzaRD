import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';

/// Configura ventana desktop (no-op en web/móvil).
Future<void> configureDesktopWindowIfNeeded() async {
  if (kIsWeb) return;
  if (!(defaultTargetPlatform == TargetPlatform.windows ||
      defaultTargetPlatform == TargetPlatform.macOS ||
      defaultTargetPlatform == TargetPlatform.linux)) {
    return;
  }
  try {
    await windowManager.ensureInitialized();
    const options = WindowOptions(
      size: Size(420, 860),
      minimumSize: Size(360, 640),
      center: true,
      title: 'Cruza RD',
    );
    await windowManager.waitUntilReadyToShow(options, () async {
      await windowManager.show();
      await windowManager.focus();
    });
  } catch (_) {
    // Sin C++ desktop workload: continuar en canvas embebido.
  }
}
