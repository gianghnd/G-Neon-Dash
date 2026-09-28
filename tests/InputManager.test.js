import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { InputManager } from '../src/input/InputManager.js';

describe('InputManager', () => {
  it('isJumpPressed returns false initially', () => {
    const input = new InputManager();
    assert.ok(!input.isJumpPressed());
  });

  it('triggerJump sets jump pressed and fires callbacks', () => {
    const input = new InputManager();
    let called = false;
    input.onJump(() => {
      called = true;
    });
    input.triggerJump();
    assert.ok(called);
    assert.ok(input.isJumpPressed());
  });

  it('isJumpPressed clears after read', () => {
    const input = new InputManager();
    input.triggerJump();
    assert.ok(input.isJumpPressed());
    assert.ok(!input.isJumpPressed());
  });

  it('onJump unsubscribe works', () => {
    const input = new InputManager();
    let count = 0;
    const unsub = input.onJump(() => count++);
    unsub();
    input.triggerJump();
    assert.equal(count, 0);
  });

  it('supports multiple jump callbacks', () => {
    const input = new InputManager();
    let a = false;
    let b = false;
    input.onJump(() => {
      a = true;
    });
    input.onJump(() => {
      b = true;
    });
    input.triggerJump();
    assert.ok(a && b);
  });
});
