import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/responsive/responsive_layout.dart';
import '../../../core/services/service_locator.dart';
import '../../../core/services/settings_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../widgets/juice_button.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final SettingsService _s;

  @override
  void initState() {
    super.initState();
    _s = sl<SettingsService>();
  }

  Future<void> _persist() async {
    await _s.save();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ajustes'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/menu'),
        ),
      ),
      body: ResponsiveLayout(
        showSidePanels: false,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Audio', style: GoogleFonts.fredoka(fontSize: 22)),
            _slider('Música', _s.musicVolume, (v) {
              _s.musicVolume = v;
              _persist();
            }),
            _slider('SFX', _s.sfxVolume, (v) {
              _s.sfxVolume = v;
              _persist();
            }),
            _slider('Ambiente', _s.ambienceVolume, (v) {
              _s.ambienceVolume = v;
              _persist();
            }),
            _slider('Voz', _s.voiceVolume, (v) {
              _s.voiceVolume = v;
              _persist();
            }),
            const SizedBox(height: 12),
            Text('Controles y accesibilidad',
                style: GoogleFonts.fredoka(fontSize: 22)),
            SwitchListTile(
              title: const Text('D-pad en pantalla'),
              value: _s.useOnScreenDpad,
              activeThumbColor: AppColors.gold,
              onChanged: (v) {
                _s.useOnScreenDpad = v;
                _persist();
              },
            ),
            SwitchListTile(
              title: const Text('Vibración (háptica)'),
              value: _s.hapticsEnabled,
              activeThumbColor: AppColors.gold,
              onChanged: (v) {
                _s.hapticsEnabled = v;
                _persist();
              },
            ),
            SwitchListTile(
              title: const Text('Reducir movimiento'),
              value: _s.reduceMotion,
              activeThumbColor: AppColors.gold,
              onChanged: (v) {
                _s.reduceMotion = v;
                _persist();
              },
            ),
            SwitchListTile(
              title: const Text('HUD alto contraste'),
              value: _s.highContrastHud,
              activeThumbColor: AppColors.gold,
              onChanged: (v) {
                _s.highContrastHud = v;
                _persist();
              },
            ),
            const SizedBox(height: 16),
            JuiceButton(
              label: 'Política de privacidad',
              color: AppColors.caribbeanCyan,
              outlined: true,
              onPressed: () => launchUrl(
                Uri.parse('https://logiccodespot.com/cruzard/privacy'),
                mode: LaunchMode.externalApplication,
              ),
            ),
            const SizedBox(height: 10),
            JuiceButton(
              label: 'Volver',
              onPressed: () => context.go('/menu'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _slider(String label, double value, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label),
        Slider(
          value: value,
          onChanged: onChanged,
          activeColor: AppColors.flagRed,
          inactiveColor: Colors.white24,
        ),
      ],
    );
  }
}
