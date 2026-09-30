/**
 * Obstacle spawn system.
 *
 * Responsibility: Manage obstacle creation and lifecycle.
 * Public API: update(), reset(), getActiveObstacles(), spawnObstacle(), pickSpawnInterval().
 * Dependencies: Obstacle, OBSTACLE_CONFIG, GAME_CONFIG, PatternSystem (when enabled).
 *
 * V1: GROUND obstacles only, randomized spawn interval from config.
 * Expansion V1: Pattern-driven spawn when patternSystemV2 is enabled.
 */

import { Obstacle, ObstacleType } from '../entities/Obstacle.js';
import { OBSTACLE_CONFIG, GAME_CONFIG, FEATURE_FLAGS } from '../config/gameConfig.js';
import { PatternSystem } from '../patterns/PatternSystem.js';
import { spacingPxFromFrames } from '../utils/fairness.js';

export class SpawnSystem {
  constructor() {
    this._obstacles = [];
    this._spawnTimer = 0;
    this._speed = GAME_CONFIG.initialSpeed;
    this._nextSpawnIntervalMs = this.pickSpawnInterval();
    this._patternSystem = new PatternSystem();
    this._activePattern = null;
    this._patternElementIndex = 0;
    this._distanceUntilNextElement = 0;
    this._patternComplexityCap = 1;
    this._currentPatternId = null;
    this._lastObstacleSpacingPx = null;
  }

  reset() {
    this._obstacles = [];
    this._spawnTimer = 0;
    this._speed = GAME_CONFIG.initialSpeed;
    this._nextSpawnIntervalMs = this.pickSpawnInterval();
    this._patternSystem.reset();
    this._activePattern = null;
    this._patternElementIndex = 0;
    this._distanceUntilNextElement = 0;
    this._currentPatternId = null;
    this._lastObstacleSpacingPx = null;
  }

  setSpeed(speed) {
    this._speed = speed;
  }

  setPatternComplexityCap(cap) {
    this._patternComplexityCap = cap;
  }

  getActiveObstacles() {
    return this._obstacles.filter((o) => o.active);
  }

  getPatternIdAtDeath() {
    return this._currentPatternId;
  }

  getObstacleSpacingAtDeath() {
    return this._lastObstacleSpacingPx;
  }

  pickSpawnInterval() {
    const { spawnIntervalMinMs, spawnIntervalMaxMs } = OBSTACLE_CONFIG;
    const range = spawnIntervalMaxMs - spawnIntervalMinMs;
    return spawnIntervalMinMs + Math.random() * range;
  }

  update(deltaTime, canvasWidth) {
    if (FEATURE_FLAGS.patternSystemV2) {
      this._updatePatternSpawn(deltaTime, canvasWidth);
    } else {
      this._updateLegacySpawn(deltaTime, canvasWidth);
    }

    for (const obstacle of this._obstacles) {
      obstacle.velocityX = -this._speed;
      obstacle.update(deltaTime);
      if (obstacle.active && obstacle.isOffScreen()) {
        obstacle.destroy();
      }
    }
  }

  _updateLegacySpawn(deltaTime, canvasWidth) {
    this._spawnTimer += deltaTime * 1000;

    if (this._spawnTimer >= this._nextSpawnIntervalMs) {
      this._spawnTimer = 0;
      this._spawnLegacyObstacle(canvasWidth);
      this._nextSpawnIntervalMs = this.pickSpawnInterval();
    }
  }

  _updatePatternSpawn(deltaTime, canvasWidth) {
    if (this._activePattern) {
      this._distanceUntilNextElement -= this._speed * deltaTime;
      if (this._distanceUntilNextElement <= 0) {
        this._spawnNextPatternElement(canvasWidth);
      }
      return;
    }

    this._spawnTimer += deltaTime * 1000;
    if (this._spawnTimer >= this._nextSpawnIntervalMs) {
      this._spawnTimer = 0;
      this._beginPattern(canvasWidth);
      this._nextSpawnIntervalMs = this.pickSpawnInterval();
    }
  }

  _beginPattern(canvasWidth) {
    const pattern = this._patternSystem.selectPattern({
      patternComplexityCap: this._patternComplexityCap,
      speedAtSpawn: this._speed,
    });
    this._activePattern = pattern;
    this._patternElementIndex = 0;
    this._currentPatternId = pattern.id;
    this._spawnNextPatternElement(canvasWidth);
  }

  _spawnNextPatternElement(canvasWidth) {
    if (!this._activePattern) {
      return;
    }

    const element = this._activePattern.elements[this._patternElementIndex];
    if (!element) {
      this._activePattern = null;
      return;
    }

    const type =
      element.type === 'floating' ? ObstacleType.FLOATING : ObstacleType.GROUND;
    this._spawnObstacleAt(type, canvasWidth, element.skin ?? null);

    if (this._patternElementIndex > 0) {
      this._lastObstacleSpacingPx = spacingPxFromFrames(
        element.tMinFrames,
        this._speed
      );
    }

    this._patternElementIndex += 1;

    if (this._patternElementIndex >= this._activePattern.elements.length) {
      this._activePattern = null;
      this._distanceUntilNextElement = 0;
      return;
    }

    const nextElement = this._activePattern.elements[this._patternElementIndex];
    this._distanceUntilNextElement = spacingPxFromFrames(
      nextElement.tMinFrames,
      this._speed
    );
  }

  _spawnLegacyObstacle(canvasWidth) {
    this._spawnObstacleAt(ObstacleType.GROUND, canvasWidth, null);
  }

  _spawnObstacleAt(type, x, skin = null) {
    const obstacle = new Obstacle(type);
    if (skin) {
      obstacle.applySkin(skin, this._speed);
    } else {
      obstacle.applyRandomSkin(this._speed);
    }
    obstacle.spawn(x, this._speed);
    this._obstacles.push(obstacle);
    return obstacle;
  }

  spawnObstacle(type, x) {
    return this._spawnObstacleAt(type, x);
  }
}
