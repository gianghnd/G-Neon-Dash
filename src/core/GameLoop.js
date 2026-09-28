/**
 * Game loop abstraction.
 *
 * Responsibility: Manage requestAnimationFrame cycle with update/render.
 * Public API: start(), stop(), pause(), resume(), isRunning(), isPaused().
 * Dependencies: None (accepts update/render callbacks).
 *
 * Design: Gameplay logic lives in callbacks, not in the loop itself.
 */

export class GameLoop {
  constructor({ update, render }) {
    this._update = update;
    this._render = render;
    this._running = false;
    this._paused = false;
    this._lastTime = 0;
    this._rafId = null;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._paused = false;
    this._lastTime = 0;
    this._rafId = requestAnimationFrame((t) => this._tick(t));
  }

  stop() {
    this._running = false;
    this._paused = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  pause() {
    this._paused = true;
  }

  resume() {
    if (!this._running) return;
    this._paused = false;
    this._lastTime = 0;
  }

  isRunning() {
    return this._running;
  }

  isPaused() {
    return this._paused;
  }

  /**
   * Manual tick for testing without RAF.
   * @param {number} timestamp - milliseconds
   */
  tick(timestamp) {
    this._tick(timestamp);
  }

  _tick(timestamp) {
    if (!this._running) return;

    if (this._lastTime === 0) {
      this._lastTime = timestamp;
    }

    const deltaTime = (timestamp - this._lastTime) / 1000;
    this._lastTime = timestamp;

    if (!this._paused && this._update) {
      this._update(deltaTime);
    }

    if (this._render) {
      this._render();
    }

    if (this._running) {
      this._rafId = requestAnimationFrame((t) => this._tick(t));
    }
  }
}
