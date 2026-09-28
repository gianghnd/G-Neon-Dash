/**
 * Pattern selection pipeline with weighted random selection.
 */

import {
  PATTERN_LIBRARY,
  PATTERN_FALLBACK_ID,
  getPatternById,
} from './PatternLibrary.js';
import { validatePatternAtSpeed } from '../utils/fairness.js';

export class PatternSystem {
  constructor(randomFn = Math.random) {
    this._random = randomFn;
    this._lastPatternId = null;
  }

  reset() {
    this._lastPatternId = null;
  }

  selectPattern({ patternComplexityCap, speedAtSpawn }) {
    const eligible = PATTERN_LIBRARY.filter(
      (pattern) => pattern.minDifficulty <= patternComplexityCap
    );

    const fair = eligible.filter((pattern) =>
      validatePatternAtSpeed(pattern, speedAtSpawn)
    );

    const nonRepeat = fair.filter((pattern) => pattern.id !== this._lastPatternId);
    const pool = nonRepeat.length > 0 ? nonRepeat : fair;

    let selected = this._weightedPick(pool);

    if (!selected || !validatePatternAtSpeed(selected, speedAtSpawn)) {
      selected = getPatternById(PATTERN_FALLBACK_ID);
    }

    this._lastPatternId = selected.id;
    return selected;
  }

  _weightedPick(pool) {
    if (pool.length === 0) {
      return null;
    }
    const totalWeight = pool.reduce((sum, pattern) => sum + (pattern.weight ?? 1), 0);
    let roll = this._random() * totalWeight;
    for (const pattern of pool) {
      roll -= pattern.weight ?? 1;
      if (roll <= 0) {
        return pattern;
      }
    }
    return pool[pool.length - 1];
  }

  getLastPatternId() {
    return this._lastPatternId;
  }
}
