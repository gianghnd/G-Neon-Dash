/**
 * Game orchestrator.
 *
 * Responsibility: Wire systems together, manage lifecycle and state flow.
 * Public API: init(), start(), destroy().
 * Dependencies: All core systems and entities.
 *
 * V1: Fixed speed (difficultyDirectorV2 OFF), ground obstacles, immediate death/retry.
 */

import { GameState, GameStateMachine } from './GameState.js';
import { GameLoop } from './GameLoop.js';
import { Player } from '../entities/Player.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { InputManager } from '../input/InputManager.js';
import { UIManager } from '../ui/UIManager.js';
import { TapHint } from '../ui/TapHint.js';
import { RetentionSystem } from '../systems/RetentionSystem.js';
import { RunnerSkinStore } from '../systems/RunnerSkinStore.js';
import {
  GAME_CONFIG,
  PLAYER_CONFIG,
  FEATURE_FLAGS,
  VISUAL_CONFIG,
} from '../config/gameConfig.js';
import { evaluateDifficulty } from '../difficulty/DifficultyDirector.js';
import {
  renderThemeBackground,
  renderThemeGround,
  resolveThemeId,
} from '../content/ThemeRenderer.js';
import { clamp } from '../utils/math.js';

export class Game {
  constructor(canvas, { tapHintElement = null, debugTelemetry = false, themeId = null } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stateMachine = new GameStateMachine();
    this.retention = new RetentionSystem();
    this.runnerSkinStore = new RunnerSkinStore();
    this.tapHint = new TapHint(tapHintElement);
    this._themeId = resolveThemeId(themeId);
    this._themeTimeSec = 0;
    this.player = new Player();
    this.player.setRunnerSkin(this.runnerSkinStore.getSkin());
    this.collisionSystem = new CollisionSystem();
    this.scoreSystem = new ScoreSystem(this.retention.getLoadedBest());
    this.spawnSystem = new SpawnSystem();
    this.inputManager = new InputManager();
    this.uiManager = new UIManager(
      this.ctx,
      GAME_CONFIG.canvasWidth,
      GAME_CONFIG.canvasHeight
    );

    this._debugTelemetry = debugTelemetry;
    this._speed = GAME_CONFIG.initialSpeed;
    this._runElapsedSec = 0;
    this._runDurationFrames = 0;
    this._retryCountSession = 0;
    this._shakeFramesLeft = 0;
    this._flashFramesLeft = 0;
    this._deathVisualFramesLeft = 0;
    this._loop = new GameLoop({
      update: (dt) => this._update(dt),
      render: () => this._render(),
    });

    this._setupInput();
    this._setupStateListeners();
  }

  init() {
    this.canvas.width = GAME_CONFIG.canvasWidth;
    this.canvas.height = GAME_CONFIG.canvasHeight;
    this.stateMachine.transition(GameState.MENU);
    this._syncTapHint();
  }

  start() {
    this.inputManager.bind(this.canvas);
    this._loop.start();
  }

  destroy() {
    this._loop.stop();
    this.inputManager.unbind();
  }

  getSpeed() {
    return this._speed;
  }

  _setupInput() {
    this.inputManager.onJump((event) => this._handleJump(event));
    this.inputManager.onMenuNav((direction) => this._handleMenuNav(direction));
  }

  _handleMenuNav(direction) {
    if (this.stateMachine.getState() !== GameState.MENU) {
      return;
    }
    this.runnerSkinStore.cycle(direction);
    this.player.setRunnerSkin(this.runnerSkinStore.getSkin());
  }

  setTheme(themeId) {
    this._themeId = resolveThemeId(themeId);
  }

  _setupStateListeners() {
    this.stateMachine.onStateChange((to) => {
      if (to === GameState.PLAYING) {
        this._loop.resume();
      }
      if (to === GameState.GAME_OVER) {
        this.retention.markFirstRunComplete();
        this.uiManager.notifyGameOver(this.scoreSystem.isNewBest());
        this._logDebugTelemetry();
      }
      this._syncTapHint();
    });
  }

  _syncTapHint() {
    const state = this.stateMachine.getState();
    const show =
      this.retention.shouldShowTapHint(
        state === GameState.MENU || state === GameState.PLAYING
      );
    this.tapHint.update(show);
  }

  _handleJump(pointerEvent = null) {
    const state = this.stateMachine.getState();

    if (state === GameState.MENU) {
      const event = pointerEvent ?? this.inputManager.consumeLastPointerEvent();
      if (event) {
        const navDir = this.uiManager.getSkinNavDirection(
          event.clientX,
          event.clientY,
          this.canvas
        );
        if (navDir !== 0) {
          this._handleMenuNav(navDir);
          return;
        }
      }
      this._startRun();
      return;
    }

    if (state === GameState.GAME_OVER) {
      this._retryRun();
      return;
    }

    if (state === GameState.PLAYING) {
      this.player.jump();
      this.retention.markFirstRunComplete();
      this._syncTapHint();
    }
  }

  _startRun() {
    this._resetRun();
    this.stateMachine.transition(GameState.PLAYING);
  }

  _retryRun() {
    this._retryCountSession += 1;
    this._resetRun();
    this.stateMachine.transition(GameState.PLAYING);
  }

  _resetRun() {
    this.player.reset();
    this.scoreSystem.reset();
    this.spawnSystem.reset();
    this._speed = GAME_CONFIG.initialSpeed;
    this._runElapsedSec = 0;
    this._runDurationFrames = 0;
    this._shakeFramesLeft = 0;
    this._flashFramesLeft = 0;
    this._deathVisualFramesLeft = 0;
    this.uiManager.resetScorePulse();
    this.uiManager.resetGameOverPresentation();
  }

  _logDebugTelemetry() {
    if (!this._debugTelemetry) {
      return;
    }

    console.table({
      runDurationFrames: this._runDurationFrames,
      deathSpeed: Math.round(this._speed),
      patternIdAtDeath: this.spawnSystem.getPatternIdAtDeath() ?? 'legacy_random',
      obstacleSpacingAtDeath: this.spawnSystem.getObstacleSpacingAtDeath(),
      retryCountThisSession: this._retryCountSession,
      finalScore: this.scoreSystem.getScore(),
    });
  }

  _triggerDeathVisuals() {
    this._shakeFramesLeft = VISUAL_CONFIG.screenShake.frameCount;
    this._flashFramesLeft = VISUAL_CONFIG.flash.frameCount;
    this._deathVisualFramesLeft = VISUAL_CONFIG.deathFlash.frameCount;
  }

  _tickDeathVisuals() {
    if (this._shakeFramesLeft > 0) {
      this._shakeFramesLeft -= 1;
    }
    if (this._flashFramesLeft > 0) {
      this._flashFramesLeft -= 1;
    }
    if (this._deathVisualFramesLeft > 0) {
      this._deathVisualFramesLeft -= 1;
    }
  }

  _update(deltaTime) {
    const state = this.stateMachine.getState();

    this.player.tickVisuals(deltaTime);
    this._tickDeathVisuals();

    if (state === GameState.PLAYING) {
      this._runElapsedSec += deltaTime;
      this._runDurationFrames += 1;
      this._themeTimeSec += deltaTime;

      if (FEATURE_FLAGS.difficultyDirectorV2) {
        const director = evaluateDifficulty(this._runElapsedSec, this._speed);
        this._speed = clamp(
          this._speed + GAME_CONFIG.speedIncreaseRate * deltaTime,
          GAME_CONFIG.initialSpeed,
          Math.min(director.targetSpeedCap, GAME_CONFIG.maxSpeed)
        );
        this.spawnSystem.setPatternComplexityCap(director.patternComplexityCap);
      } else {
        this._speed = GAME_CONFIG.initialSpeed;
        this.spawnSystem.setPatternComplexityCap(1);
      }

      this.player.update(deltaTime);
      this.spawnSystem.setSpeed(this._speed);
      this.spawnSystem.update(deltaTime, GAME_CONFIG.canvasWidth);
      this.scoreSystem.update(deltaTime, this._speed);

      const hit = this.collisionSystem.checkPlayerObstacles(
        this.player,
        this.spawnSystem.getActiveObstacles()
      );

      if (hit) {
        this.scoreSystem.finalizeRun();
        if (this.scoreSystem.isNewBest()) {
          this.retention.persistBestIfNeeded(this.scoreSystem.getBest());
        }
        this._triggerDeathVisuals();
        this.stateMachine.transition(GameState.DYING);
        this.stateMachine.transition(GameState.GAME_OVER);
      }
    }
  }

  _renderBackground(ctx) {
    renderThemeBackground(ctx, this._themeId, this._themeTimeSec);
  }

  _renderGround(ctx) {
    renderThemeGround(ctx, this._themeId);
  }

  _applyScreenShake(ctx) {
    if (this._shakeFramesLeft <= 0) return;

    const { screenShake } = VISUAL_CONFIG;
    const t = this._shakeFramesLeft / screenShake.frameCount;
    const maxOffset = screenShake.maxOffsetPx * t;
    ctx.translate(
      (Math.random() * 2 - 1) * maxOffset,
      (Math.random() * 2 - 1) * maxOffset
    );
  }

  _renderFlash(ctx) {
    if (this._flashFramesLeft <= 0) return;

    const { colors } = VISUAL_CONFIG;
    ctx.fillStyle = colors.screenFlash;
    ctx.globalAlpha = colors.screenFlashAlpha;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    ctx.globalAlpha = 1;
  }

  _resetCanvasState(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  _render() {
    const ctx = this.ctx;
    this._resetCanvasState(ctx);
    const state = this.stateMachine.getState();
    const showWorld =
      state === GameState.PLAYING ||
      state === GameState.DYING ||
      state === GameState.GAME_OVER;

    ctx.save();

    this._renderBackground(ctx);
    this._applyScreenShake(ctx);
    this._renderGround(ctx);

    if (showWorld) {
      for (const obstacle of this.spawnSystem.getActiveObstacles()) {
        obstacle.render(ctx, this._themeId);
      }

      const dyingVisual = this._deathVisualFramesLeft > 0;
      this.player.render(ctx, { dying: dyingVisual });
      this.player.renderPopRing(ctx);
    }

    ctx.restore();

    if (state !== GameState.GAME_OVER) {
      this._renderFlash(ctx);
    }

    this.uiManager.render(state, {
      score: this.scoreSystem.getScore(),
      best: this.scoreSystem.getBest(),
      isNewBest: this.scoreSystem.isNewBest(),
      runnerSkinLabel:
        state === GameState.MENU ? this.runnerSkinStore.getLabel() : undefined,
    });
  }
}
