import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameState, GameStateMachine } from '../src/core/GameState.js';

describe('GameStateMachine', () => {
  it('starts in BOOT state by default', () => {
    const sm = new GameStateMachine();
    assert.equal(sm.getState(), GameState.BOOT);
  });

  it('allows valid transition BOOT → MENU', () => {
    const sm = new GameStateMachine();
    assert.ok(sm.canTransition(GameState.MENU));
    sm.transition(GameState.MENU);
    assert.equal(sm.getState(), GameState.MENU);
  });

  it('allows full play cycle transitions', () => {
    const sm = new GameStateMachine();
    sm.transition(GameState.MENU);
    sm.transition(GameState.PLAYING);
    sm.transition(GameState.DYING);
    sm.transition(GameState.GAME_OVER);
    sm.transition(GameState.PLAYING);
    assert.equal(sm.getState(), GameState.PLAYING);
  });

  it('rejects invalid transition BOOT → PLAYING', () => {
    const sm = new GameStateMachine();
    assert.ok(!sm.canTransition(GameState.PLAYING));
    assert.throws(() => sm.transition(GameState.PLAYING));
  });

  it('rejects invalid transition MENU → GAME_OVER', () => {
    const sm = new GameStateMachine();
    sm.transition(GameState.MENU);
    assert.throws(() => sm.transition(GameState.GAME_OVER));
  });

  it('notifies listeners on transition', () => {
    const sm = new GameStateMachine();
    const events = [];
    sm.onStateChange((to, from) => events.push({ to, from }));
    sm.transition(GameState.MENU);
    assert.deepEqual(events, [{ to: GameState.MENU, from: GameState.BOOT }]);
  });

  it('supports PAUSED transitions', () => {
    const sm = new GameStateMachine();
    sm.transition(GameState.MENU);
    sm.transition(GameState.PLAYING);
    sm.transition(GameState.PAUSED);
    assert.equal(sm.getState(), GameState.PAUSED);
    sm.transition(GameState.PLAYING);
    assert.equal(sm.getState(), GameState.PLAYING);
  });
});
