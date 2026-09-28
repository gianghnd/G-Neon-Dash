import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../src/entities/Player.js';
import { Obstacle, ObstacleType } from '../src/entities/Obstacle.js';
import { CollisionSystem } from '../src/systems/CollisionSystem.js';
import {
  PLAYER_CONFIG,
  OBSTACLE_CONFIG,
  GAME_CONFIG,
} from '../src/config/gameConfig.js';

const DT = 1 / 120;
const SPEED = GAME_CONFIG.initialSpeed;

function measureJumpStats() {
  const player = new Player();
  const groundLine = PLAYER_CONFIG.groundY - PLAYER_CONFIG.height;
  player.jump();

  let minY = player.y;
  let elapsed = 0;

  while (!player.grounded && elapsed < 2) {
    player.update(DT);
    elapsed += DT;
    if (player.y < minY) {
      minY = player.y;
    }
  }

  return {
    jumpHeight: groundLine - minY,
    jumpDuration: elapsed,
    horizontalTravel: SPEED * elapsed,
  };
}

function simulateJumpAtObstacleX(obstacleX) {
  const collisionSystem = new CollisionSystem();
  const player = new Player();
  const obstacle = new Obstacle(ObstacleType.GROUND);
  obstacle.spawn(GAME_CONFIG.canvasWidth, SPEED);

  let jumped = false;
  let minVerticalMargin = Infinity;

  for (let t = 0; t < 8; t += DT) {
    if (!jumped && obstacle.x <= obstacleX) {
      player.jump();
      jumped = true;
    }

    const playerBounds = player.getBounds();
    const obstacleBounds = obstacle.getBounds();
    const xOverlap =
      playerBounds.x < obstacleBounds.x + obstacleBounds.width &&
      obstacleBounds.x < playerBounds.x + playerBounds.width;

    if (xOverlap) {
      const margin = obstacleBounds.y - (playerBounds.y + playerBounds.height);
      minVerticalMargin = Math.min(minVerticalMargin, margin);
    }

    if (collisionSystem.checkPlayerObstacle(player, obstacle)) {
      return {
        hit: true,
        minVerticalMargin,
        jumped,
      };
    }

    player.update(DT);
    obstacle.update(DT);

    if (obstacle.isOffScreen()) {
      return {
        hit: false,
        minVerticalMargin,
        jumped,
      };
    }
  }

  return {
    hit: false,
    minVerticalMargin,
    jumped,
  };
}

describe('Playability', () => {
  it('player apex clears ground obstacle top with safety margin', () => {
    const player = new Player();
    const obstacle = new Obstacle(ObstacleType.GROUND);
    const groundLine = PLAYER_CONFIG.groundY - PLAYER_CONFIG.height;

    player.jump();

    let minY = player.y;
    while (!player.grounded) {
      player.update(DT);
      if (player.y < minY) {
        minY = player.y;
      }
    }

    const jumpHeight = groundLine - minY;
    const clearanceAboveObstacle = jumpHeight - OBSTACLE_CONFIG.groundHeight;

    assert.ok(
      clearanceAboveObstacle >= 10,
      `Expected >=10px clearance above obstacle, got ${clearanceAboveObstacle.toFixed(1)}`
    );
  });

  it('typical jump timing clears a ground obstacle without collision', () => {
    const clearResults = [170, 180, 190].map((obstacleX) =>
      simulateJumpAtObstacleX(obstacleX)
    );

    for (const result of clearResults) {
      assert.equal(result.hit, false, 'expected obstacle clear at typical timing');
      assert.ok(result.jumped, 'expected jump to trigger before overlap');
      assert.ok(
        result.minVerticalMargin >= 0,
        `expected non-negative vertical margin, got ${result.minVerticalMargin}`
      );
    }
  });

  it('jump remains deterministic for repeated runs', () => {
    const first = measureJumpStats();
    const second = measureJumpStats();

    assert.equal(first.jumpHeight, second.jumpHeight);
    assert.equal(first.jumpDuration, second.jumpDuration);
    assert.equal(first.horizontalTravel, second.horizontalTravel);
  });

  it('measured jump stats match tuned V1 targets', () => {
    const stats = measureJumpStats();

    assert.ok(stats.jumpHeight >= 120 && stats.jumpHeight <= 140);
    assert.ok(stats.jumpDuration >= 0.62 && stats.jumpDuration <= 0.7);
    assert.ok(stats.horizontalTravel >= 120 && stats.horizontalTravel <= 145);
  });

  it('ground obstacle uses configured dimensions on ground line', () => {
    const obstacle = new Obstacle(ObstacleType.GROUND);

    assert.equal(obstacle.width, OBSTACLE_CONFIG.groundWidth);
    assert.equal(obstacle.height, OBSTACLE_CONFIG.groundHeight);
    assert.equal(obstacle.y, PLAYER_CONFIG.groundY - OBSTACLE_CONFIG.groundHeight);
  });

  it('collision still detects grounded overlap with obstacle', () => {
    const collisionSystem = new CollisionSystem();
    const player = new Player();
    const obstacle = new Obstacle(ObstacleType.GROUND);

    obstacle.spawn(player.x, 0);

    assert.equal(collisionSystem.checkPlayerObstacle(player, obstacle), true);
  });

  it('x-overlap window is shorter with tuned obstacle width', () => {
    const overlapDuration =
      (PLAYER_CONFIG.width + OBSTACLE_CONFIG.groundWidth) / SPEED;

    assert.ok(
      overlapDuration <= 0.32,
      `Expected <=0.32s overlap, got ${overlapDuration.toFixed(3)}s`
    );
  });
});
