/**
 * Math utilities.
 *
 * Responsibility: Shared math helpers for game logic.
 * Dependencies: None.
 */

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Axis-aligned bounding box overlap check.
 * @returns {boolean} true if boxes overlap
 */
export function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
