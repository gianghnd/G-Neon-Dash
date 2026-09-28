# Neon Dash — Pattern Library

> **Status:** IMPLEMENTED in `src/patterns/PatternLibrary.js` (gated by `patternSystemV2`, default OFF).

## Purpose

Validated obstacle sequences executed by `SpawnSystem` when `FEATURE_FLAGS.patternSystemV2 === true`. Spacing is **frame-based**; pixel gaps are computed at **live spawn speed** via `src/utils/fairness.js`.

## Selection Pipeline (`PatternSystem`)

1. **Eligibility** — `pattern.minDifficulty <= patternComplexityCap` (from Difficulty Director when enabled)
2. **Fairness** — `validatePatternAtSpeed(pattern, speedAtSpawn)` at current speed
3. **Random** — weighted pick; excludes immediate repeat when alternatives exist
4. **Fallback** — `P1` if nothing survives

## Fairness Constants (from code)

Source: `PLAYER_CONFIG.jumpForce = -800`, `gravity = 2400`, `DIFFICULTY_CONFIG.physicsFps = 60`

| Constant | Value |
|---|---|
| `jumpAirtimeFrames` | 40 |
| `peakHeightPx` | ≈ 133.33 |
| `landingStabilizeFrames` | 6 |
| `reactionFloorFrames` | 15 |
| `safeGapFrames` | 61 |
| `groundFloatingMinFrames` | 107 |

Spacing px at speed S: `(frames / 60) × S`

## Pattern Catalog P1–P10

| ID | Name | minDifficulty | weight | Elements |
|---|---|---:|---:|---|
| P1 | Single Ground | 0 | 1 | ground/block |
| P2 | Single Floating | 0 | 1 | floating/bar |
| P3 | Single Spike | 0.2 | 1 | ground/spike |
| P4 | Ground→Ground | 0.35 | 1 | ground/block → ground/block (61 frames) |
| P5 | Ground→Floating | 0.35 | 1 | ground/block → floating/bar (107 frames) |
| P6 | Floating→Ground | 0.35 | 1 | floating/bar → ground/block (61 frames) |
| P7 | Ground→Spike | 0.55 | 1 | ground/spike → ground/block (61 frames) |
| P8 | Ground→Ground→Floating | 0.55 | 1 | block → block (61) → bar (107) |
| P9 | Floating→Ground→Floating | 0.55 | 1 | bar → block (61) → bar (107) |
| P10 | Alternating Spike/Floating | 0.85 | **0.25** | spike → bar (107) → spike (61) → bar (107) |

Fallback ID: `P1`

## Element Schema

```javascript
{ type: 'ground' | 'floating', skin: string, tMinFrames: number }
```

- First element: `tMinFrames: 0`
- Subsequent elements: minimum frame spacing from previous element

## Validation Rules

- Consecutive jump-requiring elements: `tMinFrames >= safeGapFrames` (61)
- Ground→floating transitions: `tMinFrames >= groundFloatingMinFrames` (107)
- Recomputed at **live** `speedAtSpawn` — never cached from earlier in run

## When Flags Are OFF

`SpawnSystem` uses legacy random ground spawn (1600–2600 ms interval). Hazard skins still vary on ground spawns. Floating patterns require `patternSystemV2` ON.

## Human Playtest Status

Pattern fairness and P10 rarity distribution: **REQUIRES HUMAN PLAYTEST** — not validated by automation alone.
