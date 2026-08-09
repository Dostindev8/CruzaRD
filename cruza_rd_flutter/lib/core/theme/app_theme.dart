import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Tokens de marca Cruza RD (bandera + voxel playful). Evita defaults AI purple/cream.
class AppColors {
  AppColors._();

  static const Color flagBlue = Color(0xFF002D62);
  static const Color flagRed = Color(0xFFCE1126);
  static const Color gold = Color(0xFFF5A623);
  static const Color tropicalGreen = Color(0xFF1E8E5A);
  static const Color caribbeanCyan = Color(0xFF2FB6C9);
  static const Color ink = Color(0xFF0B1220);
  static const Color cloud = Color(0xFFF7F4EE);
  static const Color panel = Color(0xE6101A2E);
  static const Color lane = Color(0xFF2A3348);
  static const Color asphalt = Color(0xFF1C2436);
}

class AppTheme {
  AppTheme._();

  static ThemeData get darkTheme {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.flagBlue,
        brightness: Brightness.dark,
        primary: AppColors.flagBlue,
        secondary: AppColors.flagRed,
        tertiary: AppColors.gold,
        surface: AppColors.ink,
      ),
      scaffoldBackgroundColor: AppColors.ink,
    );

    return base.copyWith(
      textTheme: GoogleFonts.nunitoTextTheme(base.textTheme).apply(
        bodyColor: AppColors.cloud,
        displayColor: AppColors.cloud,
      ),
      primaryTextTheme: GoogleFonts.fredokaTextTheme(base.primaryTextTheme),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.flagRed,
          foregroundColor: AppColors.cloud,
          minimumSize: const Size(48, 52),
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: GoogleFonts.fredoka(fontSize: 20, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.cloud,
          side: const BorderSide(color: AppColors.caribbeanCyan, width: 2),
          minimumSize: const Size(48, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        titleTextStyle: GoogleFonts.fredoka(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: AppColors.cloud,
        ),
      ),
    );
  }
}
