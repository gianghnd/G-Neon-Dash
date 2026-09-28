import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../src/core/GameLoop.js';

function beginManualLoop(loop, startTimeMs = 1000) {
  loop._running = true;
  loop._paused = false;
  loop._lastTime = startTimeMs;
}

function endManualLoop(loop) {
  loop._running = false;
  loop._paused = false;
}

describe('GameLoop', () => {
  it('advances update with delta time while running', () => {
    let totalDelta = 0;
    const loop = new GameLoop({
      update: (dt) => {
        totalDelta += dt;
      },
      render: () => {},
    });

    beginManualLoop(loop);
    loop.tick(1016.67);
    loop.tick(1033.34);
    endManualLoop(loop);

    assert.ok(totalDelta > 0);
  });

  it('does not call update while paused', () => {
    let updateCount = 0;
    const loop = new GameLoop({
      update: () => {
        updateCount += 1;
      },
      render: () => {},
    });

    beginManualLoop(loop);
    loop.tick(1016.67);
    loop.pause();
    loop.tick(2000);
    loop.tick(3000);
    endManualLoop(loop);

    assert.equal(updateCount, 1);
  });

  it('resume rebases timestamp so hidden time is not simulated', () => {
    const deltas = [];
    const loop = new GameLoop({
      update: (dt) => {
        deltas.push(dt);
      },
      render: () => {},
    });

    beginManualLoop(loop);
    loop.tick(1016.67);
    loop.pause();
    loop.tick(1_800_000);
    loop.resume();
    loop.tick(1_800_000);
    loop.tick(1_800_016.67);
    endManualLoop(loop);

    assert.ok(deltas.every((dt) => dt < 0.05), `unexpected large delta: ${deltas}`);
    assert.ok(deltas.length >= 2);
  });

  it('still renders while paused', () => {
    let renderCount = 0;
    const loop = new GameLoop({
      update: () => {},
      render: () => {
        renderCount += 1;
      },
    });

    beginManualLoop(loop, 0);
    loop.tick(0);
    loop.pause();
    loop.tick(500);
    endManualLoop(loop);

    assert.ok(renderCount >= 2);
  });
});
