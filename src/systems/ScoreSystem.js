/**
 * Score tracking system.
 *
 * Responsibility: Track current score and personal best.
 * Public API: update(), reset(), getScore(), getBest(), isNewBest().
 * Dependencies: SCORE_CONFIG.
 *
 * Persistence is handled by RetentionSystem via Game on new best.
 */

import { SCORE_CONFIG } from '../config/gameConfig.js';

export class ScoreSystem {
  constructor(initialBest = 0) {
    this.reset();
    const parsed = Math.floor(initialBest);
    this._best = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }

  reset() {
    this._score = 0;
    this._wasNewBest = false;
  }

  update(deltaTime, speed) {
    this._score += speed * deltaTime * SCORE_CONFIG.pointsPerSpeedUnit;
  }

  getScore() {
    return Math.floor(this._score);
  }

  getBest() {
    return Math.floor(this._best);
  }

  isNewBest() {
    return this._wasNewBest;
  }

  finalizeRun() {
    const finalScore = this.getScore();
    if (finalScore > this._best) {
      this._best = finalScore;
      this._wasNewBest = true;
    } else {
      this._wasNewBest = false;
    }
    return finalScore;
  }
}
