# Neon Dash — Feedback System

> **Status:** Design document only. NOT IMPLEMENTED in foundation phase.

## Purpose

Provide in-run feedback that reinforces player skill and progress without distracting from core gameplay.

## Feedback Types

| Type | Priority | Description |
|---|---|---|
| Death | 100 | Full game-over screen — NOT a toast |
| New High Score | 90 | Player beats personal best |
| Shield Save | 80 | Shield absorbs a would-be death |
| Major Near Miss | 60 | Close call with obstacle |
| Speed Milestone | 50 | Speed threshold reached |
| Generic Hype | 20 | Ambient encouragement |

## Priority Concept

Higher priority feedback suppresses lower priority during display:

```
Death (100) > New High Score (90) > Shield Save (80) > Near Miss (60) > Speed Milestone (50) > Generic Hype (20)
```

Death is handled by the game-over flow, not the toast/feedback queue.

## Arbitration Rules

1. Only one toast visible at a time
2. Incoming higher-priority event interrupts lower-priority display
3. Same-priority events: latest wins if within cooldown
4. Generic Hype suppressed if any higher event occurred in last N seconds

## Cooldown

| Type | Cooldown |
|---|---|
| New High Score | 0 (always show) |
| Shield Save | 3s |
| Major Near Miss | 2s |
| Speed Milestone | 5s |
| Generic Hype | 8s |

> Exact values: DESIGN_PENDING — tune via `FEEDBACK_CONFIG`

## Display Duration

| Type | Duration |
|---|---|
| New High Score | 2s |
| Shield Save | 1.5s |
| Major Near Miss | 1s |
| Speed Milestone | 1.5s |
| Generic Hype | 1s |

## Event Suppression

- During DYING / GAME_OVER states: suppress all toasts
- During PAUSED: suppress all toasts
- During LEARN phase (future): suppress Generic Hype

## Configuration

Values tunable via `FEEDBACK_CONFIG` in `gameConfig.js`:

- `toastCooldown`
- `hypeInterval`
- `nearMissChance`
- Priority thresholds

## Feature Flag

`feedbackPriorityV2` — default: OFF

## Acceptance Criteria (Future)

- [ ] No two toasts visible simultaneously
- [ ] Priority arbitration works correctly under rapid events
- [ ] Cooldowns prevent spam
- [ ] Death never shows as toast
- [ ] All timing values config-driven
