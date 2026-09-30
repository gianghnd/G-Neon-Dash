/**
 * Runner skin persistence (localStorage, silent degradation).
 */

import { RETENTION_CONFIG, RUNNER_SKIN_CONFIG } from '../config/gameConfig.js';

function safeStorage(read) {
  try {
    return read();
  } catch {
    return undefined;
  }
}

export class RunnerSkinStore {
  constructor() {
    this._skin = this._load();
  }

  _load() {
    const raw = safeStorage(() => localStorage.getItem(RETENTION_CONFIG.runnerSkinKey));
    if (raw && RUNNER_SKIN_CONFIG.skins.includes(raw)) {
      return raw;
    }
    return RUNNER_SKIN_CONFIG.defaultSkin;
  }

  getSkin() {
    return this._skin;
  }

  getLabel() {
    return RUNNER_SKIN_CONFIG.labels[this._skin] ?? this._skin;
  }

  cycle(delta) {
    const list = RUNNER_SKIN_CONFIG.skins;
    const index = list.indexOf(this._skin);
    const next = list[(index + delta + list.length) % list.length];
    this._skin = next;
    safeStorage(() => localStorage.setItem(RETENTION_CONFIG.runnerSkinKey, next));
    return this._skin;
  }
}
