import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ScoreSystem } from '../src/systems/ScoreSystem.js';

describe('ScoreSystem', () => {
  it('starts at zero', () => {
    const score = new ScoreSystem();
    assert.equal(score.getScore(), 0);
    assert.equal(score.getBest(), 0);
  });

  it('accumulates score based on speed and deltaTime', () => {
    const score = new ScoreSystem();
    score.update(1, 200);
    assert.ok(score.getScore() > 0);
  });

  it('resets current score but keeps best', () => {
    const score = new ScoreSystem();
    score.update(10, 200);
    score.finalizeRun();
    const best = score.getBest();
    score.reset();
    assert.equal(score.getScore(), 0);
    assert.equal(score.getBest(), best);
  });

  it('detects new best on finalizeRun', () => {
    const score = new ScoreSystem();
    score.update(5, 200);
    score.finalizeRun();
    assert.ok(score.isNewBest());

    score.reset();
    score.update(1, 100);
    score.finalizeRun();
    assert.ok(!score.isNewBest());
  });

  it('updates best when score exceeds previous', () => {
    const score = new ScoreSystem();
    score.update(5, 200);
    score.finalizeRun();
    const firstBest = score.getBest();

    score.reset();
    score.update(10, 300);
    score.finalizeRun();
    assert.ok(score.getBest() > firstBest);
    assert.ok(score.isNewBest());
  });
});
