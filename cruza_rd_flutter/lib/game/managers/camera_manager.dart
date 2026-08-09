import 'dart:math';

import 'package:flame/components.dart';

import '../../core/constants/game_constants.dart';

class CameraManager {
  CameraManager(this.camera);

  final CameraComponent camera;
  double _shake = 0;
  final _rng = Random();

  void initialize({required PositionComponent target}) {}

  void follow(Vector2 targetPos, Vector2 viewSize) {
    final lookAhead = Vector2(0, -GameConstants.cameraLookAhead * 0.15);
    var cam = Vector2(
      targetPos.x - viewSize.x / 2,
      targetPos.y - viewSize.y * 0.65,
    )..add(lookAhead);

    if (_shake > 0.01) {
      cam += Vector2(
        (_rng.nextDouble() - 0.5) * _shake,
        (_rng.nextDouble() - 0.5) * _shake,
      );
      _shake *= 0.9;
    }

    camera.viewfinder.position = cam;
  }

  void shake(double intensity) {
    _shake = intensity;
  }

  void triggerDeathCam(Vector2 impact) {
    shake(GameConstants.cameraShakeIntensity);
    camera.viewfinder.zoom = GameConstants.deathCamZoom;
  }

  void reset() {
    _shake = 0;
    camera.viewfinder.zoom = 1;
  }
}
