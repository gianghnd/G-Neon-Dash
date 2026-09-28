/**
 * Procedural oscillator fallback (Audio V1 synthesis).
 */

import { AUDIO_CONFIG } from '../config/gameConfig.js';

export function playProceduralTone(ctx, eventName, { registerNode, stopAllActive } = {}) {
  const config = AUDIO_CONFIG[eventName];
  if (!config || !ctx) {
    return false;
  }

  if (eventName === 'hit' && typeof stopAllActive === 'function') {
    stopAllActive();
  }

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const { frequency, duration, type, volume } = config;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);

    if (typeof registerNode === 'function') {
      registerNode({ kind: 'osc', osc, gain });
    }

    return true;
  } catch {
    return false;
  }
}
