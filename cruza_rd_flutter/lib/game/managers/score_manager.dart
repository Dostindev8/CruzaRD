import '../../core/constants/game_constants.dart';

class ScoreManager {
  int currentScore = 0;
  int currentCoins = 0;
  int combo = 0;
  int comboMax = 0;
  int multiplier = 1;
  double _lastDistanceAwarded = 0;

  void reset() {
    currentScore = 0;
    currentCoins = 0;
    combo = 0;
    comboMax = 0;
    multiplier = 1;
    _lastDistanceAwarded = 0;
  }

  void addLaneCrossed() {
    combo++;
    if (combo > comboMax) comboMax = combo;
    multiplier = _multiplierFromCombo(combo);
    currentScore += GameConstants.pointsPerLaneCrossed * multiplier;
  }

  void addNearMiss() {
    currentScore += GameConstants.nearMissBonus * multiplier;
    currentCoins += GameConstants.papeletasPerNearMiss;
  }

  void addCollectible(String id) {
    currentScore += 25 * multiplier;
    currentCoins += GameConstants.papeletasPerCollectible;
    if (id == 'mangu') {
      combo = combo < 5 ? 5 : combo;
      multiplier = _multiplierFromCombo(combo);
    }
  }

  void addPowerUp() {
    currentScore += 40 * multiplier;
  }

  void updateDistance(double distance) {
    final meters = distance.floor();
    final awarded = _lastDistanceAwarded.floor();
    if (meters > awarded) {
      final delta = meters - awarded;
      currentScore += delta * GameConstants.pointsPerMeter * multiplier;
      _lastDistanceAwarded = distance;
    }
  }

  void breakCombo() {
    combo = 0;
    multiplier = 1;
  }

  int _multiplierFromCombo(int c) {
    if (c >= 30) return 5;
    if (c >= 20) return 4;
    if (c >= 10) return 3;
    if (c >= 5) return 2;
    return 1;
  }
}
