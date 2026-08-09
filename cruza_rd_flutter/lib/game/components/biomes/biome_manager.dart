import 'package:flame/components.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../cruza_rd_game.dart';

enum BiomeId {
  zonaColonial,
  malecon,
  santiago,
  puntaCana,
  jarabacoa,
  barrios,
  playas,
  montanas,
}

/// 8 biomas dominicanos con parallax de 3 capas (GDD v4 §13).
class BiomeManager extends PositionComponent with HasGameReference<CruzaRDGame> {
  BiomeManager() : super(priority: -10);

  BiomeId current = BiomeId.zonaColonial;
  double _scroll = 0;

  void updateForDistance(double distance) {
    final index = (distance / 120).floor() % BiomeId.values.length;
    current = BiomeId.values[index];
  }

  @override
  void update(double dt) {
    super.update(dt);
    if (game.state == GameState.playing) {
      _scroll += game.currentSpeed * dt * 0.35;
    }
  }

  @override
  void onGameResize(Vector2 size) {
    super.onGameResize(size);
    this.size = size;
  }

  @override
  void render(Canvas canvas) {
    final sky = switch (current) {
      BiomeId.puntaCana || BiomeId.playas => AppColors.caribbeanCyan,
      BiomeId.jarabacoa || BiomeId.montanas => const Color(0xFF3A6B8C),
      BiomeId.malecon => const Color(0xFF1A4A7A),
      _ => const Color(0xFF243552),
    };
    canvas.drawRect(size.toRect(), Paint()..color = sky);

    // Parallax far
    final farY = (size.y * 0.25 + (_scroll * 0.05) % 40);
    canvas.drawRect(
      Rect.fromLTWH(0, farY, size.x, size.y),
      Paint()..color = AppColors.tropicalGreen.withValues(alpha: 0.25),
    );

    // Mid buildings / props strip
    final midPaint = Paint()..color = AppColors.flagBlue.withValues(alpha: 0.35);
    for (var i = 0; i < 8; i++) {
      final x = ((i * 90) - (_scroll * 0.2) % 90);
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(x, size.y * 0.35, 60, 80),
          const Radius.circular(4),
        ),
        midPaint,
      );
    }

    // Road / lanes near
    canvas.drawRect(
      Rect.fromLTWH(0, size.y * 0.55, size.x, size.y * 0.45),
      Paint()..color = AppColors.asphalt,
    );
    final lanePaint = Paint()
      ..color = Colors.white24
      ..strokeWidth = 2;
    final total = 5 * 64.0;
    final start = (size.x - total) / 2;
    for (var i = 0; i <= 5; i++) {
      final x = start + i * 64;
      canvas.drawLine(Offset(x, size.y * 0.55), Offset(x, size.y), lanePaint);
    }

    // Biome label chip
    final tp = TextPainter(
      text: TextSpan(
        text: _label(current),
        style: const TextStyle(
          color: Colors.white70,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, Offset(12, 12));
  }

  String _label(BiomeId id) => switch (id) {
        BiomeId.zonaColonial => 'Zona Colonial',
        BiomeId.malecon => 'Malecón',
        BiomeId.santiago => 'Santiago',
        BiomeId.puntaCana => 'Punta Cana',
        BiomeId.jarabacoa => 'Jarabacoa',
        BiomeId.barrios => 'Barrios',
        BiomeId.playas => 'Playas',
        BiomeId.montanas => 'Montañas',
      };
}
