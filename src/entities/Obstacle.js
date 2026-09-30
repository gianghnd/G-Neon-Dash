/**
 * Obstacle entity.
 *
 * Responsibility: Obstacle state, movement, rendering.
 * Public API: update(), reset(), render(), getBounds(), destroy(), applySkin().
 * Dependencies: OBSTACLE_CONFIG, HAZARD_SKIN_CONFIG, VISUAL_CONFIG.
 */

import {
  OBSTACLE_CONFIG,
  PLAYER_CONFIG,
  HAZARD_SKIN_CONFIG,
  VISUAL_CONFIG,
} from '../config/gameConfig.js';
import { getThemeTokens } from '../content/ThemeRenderer.js';
import { resolveHazardSkin } from '../content/hazardSkins.js';

export const ObstacleType = Object.freeze({
  GROUND: 'ground',
  FLOATING: 'floating',
});

export class Obstacle {
  constructor(type = ObstacleType.GROUND) {
    this.type = type;
    this.skin = HAZARD_SKIN_CONFIG.defaultGroundSkin;
    this.active = false;
    this.reset(type);
  }

  reset(type = ObstacleType.GROUND) {
    this.type = type;
    this.active = false;
    this.velocityX = 0;
    this.skin =
      type === ObstacleType.FLOATING
        ? HAZARD_SKIN_CONFIG.defaultFloatingSkin
        : HAZARD_SKIN_CONFIG.defaultGroundSkin;
    this._applyDimensionsForSkin(this.skin);
  }

  applySkin(skinId, speedAtSpawn) {
    this.skin = resolveHazardSkin(this.type, speedAtSpawn, skinId);
    this._applyDimensionsForSkin(this.skin);
  }

  applyRandomSkin(speedAtSpawn, randomFn = Math.random) {
    this.skin = resolveHazardSkin(this.type, speedAtSpawn, null, randomFn);
    this._applyDimensionsForSkin(this.skin);
  }

  _applyDimensionsForSkin(skinId) {
    const dims =
      HAZARD_SKIN_CONFIG.dimensions[skinId] ??
      HAZARD_SKIN_CONFIG.dimensions[HAZARD_SKIN_CONFIG.defaultGroundSkin];

    this.width = dims.width;
    this.height = dims.height;

    if (this.type === ObstacleType.GROUND) {
      this.y = PLAYER_CONFIG.groundY - this.height;
    } else {
      this.y =
        PLAYER_CONFIG.groundY -
        OBSTACLE_CONFIG.floatingYOffset -
        this.height;
    }
  }

  spawn(x, speed, { skin = null } = {}) {
    if (skin) {
      this.applySkin(skin, speed);
    }
    this.x = x;
    this.velocityX = -speed;
    this.active = true;
  }

  update(deltaTime) {
    if (!this.active) return;
    this.x += this.velocityX * deltaTime;
  }

  destroy() {
    this.active = false;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  getBounds() {
    if (this.skin === 'gate') {
      const beamHeight = HAZARD_SKIN_CONFIG.dimensions.gate.beamHeight;
      const beamY = this.y + (this.height - beamHeight) / 2;
      return { x: this.x, y: beamY, width: this.width, height: beamHeight };
    }
    if (this.skin === 'laser') {
      const beamY = this.y + (this.height - HAZARD_SKIN_CONFIG.dimensions.laser.height) / 2;
      return {
        x: this.x,
        y: beamY,
        width: this.width,
        height: HAZARD_SKIN_CONFIG.dimensions.laser.height,
      };
    }
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  render(ctx, themeId = 'neonCity') {
    if (!this.active) return;

    const tokens = getThemeTokens(themeId);
    const isGround = this.type === ObstacleType.GROUND;
    const fill = isGround ? tokens.hazardGroundFill : tokens.hazardFloatingFill;
    const edge = isGround ? tokens.hazardGroundEdge : tokens.hazardFloatingEdge;
    const { glow, sizes } = VISUAL_CONFIG;

    ctx.save();
    ctx.shadowColor = fill;
    ctx.shadowBlur = glow.obstacle;
    ctx.fillStyle = fill;

    switch (this.skin) {
      case 'spike':
        this._drawSpike(ctx, fill, 1);
        break;
      case 'doubleSpike':
        this._drawSpike(ctx, fill, 2);
        break;
      case 'wideBlock':
        ctx.fillRect(this.x, this.y, this.width, this.height);
        break;
      case 'orb':
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2,
          this.y + this.height / 2,
          this.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;
      case 'gate':
        this._drawGate(ctx, fill, edge);
        break;
      case 'laser':
        ctx.fillRect(this.x, this.y + (this.height - 6) / 2, this.width, 6);
        break;
      default:
        ctx.fillRect(this.x, this.y, this.width, this.height);
        break;
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle = edge;
    if (this.skin !== 'gate' && this.skin !== 'laser' && this.skin !== 'orb') {
      ctx.fillRect(this.x, this.y, this.width, sizes.obstacleTopEdgeHeight);
    }
    ctx.restore();
  }

  _drawSpike(ctx, fill, count) {
    const spikeW = this.width / (count * 1.6);
    for (let i = 0; i < count; i += 1) {
      const offsetX = this.x + i * (this.width / count);
      ctx.beginPath();
      ctx.moveTo(offsetX, this.y + this.height);
      ctx.lineTo(offsetX + spikeW / 2, this.y + this.height * 0.15);
      ctx.lineTo(offsetX + spikeW, this.y + this.height);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }
  }

  _drawGate(ctx, fill, edge) {
    const postW = 4;
    ctx.fillStyle = edge;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(this.x, this.y, postW, this.height);
    ctx.fillRect(this.x + this.width - postW, this.y, postW, this.height);
    ctx.globalAlpha = 1;
    const beamHeight = HAZARD_SKIN_CONFIG.dimensions.gate.beamHeight;
    const beamY = this.y + (this.height - beamHeight) / 2;
    ctx.fillStyle = fill;
    ctx.fillRect(this.x, beamY, this.width, beamHeight);
  }
}
