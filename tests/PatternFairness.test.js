import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeJumpAirtimeFrames,
  computeJumpPeakHeightPx,
  computeSafeGapFrames,
  spacingPxFromFrames,
  validatePatternAtSpeed,
} from '../src/utils/fairness.js';
import { PATTERN_LIBRARY, getPatternById } from '../src/patterns/PatternLibrary.js';
import { PatternSystem } from '../src/patterns/PatternSystem.js';
import { evaluateDifficulty } from '../src/difficulty/DifficultyDirector.js';
import { PLAYER_CONFIG, GAME_CONFIG, DIFFICULTY_CONFIG } from '../src/config/gameConfig.js';

describe('Pattern fairness math', () => {
  it('computes jump airtime as 40 frames with current CONFIG', () => {
    const airtime = computeJumpAirtimeFrames();
    assert.equal(airtime, 40);
  });

  it('computes jump peak height near design reference (~133px)', () => {
    const peak = computeJumpPeakHeightPx();
    assert.ok(
      peak >= 120 && peak <= 140,
      `expected peak in 120–140px, got ${peak.toFixed(2)}`
    );
  });

  it('computes safeGapFrames as airtime + landing + reaction', () => {
    const safeGap = computeSafeGapFrames();
    assert.equal(
      safeGap,
      40 + DIFFICULTY_CONFIG.landingStabilizeFrames + DIFFICULTY_CONFIG.reactionFloorFrames
    );
    assert.equal(safeGap, 61);
  });

  it('converts frame spacing to pixels using live speed (hand calc at 200 px/s)', () => {
    const speed = GAME_CONFIG.initialSpeed;
    const spacingPx = spacingPxFromFrames(61, speed);
    const expected = (61 / DIFFICULTY_CONFIG.physicsFps) * speed;
    assert.equal(spacingPx, expected);
    assert.ok(Math.abs(spacingPx - 203.33333333333334) < 0.001);
  });

  it('recomputes spacing when speed changes (no cached px gaps)', () => {
    const low = spacingPxFromFrames(61, 200);
    const high = spacingPxFromFrames(61, 400);
    assert.equal(high, low * 2);
  });

  it('validates all library patterns at min and max supported speeds', () => {
    for (const speed of [GAME_CONFIG.initialSpeed, DIFFICULTY_CONFIG.patternComplexityMaxSpeed]) {
      for (const pattern of PATTERN_LIBRARY) {
        assert.equal(
          validatePatternAtSpeed(pattern, speed),
          true,
          `${pattern.id} should pass at speed ${speed}`
        );
      }
    }
  });

  it('rejects patterns whose spacing is below safeGapFrames', () => {
    const invalid = {
      id: 'invalid_combo',
      minDifficulty: 0,
      elements: [
        { type: 'ground', tMinFrames: 0 },
        { type: 'ground', tMinFrames: 10 },
      ],
    };
    assert.equal(validatePatternAtSpeed(invalid, GAME_CONFIG.initialSpeed), false);
  });
});

describe('PatternSystem selection', () => {
  it('falls back to P1 when nothing else is eligible', () => {
    const system = new PatternSystem(() => 0);
    const pattern = system.selectPattern({
      patternComplexityCap: 0,
      speedAtSpawn: GAME_CONFIG.initialSpeed,
    });
    assert.equal(pattern.id, 'P1');
  });

  it('excludes immediate pattern repeat when alternatives exist', () => {
    const rolls = [0, 0.5];
    let index = 0;
    const system = new PatternSystem(() => rolls[index++]);
    system.selectPattern({
      patternComplexityCap: 1,
      speedAtSpawn: GAME_CONFIG.initialSpeed,
    });
    const first = system.getLastPatternId();
    const second = system.selectPattern({
      patternComplexityCap: 1,
      speedAtSpawn: GAME_CONFIG.initialSpeed,
    }).id;
    assert.notEqual(second, first);
  });
});

describe('DifficultyDirector', () => {
  it('returns phase bands per elapsed time', () => {
    assert.equal(evaluateDifficulty(10, 200).phase, 'LEARN');
    assert.equal(evaluateDifficulty(45, 250).phase, 'FLOW');
    assert.equal(evaluateDifficulty(90, 350).phase, 'PRESSURE');
    assert.equal(evaluateDifficulty(150, 500).phase, 'MASTERY');
  });

  it('returns difficulty and patternComplexityCap in 0..1', () => {
    const state = evaluateDifficulty(60, 300);
    assert.ok(state.difficulty >= 0 && state.difficulty <= 1);
    assert.ok(state.patternComplexityCap >= 0 && state.patternComplexityCap <= 1);
  });

  it('leaves playerPerformanceAdapter unused by default', () => {
    assert.equal(DIFFICULTY_CONFIG.playerPerformanceAdapter, null);
    const before = evaluateDifficulty(30, 200);
    const after = evaluateDifficulty(30, 200);
    assert.deepEqual(before, after);
  });
});

describe('PatternLibrary catalog', () => {
  it('includes P1 through P10', () => {
    const ids = PATTERN_LIBRARY.map((pattern) => pattern.id);
    assert.deepEqual(ids, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10']);
  });

  it('uses frame-based spacing derived from safeGap for combos', () => {
    const p4 = getPatternById('P4');
    const p5 = getPatternById('P5');
    assert.equal(p4.elements[1].tMinFrames, 61);
    assert.ok(p5.elements[1].tMinFrames >= 61);
  });

  it('assigns lower weight to P10', () => {
    const p10 = getPatternById('P10');
    assert.equal(p10.weight, 0.25);
  });
});
