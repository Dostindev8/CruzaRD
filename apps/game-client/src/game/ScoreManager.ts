import { multiplierFromBananaStreak } from '@cruza-rd/shared-types';

export class ScoreManager {
  distance = 0;
  bananas = 0;
  bananaStreak = 0;
  coins = 0;
  picaPollo = 0;
  bonusPoints = 0;
  jumps = 0;
  slides = 0;
  powerupUses = 0;
  multiplier = 1;
  score = 0;

  addDistance(meters: number) {
    this.distance += meters;
    this.recompute();
  }

  collectBanana() {
    this.bananas += 1;
    this.bananaStreak += 1;
    this.multiplier = multiplierFromBananaStreak(this.bananaStreak);
    this.recompute();
  }

  collectCoin() {
    this.coins += 1;
  }

  collectPicaPollo() {
    this.picaPollo += 1;
  }

  collectMangu() {
    this.bonusPoints += 500;
    this.recompute();
  }

  resetStreak() {
    this.bananaStreak = 0;
    this.multiplier = 1;
    this.recompute();
  }

  private recompute() {
    this.score = Math.floor(
      this.distance * 1 + this.bananas * 5 * this.multiplier + this.bonusPoints,
    );
  }

  snapshot() {
    return {
      distanceMeters: Math.floor(this.distance),
      score: this.score,
      multiplierMax: this.multiplier,
      coinsEarned: this.coins,
      picaPolloCollected: this.picaPollo,
      bananasCollected: this.bananas,
      jumpsCount: this.jumps,
      slidesCount: this.slides,
      powerupUsesCount: this.powerupUses,
    };
  }
}
