/**
 * Player entity.
 *
 * Responsibility: Player state, jump physics, rendering.
 * Public API: jump(), update(), reset(), render(), getBounds(), setRunnerSkin().
 */

import { PLAYER_CONFIG, RUNNER_SKIN_CONFIG, VISUAL_CONFIG } from '../config/gameConfig.js';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawRoundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

export class Player {
  constructor() {
    this.runnerSkin = RUNNER_SKIN_CONFIG.defaultSkin;
    this.reset();
  }

  setRunnerSkin(skinId) {
    if (RUNNER_SKIN_CONFIG.skins.includes(skinId)) {
      this.runnerSkin = skinId;
    }
  }

  reset() {
    this.x = 100;
    this.y = PLAYER_CONFIG.groundY - PLAYER_CONFIG.height;
    this.velocityX = 0;
    this.velocityY = 0;
    this.width = PLAYER_CONFIG.width;
    this.height = PLAYER_CONFIG.height;
    this.grounded = true;
    this._resetVisuals();
  }

  _resetVisuals() {
    this._prevGrounded = true;
    this._squashMs = 0;
    this._stretchMs = 0;
    this._ringMs = 0;
    this._glitchMs = 0;
  }

  jump() {
    if (PLAYER_CONFIG.jumpOnlyWhenGrounded && !this.grounded) {
      return false;
    }
    this.velocityY = PLAYER_CONFIG.jumpForce;
    this.grounded = false;
    return true;
  }

  update(deltaTime) {
    this.velocityY += PLAYER_CONFIG.gravity * deltaTime;

    if (typeof PLAYER_CONFIG.maxFallSpeed === 'number') {
      const maxFall = PLAYER_CONFIG.maxFallSpeed;
      if (this.velocityY > maxFall) {
        this.velocityY = maxFall;
      }
    }

    this.y += this.velocityY * deltaTime;

    const groundLine = PLAYER_CONFIG.groundY - this.height;
    if (this.y >= groundLine) {
      this.y = groundLine;
      this.velocityY = 0;
      this.grounded = true;
    }
  }

  tickVisuals(deltaTime) {
    const dtMs = deltaTime * 1000;
    const { squash, stretch, jumpLandingRing } = VISUAL_CONFIG;

    if (!this.grounded && this._prevGrounded) {
      this._stretchMs = stretch.durationMs;
      this._ringMs = jumpLandingRing.durationMs;
    } else if (this.grounded && !this._prevGrounded) {
      this._squashMs = squash.durationMs;
      this._ringMs = jumpLandingRing.durationMs;
    }

    this._prevGrounded = this.grounded;

    if (this._squashMs > 0) {
      this._squashMs = Math.max(0, this._squashMs - dtMs);
    }
    if (this._stretchMs > 0) {
      this._stretchMs = Math.max(0, this._stretchMs - dtMs);
    }
    if (this._ringMs > 0) {
      this._ringMs = Math.max(0, this._ringMs - dtMs);
    }

    if (this.runnerSkin === 'dataShard') {
      this._glitchMs += dtMs;
    }
  }

  _getSquashStretchScale() {
    const { squash, stretch } = VISUAL_CONFIG;
    let scaleX = 1;
    let scaleY = 1;

    if (this._squashMs > 0) {
      const t = 1 - this._squashMs / squash.durationMs;
      scaleY = lerp(squash.scaleY, 1, t);
    } else if (this._stretchMs > 0) {
      const t = 1 - this._stretchMs / stretch.durationMs;
      scaleY = lerp(stretch.scaleY, 1, t);
      scaleX = lerp(stretch.scaleX, 1, t);
    }

    return { scaleX, scaleY };
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  render(ctx, { dying = false } = {}) {
    const { colors, glow, sizes } = VISUAL_CONFIG;
    const { scaleX, scaleY } = this._getSquashStretchScale();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const fill = dying ? colors.playerDeath : colors.player;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scaleX, scaleY);

    if (this.runnerSkin === 'neonPod') {
      const { maxTiltRad, tiltPerVelocity } = RUNNER_SKIN_CONFIG.neonPod;
      const tilt = Math.max(
        -maxTiltRad,
        Math.min(maxTiltRad, this.velocityY * tiltPerVelocity)
      );
      ctx.rotate(tilt);
    }

    ctx.translate(-cx, -cy);
    ctx.shadowColor = fill;
    ctx.shadowBlur = glow.player;
    ctx.fillStyle = fill;

    switch (this.runnerSkin) {
      case 'neonOrb':
        this._renderNeonOrb(ctx, fill);
        break;
      case 'dataShard':
        this._renderDataShard(ctx, fill, sizes.playerCornerRadius);
        break;
      case 'alienBlob':
        this._renderAlienBlob(ctx, fill);
        break;
      case 'neonPod':
        this._renderNeonPod(ctx, fill);
        break;
      default:
        drawRoundRectPath(
          ctx,
          this.x,
          this.y,
          this.width,
          this.height,
          sizes.playerCornerRadius
        );
        ctx.fill();
        break;
    }
    ctx.restore();
  }

  _renderNeonOrb(ctx, fill) {
    const { pulseSpeed, pulseAmount } = RUNNER_SKIN_CONFIG.neonOrb;
    const pulse = 1 + Math.sin(performance.now() / 1000 * pulseSpeed * Math.PI * 2) * pulseAmount;
    const r = (Math.min(this.width, this.height) / 2) * pulse;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  _renderDataShard(ctx, fill, radius) {
    const { glitchIntervalMs, glitchDurationMs } = RUNNER_SKIN_CONFIG.dataShard;
    const glitchPhase = this._glitchMs % glitchIntervalMs;
    const glitching = glitchPhase < glitchDurationMs;
    const offsetX = glitching ? (Math.random() > 0.5 ? 2 : -2) : 0;
    drawRoundRectPath(
      ctx,
      this.x + offsetX,
      this.y,
      this.width,
      this.height,
      radius
    );
    ctx.fill();
    if (glitching) {
      ctx.globalAlpha = 0.35;
      drawRoundRectPath(ctx, this.x - offsetX, this.y, this.width, this.height, radius);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  _renderAlienBlob(ctx, fill) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y + h);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.05, x + w * 0.8, y + h);
    ctx.quadraticCurveTo(x + w, y + h * 0.55, x + w * 0.75, y + h);
    ctx.lineTo(x + w * 0.25, y + h);
    ctx.quadraticCurveTo(x, y + h * 0.55, x + w * 0.2, y + h);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  _renderNeonPod(ctx, fill) {
    const podW = this.width * 1.15;
    const podH = this.height * 0.75;
    const px = this.x + (this.width - podW) / 2;
    const py = this.y + (this.height - podH) / 2;
    drawRoundRectPath(ctx, px, py, podW, podH, podH / 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  renderPopRing(ctx) {
    if (this._ringMs <= 0) return;

    const { jumpLandingRing, colors, glow } = VISUAL_CONFIG;
    if (!glow) return;
    const progress = 1 - this._ringMs / jumpLandingRing.durationMs;
    const radius = lerp(
      jumpLandingRing.startRadius,
      jumpLandingRing.endRadius,
      progress
    );
    const alpha = lerp(jumpLandingRing.startAlpha, 0, progress);
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height;

    ctx.save();
    ctx.strokeStyle = colors.player;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = jumpLandingRing.strokeWidth;
    ctx.shadowColor = colors.player;
    ctx.shadowBlur = glow.player;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
