# Neon Dash — Gameplay Specification

> **Status:** Core Gameplay V1 implemented (functional prototype, not final tuning).

## Player

### Movement

- Character auto-runs horizontally (world scrolls toward player; player X fixed at 100px)
- Vertical movement via jump only
- No horizontal player control

### Auto-Run

- **V1:** Speed is **fixed** at `GAME_CONFIG.initialSpeed` (200 px/s)
- Speed ramp active only when `FEATURE_FLAGS.difficultyDirectorV2 === true` (OFF in V1)
- Speed affects score rate and obstacle approach rate

### Jump

- **Input:** Space (keyboard) or tap/click (pointer)
- **Behavior:** Instant upward velocity (`PLAYER_CONFIG.jumpForce = -800`)
- **Grounded check:** Jump only allowed when grounded (`jumpOnlyWhenGrounded: true`)
- **Measured jump height:** ~130px from ground line (discrete simulation at 120Hz)
- **Measured jump duration:** ~0.658s
- **Measured horizontal travel per jump:** ~132px at 200 px/s

### Gravity

- Constant downward acceleration: `PLAYER_CONFIG.gravity = 2400` px/s²
- Terminal velocity cap: `maxFallSpeed` — DESIGN_PENDING (not applied in V1)

### Collision

- AABB collision between player and obstacles
- Collision with any obstacle → DYING → GAME_OVER (immediate, no animation)
- No shield collision logic

## Obstacles

### V1 Spawn Rules

- **Only GROUND obstacles spawned** (`ObstacleType.GROUND`)
- Spawn interval randomized: `spawnIntervalMinMs` (1600) to `spawnIntervalMaxMs` (2600)
- Obstacles spawn at right edge (`canvasWidth`) and move left at current speed
- FLOATING type exists in code for future Pattern System but is **not spawned in V1**

### Ground Obstacles

- Sit on ground line (`PLAYER_CONFIG.groundY - groundHeight`)
- Width: 20px, Height: 38px (shorter than player height — tuned for jump arc clearance)
- Player must jump over

### Fairness Baseline (V1)

Minimum spawn interval travel distance:

```
spawnIntervalMinMs × (initialSpeed / 1000) = 1600 × 0.2 = 320px
```

This exceeds `PLAYER_CONFIG.width × 3` (120px) and `groundWidth × 3` (60px), providing adequate reaction window at V1 speed. X-overlap duration at fixed speed: `(playerWidth + groundWidth) / speed = 60 / 200 = 0.30s`. Full fairness validation requires human playtest.

## Score

### Scoring (V1)

```
score += speed × deltaTime × SCORE_CONFIG.pointsPerSpeedUnit
```

- At fixed speed 200: ~2 points/second
- Personal best tracked in-session (not persisted — TODO: personalBestV2)

### On Death

- `finalizeRun()` updates personal best if current score exceeds best

### On Retry

- Current score resets to 0
- Personal best preserved

## Game States

| State | Description |
|---|---|
| `BOOT` | Initial load, system initialization |
| `MENU` | Title screen, ready to start |
| `PLAYING` | Active run |
| `PAUSED` | Run frozen (future: pause menu) |
| `DYING` | Death transition (V1: immediate pass-through to GAME_OVER) |
| `GAME_OVER` | Death screen, score display, retry option |

### State Transitions (V1)

```
BOOT → MENU
MENU → PLAYING (Space/tap)
PLAYING → DYING (collision)
DYING → GAME_OVER (immediate)
GAME_OVER → PLAYING (Space/tap retry)
```

## Retry

### Restart Behavior

- Single action (Space / tap) from GAME_OVER → instant retry
- No loading screen, no browser reload required

### Reset Requirements (verified in tests)

On retry, reset:

- Player position, velocity, grounded state
- All active obstacles (cleared)
- Current score (→ 0)
- Spawn timer and next spawn interval
- Speed (→ `initialSpeed`)

Do NOT reset:

- Personal best score
- Configuration / feature flags

## Not Yet Implemented

- Speed ramp / Difficulty Director
- Floating obstacles in spawn
- Pattern-based spawn
- Death animation
- Pause menu
- Sound effects
- Movement feel tuning (NEEDS PLAYTEST)
- Score/obstacle balance (NEEDS PLAYTEST)
