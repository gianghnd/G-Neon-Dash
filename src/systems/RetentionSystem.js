/**
 * Retention persistence — best score and first-run flag.
 *
 * Responsibility: localStorage read/write with silent degradation.
 * Dependencies: RETENTION_CONFIG.
 */

import { RETENTION_CONFIG } from '../config/gameConfig.js';

function safeStorage(read) {
  try {
    return read();
  } catch {
    return undefined;
  }
}

export class RetentionSystem {
  constructor() {
    this._canPersist = RetentionSystem._probeStorage();
    this._sessionHasCompletedRun = false;
    this._hasPlayedEver = this._loadHasPlayed();
    this._loadedBest = this._loadBest();
  }

  static handleDevReset(search = '') {
    if (new URLSearchParams(search).has(RETENTION_CONFIG.resetBestQueryParam)) {
      safeStorage(() => localStorage.removeItem(RETENTION_CONFIG.bestKey));
    }
  }

  static _probeStorage() {
    return (
      safeStorage(() => {
        const probe = '__neondash_storage_probe__';
        localStorage.setItem(probe, '1');
        localStorage.removeItem(probe);
        return true;
      }) === true
    );
  }

  _loadBest() {
    const raw = safeStorage(() => localStorage.getItem(RETENTION_CONFIG.bestKey));
    const parsed = parseInt(raw ?? '0', 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  }

  _loadHasPlayed() {
    return safeStorage(() => localStorage.getItem(RETENTION_CONFIG.hasPlayedKey)) === 'true';
  }

  getLoadedBest() {
    return this._loadedBest;
  }

  canPersist() {
    return this._canPersist;
  }

  hasPlayedEver() {
    return this._hasPlayedEver || this._sessionHasCompletedRun;
  }

  shouldShowTapHint(stateIsMenuOrPlaying) {
    return !this.hasPlayedEver() && stateIsMenuOrPlaying;
  }

  persistBestIfNeeded(bestScore) {
    if (!this._canPersist) {
      return;
    }
    safeStorage(() => localStorage.setItem(RETENTION_CONFIG.bestKey, String(bestScore)));
  }

  markFirstRunComplete() {
    if (this._hasPlayedEver || this._sessionHasCompletedRun) {
      return;
    }
    this._sessionHasCompletedRun = true;
    this._hasPlayedEver = true;
    if (this._canPersist) {
      safeStorage(() => localStorage.setItem(RETENTION_CONFIG.hasPlayedKey, 'true'));
    }
  }
}
