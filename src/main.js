/**
 * Entry point.
 *
 * Responsibility: Bootstrap the game.
 * Dependencies: Game, RetentionSystem.
 *
 * No game logic here — only initialization.
 */

import { Game } from './core/Game.js';
import { RetentionSystem } from './systems/RetentionSystem.js';
import { UI_CONFIG, THEME_CONFIG } from './config/gameConfig.js';
import { resolveThemeId } from './content/ThemeRenderer.js';

const urlParams = new URLSearchParams(window.location.search);
RetentionSystem.handleDevReset(urlParams.toString());
const themeId = resolveThemeId(urlParams.get(THEME_CONFIG.queryParam));

function bootstrap() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Canvas element #game-canvas not found');
    return;
  }

  const tapHintElement = document.getElementById('tap-hint');
  if (tapHintElement) {
    tapHintElement.textContent = UI_CONFIG.copy.tapHint;
  }

  const debugTelemetry = urlParams.has('debug');
  const game = new Game(canvas, { tapHintElement, debugTelemetry, themeId });
  game.init();
  game.start();

  window.__neonDashGame = game;
  window.__neonDashSetTheme = (id) => game.setTheme(id);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
