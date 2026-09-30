/**
 * Semantic-event SFX — Audio V2 assets with procedural fallback (V1).
 *
 * Public API: unlock(), play(eventName), setMuted(bool), isMuted().
 */

import { AUDIO_CONFIG } from '../config/gameConfig.js';
import {
  AUDIO_ASSETS,
  lookupAsset,
  shouldThrottlePlay,
} from './audioAssetCatalog.js';
import { playProceduralTone } from './proceduralAudio.js';

const SILENCE_RAMP_MS = 15;

export class AudioSystem {
  /**
   * @param {object} [options]
   * @param {typeof fetch} [options.fetchFn]
   * @param {(ctx: AudioContext, buffer: ArrayBuffer) => Promise<AudioBuffer>} [options.decodeAudioDataFn]
   * @param {() => number} [options.nowFn]
   * @param {object} [options.assets]
   */
  constructor({
    fetchFn = typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null,
    decodeAudioDataFn = null,
    nowFn = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
    assets = AUDIO_ASSETS,
  } = {}) {
    this._fetchFn = fetchFn;
    this._decodeAudioDataFn =
      decodeAudioDataFn ??
      ((ctx, data) =>
        new Promise((resolve, reject) => {
          ctx.decodeAudioData(data, resolve, reject);
        }));
    this._nowFn = nowFn;
    this._assets = assets;

    this._ctx = null;
    this._muted = false;
    /** @type {Map<string, AudioBuffer>} */
    this._buffers = new Map();
    /** @type {Map<string, Promise<'loaded'|'failed'>>} */
    this._loadStates = new Map();
    /** @type {{ kind: 'osc'|'buffer', osc?: OscillatorNode, source?: AudioBufferSourceNode, gain: GainNode }[]} */
    this._activeNodes = [];
    this._lastPlayMs = {};
    this._variationState = {};
  }

  unlock() {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      if (!this._ctx) {
        this._ctx = new AudioContextClass();
      }

      if (this._ctx.state === 'suspended') {
        void this._ctx.resume();
      }

      this._preloadAssets();
    } catch {
      // Safe no-op in unsupported or DOM-less environments.
    }
  }

  setMuted(muted) {
    this._muted = Boolean(muted);
  }

  isMuted() {
    return this._muted;
  }

  _preloadAssets() {
    if (!this._fetchFn || !this._ctx) {
      return;
    }

    for (const eventName of Object.keys(this._assets.events)) {
      const event = this._assets.events[eventName];
      for (const variationId of event.variations) {
        const url = `${this._assets.basePath}/${eventName}/${variationId}${this._assets.extension}`;
        void this._loadBuffer(url);
      }
    }
  }

  async _loadBuffer(url) {
    if (this._loadStates.has(url)) {
      return this._loadStates.get(url);
    }

    const promise = (async () => {
      try {
        if (!this._fetchFn || !this._ctx) {
          return 'failed';
        }

        const response = await this._fetchFn(url);
        if (!response.ok) {
          return 'failed';
        }

        const data = await response.arrayBuffer();
        const buffer = await this._decodeAudioDataFn(this._ctx, data);
        this._buffers.set(url, buffer);
        return 'loaded';
      } catch {
        return 'failed';
      }
    })();

    this._loadStates.set(url, promise);
    return promise;
  }

  _stopAllActive() {
    const ctx = this._ctx;
    if (!ctx) {
      return;
    }

    const now = ctx.currentTime;
    const rampEnd = now + SILENCE_RAMP_MS / 1000;

    for (const entry of this._activeNodes) {
      try {
        entry.gain.gain.cancelScheduledValues(now);
        entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
        entry.gain.gain.linearRampToValueAtTime(0.0001, rampEnd);

        if (entry.kind === 'osc' && entry.osc) {
          entry.osc.stop(rampEnd + 0.02);
        } else if (entry.kind === 'buffer' && entry.source) {
          entry.source.stop(rampEnd + 0.02);
        }
      } catch {
        // Node may already be stopped.
      }
    }

    this._activeNodes = [];
  }

  _registerNode(entry) {
    this._activeNodes.push(entry);

    const cleanup = () => {
      this._activeNodes = this._activeNodes.filter((node) => node !== entry);
    };

    if (entry.kind === 'osc' && entry.osc) {
      entry.osc.onended = cleanup;
    } else if (entry.kind === 'buffer' && entry.source) {
      entry.source.onended = cleanup;
    }
  }

  _playBuffer(buffer, volume) {
    const ctx = this._ctx;
    if (!ctx || !buffer) {
      return false;
    }

    try {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.setValueAtTime(Math.max(volume, 0.0001), ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      this._registerNode({ kind: 'buffer', source, gain });
      return true;
    } catch {
      return false;
    }
  }

  async _ensureAssetBuffer(eventName) {
    const asset = lookupAsset(eventName, this._variationState, this._assets);
    if (!asset) {
      return null;
    }

    if (!this._buffers.has(asset.url)) {
      await this._loadBuffer(asset.url);
    }

    return this._buffers.get(asset.url) ?? null;
  }

  _playAssetBuffer(eventName, buffer) {
    if (!buffer) {
      return false;
    }

    const volume = AUDIO_CONFIG[eventName]?.volume ?? 1;
    return this._playBuffer(buffer, volume);
  }

  _playProcedural(eventName) {
    return playProceduralTone(this._ctx, eventName, {
      registerNode: (entry) => this._registerNode(entry),
      stopAllActive: () => this._stopAllActive(),
    });
  }

  play(eventName) {
    void this._playAsync(eventName);
  }

  async _playAsync(eventName) {
    if (this._muted || !this._ctx) {
      return;
    }

    if (!AUDIO_CONFIG[eventName] && !this._assets.events[eventName]) {
      return;
    }

    const nowMs = this._nowFn();
    if (shouldThrottlePlay(eventName, nowMs, this._lastPlayMs, this._assets)) {
      return;
    }

    if (eventName === 'hit') {
      this._stopAllActive();
    }

    this._lastPlayMs[eventName] = nowMs;

    const buffer = await this._ensureAssetBuffer(eventName);
    if (this._playAssetBuffer(eventName, buffer)) {
      return;
    }

    if (!this._muted) {
      this._playProcedural(eventName);
    }
  }

  /** @internal Test helper — inject a decoded buffer without fetch. */
  _setBufferForTest(url, buffer) {
    this._buffers.set(url, buffer);
    this._loadStates.set(url, Promise.resolve('loaded'));
  }
}
