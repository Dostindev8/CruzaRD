class DifficultyManager {
  double _baseSpeed = 150;
  double _speedIncrement = 10;
  double _maxSpeed = 500;

  void initialize({
    required double baseSpeed,
    required double speedIncrement,
    required double maxSpeed,
  }) {
    _baseSpeed = baseSpeed;
    _speedIncrement = speedIncrement;
    _maxSpeed = maxSpeed;
  }

  double getSpeedForDistance(double distanceMeters) {
    final speed = _baseSpeed + (distanceMeters / 100) * _speedIncrement;
    return speed.clamp(_baseSpeed, _maxSpeed);
  }

  double getSpawnInterval(double distanceMeters) {
    final interval = 2.0 - (distanceMeters * 0.0015);
    return interval.clamp(0.5, 2.0);
  }
}
