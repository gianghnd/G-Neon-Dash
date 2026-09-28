# Neon Dash — Configuration

## Philosophy

Game tuning must be **configuration-driven**, not hardcoded. Designers and AI agents should be able to tune gameplay by editing config values without touching game logic.

## Configuration File

`src/config/gameConfig.js`

## Configuration Groups

### PLAYER_CONFIG

| Key | Value | Description | Status |
|---|---|---|---|
| `width` | 40 | Player hitbox width (px) | Set |
| `height` | 40 | Player hitbox height (px) | Set |
| `jumpForce` | -800 | Upward velocity on jump (px/s) | Set — playability tuned |
| `gravity` | 2400 | Downward acceleration (px/s²) | Set — playability tuned |
| `groundY` | 340 | Ground line Y position (px) | Set |
| `jumpOnlyWhenGrounded` | true | Require grounded to jump | Set |
| `maxFallSpeed` | — | Terminal velocity | DESIGN_PENDING |

### GAME_CONFIG

| Key | Value | Description | Status |
|---|---|---|---|
| `canvasWidth` | 800 | Logical canvas width (px) | Set |
| `canvasHeight` | 400 | Logical canvas height (px) | Set |
| `initialSpeed` | 200 | Scroll speed — **fixed in V1** (px/s) | Set |
| `maxSpeed` | 600 | Speed cap (used when difficultyDirectorV2 ON) | Set |
| `speedIncreaseRate` | 8 | Speed ramp per second (gated by feature flag) | Set |
| `dyingDurationMs` | — | DYING state duration | DESIGN_PENDING |

### DIFFICULTY_CONFIG

| Key | Value | Description |
|---|---|---|
| `physicsFps` | 60 | Frame basis for fairness math |
| `landingStabilizeFrames` | 6 | Post-landing stabilization |
| `reactionFloorFrames` | 15 | Minimum reaction window |
| `patternComplexityMaxSpeed` | 600 | Speed reference for difficulty scalar |
| `phaseThresholdsSec` | 30 / 60 / 120 / ∞ | LEARN / FLOW / PRESSURE / MASTERY |
| `phaseSpeedCaps` | 250, 350, 500, 600 | Per-phase speed caps |
| `playerPerformanceAdapter` | null | Unused extension point |

**Derived fairness** (see `src/utils/fairness.js`):

| Derived | Value |
|---|---|
| `jumpAirtimeFrames` | 40 |
| `peakHeightPx` | ≈ 133.33 |
| `safeGapFrames` | 61 |
| `groundFloatingMinFrames` | 107 |

### OBSTACLE_CONFIG

| Key | Value | Description | Status |
|---|---|---|---|
| `groundWidth` | 20 | Ground obstacle width (px) | Set — playability tuned |
| `groundHeight` | 38 | Ground obstacle height (px) | Set — playability tuned |
| `floatingWidth` | 40 | Floating obstacle width (future) | Set |
| `floatingHeight` | 30 | Floating obstacle height (future) | Set |
| `floatingYOffset` | 80 | Height above ground for floating (future) | Set |
| `spawnIntervalMinMs` | 1600 | Minimum spawn interval (ms) | Set — V1 |
| `spawnIntervalMaxMs` | 2600 | Maximum spawn interval (ms) | Set — V1 |

#### Fairness Verification (V1)

```
spawnIntervalMinMs × (initialSpeed / 1000) = 1600 × 0.2 = 320px
PLAYER_CONFIG.width × 3 = 120px  → 320 >= 120 ✓
X-overlap duration = (40 + 20) / 200 = 0.30s
```

Units: spawn interval (ms) × speed (px/s) / 1000 = pixels traveled between spawns at minimum interval.

### FEEDBACK_CONFIG

| Key | Description | Status |
|---|---|---|
| `toastCooldownMs` | Global toast cooldown | DESIGN_PENDING |
| `hypeIntervalMs` | Generic hype interval | DESIGN_PENDING |
| `nearMissThresholdPx` | Distance for near miss detection | DESIGN_PENDING |

### SHIELD_CONFIG

| Key | Description | Status |
|---|---|---|
| `spawnIntervalMs` | Shield spawn interval | DESIGN_PENDING |
| `durationMs` | Shield active duration | DESIGN_PENDING |

### SCORE_CONFIG

| Key | Value | Description | Status |
|---|---|---|---|
| `pointsPerSpeedUnit` | 0.01 | Score multiplier per speed unit | Set |

### RETENTION_CONFIG

| Key | Purpose |
|---|---|
| `bestKey` | `neondash_best_v1` |
| `hasPlayedKey` | `neondash_has_played_v1` |
| `runnerSkinKey` | `neondash_runner_skin_v1` |
| `resetBestQueryParam` | `resetBest` |

### HAZARD_SKIN_CONFIG

Ground skins: `block`, `spike`, `wideBlock`, `doubleSpike`  
Floating skins: `bar`, `orb`, `gate`, `laser`

Wide skin gates: `wideBlock.minReachPx = 118`, `doubleSpike.minReachPx = 108` (vs live jump reach at spawn speed).

### RUNNER_SKIN_CONFIG

Skins: `neonCube`, `neonOrb`, `dataShard`, `alienBlob`, `neonPod` — default `neonCube`.

### THEME_CONFIG

| ID | Label |
|---|---|
| `neonCity` | Neon City (default) |
| `spaceVoid` | Space Void |

Query param: `?theme=spaceVoid`. Console: `window.__neonDashSetTheme(id)`.

### UI_CONFIG (Game Over)

| Copy | Value |
|---|---|
| `playAgainCta` | `▶ PLAY AGAIN` |
| `gameOverHint` | `SPACE · TAP · CLICK` |
| `ptsToBeatBest(n)` | `{n} pts to beat best` |
| Overlay alpha | 0.68 |

## Active Configuration Summary (flags OFF)

| Parameter | Value |
|---|---|
| Fixed speed | 200 px/s |
| Jump force | -800 px/s |
| Gravity | 2400 px/s² |
| Default ground skin | block 20×38 px |
| Spawn interval | 1600–2600 ms (random ground) |
| Themes | neonCity default; render-only |

## Rules

1. Values marked `DESIGN_PENDING` must not be invented — leave as placeholder
2. Values marked `TODO` are known to be needed but not yet defined
3. Speed ramp code exists but is gated behind `difficultyDirectorV2` (OFF)
4. All config groups exported from single `gameConfig.js`
