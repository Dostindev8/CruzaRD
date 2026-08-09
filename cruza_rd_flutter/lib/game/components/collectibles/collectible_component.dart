import 'package:flame/collisions.dart';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../cruza_rd_game.dart';

class CollectibleComponent extends PositionComponent
    with CollisionCallbacks, HasGameReference<CruzaRDGame> {
  CollectibleComponent({
    required this.itemId,
    required double laneX,
    required double startY,
    required this.speed,
  }) : super(
          position: Vector2(laneX, startY),
          size: Vector2(28, 28),
          anchor: Anchor.center,
          priority: 8,
        );

  final String itemId;
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
    position.y += speed * dt * 0.55;
    if (position.y > game.size.y + 40) removeFromParent();
  }

  void collect() {
    _collected = true;
    removeFromParent();
  }

  @override
  void render(Canvas canvas) {
    final color = switch (itemId) {
      'papeleta' => AppColors.gold,
      'mangu' => const Color(0xFFF2E6A0),
      _ => AppColors.caribbeanCyan,
    };
    canvas.drawCircle(
      Offset(size.x / 2, size.y / 2),
      size.x / 2,
      Paint()..color = color,
    );
    canvas.drawCircle(
      Offset(size.x / 2, size.y / 2),
      size.x / 2,
      Paint()
        ..style = PaintingStyle.stroke
        ..color = Colors.white54
        ..strokeWidth = 2,
    );
  }
}
