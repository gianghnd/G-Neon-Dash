/**
 * UI manager.
 *
 * Responsibility: Render menu, HUD, and game-over overlays.
 * Public API: renderMenu(), renderHUD(), renderGameOver(), notifyGameOver().
 * Dependencies: GameState, VISUAL_CONFIG, UI_CONFIG.
 */

import { GameState } from '../core/GameState.js';
import { UI_CONFIG, VISUAL_CONFIG } from '../config/gameConfig.js';

export class UIManager {
  constructor(ctx, canvasWidth, canvasHeight) {
    this._ctx = ctx;
    this._width = canvasWidth;
    this._height = canvasHeight;
    this._scorePulseFrames = 0;
    this._lastScoreMilestone = 0;
    this._gameOverShownAt = null;
    this._gameOverIsNewBest = false;
  }

  render(state, { score = 0, best = 0, isNewBest = false, runnerSkinLabel = '' } = {}) {
    this._ctx.shadowBlur = 0;
    this._ctx.shadowColor = 'transparent';

    switch (state) {
      case GameState.MENU:
        this.renderMenu(best, runnerSkinLabel);
        break;
      case GameState.PLAYING:
      case GameState.PAUSED:
      case GameState.DYING:
        this.renderHUD(score, best);
        break;
      case GameState.GAME_OVER:
        this.renderGameOver(score, best, isNewBest);
        break;
      default:
        break;
    }
  }

  notifyGameOver(isNewBest) {
    this._gameOverShownAt = performance.now();
    this._gameOverIsNewBest = isNewBest;
  }

  resetGameOverPresentation() {
    this._gameOverShownAt = null;
    this._gameOverIsNewBest = false;
  }

  resetScorePulse() {
    this._scorePulseFrames = 0;
    this._lastScoreMilestone = 0;
  }

  _formatBest(value) {
    return value > 0 ? String(Math.floor(value)) : '—';
  }

  _getNewBestPopScale() {
    if (!this._gameOverIsNewBest || this._gameOverShownAt === null) {
      return 1;
    }
    const { newBestPopMs } = UI_CONFIG.gameOver;
    const elapsed = performance.now() - this._gameOverShownAt;
    if (elapsed >= newBestPopMs) {
      return 1;
    }
    const t = elapsed / newBestPopMs;
    const peak = 1.14;
    if (t < 0.45) {
      return 1 + (peak - 1) * (t / 0.45);
    }
    return peak - (peak - 1) * ((t - 0.45) / 0.55);
  }

  _drawText(text, x, y, { color, glow = 0, font, align = 'center', baseline = 'alphabetic', scale = 1 } = {}) {
    const ctx = this._ctx;
    ctx.save();
    if (scale !== 1) {
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
    }
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillStyle = color;
    if (glow > 0) {
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
    }
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  _drawOverlay(alpha) {
    const ctx = this._ctx;
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, this._width, this._height);
    ctx.restore();
  }

  _drawCtaButton(label, centerX, centerY, pulsePhase = 0, size = null) {
    const ctx = this._ctx;
    const { colors, glow, fonts } = VISUAL_CONFIG;
    const { button, gameOver: gameOverUi } = UI_CONFIG;
    const baseWidth = size?.width ?? button.width;
    const baseHeight = size?.height ?? button.height;
    const pulse = 1 + Math.sin(pulsePhase) * button.pulseAmount;
    const width = baseWidth * pulse;
    const height = baseHeight * pulse;
    const x = centerX - width / 2;
    const y = centerY - height / 2;
    const radius = button.radius;

    ctx.save();
    ctx.shadowColor = colors.title;
    ctx.shadowBlur = glow.title * 0.45;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fillStyle = `rgba(0, 255, 255, ${button.fillAlpha + 0.04})`;
    ctx.fill();
    ctx.strokeStyle = colors.title;
    ctx.lineWidth = button.borderWidth;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = size ? fonts.button : fonts.button;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.title;
    ctx.fillText(label, centerX, centerY);
    ctx.restore();
  }

  _drawLabelValue(label, value, centerX, labelY, valueY, { valueColor, valueGlow = 0, valueFont }) {
    const { colors, glow, fonts } = VISUAL_CONFIG;

    this._drawText(label, centerX, labelY, {
      color: colors.mutedText,
      glow: glow.mutedText,
      font: fonts.label,
    });

    this._drawText(value, centerX, valueY, {
      color: valueColor ?? colors.hudScore,
      glow: valueGlow,
      font: valueFont ?? fonts.displayScore,
    });
  }

  getSkinNavDirection(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = this._width / rect.width;
    const scaleY = this._height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const { layout } = UI_CONFIG;
    const rowY = layout.menuRunnerSkinY;
    if (Math.abs(y - rowY) > 18) {
      return 0;
    }
    const cx = this._width / 2;
    if (x < cx - 70) return -1;
    if (x > cx + 70) return 1;
    return 0;
  }

  renderMenu(best, runnerSkinLabel = '') {
    const cx = this._width / 2;
    const { colors, glow, fonts } = VISUAL_CONFIG;
    const { copy, layout, overlay, button } = UI_CONFIG;
    const pulsePhase = (performance.now() / 1000) * button.pulseSpeed * Math.PI * 2;

    this._drawOverlay(overlay.menuAlpha);

    this._drawText(copy.titleLine1, cx, layout.menuTitleY1, {
      color: colors.title,
      glow: glow.title,
      font: fonts.titleLine,
    });

    this._drawText(copy.titleLine2, cx, layout.menuTitleY2, {
      color: colors.title,
      glow: glow.title,
      font: fonts.titleLine,
    });

    this._drawText(copy.tagline, cx, layout.menuTaglineY, {
      color: colors.mutedText,
      glow: glow.mutedText,
      font: fonts.tagline,
    });

    this._drawText('‹', cx - 90, layout.menuRunnerSkinY, {
      color: colors.title,
      glow: glow.mutedText,
      font: fonts.body,
    });
    this._drawText(runnerSkinLabel || copy.runnerSkinDefault, cx, layout.menuRunnerSkinY, {
      color: colors.hudScore,
      glow: glow.mutedText,
      font: fonts.caption,
    });
    this._drawText('›', cx + 90, layout.menuRunnerSkinY, {
      color: colors.title,
      glow: glow.mutedText,
      font: fonts.body,
    });

    this._drawLabelValue(
      copy.bestLabel,
      this._formatBest(best),
      cx,
      layout.menuBestLabelY,
      layout.menuBestValueY,
      {
        valueColor: best > 0 ? colors.hudScore : colors.mutedText,
        valueGlow: best > 0 ? glow.hudScore : 0,
        valueFont: fonts.scoreLarge,
      }
    );

    this._drawCtaButton(copy.playCta, cx, layout.menuCtaY, pulsePhase);

    this._drawText(copy.spaceTap, cx, layout.menuHintY, {
      color: colors.mutedText,
      glow: glow.mutedText,
      font: fonts.caption,
    });
  }

  renderHUD(score, best) {
    const { colors, glow, fonts, scorePulse } = VISUAL_CONFIG;
    const milestone = Math.floor(score / scorePulse.intervalScore);
    if (milestone > this._lastScoreMilestone) {
      this._scorePulseFrames = scorePulse.frameCount;
      this._lastScoreMilestone = milestone;
    }

    let scale = 1;
    if (this._scorePulseFrames > 0) {
      const progress = 1 - this._scorePulseFrames / scorePulse.frameCount;
      scale =
        progress < 0.5
          ? 1 + (scorePulse.scalePeak - 1) * (progress * 2)
          : 1 + (scorePulse.scalePeak - 1) * ((1 - progress) * 2);
      this._scorePulseFrames -= 1;
    }

    const ctx = this._ctx;
    const scoreText = `Score: ${Math.floor(score)}`;
    const x = 16;
    const y = 32;

    ctx.save();
    ctx.font = fonts.hud;
    ctx.textAlign = 'left';
    ctx.fillStyle = colors.hudScore;
    if (scale !== 1) {
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
    }
    ctx.fillText(scoreText, x, y);
    ctx.restore();

    const bestText = best > 0 ? `Best: ${Math.floor(best)}` : 'Best: —';
    ctx.save();
    ctx.font = fonts.caption;
    ctx.textAlign = 'right';
    ctx.fillStyle = colors.mutedText;
    ctx.fillText(bestText, this._width - 16, 32);
    ctx.restore();
  }

  renderGameOver(score, best, isNewBest) {
    const cx = this._width / 2;
    const { colors, glow, fonts } = VISUAL_CONFIG;
    const { copy, layout, overlay, button, gameOver: gameOverUi } = UI_CONFIG;
    const finalScore = Math.floor(score);
    const bestScore = Math.floor(best);
    const pulsePhase = (performance.now() / 1000) * button.pulseSpeed * Math.PI * 2;

    this._drawOverlay(overlay.gameOverAlpha);

    this._drawText(copy.gameOver, cx, layout.gameOverLabelY, {
      color: colors.mutedText,
      glow: 0,
      font: fonts.label,
    });

    this._drawLabelValue(
      copy.currentScoreLabel,
      String(finalScore),
      cx,
      layout.gameOverScoreLabelY,
      layout.gameOverScoreValueY,
      { valueGlow: 0 }
    );

    if (isNewBest) {
      this._drawText(copy.newBest, cx, layout.gameOverMsgY, {
        color: colors.title,
        glow: glow.title * 0.35,
        font: fonts.body,
        scale: this._getNewBestPopScale(),
      });
    } else {
      const ptsToBeat = Math.max(0, bestScore - finalScore);
      if (bestScore > 0 && ptsToBeat > 0) {
        this._drawText(copy.ptsToBeatBest(ptsToBeat), cx, layout.gameOverMsgY, {
          color: colors.mutedText,
          glow: 0,
          font: fonts.caption,
        });
      }
    }

    this._drawLabelValue(
      copy.bestLabel,
      this._formatBest(bestScore),
      cx,
      layout.gameOverBestLabelY,
      layout.gameOverBestValueY,
      { valueColor: colors.mutedText, valueFont: fonts.scoreLarge, valueGlow: 0 }
    );

    this._drawCtaButton(
      copy.playAgainCta,
      cx,
      layout.gameOverCtaY,
      pulsePhase,
      { width: gameOverUi.buttonWidth, height: gameOverUi.buttonHeight }
    );

    this._drawText(copy.gameOverHint, cx, layout.gameOverHintY, {
      color: colors.mutedText,
      glow: 0,
      font: fonts.caption,
    });
  }
}
