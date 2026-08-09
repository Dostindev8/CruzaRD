import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';

class AnimatedCounterText extends ImplicitlyAnimatedWidget {
  const AnimatedCounterText({
    super.key,
    required this.value,
    this.suffix = '',
    this.fontSize = 28,
    this.color = AppColors.cloud,
    super.duration = const Duration(milliseconds: 350),
  });

  final int value;
  final String suffix;
  final double fontSize;
  final Color color;

  @override
  ImplicitlyAnimatedWidgetState<AnimatedCounterText> createState() =>
      _AnimatedCounterTextState();
}

class _AnimatedCounterTextState
    extends AnimatedWidgetBaseState<AnimatedCounterText> {
  IntTween? _tween;

  @override
  void forEachTween(TweenVisitor<dynamic> visitor) {
    _tween = visitor(
      _tween,
      widget.value,
      (dynamic value) => IntTween(begin: value as int),
    ) as IntTween?;
  }

  @override
  Widget build(BuildContext context) {
    final v = _tween?.evaluate(animation) ?? widget.value;
    return Text(
      '${_format(v)}${widget.suffix}',
      style: GoogleFonts.fredoka(
        fontSize: widget.fontSize,
        fontWeight: FontWeight.w700,
        color: widget.color,
      ),
    );
  }

  String _format(int n) {
    final s = n.toString();
    final buf = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      final fromEnd = s.length - i;
      buf.write(s[i]);
      if (fromEnd > 1 && fromEnd % 3 == 1) buf.write(',');
    }
    return buf.toString();
  }
}
