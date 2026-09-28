import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { RetentionSystem } from '../src/systems/RetentionSystem.js';
import { RETENTION_CONFIG } from '../src/config/gameConfig.js';

function createMockLocalStorage(options = {}) {
  const {
    readThrows = false,
    writeThrows = false,
    probeWriteThrows = false,
  } = options;
  const data = new Map();

  return {
    data,
    getItem(key) {
      if (readThrows) {
        throw new Error('storage read failure');
      }
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      if (writeThrows || (probeWriteThrows && key === '__neondash_storage_probe__')) {
        throw new Error('storage write failure');
      }
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
  };
}

function installLocalStorage(mock) {
  globalThis.localStorage = mock;
}

function restoreLocalStorage(original) {
  if (original === undefined) {
    delete globalThis.localStorage;
  } else {
    globalThis.localStorage = original;
  }
}

describe('RetentionSystem', () => {
  let originalLocalStorage;

  beforeEach(() => {
    originalLocalStorage = globalThis.localStorage;
    installLocalStorage(createMockLocalStorage());
  });

  afterEach(() => {
    restoreLocalStorage(originalLocalStorage);
  });

  it('returns default state when no best is stored', () => {
    const retention = new RetentionSystem();

    assert.equal(retention.getLoadedBest(), 0);
    assert.equal(retention.hasPlayedEver(), false);
    assert.equal(retention.shouldShowTapHint(true), true);
    assert.equal(retention.canPersist(), true);
  });

  it('saves best score to localStorage', () => {
    const retention = new RetentionSystem();

    retention.persistBestIfNeeded(44);

    assert.equal(
      globalThis.localStorage.getItem(RETENTION_CONFIG.bestKey),
      '44'
    );
  });

  it('loads persisted best on a new instance', () => {
    globalThis.localStorage.setItem(RETENTION_CONFIG.bestKey, '44');

    const retention = new RetentionSystem();

    assert.equal(retention.getLoadedBest(), 44);
  });

  it('does not overwrite best when a lower score is not persisted', () => {
    globalThis.localStorage.setItem(RETENTION_CONFIG.bestKey, '44');

    const retention = new RetentionSystem();
    assert.equal(retention.getLoadedBest(), 44);

    // Game only calls persistBestIfNeeded on new best; omitting a lower score write.
    const reloaded = new RetentionSystem();
    assert.equal(reloaded.getLoadedBest(), 44);
    assert.equal(
      globalThis.localStorage.getItem(RETENTION_CONFIG.bestKey),
      '44'
    );
  });

  it('updates storage when a higher best is persisted', () => {
    globalThis.localStorage.setItem(RETENTION_CONFIG.bestKey, '44');

    const retention = new RetentionSystem();
    retention.persistBestIfNeeded(55);

    assert.equal(
      globalThis.localStorage.getItem(RETENTION_CONFIG.bestKey),
      '55'
    );
    assert.equal(new RetentionSystem().getLoadedBest(), 55);
  });

  it('tracks has_played lifecycle in memory and storage', () => {
    const retention = new RetentionSystem();

    assert.equal(retention.hasPlayedEver(), false);
    assert.equal(retention.shouldShowTapHint(true), true);

    retention.markFirstRunComplete();

    assert.equal(retention.hasPlayedEver(), true);
    assert.equal(retention.shouldShowTapHint(true), false);
    assert.equal(
      globalThis.localStorage.getItem(RETENTION_CONFIG.hasPlayedKey),
      'true'
    );

    const reloaded = new RetentionSystem();
    assert.equal(reloaded.hasPlayedEver(), true);
    assert.equal(reloaded.shouldShowTapHint(true), false);
  });

  it('handleDevReset clears stored best via resetBest query param', () => {
    globalThis.localStorage.setItem(RETENTION_CONFIG.bestKey, '44');
    globalThis.localStorage.setItem(RETENTION_CONFIG.hasPlayedKey, 'true');

    RetentionSystem.handleDevReset('?resetBest=1');

    assert.equal(globalThis.localStorage.getItem(RETENTION_CONFIG.bestKey), null);
    assert.equal(
      globalThis.localStorage.getItem(RETENTION_CONFIG.hasPlayedKey),
      'true'
    );
    assert.equal(new RetentionSystem().getLoadedBest(), 0);
  });

  it('treats malformed stored best values as zero', () => {
    const cases = ['abc', '-5', '', 'NaN'];

    for (const raw of cases) {
      installLocalStorage(createMockLocalStorage());
      globalThis.localStorage.setItem(RETENTION_CONFIG.bestKey, raw);

      const retention = new RetentionSystem();
      assert.equal(retention.getLoadedBest(), 0, `expected 0 for "${raw}"`);
    }
  });

  it('degrades safely when storage read fails', () => {
    installLocalStorage(createMockLocalStorage({ readThrows: true }));

    const retention = new RetentionSystem();

    assert.equal(retention.getLoadedBest(), 0);
    assert.equal(retention.hasPlayedEver(), false);
    assert.doesNotThrow(() => retention.shouldShowTapHint(true));
  });

  it('degrades safely when storage write fails', () => {
    installLocalStorage(createMockLocalStorage({ writeThrows: true }));

    const retention = new RetentionSystem();

    assert.doesNotThrow(() => retention.persistBestIfNeeded(44));
    assert.doesNotThrow(() => retention.markFirstRunComplete());

    assert.equal(retention.hasPlayedEver(), true);
    assert.equal(globalThis.localStorage.data?.size ?? 0, 0);
  });

  it('operates safely when storage is unavailable', () => {
    installLocalStorage(createMockLocalStorage({ probeWriteThrows: true }));

    const retention = new RetentionSystem();

    assert.equal(retention.canPersist(), false);
    assert.equal(retention.getLoadedBest(), 0);
    assert.equal(retention.hasPlayedEver(), false);

    assert.doesNotThrow(() => retention.persistBestIfNeeded(44));
    retention.markFirstRunComplete();
    assert.equal(retention.hasPlayedEver(), true);
    assert.equal(retention.shouldShowTapHint(true), false);
  });
});
