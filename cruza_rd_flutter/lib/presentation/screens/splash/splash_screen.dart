import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future<void>.delayed(1800.ms, () {
      if (mounted) context.go('/menu');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.flagBlue, AppColors.ink, Color(0xFF1A0A10)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const Spacer(),
              Text(
                'CRUZA RD',
                style: GoogleFonts.fredoka(
                  fontSize: 48,
                  fontWeight: FontWeight.w800,
                  color: AppColors.cloud,
                  letterSpacing: 1.2,
                ),
              )
                  .animate()
                  .fadeIn(duration: 500.ms)
                  .scale(begin: const Offset(0.92, 0.92)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.gold,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '¡QUÍTATE DEL MEDIO!',
                  style: GoogleFonts.fredoka(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.3),
              const SizedBox(height: 28),
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Image.asset(
                  'assets/images/ui/brand_hero.png',
                  height: MediaQuery.sizeOf(context).height * 0.38,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const Icon(
                    Icons.directions_run,
                    size: 96,
                    color: AppColors.cloud,
                  ),
                ),
              ).animate().fadeIn(delay: 300.ms),
              const Spacer(),
              const Padding(
                padding: EdgeInsets.only(bottom: 32),
                child: _BrandLoader(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BrandLoader extends StatelessWidget {
  const _BrandLoader();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'Logic Code Spot',
          style: GoogleFonts.nunito(color: Colors.white54, fontSize: 13),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: 180,
          child: LinearProgressIndicator(
            minHeight: 6,
            borderRadius: BorderRadius.circular(8),
            color: AppColors.flagRed,
            backgroundColor: Colors.white12,
          )
              .animate(onPlay: (c) => c.repeat())
              .shimmer(duration: 1200.ms, color: AppColors.gold),
        ),
      ],
    );
  }
}
