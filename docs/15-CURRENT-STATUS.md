# Neon Dash — Current Status

> Last updated: 2026-09-28

## Project Phase

**Content V1 + Game Over UX V1 complete** — modular HTML5 canvas runner with feature-flagged expansion systems.

## Milestone Status

| Milestone | Code Status | Human Playtest |
|---|---|---|
| Core Gameplay V1 | ✅ IMPLEMENTED | Partially reviewed |
| Polish & Retention V1 | ✅ IMPLEMENTED | Partially reviewed |
| Difficulty Director V2 | ✅ IMPLEMENTED (flag OFF) | REQUIRES HUMAN PLAYTEST |
| Pattern System V2 | ✅ IMPLEMENTED (flag OFF) | REQUIRES HUMAN PLAYTEST |
| Content V1 | ✅ IMPLEMENTED | REQUIRES HUMAN PLAYTEST |
| Game Over UX V1 | ✅ IMPLEMENTED | Manually reviewed — acceptable; further validation possible |
| Background-tab / visibility protection | ✅ FIXED | Automated + partial browser review |

## Implementation Summary

| Area | Status |
|---|---|
| Modular architecture (`src/`) | ✅ Complete |
| Game state machine + loop | ✅ Complete |
| Fixed speed V1 (flags OFF) | ✅ Verified |
| Retention (best score, has_played, tap hint) | ✅ Complete |
| Start Screen polish | ✅ Complete |
| Difficulty Director (`src/difficulty/`) | ✅ Complete — `difficultyDirectorV2` default OFF |
| Pattern System (`src/patterns/`, `src/utils/fairness.js`) | ✅ Complete — `patternSystemV2` default OFF |
| Content V1 (runners, hazard skins, themes, P1–P10) | ✅ Complete |
| Game Over UX V1 | ✅ Complete |
| Background-tab / visibility protection | ✅ Complete |
| Unit / integration tests | ✅ **103/103 pass** (`npm test`) |
| Dev server with port fallback | ✅ Complete |

## Background-Tab / Visibility Protection (Fixed)

When `document.visibilityState === 'hidden'` during `PLAYING`:

- `GameLoop` pauses gameplay simulation (`pause()`)
- Score and best score do **not** increase
- Player physics do **not** advance
- Obstacles do **not** spawn or move
- Pattern timing do **not** advance
- Difficulty Director elapsed gameplay time (`_runElapsedSec`) do **not** advance

When the document becomes visible again:

- Gameplay resumes from the frozen state
- `GameLoop.resume()` rebases `_lastTime` — hidden duration is **not** simulated
- No catch-up score, spawn, pattern, or difficulty progression

**Implementation:** Page Visibility API (`document.visibilityState`, `visibilitychange`) integrated with existing `GameLoop` pause/resume in `Game.js`.

**Scope:** Prevents gameplay simulation from continuing while the game is backgrounded/hidden. **Not** a complete anti-cheat system — does not protect against DevTools manipulation, modified JavaScript, localStorage editing, memory tampering, or future online leaderboard exploits.

**UX:** No pause screen. Focus loss alone does **not** pause gameplay. `MENU` and `GAME_OVER` are unaffected.

## Content V1 (Implemented)

### Runners (draw-only, same physics/hitbox)

`neonCube`, `neonOrb`, `dataShard`, `alienBlob`, `neonPod` — selectable on Start Screen; persisted via `neondash_runner_skin_v1`.

### Hazard skins (draw-only)

| Family | Skins | Color |
|---|---|---|
| Ground | `block`, `spike`, `wideBlock`, `doubleSpike` | Magenta (`#ff0066`) |
| Floating | `bar`, `orb`, `gate`, `laser` | Yellow (`#ffff00`) |

- Collision uses obstacle rects (not visual shape).
- `spike` / `doubleSpike`: triangle visuals may be narrower; rect unchanged.
- `gate` / `laser`: beam band is collidable region.
- `wideBlock` / `doubleSpike`: gated by live jump reach vs `minReachPx` at spawn speed.

### Themes (render-only)

| ID | Label | Selection |
|---|---|---|
| `neonCity` | Neon City (Theme A) | Default |
| `spaceVoid` | Space Void (Theme B) | `?theme=spaceVoid` or `window.__neonDashSetTheme('spaceVoid')` |

Themes do **not** affect physics, collision, spawn timing, patterns, or difficulty.

## Game Over UX V1 (Implemented)

Visual hierarchy (prominence): **PLAY AGAIN CTA** → current score → New Best / pts-to-beat → Best → small static GAME OVER → `SPACE · TAP · CLICK`.

Retry: Space / click / tap anywhere → `PLAYING` (skips Start Screen); preserves runner, theme, best score.

## Not Implemented

| System | Status |
|---|---|
| Gap/River | NOT IMPLEMENTED |
| Player-performance-adaptive difficulty | NOT IMPLEMENTED (extension point only) |
| Feedback Priority V2 | NOT IMPLEMENTED |
| Shield | NOT IMPLEMENTED |
| Analytics / Monetization | NOT IMPLEMENTED |
| Audio | NOT IMPLEMENTED |
| Shop / progression / leaderboards | NOT IMPLEMENTED |

## Requires Human Playtest (Not PASS)

- All 5 runners readable at gameplay speed
- All 8 hazard skins distinguishable in both themes
- Theme readability; confirm no perceived gameplay change when switching themes
- P1–P10 distribution and visibility (requires `patternSystemV2` ON)
- P10 rarity vs other patterns
- Pattern fairness over multiple full runs (flags ON)
- `wideBlock` / `doubleSpike` fairness at run start
- Difficulty Director phase pacing (flag ON)
- Mobile Game Over CTA / tap UX
- Overall variety, readability, fun, long-run fairness

**Do not claim gameplay fun/fairness validation from automated tests alone.**

## Next Recommended Tasks

1. Human playtest with `patternSystemV2` + `difficultyDirectorV2` enabled
2. External review (ChatGPT) with playtest notes
3. Address any findings before platform submission prep
