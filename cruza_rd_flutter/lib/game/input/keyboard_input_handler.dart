import 'package:flutter/services.dart';

import '../cruza_rd_game.dart';

/// Input teclado/gamepad para desktop/web (GDD v4 §07 — cierra hallazgo #5).
class KeyboardInputHandler {
  KeyboardInputHandler._();

  static SwipeDirection resolve(
    KeyEvent event,
    Set<LogicalKeyboardKey> keysPressed,
  ) {
    if (event is! KeyDownEvent) return SwipeDirection.none;

    final key = event.logicalKey;
    if (key == LogicalKeyboardKey.arrowUp || key == LogicalKeyboardKey.keyW) {
      return SwipeDirection.up;
    }
    if (key == LogicalKeyboardKey.arrowDown || key == LogicalKeyboardKey.keyS) {
      return SwipeDirection.down;
    }
    if (key == LogicalKeyboardKey.arrowLeft || key == LogicalKeyboardKey.keyA) {
      return SwipeDirection.left;
    }
    if (key == LogicalKeyboardKey.arrowRight || key == LogicalKeyboardKey.keyD) {
      return SwipeDirection.right;
    }
    return SwipeDirection.none;
  }
}
