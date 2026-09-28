import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/core/Game.js';
import { GameState } from '../src/core/GameState.js';
import { ObstacleType } from '../src/entities/Obstacle.js';
import { GAME_CONFIG, PLAYER_CONFIG } from '../src/config/gameConfig.js';

function createMockCanvas() {
  const ctx = {
    fillStyle: '',
    font: '',
    textAlign: '',
    fillRect() {},
    fillText() {},
  };
  return {
    width: GAME_CONFIG.canvasWidth,
    height: GAME_CONFIG.canvasHeight,
    getContext: () => ctx,
  };
}

describe('Game — Core Gameplay V1', () => {
  it('collision during PLAYING transitions to GAME_OVER', () => {
    const game = new Game(createMockCanvas());
    game.init();
    game._startRun();
    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, game.player.x);
    game._update(1 / 60);
    assert.equal(game.stateMachine.getState(), GameState.GAME_OVER);
  });

  it('retry clears obstacles and resets score', () => {
    const game = new Game(createMockCanvas());
    game.init();
    game._startRun();
    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, 400);
    for (let i = 0; i < 50; i++) game._update(0.1);
    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, game.player.x);
    game._update(1 / 60);
    game._retryRun();
    assert.equal(game.spawnSystem.getActiveObstacles().length, 0);
    assert.equal(game.scoreSystem.getScore(), 0);
    assert.equal(game.stateMachine.getState(), GameState.PLAYING);
  });

  it('personal best survives retry', () => {
    const game = new Game(createMockCanvas());
    game.init();
    game._startRun();
    for (let i = 0; i < 30; i++) game._update(0.1);
    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, game.player.x);
    game._update(1 / 60);
    const best = game.scoreSystem.getBest();
    assert.ok(best > 0);
    game._retryRun();
    assert.equal(game.scoreSystem.getBest(), best);
    assert.equal(game.scoreSystem.getScore(), 0);
  });

  it('two consecutive runs do not leak obstacle state', () => {
    const game = new Game(createMockCanvas());
    game.init();

    game._startRun();
    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, 300);
    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, 500);
    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, game.player.x);
    game._update(1 / 60);
    assert.equal(game.stateMachine.getState(), GameState.GAME_OVER);
    game._retryRun();
    assert.equal(game.spawnSystem.getActiveObstacles().length, 0);

    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, 400);
    game._update(0.5);
    assert.equal(game.spawnSystem.getActiveObstacles().length, 1);
  });

  it('retry resets player position and grounded state', () => {
    const game = new Game(createMockCanvas());
    game.init();
    game._startRun();
    game.player.jump();
    game.player.y = 50;
    game.player.grounded = false;
    game.player.y = PLAYER_CONFIG.groundY - PLAYER_CONFIG.height;
    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, game.player.x);
    game._update(1 / 60);
    assert.equal(game.stateMachine.getState(), GameState.GAME_OVER);
    game._retryRun();
    assert.equal(game.player.y, PLAYER_CONFIG.groundY - PLAYER_CONFIG.height);
    assert.equal(game.player.grounded, true);
    assert.equal(game.player.velocityY, 0);
  });

  it('keeps speed fixed at initialSpeed when difficultyDirectorV2 is OFF', () => {
    const game = new Game(createMockCanvas());
    game.init();
    game._startRun();

    assert.equal(game._speed, GAME_CONFIG.initialSpeed);

    for (let i = 0; i < 100; i++) game._update(0.1);
    assert.equal(game._speed, GAME_CONFIG.initialSpeed);

    for (let i = 0; i < 200; i++) game._update(0.1);
    assert.equal(game._speed, GAME_CONFIG.initialSpeed);
  });

  it('speed unchanged at second 0, 10, and 30', () => {
    const game = new Game(createMockCanvas());
    game.init();
    game._startRun();
    const speeds = [game._speed];

    for (let i = 0; i < 100; i++) game._update(0.1);
    speeds.push(game._speed);

    for (let i = 0; i < 200; i++) game._update(0.1);
    speeds.push(game._speed);

    assert.deepEqual(speeds, [
      GAME_CONFIG.initialSpeed,
      GAME_CONFIG.initialSpeed,
      GAME_CONFIG.initialSpeed,
    ]);
  });

  it('finalizeRun updates best on death via collision', () => {
    const game = new Game(createMockCanvas());
    game.init();
    game._startRun();
    for (let i = 0; i < 20; i++) game._update(0.1);
    game.spawnSystem.spawnObstacle(ObstacleType.GROUND, game.player.x);
    game._update(1 / 60);
    assert.ok(game.scoreSystem.getBest() > 0);
  });
});
