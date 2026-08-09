import 'dart:math';

import 'package:flame/components.dart';

import '../../../core/constants/game_constants.dart';
import '../../cruza_rd_game.dart';
import 'obstacle_component.dart';

class ObstacleManager extends Component with HasGameReference<CruzaRDGame> {
  ObstacleManager({
    required List<double> lanePositions,
    required this.onNearMiss,
  }) : lanePositions = List<double>.from(lanePositions);

  final void Function(Vector2 pos) onNearMiss;
  final List<double> lanePositions;
  final _rng = Random.secure();
  double _speed = GameConstants.baseSpeed;
  double _timer = 0;
  bool _spawning = false;
  int _lastLane = -1;

  void updateSpeed(double speed) => _speed = speed;

  void startSpawning() {
    _spawning = true;
    _timer = 0.4;
  }

  void pauseSpawning() => _spawning = false;
  void stopSpawning() {
    _spawning = false;
    for (final c in children.whereType<ObstacleComponent>().toList()) {
      c.removeFromParent();
    }
  }

  void notifyNearMiss(Vector2 pos) => onNearMiss(pos);

  @override
  void update(double dt) {
    super.update(dt);
    if (!_spawning || game.state != GameState.playing) return;
    _timer -= dt;
    if (_timer > 0) return;

    final interval = (GameConstants.spawnIntervalBase -
            game.distanceTraveled * 0.0015)
        .clamp(GameConstants.spawnIntervalMin, GameConstants.spawnIntervalBase);
    _timer = interval;

    var lane = _rng.nextInt(GameConstants.totalLanes);
    if (lane == _lastLane && GameConstants.totalLanes > 1) {
      lane = (lane + 1 + _rng.nextInt(GameConstants.totalLanes - 1)) %
          GameConstants.totalLanes;
    }
    _lastLane = lane;

    final kinds = ObstacleKind.values;
    final kind = kinds[_rng.nextInt(kinds.length)];
    add(
      ObstacleComponent(
        kind: kind,
        laneX: lanePositions[lane],
        startY: -60,
        speed: _speed,
      ),
    );
  }
}
