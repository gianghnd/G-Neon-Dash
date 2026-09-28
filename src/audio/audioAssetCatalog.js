/**
 * Semantic audio event → asset variation catalog (Audio V2).
 *
 * Gameplay code uses event IDs only; paths are resolved here.
 */

export const AUDIO_ASSETS = {
  basePath: 'assets/audio',
  extension: '.mp3',
  /** 'alternate' cycles variations; 'random' picks uniformly at random. */
  variationMode: 'alternate',
  events: {
    jump: {
      variations: ['jump_a', 'jump_b'],
      minIntervalMs: 80,
    },
    land: {
      variations: ['land_a', 'land_b'],
      minIntervalMs: 80,
    },
    hit: {
      variations: ['hit'],
      minIntervalMs: 0,
    },
    play: {
      variations: ['play'],
      minIntervalMs: 200,
    },
    ui_confirm: {
      variations: ['ui_confirm'],
      minIntervalMs: 120,
    },
    new_best: {
      variations: ['new_best'],
      minIntervalMs: 0,
    },
    near_miss: {
      variations: ['near_miss'],
      minIntervalMs: 500,
    },
    coin: {
      variations: ['coin'],
      minIntervalMs: 100,
    },
    shield: {
      variations: ['shield'],
      minIntervalMs: 200,
    },
    timed_gate: {
      variations: ['timed_gate'],
      minIntervalMs: 300,
    },
  },
};

/**
 * @returns {string|null} Relative URL from site root, or null if unknown event.
 */
export function resolveAssetUrl(eventName, variationId, assets = AUDIO_ASSETS) {
  const event = assets.events[eventName];
  if (!event?.variations?.includes(variationId)) {
    return null;
  }

  return `${assets.basePath}/${eventName}/${variationId}${assets.extension}`;
}

/**
 * @returns {{ eventName: string, variationId: string, url: string }|null}
 */
export function lookupAsset(eventName, variationState, assets = AUDIO_ASSETS) {
  const event = assets.events[eventName];
  if (!event?.variations?.length) {
    return null;
  }

  const variationId = pickVariation(eventName, event.variations, variationState, assets.variationMode);
  const url = resolveAssetUrl(eventName, variationId, assets);
  if (!url) {
    return null;
  }

  return { eventName, variationId, url };
}

/**
 * @param {Record<string, number>} variationState mutable map eventName → last index used
 */
export function pickVariation(eventName, variations, variationState, mode = 'alternate') {
  if (variations.length === 1) {
    return variations[0];
  }

  if (mode === 'random') {
    return variations[Math.floor(Math.random() * variations.length)];
  }

  const prevIndex = variationState[eventName] ?? -1;
  const nextIndex = (prevIndex + 1) % variations.length;
  variationState[eventName] = nextIndex;
  return variations[nextIndex];
}

/**
 * @param {Record<string, number>} lastPlayMs mutable map eventName → timestamp (ms)
 * @returns {boolean} true if play should be suppressed as spam
 */
export function shouldThrottlePlay(eventName, nowMs, lastPlayMs, assets = AUDIO_ASSETS) {
  const minIntervalMs = assets.events[eventName]?.minIntervalMs ?? 0;
  if (minIntervalMs <= 0) {
    return false;
  }

  const last = lastPlayMs[eventName];
  if (last === undefined) {
    return false;
  }

  return nowMs - last < minIntervalMs;
}

export function listExpectedAssetFiles(assets = AUDIO_ASSETS) {
  const files = [];
  for (const [eventName, event] of Object.entries(assets.events)) {
    for (const variationId of event.variations) {
      files.push(resolveAssetUrl(eventName, variationId, assets));
    }
  }
  return files;
}
