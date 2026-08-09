import 'dart:math';
import 'dart:ui';

import 'package:flame/components.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../powerups/powerup_manager.dart';

class ParticleManager extends Component {
  void spawnNearMissEffect(Vector2 pos) {
    add(_Burst(pos: pos.clone(), color: AppColors.gold, count: 10));
  }

  void spawnDeathEffect(Vector2 pos) {
    add(_Burst(pos: pos.clone(), color: AppColors.flagRed, count: 18));
  }

  void spawnCollectEffect(Vector2 pos, String id) {
    final color = id == 'papeleta' ? AppColors.gold : AppColors.tropicalGreen;
    add(_Burst(pos: pos.clone(), color: color, count: 8));
  }

  void spawnPowerUpEffect(Vector2 pos, PowerUpType type) {
    final color = switch (type) {
      PowerUpType.picapollo => const Color(0xFFFF6A2A),
      PowerUpType.cafe => const Color(0xFF8B5A2B),
      _ => AppColors.caribbeanCyan,
    };
    add(_Burst(pos: pos.clone(), color: color, count: 16, rise: type == PowerUpType.cafe));
  }
}

class _Burst extends PositionComponent {
  _Burst({
    required Vector2 pos,
    required this.color,
    required this.count,
    this.rise = false,
  }) : super(position: pos, priority: 30);

  final Color color;
  final int count;
  final bool rise;
  final List<_P> _ps = [];
  double _life = 0.45;
  final _rng = Random();

  @override
  Future<void> onLoad() async {
    for (var i = 0; i < count; i++) {
      _ps.add(
        _P(
          offset: Vector2(
            (_rng.nextDouble() - 0.5) * 20,
            (_rng.nextDouble() - 0.5) * 20,
          ),
          vel: Vector2(
            (_rng.nextDouble() - 0.5) * 120,
            rise ? -40 - _rng.nextDouble() * 80 : (_rng.nextDouble() - 0.5) * 120,
          ),
        ),
      );
    }
  }

  @override
  void update(double dt) {
    _life -= dt;
    for (final p in _ps) {
      p.offset += p.vel * dt;
      p.vel.y += rise ? -20 * dt : 180 * dt;
    }
    if (_life <= 0) removeFromParent();
  }

  @override
  void render(Canvas canvas) {
    final alpha = (_life / 0.45).clamp(0.0, 1.0);
    final paint = Paint()..color = color.withValues(alpha: alpha);
    for (final p in _ps) {
      canvas.drawCircle(Offset(p.offset.x, p.offset.y), 3, paint);
    }
  }
}

class _P {
  _P({required this.offset, required this.vel});
  Vector2 offset;
  Vector2 vel;
}
