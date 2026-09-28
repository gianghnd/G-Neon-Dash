import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { SpawnSystem } from '../src/systems/SpawnSystem.js';
import { ObstacleType } from '../src/entities/Obstacle.js';
import { OBSTACLE_CONFIG, GAME_CONFIG } from '../src/config/gameConfig.js';

describe('SpawnSystem', () => {
  let spawn;
  let originalRandom;

  beforeEach(() => {
    spawn = new SpawnSystem();
    originalRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  it('pickSpawnInterval returns min when random is 0', () => {
    Math.random = () => 0;
    assert.equal(spawn.pickSpawnInterval(), OBSTACLE_CONFIG.spawnIntervalMinMs);
  });

  it('pickSpawnInterval returns max when random approaches 1', () => {
    Math.random = () => 0.999999;
    const interval = spawn.pickSpawnInterval();
    assert.ok(interval >= OBSTACLE_CONFIG.spawnIntervalMaxMs - 1);
    assert.ok(interval <= OBSTACLE_CONFIG.spawnIntervalMaxMs);
  });

  it('spawns only GROUND obstacles during V1 update', () => {
    Math.random = () => 0;
    spawn = new SpawnSystem();
    spawn.update(OBSTACLE_CONFIG.spawnIntervalMinMs / 1000 + 0.01, GAME_CONFIG.canvasWidth);
    const active = spawn.getActiveObstacles();
    assert.equal(active.length, 1);
    assert.equal(active[0].type, ObstacleType.GROUND);
  });

  it('never spawns FLOATING obstacles during V1 update', () => {
    for (let trial = 0; trial < 20; trial++) {
      Math.random = () => trial / 20;
      spawn = new SpawnSystem();
      spawn.update(OBSTACLE_CONFIG.spawnIntervalMinMs / 1000 + 0.01, GAME_CONFIG.canvasWidth);
      for (const obstacle of spawn.getActiveObstacles()) {
        assert.equal(obstacle.type, ObstacleType.GROUND);
      }
    }
  });

  it('moves obstacles according to configured speed', () => {
    const obstacle = spawn.spawnObstacle(ObstacleType.GROUND, 400);
    spawn.setSpeed(200);
    const startX = obstacle.x;
    spawn.update(1, GAME_CONFIG.canvasWidth);
    assert.equal(obstacle.x, startX - 200);
  });

  it('destroys obstacles when off-screen', () => {
    const obstacle = spawn.spawnObstacle(ObstacleType.GROUND, 10);
    spawn.update(1, GAME_CONFIG.canvasWidth);
    assert.equal(spawn.getActiveObstacles().length, 0);
  });

  it('reset clears all obstacles and spawn timer', () => {
    spawn.spawnObstacle(ObstacleType.GROUND, 400);
    spawn._spawnTimer = 500;
    spawn.reset();
    assert.equal(spawn.getActiveObstacles().length, 0);
    assert.equal(spawn._spawnTimer, 0);
  });

  it('fairness baseline: min interval travel distance exceeds 3× player width', () => {
    const minTravelPx =
      OBSTACLE_CONFIG.spawnIntervalMinMs * (GAME_CONFIG.initialSpeed / 1000);
    const minGapRequired = OBSTACLE_CONFIG.groundWidth * 3;
    assert.ok(
      minTravelPx >= minGapRequired,
      `Expected ${minTravelPx}px >= ${minGapRequired}px`
    );
  });
});
