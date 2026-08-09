import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/responsive/responsive_layout.dart';
import '../../../core/services/service_locator.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/repositories/player_repository.dart';
import '../../widgets/juice_button.dart';

class MainMenuScreen extends StatelessWidget {
  const MainMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final save = sl<PlayerRepository>().data;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.flagBlue, AppColors.ink, Color(0xFF2A1018)],
          ),
        ),
        child: ResponsiveLayout(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              children: [
                const SizedBox(height: 12),
                Text(
                  'CRUZA RD',
                  style: GoogleFonts.fredoka(
                    fontSize: 42,
                    fontWeight: FontWeight.w800,
                    color: AppColors.cloud,
                  ),
                ).animate().fadeIn().slideY(begin: -0.15),
                Container(
                  margin: const EdgeInsets.only(top: 8),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.gold,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '¡QUÍTATE DEL MEDIO!',
                    style: GoogleFonts.fredoka(
                      fontWeight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: Image.asset(
                    'assets/images/ui/brand_hero.png',
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => const Icon(
                      Icons.sports_motorsports,
                      size: 120,
                      color: AppColors.cloud,
                    ),
                  ).animate().fadeIn(delay: 100.ms).scale(
                        begin: const Offset(0.96, 0.96),
                        duration: 500.ms,
                      ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _StatChip(label: 'Mejor', value: '${save.bestScore}'),
                    const SizedBox(width: 12),
                    _StatChip(label: 'Papeletas', value: '${save.papeletas}'),
                  ],
                ),
                const SizedBox(height: 20),
                JuiceButton(
                  label: 'JUGAR',
                  onPressed: () => context.go('/game'),
                ),
                const SizedBox(height: 10),
                JuiceButton(
                  label: 'Tienda',
                  color: AppColors.flagBlue,
                  onPressed: () => context.go('/shop'),
                ),
                const SizedBox(height: 10),
                JuiceButton(
                  label: 'Ajustes',
                  color: AppColors.tropicalGreen,
                  outlined: true,
                  onPressed: () => context.go('/settings'),
                ),
                const SizedBox(height: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.panel,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
          Text(
            value,
            style: GoogleFonts.fredoka(
              color: AppColors.gold,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
