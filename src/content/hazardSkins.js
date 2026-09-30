/**
 * Hazard skin selection and start-speed reach gating.
 *
 * Responsibility: Draw-only skin pick; wide skins gated by jump reach at live speed.
 */

import { HAZARD_SKIN_CONFIG } from '../config/gameConfig.js';
import { ObstacleType } from '../entities/Obstacle.js';
import {
  computeJumpAirtimeFrames,
  spacingPxFromFrames,
} from '../utils/fairness.js';

export function computeJumpReachPx(speedAtSpawn) {
  return spacingPxFromFrames(computeJumpAirtimeFrames(), speedAtSpawn);
}

export function isSkinAllowedAtSpeed(skinId, speedAtSpawn) {
  const dims = HAZARD_SKIN_CONFIG.dimensions[skinId];
  if (!dims?.minReachPx) {
    return true;
  }
  return computeJumpReachPx(speedAtSpawn) >= dims.minReachPx;
}

export function getSkinsForType(type) {
  return type === ObstacleType.FLOATING
    ? HAZARD_SKIN_CONFIG.floatingSkins
    : HAZARD_SKIN_CONFIG.groundSkins;
}

export function pickRandomHazardSkin(type, speedAtSpawn, randomFn = Math.random) {
  const pool = getSkinsForType(type).filter((skinId) =>
    isSkinAllowedAtSpeed(skinId, speedAtSpawn)
  );
  const fallback =
    type === ObstacleType.FLOATING
      ? HAZARD_SKIN_CONFIG.defaultFloatingSkin
      : HAZARD_SKIN_CONFIG.defaultGroundSkin;
  const candidates = pool.length > 0 ? pool : [fallback];
  const index = Math.min(
    candidates.length - 1,
    Math.floor(randomFn() * candidates.length)
  );
  return candidates[index];
}

export function resolveHazardSkin(type, speedAtSpawn, requestedSkin, randomFn = Math.random) {
  if (requestedSkin && isSkinAllowedAtSpeed(requestedSkin, speedAtSpawn)) {
    const family = getSkinsForType(type);
    if (family.includes(requestedSkin)) {
      return requestedSkin;
    }
  }
  return pickRandomHazardSkin(type, speedAtSpawn, randomFn);
}
