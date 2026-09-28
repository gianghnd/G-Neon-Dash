/**
 * Pattern fairness math — pure functions, no DOM.
 */

import { DIFFICULTY_CONFIG, PLAYER_CONFIG } from '../config/gameConfig.js';

export function computeJumpAirtimeFrames(
  jumpForce = PLAYER_CONFIG.jumpForce,
  gravity = PLAYER_CONFIG.gravity,
  physicsFps = DIFFICULTY_CONFIG.physicsFps
) {
  const airtimeSec = (-2 * jumpForce) / gravity;
  return airtimeSec * physicsFps;
}

export function computeJumpPeakHeightPx(
  jumpForce = PLAYER_CONFIG.jumpForce,
  gravity = PLAYER_CONFIG.gravity
) {
  const initialSpeed = Math.abs(jumpForce);
  return (initialSpeed * initialSpeed) / (2 * gravity);
}

export function computeSafeGapFrames(
  config = DIFFICULTY_CONFIG,
  jumpForce = PLAYER_CONFIG.jumpForce,
  gravity = PLAYER_CONFIG.gravity
) {
  const airtime = computeJumpAirtimeFrames(jumpForce, gravity, config.physicsFps);
  return airtime + config.landingStabilizeFrames + config.reactionFloorFrames;
}

export function spacingPxFromFrames(
  frames,
  speedAtSpawn,
  physicsFps = DIFFICULTY_CONFIG.physicsFps
) {
  return (frames / physicsFps) * speedAtSpawn;
}

export function computeGroundFloatingMinFrames(config = DIFFICULTY_CONFIG) {
  const airtime = computeJumpAirtimeFrames(
    PLAYER_CONFIG.jumpForce,
    PLAYER_CONFIG.gravity,
    config.physicsFps
  );
  return (
    computeSafeGapFrames(config) +
    airtime +
    config.landingStabilizeFrames
  );
}

function requiresJump(element) {
  return element?.type === 'ground';
}

function isGroundToFloating(prev, curr) {
  return prev?.type === 'ground' && curr?.type === 'floating';
}

export function validatePatternAtSpeed(pattern, speedAtSpawn) {
  if (!pattern?.elements?.length) {
    return false;
  }

  const safeGap = computeSafeGapFrames();
  const groundFloatingMin = computeGroundFloatingMinFrames();

  for (let i = 1; i < pattern.elements.length; i += 1) {
    const prev = pattern.elements[i - 1];
    const curr = pattern.elements[i];
    const tMin = curr.tMinFrames;

    if (tMin < safeGap) {
      return false;
    }

    const spacingPx = spacingPxFromFrames(tMin, speedAtSpawn);
    if (spacingPx <= 0) {
      return false;
    }

    if (requiresJump(prev) && requiresJump(curr) && tMin < safeGap) {
      return false;
    }

    if (isGroundToFloating(prev, curr) && tMin < groundFloatingMin) {
      return false;
    }
  }

  return true;
}
