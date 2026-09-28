/**
 * Input manager.
 *
 * Responsibility: Abstract keyboard and pointer input.
 * Public API: isJumpPressed(), onJump(), bind(), unbind().
 * Dependencies: DOM (browser only for bind/unbind).
 *
 * Keyboard: Space
 * Pointer: click, tap
 */

const JUMP_KEY = ' ';

export class InputManager {
  constructor() {
    this._jumpPressed = false;
    this._jumpCallbacks = [];
    this._menuNavCallbacks = [];
    this._lastPointerEvent = null;
    this._bound = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
  }

  consumeLastPointerEvent() {
    const event = this._lastPointerEvent;
    this._lastPointerEvent = null;
    return event;
  }

  onMenuNav(callback) {
    this._menuNavCallbacks.push(callback);
    return () => {
      this._menuNavCallbacks = this._menuNavCallbacks.filter((cb) => cb !== callback);
    };
  }

  isJumpPressed() {
    const pressed = this._jumpPressed;
    this._jumpPressed = false;
    return pressed;
  }

  onJump(callback) {
    this._jumpCallbacks.push(callback);
    return () => {
      this._jumpCallbacks = this._jumpCallbacks.filter((cb) => cb !== callback);
    };
  }

  /** Trigger jump programmatically (for testing). */
  triggerJump() {
    this._jumpPressed = true;
    this._fireJumpCallbacks();
  }

  bind(target = document) {
    if (this._bound) return;
    this._target = target;
    target.addEventListener('keydown', this._onKeyDown);
    target.addEventListener('pointerdown', this._onPointerDown);
    this._bound = true;
  }

  unbind() {
    if (!this._bound || !this._target) return;
    this._target.removeEventListener('keydown', this._onKeyDown);
    this._target.removeEventListener('pointerdown', this._onPointerDown);
    this._bound = false;
  }

  _onKeyDown(event) {
    if (event.code === 'ArrowLeft') {
      event.preventDefault();
      this._fireMenuNavCallbacks(-1);
      return;
    }
    if (event.code === 'ArrowRight') {
      event.preventDefault();
      this._fireMenuNavCallbacks(1);
      return;
    }
    if (event.code === 'Space' || event.key === JUMP_KEY) {
      event.preventDefault();
      this._jumpPressed = true;
      this._fireJumpCallbacks(event);
    }
  }

  _onPointerDown(event) {
    this._lastPointerEvent = event;
    this._jumpPressed = true;
    this._fireJumpCallbacks(event);
  }

  _fireMenuNavCallbacks(direction) {
    for (const cb of this._menuNavCallbacks) {
      cb(direction);
    }
  }

  _fireJumpCallbacks(event = null) {
    for (const cb of this._jumpCallbacks) {
      cb(event);
    }
  }
}
