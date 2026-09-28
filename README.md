# Neon Dash

HTML5 casual endless runner developed by **ASOL Game Factory**.

## Description

Neon Dash is a neon-styled endless runner where the player survives by jumping over ground and floating obstacles. The game optimizes for the **"one more run"** feeling — quick deaths, instant retries, and visible progress.

**Current phase:** Content V1 + Game Over UX V1 complete. Core gameplay, retention, expansion systems (feature-flagged), visual content, and polished Game Over flow are implemented in a modular ES module codebase.

See `docs/15-CURRENT-STATUS.md` for milestone status and pending human playtest items.

## Core Loop

```
RUN → DODGE → FAIL → RETRY
```

## Tech Stack

- HTML5 Canvas
- Vanilla JavaScript (ES Modules)
- Node.js built-in test runner
- No game framework

## Project Structure

```
neon-dash/
├── docs/                  # Game Knowledge Base
├── prompts/               # AI workflow prompts
├── src/
│   ├── core/              # Game, GameState, GameLoop
│   ├── config/            # gameConfig.js
│   ├── content/           # hazardSkins, ThemeRenderer
│   ├── difficulty/        # DifficultyDirector
│   ├── patterns/          # PatternLibrary, PatternSystem
│   ├── entities/          # Player, Obstacle
│   ├── systems/           # Collision, Score, Spawn, Retention, RunnerSkin
│   ├── input/             # InputManager
│   ├── ui/                # UIManager, TapHint
│   └── main.js
├── tests/                 # 103 automated tests
├── scripts/               # dev-server, validate
├── index.html
└── package.json
```

## How to Run

```bash
npm run dev
# Opens http://127.0.0.1:8080 (falls back 8081, 8765, 3000 if busy)
```

Query params:

- `?resetBest=1` — clear persisted best score
- `?theme=spaceVoid` — Space Void theme
- `?debug=1` — game-over telemetry table

## How to Test

```bash
npm test      # 103 tests
npm run build # project validation
```

## Feature Flags (default OFF)

In `src/config/gameConfig.js` → `FEATURE_FLAGS`:

- `difficultyDirectorV2` — phase-based speed + pattern cap
- `patternSystemV2` — P1–P10 pattern spawning

With both OFF: fixed 200 px/s, random ground spawn (V1 behavior).

## Development Workflow

1. Read relevant docs in `/docs`
2. Check `docs/15-CURRENT-STATUS.md`
3. Implement in `/src` per `docs/09-TECH-ARCHITECTURE.md`
4. Add tests in `/tests`
5. Run `npm test` and `npm run build`
6. Update `docs/16-HANDOFF.md` after milestones

## AI Workflow

| Agent | Role |
|---|---|
| **Claude** | Strategy, design, architecture |
| **Cursor** | Implementation, testing |
| **ChatGPT** | External review, playtest analysis |
| **Giang** | Final decision (Game Director) |

## Platforms (Target)

- YouTube Playables
- CrazyGames
- Poki

## License

UNLICENSED — ASOL Game Factory internal project.
