import 'package:flame/collisions.dart';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../cruza_rd_game.dart';

enum ObstacleKind { omsa, motoconcho, jeepeta, taxi }

class ObstacleComponent extends PositionComponent
    with CollisionCallbacks, HasGameReference<CruzaRDGame> {
  ObstacleComponent({
    required this.kind,
    required this.laneX,
    required double startY,
    required this.speed,
  }) : super(
          position: Vector2(laneX, startY),
          size: kind == ObstacleKind.omsa ? Vector2(52, 70) : Vector2(40, 48),
          anchor: Anchor.center,
          priority: 10,
        );

  final ObstacleKind kind;
  final double laneX;
  double speed;
  bool reportedNearMiss = false;

  @override
  Future<void> onLoad() async {
    await super.onLoad();
    add(RectangleHitbox());
  }

  @override
  void update(double dt) {
    super.update(dt);
    if (game.state != GameState.playing) return;
    position.y += speed * dt * 0.6;

    // Near-miss: pasa cerca del jugador sin colisión letal
    final player = game.player;
    final dx = (position.x - player.position.x).abs();
    final dy = (position.y - player.position.y).abs();
    if (!reportedNearMiss && dy < 40 && dx > 28 && dx < 70 && position.y > player.position.y) {
      reportedNearMiss = true;
      game.obstacleManager.notifyNearMiss(position.clone());
    }

    if (position.y > game.size.y + 80) {
      removeFromParent();
    }
  }

  @override
  void render(Canvas canvas) {
    final color = switch (kind) {
      ObstacleKind.omsa => AppColors.flagBlue,
      ObstacleKind.motoconcho => AppColors.flagRed,
      ObstacleKind.jeepeta => AppColors.tropicalGreen,
      ObstacleKind.taxi => AppColors.gold,
    };
    final r = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.x, size.y),
      const Radius.circular(6),
    );
    canvas.drawRRect(r, Paint()..color = color);
    canvas.drawRRect(
      r,
      Paint()
        ..style = PaintingStyle.stroke
        ..color = Colors.white24
        ..strokeWidth = 2,
    );
    // Ventana
    canvas.drawRect(
      Rect.fromLTWH(6, 8, size.x - 12, size.y * 0.28),
      Paint()..color = Colors.white30,
    );
  }
}
