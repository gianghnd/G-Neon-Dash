/**
 * Difficulty Director — time/speed difficulty scalar and pattern cap.
 *
 * Responsibility: Map elapsed run time + speed to difficulty outputs.
 * Dependencies: DIFFICULTY_CONFIG, GAME_CONFIG.
 *
 * Player-performance adaptation is intentionally NOT used (extension point only).
 */

import { DIFFICULTY_CONFIG, GAME_CONFIG } from '../config/gameConfig.js';
import { clamp } from '../utils/math.js';

function getPhaseIndex(elapsedSec) {
  const { phaseThresholdsSec } = DIFFICULTY_CONFIG;
  if (elapsedSec < phaseThresholdsSec.learnEnd) return 0;
  if (elapsedSec < phaseThresholdsSec.flowEnd) return 1;
  if (elapsedSec < phaseThresholdsSec.pressureEnd) return 2;
  return 3;
}

const PHASE_NAMES = ['LEARN', 'FLOW', 'PRESSURE', 'MASTERY'];

function computeDifficultyScalar(elapsedSec, currentSpeed) {
  const { phaseThresholdsSec, patternComplexityMaxSpeed } = DIFFICULTY_CONFIG;
  const totalSpan =
    phaseThresholdsSec.pressureEnd +
    (phaseThresholdsSec.masteryEnd - phaseThresholdsSec.pressureEnd) * 0.5;
  const timeFactor = clamp(elapsedSec / totalSpan, 0, 1);
  const speedFactor = clamp(
    (currentSpeed - GAME_CONFIG.initialSpeed) /
      (patternComplexityMaxSpeed - GAME_CONFIG.initialSpeed),
    0,
    1
  );
  return clamp(timeFactor * 0.75 + speedFactor * 0.25, 0, 1);
}

function computePatternComplexityCap(elapsedSec, difficultyScalar) {
  const phaseIndex = getPhaseIndex(elapsedSec);
  const phaseFloor = [0, 0.25, 0.5, 0.75][phaseIndex];
  return clamp(Math.max(phaseFloor, difficultyScalar), 0, 1);
}

/**
 * Optional player-performance hook — unused in V1 expansion.
 * @type {((state: object, input: object) => object) | null}
 */
export function applyPlayerPerformanceExtension(state, performanceInput = {}) {
  const adapter = DIFFICULTY_CONFIG.playerPerformanceAdapter;
  if (typeof adapter !== 'function') {
    return state;
  }
  return adapter(state, performanceInput);
}

export function evaluateDifficulty(elapsedSec, currentSpeed) {
  const phaseIndex = getPhaseIndex(elapsedSec);
  const difficulty = computeDifficultyScalar(elapsedSec, currentSpeed);
  const patternComplexityCap = computePatternComplexityCap(elapsedSec, difficulty);
  const speedCap = DIFFICULTY_CONFIG.phaseSpeedCaps[phaseIndex];

  const state = {
    phase: PHASE_NAMES[phaseIndex],
    phaseIndex,
    difficulty,
    patternComplexityCap,
    speedCap,
    targetSpeedCap: Math.min(speedCap, DIFFICULTY_CONFIG.patternComplexityMaxSpeed),
  };

  return applyPlayerPerformanceExtension(state, {});
}
