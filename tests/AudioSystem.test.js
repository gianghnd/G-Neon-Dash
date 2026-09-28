import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUDIO_ASSETS,
  lookupAsset,
  pickVariation,
  resolveAssetUrl,
  shouldThrottlePlay,
  listExpectedAssetFiles,
} from '../src/audio/audioAssetCatalog.js';
import { AudioSystem } from '../src/audio/AudioSystem.js';

function createFakeAudioContext() {
  let oscCount = 0;
  let bufferCount = 0;

  const ctx = {
    currentTime: 0,
    destination: {},
    state: 'running',
    resume: async () => {},
    get oscCreated() {
      return oscCount;
    },
    get bufferSourcesCreated() {
      return bufferCount;
    },
    createOscillator() {
      oscCount += 1;
      return {
        type: 'sine',
        frequency: { setValueAtTime() {} },
        connect() {},
        start() {},
        stop() {},
        onended: null,
      };
    },
    createGain() {
      return {
        gain: {
          value: 1,
          setValueAtTime() {},
          exponentialRampToValueAtTime() {},
          cancelScheduledValues() {},
          linearRampToValueAtTime() {},
        },
        connect() {},
      };
    },
    createBufferSource() {
      bufferCount += 1;
      return {
        buffer: null,
        connect() {},
        start() {},
        stop() {},
        onended: null,
      };
    },
  };

  return ctx;
}

describe('Audio asset catalog', () => {
  it('resolves semantic event URLs without hard-coded gameplay paths', () => {
    assert.equal(resolveAssetUrl('jump', 'jump_a'), 'assets/audio/jump/jump_a.mp3');
    assert.equal(resolveAssetUrl('land', 'land_b'), 'assets/audio/land/land_b.mp3');
    assert.equal(resolveAssetUrl('unknown', 'x'), null);
  });

  it('lists 12 expected asset files across 10 semantic events', () => {
    const files = listExpectedAssetFiles();
    assert.equal(files.length, 12);
    assert.ok(files.includes('assets/audio/jump/jump_a.mp3'));
    assert.ok(files.includes('assets/audio/timed_gate/timed_gate.mp3'));
  });

  it('alternates jump and land variations', () => {
    const state = {};
    assert.equal(pickVariation('jump', ['jump_a', 'jump_b'], state, 'alternate'), 'jump_a');
    assert.equal(pickVariation('jump', ['jump_a', 'jump_b'], state, 'alternate'), 'jump_b');
    assert.equal(pickVariation('jump', ['jump_a', 'jump_b'], state, 'alternate'), 'jump_a');
  });

  it('lookupAsset returns URL for known semantic events', () => {
    const asset = lookupAsset('play', {});
    assert.equal(asset?.url, 'assets/audio/play/play.mp3');
  });
});

describe('AudioSystem', () => {
  it('unlock is safe without window or AudioContext', () => {
    const audio = new AudioSystem({ fetchFn: null });
    assert.doesNotThrow(() => audio.unlock());
    assert.equal(audio.isMuted(), false);
  });

  it('does not play when muted', () => {
    const ctx = createFakeAudioContext();
    const audio = new AudioSystem({ fetchFn: null, nowFn: () => 1000 });
    audio._ctx = ctx;
    audio.setMuted(true);
    audio.play('jump');
    assert.equal(ctx.oscCreated, 0);
    assert.equal(ctx.bufferSourcesCreated, 0);
  });

  it('falls back to procedural synthesis when asset buffer is missing', async () => {
    const ctx = createFakeAudioContext();
    const audio = new AudioSystem({ fetchFn: null, nowFn: () => 1000 });
    audio._ctx = ctx;
    await audio._playAsync('jump');
    assert.equal(ctx.oscCreated, 1);
    assert.equal(ctx.bufferSourcesCreated, 0);
  });

  it('plays decoded asset buffer when available', async () => {
    const ctx = createFakeAudioContext();
    const audio = new AudioSystem({ fetchFn: null, nowFn: () => 1000 });
    audio._ctx = ctx;
    audio._setBufferForTest('assets/audio/jump/jump_a.mp3', { duration: 0.2 });
    await audio._playAsync('jump');
    assert.equal(ctx.bufferSourcesCreated, 1);
    assert.equal(ctx.oscCreated, 0);
  });

  it('awaits in-flight asset load before first play', async () => {
    const ctx = createFakeAudioContext();
    let resolveLoad;
    const audio = new AudioSystem({
      fetchFn: () =>
        new Promise((resolve) => {
          resolveLoad = resolve;
        }),
      decodeAudioDataFn: async () => ({ duration: 0.1 }),
      nowFn: () => 1000,
    });
    audio._ctx = ctx;

    const playPromise = audio._playAsync('play');
    resolveLoad({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
    await playPromise;

    assert.equal(ctx.bufferSourcesCreated, 1);
    assert.equal(ctx.oscCreated, 0);
  });

  it('throttles rapid repeated semantic events', async () => {
    const ctx = createFakeAudioContext();
    let now = 1000;
    const audio = new AudioSystem({
      fetchFn: null,
      nowFn: () => now,
    });
    audio._ctx = ctx;

    await audio._playAsync('jump');
    assert.equal(ctx.oscCreated, 1);

    now += 10;
    await audio._playAsync('jump');
    assert.equal(ctx.oscCreated, 1);

    now += 100;
    await audio._playAsync('jump');
    assert.equal(ctx.oscCreated, 2);
  });

  it('shouldThrottlePlay respects per-event minIntervalMs', () => {
    const lastPlayMs = { jump: 1000 };
    assert.equal(shouldThrottlePlay('jump', 1050, lastPlayMs), true);
    assert.equal(shouldThrottlePlay('jump', 1100, lastPlayMs), false);
    assert.equal(shouldThrottlePlay('hit', 1001, lastPlayMs), false);
  });

  it('hit stops active sounds before playing', async () => {
    const ctx = createFakeAudioContext();
    const audio = new AudioSystem({ fetchFn: null, nowFn: () => 2000 });
    audio._ctx = ctx;

    await audio._playAsync('jump');
    assert.equal(audio._activeNodes.length, 1);

    await audio._playAsync('hit');
    assert.equal(ctx.oscCreated, 2);
  });

  it('preload marks missing assets as failed without throwing', async () => {
    const ctx = createFakeAudioContext();
    const audio = new AudioSystem({
      fetchFn: async () => ({ ok: false, status: 404 }),
      decodeAudioDataFn: async () => {
        throw new Error('should not decode');
      },
      nowFn: () => 0,
    });
    audio._ctx = ctx;

    const state = await audio._loadBuffer('assets/audio/jump/jump_a.mp3');
    assert.equal(state, 'failed');
    assert.equal(audio._buffers.has('assets/audio/jump/jump_a.mp3'), false);
  });
});
