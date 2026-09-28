import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CollisionSystem } from '../src/systems/CollisionSystem.js';

function mockEntity(x, y, width, height, active = true) {
  return {
    active,
    getBounds: () => ({ x, y, width, height }),
  };
}

describe('CollisionSystem', () => {
  const collision = new CollisionSystem();

  it('detects overlapping boxes', () => {
    const player = mockEntity(10, 10, 20, 20);
    const obstacle = mockEntity(15, 15, 20, 20);
    assert.ok(collision.checkPlayerObstacle(player, obstacle));
  });

  it('returns false for non-overlapping boxes', () => {
    const player = mockEntity(0, 0, 20, 20);
    const obstacle = mockEntity(100, 100, 20, 20);
    assert.ok(!collision.checkPlayerObstacle(player, obstacle));
  });

  it('returns false for inactive obstacle', () => {
    const player = mockEntity(10, 10, 20, 20);
    const obstacle = mockEntity(10, 10, 20, 20, false);
    assert.ok(!collision.checkPlayerObstacle(player, obstacle));
  });

  it('checkPlayerObstacles returns first hit', () => {
    const player = mockEntity(10, 10, 20, 20);
    const obs1 = mockEntity(100, 100, 20, 20);
    const obs2 = mockEntity(15, 15, 20, 20);
    const hit = collision.checkPlayerObstacles(player, [obs1, obs2]);
    assert.equal(hit, obs2);
  });

  it('checkPlayerObstacles returns null when no hit', () => {
    const player = mockEntity(0, 0, 20, 20);
    const obs1 = mockEntity(100, 100, 20, 20);
    const hit = collision.checkPlayerObstacles(player, [obs1]);
    assert.equal(hit, null);
  });
});
