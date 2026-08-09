import 'dart:math';

import 'package:flame/components.dart';

import '../../../core/constants/game_constants.dart';
import '../../cruza_rd_game.dart';
import 'powerup_component.dart';

enum PowerUpType {
  magnet,
  shield,
  speed,
  multiplier,
  picapollo,
  cafe,
  mangu,
  habichuelas,
}

class PowerUpManager extends Component with HasGameReference<CruzaRDGame> {
  PowerUpManager({required List<double> lanePositions})
      : lanePositions = List<double>.from(lanePositions);

  final List<double> lanePositions;
  final _rng = Random.secure();
  double _speed = GameConstants.baseSpeed;
  double _timer = GameConstants.powerUpSpawnIntervalSec;
  bool _spawning = false;

  void updateSpeed(double speed) => _speed = speed;
  void startSpawning() {
    _spawning = true;
    _timer = GameConstants.powerUpSpawnIntervalSec;
  }

  void pauseSpawning() => _spawning = false;
  void stopSpawning() {
    _spawning = false;
    for (final c in children.whereType<PowerUpComponent>().toList()) {
      c.removeFromParent();
    }
  }

  @override
  void update(double dt) {
    super.update(dt);
    if (!_spawning || game.state != GameState.playing) return;
    _timer -= dt;
    if (_timer > 0) return;
    _timer = GameConstants.powerUpSpawnIntervalSec;

    final cultural = [
      PowerUpType.picapollo,
      PowerUpType.cafe,
      PowerUpType.mangu,
      PowerUpType.habichuelas,
    ];
    final type = cultural[_rng.nextInt(cultural.length)];
    final lane = _rng.nextInt(GameConstants.totalLanes);
    add(
      PowerUpComponent(
        type: type,
        laneX: lanePositions[lane],
        startY: -50,
        speed: _speed,
      ),
    );
  }
}
