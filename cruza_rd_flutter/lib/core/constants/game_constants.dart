/// Constantes globales del juego (GDD v4.0 §05).
class GameConstants {
  GameConstants._();

  static const int targetFps = 60;
  static const double targetFrameTimeMs = 16.67;

  // Input (<150ms benchmark Subway Surfers)
  static const int inputLatencyMs = 150;
  static const int inputBufferMs = 150;
  static const double swipeThreshold = 20.0;
  static const double swipeVelocityThreshold = 100.0;

  // Grid (Crossy Road style)
  static const double gridCellSize = 64.0;
  static const double laneWidth = gridCellSize;
  static const int totalLanes = 5;
  static const double moveDurationMs = 120.0;
  static const double jumpDurationMs = 250.0;
  static const double jumpHeight = 48.0;

  // Cámara / death-cam
  static const double cameraLookAhead = 200.0;
  static const double cameraShakeIntensity = 3.0;
  static const double deathCamSlowMoDuration = 0.8;
  static const double deathCamZoom = 1.5;

  // Dificultad
  static const double baseSpeed = 150.0;
  static const double speedIncrementPer100m = 10.0;
  static const double maxSpeed = 500.0;
  static const double spawnIntervalBase = 2.0;
  static const double spawnIntervalMin = 0.5;

  // Puntuación
  static const int pointsPerLaneCrossed = 10;
  static const int pointsPerMeter = 1;
  static const int nearMissBonus = 50;
  static const int nearMissWindowMs = 200;
  static const int comboMaxMultiplier = 5;
  static const int comboTimeWindowMs = 3000;

  // Economía
  static const int papeletasPerMeter = 1;
  static const int papeletasPerCollectible = 10;
  static const int papeletasPerNearMiss = 5;

  // Power-ups
  static const double magnetDuration = 8.0;
  static const double shieldDuration = 6.0;
  static const double speedBoostDuration = 5.0;
  static const double multiplierDuration = 10.0;
  static const double magnetRadius = 100.0;
  static const double powerUpSpawnIntervalSec = 12.0;

  // Seguridad (anti-cheat cliente)
  static const int maxScorePerSecond = 50;
  static const int maxDistancePerSecond = 30;
  static const int rateLimitRequestsPerMinute = 60;

  // Monetización ética
  static const int maxInterstitialPerSession = 3;
  static const int minGamesBetweenInterstitials = 3;
  static const int rewardedAdCooldownMinutes = 5;
}

/// Breakpoints multiplataforma (GDD v4.0 §05) — cierra hallazgo #4.
class ResponsiveBreakpoints {
  ResponsiveBreakpoints._();

  static const double phone = 375;
  static const double phoneLarge = 600;
  static const double tablet = 840;
  static const double desktopSmall = 1024;
  static const double desktopWide = 1440;

  static DeviceClass classify(double width) {
    if (width < phoneLarge) return DeviceClass.phone;
    if (width < tablet) return DeviceClass.phoneLarge;
    if (width < desktopSmall) return DeviceClass.tablet;
    if (width < desktopWide) return DeviceClass.desktopSmall;
    return DeviceClass.desktopWide;
  }
}

enum DeviceClass { phone, phoneLarge, tablet, desktopSmall, desktopWide }
