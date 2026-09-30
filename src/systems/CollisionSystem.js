/**
 * Collision detection system.
 *
 * Responsibility: Detect collisions between game entities.
 * Public API: checkPlayerObstacle(), checkPlayerObstacles().
 * Dependencies: math.js (aabbOverlap).
 *
 * TODO: Near miss detection (nearMissV2 feature flag).
 * NOT IMPLEMENTED: Shield collision logic.
 */

import { aabbOverlap } from '../utils/math.js';

export class CollisionSystem {
  checkPlayerObstacle(player, obstacle) {
    if (!obstacle.active) return false;
    return aabbOverlap(player.getBounds(), obstacle.getBounds());
  }

  checkPlayerObstacles(player, obstacles) {
    for (const obstacle of obstacles) {
      if (this.checkPlayerObstacle(player, obstacle)) {
        return obstacle;
      }
    }
    return null;
  }
}
