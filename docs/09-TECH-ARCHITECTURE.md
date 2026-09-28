# Neon Dash — Technical Architecture

## Stack

- HTML5 Canvas
- Vanilla JavaScript (ES Modules)
- Node.js built-in test runner (development/testing)
- No game framework

## Source Structure

```
src/
├── core/           # Game orchestration, state machine, loop
│   ├── Game.js
│   ├── GameState.js
│   └── GameLoop.js
├── config/         # Configuration values (tuning)
│   └── gameConfig.js
├── entities/       # Game objects (player, obstacles)
│   ├── Player.js
│   └── Obstacle.js
├── systems/        # Game logic systems
│   ├── CollisionSystem.js
│   ├── ScoreSystem.js
│   └── SpawnSystem.js
├── input/          # Input handling
│   └── InputManager.js
├── ui/             # UI rendering and screen management
│   └── UIManager.js
├── utils/          # Shared utilities
│   └── math.js
└── main.js         # Entry point
```

## Reserved Directories (Not Yet Created)

```
src/difficulty/     # Difficulty Director (future)
src/patterns/       # Pattern engine (future)
src/feedback/       # Feedback priority system (future)
src/audio/          # Sound effects and music (future)
src/analytics/      # Event tracking (future)
```

## Module Responsibilities

### core/

| Module | Responsibility |
|---|---|
| `Game.js` | Orchestrates systems, owns game lifecycle |
| `GameState.js` | State machine with valid transitions |
| `GameLoop.js` | RequestAnimationFrame loop with update/render |

### config/

| Module | Responsibility |
|---|---|
| `gameConfig.js` | All tunable game values, grouped by domain |

### entities/

| Module | Responsibility |
|---|---|
| `Player.js` | Player state, jump, physics, render |
| `Obstacle.js` | Obstacle state, types, render |

### systems/

| Module | Responsibility |
|---|---|
| `CollisionSystem.js` | AABB collision detection |
| `ScoreSystem.js` | Score tracking and personal best |
| `SpawnSystem.js` | Obstacle spawning (placeholder → pattern-aware) |

### input/

| Module | Responsibility |
|---|---|
| `InputManager.js` | Keyboard and pointer input abstraction |

### ui/

| Module | Responsibility |
|---|---|
| `UIManager.js` | Menu, HUD, game-over screen rendering |

## Design Principles

1. **No module without clear responsibility** — don't create folders for aesthetics
2. **Configuration over hardcode** — tuning values live in `gameConfig.js`
3. **Testable without browser** — core logic testable in Node.js
4. **Feature flags for incremental rollout** — see `11-FEATURE-FLAGS.md`
5. **Minimal dependencies** — vanilla JS only for runtime

## Data Flow

```
InputManager → Game → Systems → Entities
                  ↓
              GameLoop (update/render)
                  ↓
              UIManager (overlay)
```

## Entry Point

`src/main.js`:

1. Get canvas element
2. Create Game instance
3. Initialize systems
4. Start game loop

No game logic in `main.js`.

## Testing

- Unit tests in `/tests` using Node.js built-in test runner
- Tests import ES modules directly
- Browser-specific code (InputManager DOM binding) tested with minimal mocks

## Build

No transpilation required. ES modules served directly.

Validation script checks project structure and file existence.
