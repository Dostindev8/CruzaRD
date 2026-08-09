import 'package:cruza_rd/game/managers/score_manager.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('lane crossed increases score and combo multiplier', () {
    final s = ScoreManager();
    s.addLaneCrossed();
    expect(s.currentScore, greaterThan(0));
    for (var i = 0; i < 5; i++) {
      s.addLaneCrossed();
    }
    expect(s.multiplier, greaterThanOrEqualTo(2));
  });

  test('near miss grants bonus', () {
    final s = ScoreManager();
    final before = s.currentScore;
    s.addNearMiss();
    expect(s.currentScore, greaterThan(before));
    expect(s.currentCoins, greaterThan(0));
  });
}
