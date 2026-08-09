import 'package:cruza_rd/core/services/security_service.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('rejects impossible score rates', () {
    final s = SecurityService();
    expect(
      s.validateRunRewards(score: 999999, distanceMeters: 10, runDurationSeconds: 1),
      isFalse,
    );
    expect(
      s.validateRunRewards(score: 100, distanceMeters: 20, runDurationSeconds: 10),
      isTrue,
    );
  });
}
