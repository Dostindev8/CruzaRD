import 'package:flame/components.dart';

import '../../core/constants/game_constants.dart';
import '../cruza_rd_game.dart';

class InputManager {
  Vector2 _panDelta = Vector2.zero();
  DateTime _panStartTime = DateTime.now();

  void onPanStart(Vector2 position) {
    _panDelta = Vector2.zero();
    _panStartTime = DateTime.now();
  }

  void onPanUpdate(Vector2 delta) => _panDelta += delta;

  SwipeDirection onPanEnd() {
    final duration = DateTime.now().difference(_panStartTime).inMilliseconds;
    if (duration > GameConstants.inputBufferMs) return SwipeDirection.none;
    final dx = _panDelta.x.abs();
    final dy = _panDelta.y.abs();
    if (dx < GameConstants.swipeThreshold && dy < GameConstants.swipeThreshold) {
      return SwipeDirection.none;
    }
    return dx > dy
        ? (_panDelta.x > 0 ? SwipeDirection.right : SwipeDirection.left)
        : (_panDelta.y > 0 ? SwipeDirection.down : SwipeDirection.up);
  }
}
