import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/constants/game_constants.dart';
import 'components/biomes/biome_manager.dart';
import 'components/collectibles/collectible_manager.dart';
import 'components/obstacles/obstacle_manager.dart';
import 'components/particles/particle_manager.dart';
import 'components/player/player_component.dart';
import 'components/powerups/powerup_manager.dart';
import 'input/keyboard_input_handler.dart';
import 'managers/camera_manager.dart';
import 'managers/difficulty_manager.dart';
import 'managers/input_manager.dart';
import 'managers/score_manager.dart';

enum GameState { ready, playing, paused, gameOver }

enum SwipeDirection { up, down, left, right, none }

/// Motor principal Flame — GDD v4 §06 (viewport responsive + colisiones + input universal).
class CruzaRDGame extends FlameGame
    with HasCollisionDetection, TapCallbacks, PanDetector, KeyboardEvents {
  late final InputManager _inputManager;
  late final CameraManager _cameraManager;
  late final ScoreManager scoreManager;
  late final DifficultyManager _difficultyManager;
  late final ObstacleManager obstacleManager;
  late final CollectibleManager collectibleManager;
  late final PowerUpManager powerUpManager;
  late final ParticleManager particleManager;
  late final BiomeManager biomeManager;
  late PlayerComponent player;

  GameState state = GameState.ready;
  double distanceTraveled = 0.0;
  double currentSpeed = GameConstants.baseSpeed;
  int currentLane = 2;
  final List<double> lanePositions = [];
  double _runSeconds = 0;
  double _timeScale = 1;

  void Function(int score)? onScoreChanged;
  void Function(int coins)? onCoinsChanged;
  void Function(double distance)? onDistanceChanged;
  void Function()? onGameOver;

  double get runSeconds => _runSeconds;
  double get timeScale => _timeScale;

  @override
  Color backgroundColor() => const Color(0xFF101A2E);

  @override
  Future<void> onLoad() async {
    await super.onLoad();
    camera.viewfinder.anchor = Anchor.topLeft;

    _inputManager = InputManager();
    _cameraManager = CameraManager(camera);
    scoreManager = ScoreManager();
    _difficultyManager = DifficultyManager()
      ..initialize(
        baseSpeed: GameConstants.baseSpeed,
        speedIncrement: GameConstants.speedIncrementPer100m,
        maxSpeed: GameConstants.maxSpeed,
      );

    particleManager = ParticleManager();
    biomeManager = BiomeManager();
    await world.add(biomeManager);
    await world.add(particleManager);

    _calculateLanePositions();
    player = PlayerComponent(laneIndex: currentLane, lanePositions: lanePositions);
    await world.add(player);

    obstacleManager = ObstacleManager(
      lanePositions: lanePositions,
      onNearMiss: (pos) {
        scoreManager.addNearMiss();
        particleManager.spawnNearMissEffect(pos);
        player.triggerNearMiss();
        _cameraManager.shake(GameConstants.cameraShakeIntensity * 0.4);
        onScoreChanged?.call(scoreManager.currentScore);
        onCoinsChanged?.call(scoreManager.currentCoins);
      },
    );
    collectibleManager = CollectibleManager(lanePositions: lanePositions);
    powerUpManager = PowerUpManager(lanePositions: lanePositions);
    await world.addAll([obstacleManager, collectibleManager, powerUpManager]);

    _cameraManager.initialize(target: player);
    state = GameState.ready;
  }

  @override
  void onGameResize(Vector2 size) {
    super.onGameResize(size);
    if (lanePositions.isNotEmpty) {
      _calculateLanePositions(reposition: true);
    }
  }

  void _calculateLanePositions({bool reposition = false}) {
    lanePositions.clear();
    final totalWidth = GameConstants.laneWidth * GameConstants.totalLanes;
    final startX = (size.x - totalWidth) / 2;
    for (var i = 0; i < GameConstants.totalLanes; i++) {
      lanePositions.add(
        startX + (i * GameConstants.laneWidth) + (GameConstants.laneWidth / 2),
      );
    }
    if (reposition && isLoaded) {
      player.snapToLane(currentLane, lanePositions[currentLane]);
      obstacleManager.lanePositions
        ..clear()
        ..addAll(lanePositions);
      collectibleManager.lanePositions
        ..clear()
        ..addAll(lanePositions);
      powerUpManager.lanePositions
        ..clear()
        ..addAll(lanePositions);
    }
  }

  @override
  void update(double dt) {
    final scaled = dt * _timeScale;
    if (state == GameState.playing) {
      _updateGameplay(scaled);
    }
    super.update(scaled);
  }

  void _updateGameplay(double dt) {
    _runSeconds += dt;
    distanceTraveled += currentSpeed * dt * 0.02; // metros relativos
    currentSpeed = _difficultyManager.getSpeedForDistance(distanceTraveled);
    obstacleManager.updateSpeed(currentSpeed);
    collectibleManager.updateSpeed(currentSpeed);
    powerUpManager.updateSpeed(currentSpeed);
    biomeManager.updateForDistance(distanceTraveled);
    scoreManager.updateDistance(distanceTraveled);
    _cameraManager.follow(player.position, size);
    onDistanceChanged?.call(distanceTraveled);
    onScoreChanged?.call(scoreManager.currentScore);
    onCoinsChanged?.call(scoreManager.currentCoins);
  }

  @override
  void onPanStart(DragStartInfo info) {
    if (state != GameState.playing) return;
    _inputManager.onPanStart(info.eventPosition.global);
  }

  @override
  void onPanUpdate(DragUpdateInfo info) {
    if (state != GameState.playing) return;
    _inputManager.onPanUpdate(info.delta.global);
  }

  @override
  void onPanEnd(DragEndInfo info) {
    if (state != GameState.playing) return;
    _handleSwipe(_inputManager.onPanEnd());
  }

  @override
  KeyEventResult onKeyEvent(KeyEvent event, Set<LogicalKeyboardKey> keysPressed) {
    if (state != GameState.playing) return KeyEventResult.ignored;
    final direction = KeyboardInputHandler.resolve(event, keysPressed);
    if (direction != SwipeDirection.none) {
      _handleSwipe(direction);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  void _handleSwipe(SwipeDirection direction) {
    switch (direction) {
      case SwipeDirection.up:
        _moveForward();
      case SwipeDirection.down:
        _moveBackward();
      case SwipeDirection.left:
        _moveLeft();
      case SwipeDirection.right:
        _moveRight();
      case SwipeDirection.none:
        break;
    }
  }

  void _moveForward() {
    if (state != GameState.playing) return;
    player.moveForward();
    scoreManager.addLaneCrossed();
    onScoreChanged?.call(scoreManager.currentScore);
  }

  void _moveBackward() {
    if (state != GameState.playing) return;
    player.moveBackward();
  }

  void _moveLeft() {
    if (state != GameState.playing || currentLane <= 0) return;
    currentLane--;
    player.moveToLane(currentLane, lanePositions[currentLane]);
  }

  void _moveRight() {
    if (state != GameState.playing || currentLane >= GameConstants.totalLanes - 1) {
      return;
    }
    currentLane++;
    player.moveToLane(currentLane, lanePositions[currentLane]);
  }

  /// Input desde D-pad on-screen.
  void swipe(SwipeDirection direction) => _handleSwipe(direction);

  void startGame() {
    if (state != GameState.ready && state != GameState.gameOver) return;
    state = GameState.playing;
    distanceTraveled = 0;
    _runSeconds = 0;
    currentSpeed = GameConstants.baseSpeed;
    currentLane = 2;
    _timeScale = 1;
    scoreManager.reset();
    player.reset(laneIndex: currentLane, laneX: lanePositions[currentLane]);
    obstacleManager.startSpawning();
    collectibleManager.startSpawning();
    powerUpManager.startSpawning();
    player.startRunning();
    _cameraManager.reset();
  }

  void pauseGame() {
    if (state != GameState.playing) return;
    state = GameState.paused;
    obstacleManager.pauseSpawning();
    collectibleManager.pauseSpawning();
    powerUpManager.pauseSpawning();
  }

  void resumeGame() {
    if (state != GameState.paused) return;
    state = GameState.playing;
    obstacleManager.startSpawning();
    collectibleManager.startSpawning();
    powerUpManager.startSpawning();
  }

  Future<void> triggerGameOver() async {
    if (state == GameState.gameOver) return;
    state = GameState.gameOver;
    obstacleManager.stopSpawning();
    collectibleManager.stopSpawning();
    powerUpManager.stopSpawning();
    particleManager.spawnDeathEffect(player.position);
    player.triggerDeath();
    _cameraManager.triggerDeathCam(player.position);
    _timeScale = 0.25;
    await Future<void>.delayed(
      Duration(
        milliseconds: (GameConstants.deathCamSlowMoDuration * 1000).round(),
      ),
    );
    _timeScale = 1;
    onGameOver?.call();
  }

  void restartGame() {
    state = GameState.ready;
    startGame();
  }

  @override
  void onTapUp(TapUpEvent event) {
    if (state == GameState.ready) startGame();
  }

  void onCollectiblePicked(String id) {
    scoreManager.addCollectible(id);
    particleManager.spawnCollectEffect(player.position, id);
    onScoreChanged?.call(scoreManager.currentScore);
    onCoinsChanged?.call(scoreManager.currentCoins);
  }

  void onPowerUpPicked(PowerUpType type) {
    player.activatePowerUp(type);
    particleManager.spawnPowerUpEffect(player.position, type);
    scoreManager.addPowerUp();
    onScoreChanged?.call(scoreManager.currentScore);
  }
}
