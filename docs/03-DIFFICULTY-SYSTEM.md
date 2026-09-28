# Neon Dash — Difficulty System

> **Status:** IMPLEMENTED in `src/difficulty/DifficultyDirector.js` (gated by `difficultyDirectorV2`, default OFF).

## Overview

The **Difficulty Director** maps elapsed run time and current speed to a difficulty scalar and `patternComplexityCap`. **Player-performance adaptation is NOT implemented** — `DIFFICULTY_CONFIG.playerPerformanceAdapter` is reserved (null).

## When Flag Is OFF (V1 default)

- Speed fixed at `GAME_CONFIG.initialSpeed` (200 px/s)
- `patternComplexityCap` passed as 1 to SpawnSystem (does not restrict P1–P10 eligibility by director)
- Legacy random ground spawn (unless `patternSystemV2` ON separately)

## When Flag Is ON

- Speed ramps via `speedIncreaseRate` toward phase speed cap
- `evaluateDifficulty(elapsedSec, currentSpeed)` returns:
  - `phase`: LEARN | FLOW | PRESSURE | MASTERY
  - `difficulty`: 0..1
  - `patternComplexityCap`: 0..1
  - `targetSpeedCap`: phase-limited max speed

## Phase Bands (`DIFFICULTY_CONFIG.phaseThresholdsSec`)

| Phase | Time | Speed cap (`phaseSpeedCaps`) |
|---|---|---|
| LEARN | 0–30s | 250 |
| FLOW | 30–60s | 350 |
| PRESSURE | 60–120s | 500 |
| MASTERY | 120s+ | 600 |

`patternComplexityMaxSpeed`: 600

## Inputs (implemented)

| Input | Used |
|---|---|
| `survivalTime` (elapsed sec) | ✅ |
| `speed` | ✅ |
| `playerPerformance` | ❌ extension point only |

## Outputs (implemented)

| Output | Description |
|---|---|
| `difficulty` | 0..1 scalar |
| `patternComplexityCap` | Gates pattern `minDifficulty` |
| `targetSpeedCap` | Caps speed ramp |
| `phase` | LEARN / FLOW / PRESSURE / MASTERY |

## Human Playtest Status

Phase pacing, LEARN safety, PRESSURE fairness: **REQUIRES HUMAN PLAYTEST**.

## Historical Design Notes

Original design hypotheses (below) remain for reference; phase boundaries are now coded in `DIFFICULTY_CONFIG` but **feel** is unvalidated.

### LEARN (0–30s)

- Low speed cap, simple patterns eligible

### FLOW (30–60s)

- Moderate speed; floating patterns eligible via director cap

### PRESSURE (60–120s)

- Higher speed; multi-obstacle patterns

### MASTERY (120s+)

- Near-max speed; P10 eligible (minDifficulty 0.85)
