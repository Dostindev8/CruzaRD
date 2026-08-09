import 'dart:ui';

import 'package:flame/collisions.dart';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../cruza_rd_game.dart';
import 'powerup_manager.dart';

class PowerUpComponent extends PositionComponent
    with CollisionCallbacks, HasGameReference<CruzaRDGame> {
  PowerUpComponent({
    required this.type,
    required double laneX,
    required double startY,
    required this.speed,
  }) : super(
          position: Vector2(laneX, startY),
          size: Vector2(34, 34),
          anchor: Anchor.center,
          priority: 9,
        );

  final PowerUpType type;
  double speed;
  bool _collected = false;

  @override
  Future<void> onLoad() async {
    await super.onLoad();
    add(CircleHitbox());
  }

  @override
  void update(double dt) {
    super.update(dt);
    if (game.state != GameState.playing || _collected) return;
    position.y += speed * dt * 0.5;
    if (position.y > game.size.y + 40) removeFromParent();
  }

  void collect() {
    _collected = true;
    removeFromParent();
  }

  @override
  void render(Canvas canvas) {
    final color = switch (type) {
      PowerUpType.picapollo => const Color(0xFFFF6A2A),
      PowerUpType.cafe => const Color(0xFF8B5A2B),
      PowerUpType.mangu => const Color(0xFFF5E6A0),
      PowerUpType.habichuelas => const Color(0xFFB33A4A),
      _ => AppColors.gold,
    };
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, size.x, size.y),
        const Radius.circular(8),
      ),
      Paint()..color = color,
    );
  }
}
