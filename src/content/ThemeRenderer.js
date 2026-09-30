/**
 * Theme-specific background and ground rendering (draw-only).
 *
 * Responsibility: Swap visual tokens per theme without touching gameplay config.
 */

import { GAME_CONFIG, PLAYER_CONFIG, THEME_CONFIG } from '../config/gameConfig.js';

export function resolveThemeId(requestedId) {
  if (requestedId && THEME_CONFIG.themes[requestedId]) {
    return requestedId;
  }
  return THEME_CONFIG.defaultThemeId;
}

export function getThemeTokens(themeId) {
  const id = resolveThemeId(themeId);
  return THEME_CONFIG.themes[id].tokens;
}

export function renderThemeBackground(ctx, themeId, timeSec = 0) {
  const tokens = getThemeTokens(themeId);
  const w = GAME_CONFIG.canvasWidth;
  const h = GAME_CONFIG.canvasHeight;

  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, tokens.backgroundTop);
  gradient.addColorStop(1, tokens.backgroundBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  if (themeId === 'spaceVoid') {
    _renderStarfield(ctx, tokens, w, h, timeSec);
  } else {
    _renderSkyline(ctx, tokens, w, h, timeSec);
  }
}

export function renderThemeGround(ctx, themeId) {
  const tokens = getThemeTokens(themeId);
  const groundY = PLAYER_CONFIG.groundY;
  const w = GAME_CONFIG.canvasWidth;

  ctx.fillStyle = tokens.groundFill;
  ctx.fillRect(0, groundY, w, 4);

  ctx.save();
  ctx.shadowColor = tokens.groundEdge;
  ctx.shadowBlur = 4;
  ctx.strokeStyle = tokens.groundEdge;
  ctx.globalAlpha = tokens.groundEdgeAlpha;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();

  if (themeId === 'spaceVoid') {
    ctx.globalAlpha = 0.25;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(0, groundY + 6);
    ctx.lineTo(w, groundY + 6);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.globalAlpha = 0.15;
    for (let x = 0; x < w; x += 40) {
      ctx.fillRect(x, groundY + 4, 20, 1);
    }
  }
  ctx.restore();
}

function _renderSkyline(ctx, tokens, w, h, timeSec) {
  const parallax = (timeSec * 24) % w;
  ctx.save();
  ctx.globalAlpha = tokens.skylineAlpha;
  ctx.fillStyle = tokens.parallaxAccent2;
  for (let layer = 0; layer < 3; layer += 1) {
    const baseY = h * (0.45 + layer * 0.08);
    const height = 30 + layer * 18;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = -parallax * (0.3 + layer * 0.2); x < w + 80; x += 60 + layer * 20) {
      const buildingW = 24 + (layer * 10);
      ctx.lineTo(x, baseY - height);
      ctx.lineTo(x + buildingW, baseY - height);
      ctx.lineTo(x + buildingW, baseY);
    }
    ctx.lineTo(w, baseY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowColor = tokens.parallaxAccent;
  ctx.shadowBlur = 12;
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = tokens.parallaxAccent;
  ctx.fillRect(w * 0.15 - parallax * 0.1, h * 0.35, 40, 6);
  ctx.fillRect(w * 0.55 - parallax * 0.15, h * 0.38, 28, 4);
  ctx.restore();
}

function _renderStarfield(ctx, tokens, w, h, timeSec) {
  ctx.save();
  ctx.globalAlpha = tokens.skylineAlpha;
  const nebula = ctx.createRadialGradient(w * 0.7, h * 0.25, 10, w * 0.7, h * 0.25, 180);
  nebula.addColorStop(0, tokens.parallaxAccent2);
  nebula.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 48; i += 1) {
    const x = (i * 97 + timeSec * (12 + (i % 5))) % w;
    const y = (i * 53) % (h * 0.55);
    ctx.globalAlpha = 0.15 + (i % 4) * 0.12;
    ctx.fillRect(x, y, 1 + (i % 2), 1 + (i % 2));
  }
  ctx.restore();
}
