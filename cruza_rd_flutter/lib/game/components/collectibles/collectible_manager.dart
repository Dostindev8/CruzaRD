import 'dart:math';

import 'package:flame/components.dart';

import '../../../core/constants/game_constants.dart';
import '../../cruza_rd_game.dart';
import 'collectible_component.dart';

class CollectibleManager extends Component with HasGameReference<CruzaRDGame> {
  CollectibleManager({required List<double> lanePositions})
      : lanePositions = List<double>.from(lanePositions);

  final List<double> lanePositions;
  final _rng = Random.secure();
  double _speed = GameConstants.baseSpeed;
  double _timer = 1.2;
  bool _spawning = false;

  void updateSpeed(double speed) => _speed = speed;
  void startSpawning() {
    _spawning = true;
    _timer = 1.0;
  }

  void pauseSpawning() => _spawning = false;
  void stopSpawning() {
    _spawning = false;
    for (final c in children.whereType<CollectibleComponent>().toList()) {
      c.removeFromParent();
    }
  }

  @override
  void update(double dt) {
    super.update(dt);
    if (!_spawning || game.state != GameState.playing) return;
    _timer -= dt;
    if (_timer > 0) return;
    _timer = 1.4 + _rng.nextDouble();

    final lane = _rng.nextInt(GameConstants.totalLanes);
    final id = _rng.nextBool() ? 'papeleta' : 'mangu';
    add(
      CollectibleComponent(
        itemId: id,
        laneX: lanePositions[lane],
        startY: -40,
        speed: _speed,
      ),
    );
  }
}
