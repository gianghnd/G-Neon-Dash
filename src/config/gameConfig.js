/**
 * Game configuration — all tunable values.
 *
 * Responsibility: Central source of truth for game tuning.
 * Dependencies: None.
 *
 * Rules:
 * - DESIGN_PENDING values are not yet decided — do not invent.
 * - TODO values are known to be needed but not yet defined.
 */

export const PLAYER_CONFIG = {
  width: 40,
  height: 40,
  jumpForce: -800,
  gravity: 2400,
  groundY: 340,
  jumpOnlyWhenGrounded: true,
  maxFallSpeed: 'DESIGN_PENDING',
};

export const GAME_CONFIG = {
  canvasWidth: 800,
  canvasHeight: 400,
  initialSpeed: 200,
  maxSpeed: 600,
  speedIncreaseRate: 8,
  dyingDurationMs: 'DESIGN_PENDING',
};

export const DIFFICULTY_CONFIG = {
  physicsFps: 60,
  landingStabilizeFrames: 6,
  reactionFloorFrames: 15,
  patternComplexityMaxSpeed: 600,
  phaseThresholdsSec: {
    learnEnd: 30,
    flowEnd: 60,
    pressureEnd: 120,
    masteryEnd: Infinity,
  },
  phaseSpeedCaps: [250, 350, 500, 600],
  /** @type {((state: object, input: object) => object) | null} */
  playerPerformanceAdapter: null,
};

export const OBSTACLE_CONFIG = {
  groundWidth: 20,
  groundHeight: 38,
  floatingWidth: 40,
  floatingHeight: 30,
  floatingYOffset: 80,
  spawnIntervalMinMs: 1600,
  spawnIntervalMaxMs: 2600,
};

export const FEEDBACK_CONFIG = {
  toastCooldownMs: 'DESIGN_PENDING',
  hypeIntervalMs: 'DESIGN_PENDING',
  nearMissThresholdPx: 'DESIGN_PENDING',
};

export const SHIELD_CONFIG = {
  spawnIntervalMs: 'DESIGN_PENDING',
  durationMs: 'DESIGN_PENDING',
};

export const SCORE_CONFIG = {
  pointsPerSpeedUnit: 0.01,
};

export const RETENTION_CONFIG = {
  bestKey: 'neondash_best_v1',
  hasPlayedKey: 'neondash_has_played_v1',
  runnerSkinKey: 'neondash_runner_skin_v1',
  resetBestQueryParam: 'resetBest',
};

export const HAZARD_SKIN_CONFIG = {
  groundSkins: ['block', 'spike', 'wideBlock', 'doubleSpike'],
  floatingSkins: ['bar', 'orb', 'gate', 'laser'],
  defaultGroundSkin: 'block',
  defaultFloatingSkin: 'bar',
  wideSkins: ['wideBlock', 'doubleSpike'],
  dimensions: {
    block: { width: 20, height: 38 },
    spike: { width: 20, height: 38 },
    wideBlock: { width: 32, height: 38, minReachPx: 118 },
    doubleSpike: { width: 24, height: 38, minReachPx: 108 },
    bar: { width: 40, height: 30 },
    orb: { width: 30, height: 30 },
    gate: { width: 40, height: 30, beamHeight: 8 },
    laser: { width: 40, height: 6 },
  },
  colors: {
    groundFill: '#ff0066',
    groundEdge: '#ff5599',
    floatingFill: '#ffff00',
    floatingEdge: '#ffee55',
  },
};

export const RUNNER_SKIN_CONFIG = {
  skins: ['neonCube', 'neonOrb', 'dataShard', 'alienBlob', 'neonPod'],
  defaultSkin: 'neonCube',
  labels: {
    neonCube: 'Neon Cube',
    neonOrb: 'Neon Orb',
    dataShard: 'Data Shard',
    alienBlob: 'Alien Blob',
    neonPod: 'Neon Pod',
  },
  neonPod: {
    maxTiltRad: 0.26,
    tiltPerVelocity: 0.00035,
  },
  dataShard: {
    glitchIntervalMs: 420,
    glitchDurationMs: 80,
  },
  neonOrb: {
    pulseSpeed: 4,
    pulseAmount: 0.08,
  },
};

export const THEME_CONFIG = {
  defaultThemeId: 'neonCity',
  queryParam: 'theme',
  themes: {
    neonCity: {
      id: 'neonCity',
      label: 'Neon City',
      tokens: {
        backgroundTop: '#0a0a1a',
        backgroundBottom: '#12122a',
        groundFill: '#1a1a3a',
        groundEdge: '#00ffff',
        groundEdgeAlpha: 0.4,
        hazardGroundFill: '#ff0066',
        hazardGroundEdge: '#ff5599',
        hazardFloatingFill: '#ffff00',
        hazardFloatingEdge: '#ffee55',
        parallaxAccent: '#00ffff',
        parallaxAccent2: '#ff0066',
        skylineAlpha: 0.35,
      },
    },
    spaceVoid: {
      id: 'spaceVoid',
      label: 'Space Void',
      tokens: {
        backgroundTop: '#050510',
        backgroundBottom: '#0a0820',
        groundFill: '#12122a',
        groundEdge: '#9966ff',
        groundEdgeAlpha: 0.45,
        hazardGroundFill: '#ff0066',
        hazardGroundEdge: '#ff5599',
        hazardFloatingFill: '#ffff00',
        hazardFloatingEdge: '#ffee55',
        parallaxAccent: '#6644cc',
        parallaxAccent2: '#9966ff',
        skylineAlpha: 0.4,
      },
    },
  },
};

export const UI_CONFIG = {
  copy: {
    titleLine1: 'NEON',
    titleLine2: 'DASH',
    tagline: 'RUN • JUMP • SURVIVE',
    bestLabel: 'BEST',
    currentScoreLabel: 'CURRENT SCORE',
    scoreLabel: 'SCORE',
    gameOver: 'GAME OVER',
    newBest: 'NEW BEST!',
    playCta: 'PLAY',
    playAgainCta: '▶ PLAY AGAIN',
    spaceTap: 'SPACE / TAP',
    gameOverHint: 'SPACE · TAP · CLICK',
    tapHint: 'Tap or press SPACE',
    ptsToBeatBest: (pts) => `${pts} pts to beat best`,
    runnerSkinDefault: 'Neon Cube',
  },
  layout: {
    menuTitleY1: 88,
    menuTitleY2: 128,
    menuTaglineY: 152,
    menuRunnerSkinY: 178,
    menuBestLabelY: 198,
    menuBestValueY: 224,
    menuCtaY: 278,
    menuHintY: 338,
    gameOverLabelY: 56,
    gameOverScoreLabelY: 92,
    gameOverScoreValueY: 136,
    gameOverMsgY: 172,
    gameOverBestLabelY: 204,
    gameOverBestValueY: 228,
    gameOverCtaY: 298,
    gameOverHintY: 352,
  },
  gameOver: {
    newBestPopMs: 450,
    buttonWidth: 204,
    buttonHeight: 48,
  },
  button: {
    width: 168,
    height: 42,
    radius: 10,
    pulseSpeed: 2.5,
    pulseAmount: 0.04,
    fillAlpha: 0.1,
    borderWidth: 2,
  },
  overlay: {
    menuAlpha: 0.62,
    gameOverAlpha: 0.68,
  },
};

export const VISUAL_CONFIG = {
  colors: {
    backgroundTop: '#0a0a1a',
    backgroundBottom: '#12122a',
    groundFill: '#1a1a3a',
    groundEdge: '#00ffff',
    groundEdgeAlpha: 0.4,
    player: '#00ffff',
    obstacleFill: '#ff0066',
    obstacleTopEdge: '#ff5599',
    title: '#00ffff',
    hudScore: '#ffffff',
    mutedText: '#aaaaaa',
    gameOver: '#ff0066',
    newBest: '#ffff00',
    screenFlash: '#ffffff',
    screenFlashAlpha: 0.85,
    playerDeath: '#ffffff',
    instructionText: '#ffffff',
    menuOverlay: 'rgba(0, 0, 0, 0.6)',
    gameOverOverlay: 'rgba(0, 0, 0, 0.7)',
  },
  glow: {
    groundEdge: 4,
    player: 14,
    obstacle: 10,
    title: 16,
    gameOver: 16,
    newBest: 12,
    hudScore: 0,
    mutedText: 0,
    instructionText: 0,
  },
  sizes: {
    playerCornerRadius: 8,
    obstacleTopEdgeHeight: 3,
    groundStripHeight: 4,
    groundEdgeGlowHeight: 2,
  },
  jumpLandingRing: {
    startRadius: 6,
    endRadius: 24,
    durationMs: 100,
    strokeWidth: 2,
    startAlpha: 0.6,
  },
  screenShake: {
    maxOffsetPx: 4,
    frameCount: 5,
  },
  flash: {
    frameCount: 2,
  },
  squash: {
    scaleY: 0.85,
    durationMs: 80,
  },
  stretch: {
    scaleY: 1.15,
    scaleX: 0.9,
    durationMs: 120,
  },
  deathFlash: {
    frameCount: 2,
  },
  scorePulse: {
    scalePeak: 1.15,
    frameCount: 6,
    intervalScore: 10,
  },
  distantDots: {
    enabled: false,
    minAlpha: 0.15,
    maxAlpha: 0.25,
    color: '#ffffff',
  },
  fonts: {
    title: 'bold 48px monospace',
    titleLine: 'bold 42px monospace',
    gameOver: 'bold 32px monospace',
    displayScore: 'bold 40px monospace',
    hud: '20px monospace',
    scoreLarge: '24px monospace',
    body: '18px monospace',
    bodySmall: '16px monospace',
    caption: '14px monospace',
    label: '600 11px monospace',
    tagline: '600 13px monospace',
    button: 'bold 18px monospace',
    newBestBanner: 'bold 28px monospace',
  },
};

export const FEATURE_FLAGS = {
  difficultyDirectorV2: false,
  patternSystemV2: false,
  feedbackPriorityV2: false,
  nearMissV2: false,
  shieldSystem: false,
  personalBestV2: false,
  analyticsV1: false,
  monetizationV1: false,
};
