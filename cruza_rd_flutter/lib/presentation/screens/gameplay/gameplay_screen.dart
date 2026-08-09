import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/constants/game_constants.dart';
import '../../../core/responsive/responsive_layout.dart';
import '../../../core/services/economy_service.dart';
import '../../../core/services/service_locator.dart';
import '../../../core/services/settings_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../game/cruza_rd_game.dart';
import '../../widgets/animated_counter_text.dart';
import '../../widgets/juice_button.dart';

class GameplayScreen extends StatefulWidget {
  const GameplayScreen({super.key});

  @override
  State<GameplayScreen> createState() => _GameplayScreenState();
}

class _GameplayScreenState extends State<GameplayScreen> {
  late final CruzaRDGame _game;
  int _score = 0;
  int _coins = 0;
  double _distance = 0;
  bool _showDeath = false;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _game = CruzaRDGame()
      ..onScoreChanged = (s) {
        if (mounted) setState(() => _score = s);
      }
      ..onCoinsChanged = (c) {
        if (mounted) setState(() => _coins = c);
      }
      ..onDistanceChanged = (d) {
        if (mounted) setState(() => _distance = d);
      }
      ..onGameOver = _handleGameOver;
  }

  Future<void> _handleGameOver() async {
    await sl<EconomyService>().grantRunRewards(
      score: _score,
      distance: _distance,
      durationSeconds: _game.runSeconds.clamp(0.1, 9999),
      papeletasCollected: _coins,
    );
    if (mounted) setState(() => _showDeath = true);
  }

  @override
  Widget build(BuildContext context) {
    final settings = sl<SettingsService>();
    final width = MediaQuery.sizeOf(context).width;
    final device = ResponsiveBreakpoints.classify(width);

    return Scaffold(
      body: ResponsiveLayout(
        child: Stack(
          children: [
            GameWidget(game: _game),
            SafeArea(
              child: Padding(
                padding: EdgeInsets.all(device == DeviceClass.phone ? 12 : 20),
                child: Column(
                  children: [
                    Row(
                      children: [
                        _HudPill(
                          child: AnimatedCounterText(
                            value: _score,
                            fontSize: 22,
                            color: AppColors.gold,
                          ),
                        ),
                        const Spacer(),
                        _HudPill(
                          child: Text(
                            '${_distance.toStringAsFixed(0)} m',
                            style: GoogleFonts.fredoka(
                              color: AppColors.cloud,
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        _HudPill(
                          child: Text(
                            '₱ $_coins',
                            style: GoogleFonts.fredoka(
                              color: AppColors.gold,
                              fontSize: 18,
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            if (_game.state == GameState.playing) {
                              _game.pauseGame();
                            } else if (_game.state == GameState.paused) {
                              _game.resumeGame();
                            }
                            setState(() {});
                          },
                          icon: Icon(
                            _game.state == GameState.paused
                                ? Icons.play_arrow
                                : Icons.pause,
                            color: AppColors.cloud,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    if (!_started)
                      JuiceButton(
                        label: 'TOCA PARA EMPEZAR',
                        onPressed: () {
                          _game.startGame();
                          setState(() {
                            _started = true;
                            _showDeath = false;
                          });
                        },
                      ),
                    if (settings.useOnScreenDpad && _started && !_showDeath)
                      const _OnScreenDpad(),
                    if (_game.state == GameState.paused)
                      _PauseOverlay(
                        onResume: () {
                          _game.resumeGame();
                          setState(() {});
                        },
                        onMenu: () => context.go('/menu'),
                      ),
                  ],
                ),
              ),
            ),
            if (_showDeath)
              _DeathOverlay(
                score: _score,
                distance: _distance,
                onRetry: () {
                  setState(() {
                    _showDeath = false;
                    _score = 0;
                    _coins = 0;
                    _distance = 0;
                  });
                  _game.restartGame();
                },
                onMenu: () => context.go('/menu'),
              ),
          ],
        ),
      ),
    );
  }
}

class _HudPill extends StatelessWidget {
  const _HudPill({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.panel,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: child,
    );
  }
}

class _OnScreenDpad extends StatelessWidget {
  const _OnScreenDpad();

  @override
  Widget build(BuildContext context) {
    final state = context.findAncestorStateOfType<_GameplayScreenState>()!;
    Widget btn(IconData icon, SwipeDirection dir) => IconButton.filled(
          style: IconButton.styleFrom(
            backgroundColor: Colors.white24,
            minimumSize: const Size(56, 56),
          ),
          onPressed: () => state._game.swipe(dir),
          icon: Icon(icon, color: Colors.white),
        );

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: [
          btn(Icons.keyboard_arrow_up, SwipeDirection.up),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              btn(Icons.keyboard_arrow_left, SwipeDirection.left),
              const SizedBox(width: 56),
              btn(Icons.keyboard_arrow_right, SwipeDirection.right),
            ],
          ),
          btn(Icons.keyboard_arrow_down, SwipeDirection.down),
        ],
      ),
    );
  }
}

class _PauseOverlay extends StatelessWidget {
  const _PauseOverlay({required this.onResume, required this.onMenu});
  final VoidCallback onResume;
  final VoidCallback onMenu;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Pausa', style: GoogleFonts.fredoka(fontSize: 36, color: Colors.white)),
          const SizedBox(height: 16),
          JuiceButton(label: 'Continuar', onPressed: onResume),
          const SizedBox(height: 10),
          JuiceButton(
            label: 'Menú',
            outlined: true,
            color: AppColors.caribbeanCyan,
            onPressed: onMenu,
          ),
        ],
      ),
    );
  }
}

class _DeathOverlay extends StatelessWidget {
  const _DeathOverlay({
    required this.score,
    required this.distance,
    required this.onRetry,
    required this.onMenu,
  });

  final int score;
  final double distance;
  final VoidCallback onRetry;
  final VoidCallback onMenu;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xCC0B1220),
      alignment: Alignment.center,
      padding: const EdgeInsets.all(24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '¡QUÍTATE DEL MEDIO!',
              textAlign: TextAlign.center,
              style: GoogleFonts.fredoka(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: AppColors.flagRed,
              ),
            ),
            const SizedBox(height: 16),
            AnimatedCounterText(
              value: score,
              suffix: ' pts',
              fontSize: 40,
              color: AppColors.gold,
            ),
            Text(
              'Distancia: ${distance.toStringAsFixed(0)} m',
              style: GoogleFonts.nunito(color: AppColors.cloud, fontSize: 18),
            ),
            const SizedBox(height: 24),
            JuiceButton(label: 'Jugar de nuevo', onPressed: onRetry),
            const SizedBox(height: 10),
            JuiceButton(
              label: 'Menú',
              outlined: true,
              color: AppColors.flagBlue,
              onPressed: onMenu,
            ),
          ],
        ),
      ),
    );
  }
}
