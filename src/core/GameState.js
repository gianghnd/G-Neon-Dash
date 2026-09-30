/**
 * Game state machine.
 *
 * Responsibility: Manage valid game state transitions.
 * Public API: GameState constants, GameStateMachine class.
 * Dependencies: None.
 *
 * TODO: Add state enter/exit hooks when gameplay systems need cleanup.
 */

export const GameState = Object.freeze({
  BOOT: 'BOOT',
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  DYING: 'DYING',
  GAME_OVER: 'GAME_OVER',
});

const VALID_TRANSITIONS = {
  [GameState.BOOT]: [GameState.MENU],
  [GameState.MENU]: [GameState.PLAYING],
  [GameState.PLAYING]: [GameState.PAUSED, GameState.DYING],
  [GameState.PAUSED]: [GameState.PLAYING, GameState.MENU],
  [GameState.DYING]: [GameState.GAME_OVER],
  [GameState.GAME_OVER]: [GameState.PLAYING, GameState.MENU],
};

export class GameStateMachine {
  constructor(initialState = GameState.BOOT) {
    this._state = initialState;
    this._listeners = [];
  }

  getState() {
    return this._state;
  }

  canTransition(to) {
    const allowed = VALID_TRANSITIONS[this._state];
    return allowed ? allowed.includes(to) : false;
  }

  transition(to) {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this._state} → ${to}`);
    }
    const from = this._state;
    this._state = to;
    for (const listener of this._listeners) {
      listener(to, from);
    }
    return to;
  }

  onStateChange(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== callback);
    };
  }

  reset() {
    this._state = GameState.BOOT;
  }
}
