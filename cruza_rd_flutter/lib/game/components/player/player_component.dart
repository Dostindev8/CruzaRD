import 'dart:math';
import 'dart:ui';

import 'package:flame/collisions.dart';
import 'package:flame/components.dart';
import 'package:flutter/material.dart';

import '../../../core/constants/game_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../cruza_rd_game.dart';
import '../collectibles/collectible_component.dart';
import '../obstacles/obstacle_component.dart';
import '../powerups/powerup_component.dart';
import '../powerups/powerup_manager.dart';

/// Jugador voxel-like con set de 9 estados (procedural hasta Rive/assets).
class PlayerComponent extends PositionComponent
    with CollisionCallbacks, HasGameReference<CruzaRDGame> {
  PlayerComponent({required this.laneIndex, required List<double> lanePositions})
      : _lanePositions = List<double>.from(lanePositions),
        super(
          size: Vector2(44, 56),
          anchor: Anchor.center,
          priority: 20,
        );

  int laneIndex;
  final List<double> _lanePositions;
  bool _moving = false;
  double _moveT = 0;
  Vector2 _from = Vector2.zero();
  Vector2 _to = Vector2.zero();
  bool _invulnerable = false;
  double _invulnT = 0;
  double _squash = 0;
  String _anim = 'idle';
  PowerUpType? activePowerUp;
  double _powerUpT = 0;

  @override
  Future<void> onLoad() async {
    await super.onLoad();
    add(RectangleHitbox(isSolid: false));
    position = Vector2(_lanePositions[laneIndex], game.size.y * 0.72);
  }

  @override
  void update(double dt) {
    super.update(dt);
    if (_moving) {
      _moveT += dt / (GameConstants.moveDurationMs / 1000);
      final t = _moveT.clamp(0.0, 1.0);
      final eased = t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
      position = _from + (_to - _from) * eased;
      if (t >= 1) {
        _moving = false;
        position = _to;
        _squash = 1;
        _anim = 'run';
      }
    }
    if (_squash > 0) _squash = (_squash - dt * 6).clamp(0.0, 1.0);
    if (_invulnerable) {
      _invulnT -= dt;
      if (_invulnT <= 0) _invulnerable = false;
    }
    if (activePowerUp != null) {
      _powerUpT -= dt;
      if (_powerUpT <= 0) activePowerUp = null;
    }
  }

  @override
  void render(Canvas canvas) {
    final squashX = 1 + 0.12 * sin(_squash * pi);
    final squashY = 1 - 0.15 * sin(_squash * pi);
    canvas.save();
    canvas.translate(size.x / 2, size.y / 2);
    canvas.scale(squashX, squashY);
    canvas.translate(-size.x / 2, -size.y / 2);

    // Cuerpo voxel (cápsula/cubo con volumen — nunca plano)
    final body = RRect.fromRectAndRadius(
      Rect.fromLTWH(8, 10, 28, 36),
      const Radius.circular(8),
    );
    final paint = Paint()
      ..color = _invulnerable
          ? AppColors.caribbeanCyan
          : (_anim == 'death' ? AppColors.flagRed : AppColors.cloud);
    canvas.drawRRect(body, paint);
    canvas.drawRRect(
      body,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = AppColors.flagBlue,
    );

    // Gorra / mochila RD
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(10, 4, 24, 10),
        const Radius.circular(4),
      ),
      Paint()..color = AppColors.flagBlue,
    );
    canvas.drawCircle(
      const Offset(34, 22),
      6,
      Paint()..color = AppColors.flagRed,
    );

    if (activePowerUp != null) {
      canvas.drawCircle(
        Offset(size.x / 2, size.y / 2),
        30,
        Paint()
          ..color = AppColors.gold.withValues(alpha: 0.25)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3,
      );
    }
    canvas.restore();
  }

  void startRunning() => _anim = 'run';

  void moveForward() {
    if (_moving) return;
    _anim = 'jump';
    _beginMove(Vector2(position.x, position.y - GameConstants.gridCellSize * 0.35));
  }

  void moveBackward() {
    if (_moving) return;
    _anim = 'jump';
    _beginMove(Vector2(position.x, position.y + GameConstants.gridCellSize * 0.2));
  }

  void moveToLane(int lane, double laneX) {
    if (_moving) return;
    laneIndex = lane;
    _anim = 'lane';
    _beginMove(Vector2(laneX, position.y));
  }

  void snapToLane(int lane, double laneX) {
    laneIndex = lane;
    position = Vector2(laneX, position.y);
  }

  void _beginMove(Vector2 target) {
    _from = position.clone();
    _to = target;
    _moveT = 0;
    _moving = true;
  }

  void triggerNearMiss() {
    _anim = 'nearMiss';
    _squash = 1;
  }

  void triggerDeath() {
    _anim = 'death';
    game.scoreManager.breakCombo();
  }

  void activatePowerUp(PowerUpType type) {
    activePowerUp = type;
    _anim = 'collectPower';
    _squash = 1;
    switch (type) {
      case PowerUpType.shield:
      case PowerUpType.habichuelas:
        _invulnerable = true;
        _invulnT = GameConstants.shieldDuration;
        _powerUpT = GameConstants.shieldDuration;
      case PowerUpType.speed:
      case PowerUpType.cafe:
        _powerUpT = GameConstants.speedBoostDuration;
      case PowerUpType.magnet:
      case PowerUpType.picapollo:
        _powerUpT = GameConstants.magnetDuration;
      case PowerUpType.multiplier:
      case PowerUpType.mangu:
        _powerUpT = GameConstants.multiplierDuration;
    }
  }

  void reset({required int laneIndex, required double laneX}) {
    this.laneIndex = laneIndex;
    position = Vector2(laneX, game.size.y * 0.72);
    _moving = false;
    _anim = 'idle';
    _invulnerable = false;
    activePowerUp = null;
  }

  @override
  void onCollisionStart(
    Set<Vector2> intersectionPoints,
    PositionComponent other,
  ) {
    super.onCollisionStart(intersectionPoints, other);
    if (game.state != GameState.playing) return;

    if (other is ObstacleComponent) {
      if (_invulnerable) return;
      game.triggerGameOver();
      return;
    }
    if (other is CollectibleComponent) {
      game.onCollectiblePicked(other.itemId);
      other.collect();
      _anim = 'collect';
      _squash = 1;
      return;
    }
    if (other is PowerUpComponent) {
      game.onPowerUpPicked(other.type);
      other.collect();
    }
  }
}
