import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../src/entities/Player.js';
import { PLAYER_CONFIG } from '../src/config/gameConfig.js';

describe('Player', () => {
  it('reset restores initial position, velocity, and grounded state', () => {
    const player = new Player();
    player.x = 999;
    player.y = 999;
    player.velocityY = -100;
    player.grounded = false;
    player.reset();

    assert.equal(player.x, 100);
    assert.equal(player.y, PLAYER_CONFIG.groundY - PLAYER_CONFIG.height);
    assert.equal(player.velocityX, 0);
    assert.equal(player.velocityY, 0);
    assert.equal(player.grounded, true);
  });

  it('jump works when grounded', () => {
    const player = new Player();
    assert.ok(player.jump());
    assert.equal(player.velocityY, PLAYER_CONFIG.jumpForce);
    assert.equal(player.grounded, false);
  });

  it('jump does not trigger while airborne when jumpOnlyWhenGrounded is true', () => {
    const player = new Player();
    player.jump();
    const velocityAfterFirstJump = player.velocityY;
    assert.ok(!player.jump());
    assert.equal(player.velocityY, velocityAfterFirstJump);
  });

  it('gravity moves player upward then downward', () => {
    const player = new Player();
    const groundY = player.y;
    player.jump();
    player.update(0.05);
    assert.ok(player.y < groundY, 'player should rise after jump');
    while (!player.grounded) {
      player.update(1 / 120);
    }
    assert.equal(player.y, groundY, 'player should land back on ground');
  });

  it('player lands correctly on ground', () => {
    const player = new Player();
    player.jump();
    for (let i = 0; i < 200; i++) {
      player.update(1 / 60);
      if (player.grounded) break;
    }
    assert.equal(player.grounded, true);
    assert.equal(player.y, PLAYER_CONFIG.groundY - PLAYER_CONFIG.height);
    assert.equal(player.velocityY, 0);
  });

  it('measures jump apex height from ground line', () => {
    const player = new Player();
    const groundLine = PLAYER_CONFIG.groundY - PLAYER_CONFIG.height;
    player.jump();
    let minY = player.y;
    for (let i = 0; i < 200; i++) {
      player.update(1 / 120);
      if (player.y < minY) minY = player.y;
      if (player.grounded) break;
    }
    const jumpHeight = groundLine - minY;
    const expectedHeight =
      (PLAYER_CONFIG.jumpForce ** 2) / (2 * PLAYER_CONFIG.gravity);
    // Discrete Euler integration undershoots continuous apex at dt=1/120.
    assert.ok(
      Math.abs(jumpHeight - expectedHeight) < 4,
      `jumpHeight=${jumpHeight}, expected≈${expectedHeight}`
    );
  });

  it('measures full jump duration until landing', () => {
    const player = new Player();
    player.jump();
    let elapsed = 0;
    const dt = 1 / 1000;
    while (!player.grounded && elapsed < 2) {
      player.update(dt);
      elapsed += dt;
    }
    const expectedDuration = (2 * Math.abs(PLAYER_CONFIG.jumpForce)) / PLAYER_CONFIG.gravity;
    assert.ok(Math.abs(elapsed - expectedDuration) < 0.05);
  });
});
