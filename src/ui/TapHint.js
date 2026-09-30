/**
 * First-run DOM tap hint (outside canvas).
 *
 * Responsibility: Show/hide #tap-hint based on retention state.
 */

export class TapHint {
  constructor(element) {
    this._element = element;
  }

  update(visible) {
    if (!this._element) {
      return;
    }
    this._element.classList.toggle('hidden', !visible);
  }
}
