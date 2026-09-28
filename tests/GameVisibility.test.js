import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/core/Game.js';
import { GameState } from '../src/core/GameState.js';
import { GAME_CONFIG } from '../src/config/gameConfig.js';

function createMockCanvas() {
  const ctx = {
    fillStyle: '',
    font: '',
    textAlign: '',
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: '',
    fillRect() {},
    fillText() {},
    save() {},
    restore() {},
    translate() {},
    setTransform() {},
    createLinearGradient() {
      return { addColorStop() {} };
    },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    stroke() {},
    arc() {},
    fill() {},
    measureText() {
      return { width: 0 };
    },
  };
  return {
    width: GAME_CONFIG.canvasWidth,
    height: GAME_CONFIG.canvasHeight,
    getContext: () => ctx,
  };
}

function createGame(visibilityState = 'visible') {
  let state = visibilityState;
  const game = new Game(createMockCanvas(), {
    getVisibilityState: () => state,
  });
  game.init();
  game._loop._render = () => {};
  return {
    game,
    setVisibility: (next) => {
      state = next;
      game._applyVisibilityToGameplayLoop();
    },
  };
}

function beginManualLoop(loop, startTimeMs = 1000) {
  loop._running = true;
  loop._paused = false;
  loop._lastTime = startTimeMs;
}

function endManualLoop(loop) {
  loop._running = false;
  loop._paused = false;
}

function tickLoop(game, fromMs, toMs, stepMs = 16.67) {
  for (let t = fromMs; t <= toMs; t += stepMs) {
    game._loop.tick(t);
  }
}

function disableSpawns(game) {
  game.spawnSystem.update = () => {};
}

describe('Game — background tab / visibility freeze', () => {
  it('PLAYING advances score during normal frame progression', () => {
    const { game } = createGame('visible');
    game._startRun();

    for (let i = 0; i < 10; i++) {
      game._update(0.1);
    }

    assert.ok(game.scoreSystem.getScore() > 0);
    assert.ok(game._runElapsedSec > 0);
  });

  it('hidden document freezes gameplay simulation via the game loop', () => {
    const { game, setVisibility } = createGame('visible');
    game._startRun();
    disableSpawns(game);
    beginManualLoop(game._loop);
    tickLoop(game, 1016.67, 1300);

    const scoreBeforeHide = game.scoreSystem.getScore();
    const elapsedBeforeHide = game._runElapsedSec;
    const frameCountBeforeHide = game._runDurationFrames;

    setVisibility('hidden');
    assert.equal(game._loop.isPaused(), true);

    tickLoop(game, 2000, 1_800_000, 1000);

    assert.equal(game.scoreSystem.getScore(), scoreBeforeHide);
    assert.equal(game._runElapsedSec, elapsedBeforeHide);
    assert.equal(game._runDurationFrames, frameCountBeforeHide);
    endManualLoop(game._loop);
  });

  it('simulated long hidden duration does not advance score or elapsed time', () => {
    const { game, setVisibility } = createGame('visible');
    game._startRun();
    disableSpawns(game);
    beginManualLoop(game._loop);
    tickLoop(game, 1016.67, 1200);

    const scoreAtHide = game.scoreSystem.getScore();
    const elapsedAtHide = game._runElapsedSec;

    setVisibility('hidden');
    game._loop.tick(3_600_000);
    game._loop.tick(7_200_000);

    assert.equal(game.scoreSystem.getScore(), scoreAtHide);
    assert.equal(game._runElapsedSec, elapsedAtHide);
    endManualLoop(game._loop);
  });

  it('resume rebases loop timing and continues from frozen state', () => {
    const { game, setVisibility } = createGame('visible');
    game._startRun();
    disableSpawns(game);
    beginManualLoop(game._loop);
    tickLoop(game, 1016.67, 1200);

    const scoreAtHide = game.scoreSystem.getScore();
    const elapsedAtHide = game._runElapsedSec;

    setVisibility('hidden');
    game._loop.tick(5_000_000);

    setVisibility('visible');
    assert.equal(game._loop.isPaused(), false);

    game._loop.tick(5_000_000);

    assert.equal(game.scoreSystem.getScore(), scoreAtHide);
    assert.equal(game._runElapsedSec, elapsedAtHide);

    tickLoop(game, 5_000_016, 5_000_500);

    assert.ok(game._runElapsedSec > elapsedAtHide);
    assert.ok(game.scoreSystem.getScore() >= scoreAtHide);
    assert.ok(
      game._runElapsedSec - elapsedAtHide < 1,
      'resume must not simulate hidden elapsed time'
    );
    endManualLoop(game._loop);
  });

  it('hidden duration does not advance run elapsed time used by Difficulty Director', () => {
    const { game, setVisibility } = createGame('visible');
    game._startRun();
    disableSpawns(game);
    beginManualLoop(game._loop);
    tickLoop(game, 1016.67, 2000);

    const elapsedAtHide = game._runElapsedSec;
    setVisibility('hidden');
    game._loop.tick(500_000);

    assert.equal(game._runElapsedSec, elapsedAtHide);
    endManualLoop(game._loop);
  });

  it('does not pause when not in PLAYING state', () => {
    const { game, setVisibility } = createGame('visible');
    assert.equal(game.stateMachine.getState(), GameState.MENU);

    setVisibility('hidden');

    assert.equal(game._loop.isPaused(), false);
    assert.equal(game._pausedByVisibility, false);
  });

  it('leaving PLAYING clears visibility pause for overlay states', () => {
    const { game, setVisibility } = createGame('visible');
    game._startRun();
    setVisibility('hidden');
    assert.equal(game._loop.isPaused(), true);

    game.stateMachine.transition(GameState.DYING);
    game.stateMachine.transition(GameState.GAME_OVER);

    assert.equal(game._pausedByVisibility, false);
    assert.equal(game._loop.isPaused(), false);
  });
});
