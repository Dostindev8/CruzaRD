import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_theme.dart';

/// Botón con micro-animación 0.95x (GDD v4 / UI Pro Max — cero botones muertos).
class JuiceButton extends StatefulWidget {
  const JuiceButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.color = AppColors.flagRed,
    this.outlined = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final Color color;
  final bool outlined;

  @override
  State<JuiceButton> createState() => _JuiceButtonState();
}

class _JuiceButtonState extends State<JuiceButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final child = widget.outlined
        ? OutlinedButton(
            onPressed: widget.onPressed,
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: widget.color, width: 2),
              foregroundColor: AppColors.cloud,
              minimumSize: const Size(48, 54),
            ),
            child: Text(widget.label),
          )
        : ElevatedButton(
            onPressed: widget.onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: widget.color,
              minimumSize: const Size(48, 54),
            ),
            child: Text(widget.label),
          );

    return Listener(
      onPointerDown: (_) => setState(() => _pressed = true),
      onPointerUp: (_) => setState(() => _pressed = false),
      onPointerCancel: (_) => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.95 : 1,
        duration: 90.ms,
        curve: Curves.easeOutCubic,
        child: child,
      ),
    );
  }
}
