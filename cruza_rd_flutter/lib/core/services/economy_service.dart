import '../../data/repositories/player_repository.dart';
import 'security_service.dart';

/// Economía centralizada — la UI nunca muta balances directamente (GDD v4 §18).
class EconomyService {
  EconomyService({required this.repository, required this.security});

  final PlayerRepository repository;
  final SecurityService security;

  int get papeletas => repository.data.papeletas;
  int get trofeos => repository.data.trofeos;

  Future<bool> trySpendPapeletas(int amount, String reason) async {
    if (amount <= 0 || repository.data.papeletas < amount) return false;
    repository.data.papeletas -= amount;
    await repository.save();
    return true;
  }

  Future<void> grantRunRewards({
    required int score,
    required double distance,
    required double durationSeconds,
    required int papeletasCollected,
  }) async {
    if (!security.validateRunRewards(
      score: score,
      distanceMeters: distance,
      runDurationSeconds: durationSeconds,
    )) {
      return;
    }

    final grant = (papeletasCollected + (distance / 10).floor()).clamp(1, 5000);
    repository.data.papeletas += grant;
    repository.data.totalDistance += distance.floor();
    if (score > repository.data.bestScore) {
      repository.data.bestScore = score;
    }
    await repository.save();
  }
}
