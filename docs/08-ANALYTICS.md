# Neon Dash — Analytics

> **Status:** Design document only. NOT IMPLEMENTED.

## Purpose

Track player behavior to validate design hypotheses and measure retention KPIs.

## Future Events

| Event | Trigger | Properties |
|---|---|---|
| `game_start` | Run begins | `session_id`, `platform` |
| `game_death` | Player dies | `run_duration`, `score`, `speed`, `difficulty`, `pattern_id`, `death_reason` |
| `game_retry` | Player retries | `time_since_death`, `session_run_count` |
| `new_high_score` | Best beaten | `score`, `previous_best`, `run_duration` |
| `near_miss` | Near miss detected | `obstacle_type`, `distance`, `speed` |
| `shield_collected` | Shield picked up | `run_duration`, `speed` |
| `shield_saved` | Shield prevents death | `run_duration`, `speed`, `obstacle_type` |

## Event Properties

| Property | Type | Description |
|---|---|---|
| `run_duration` | number (seconds) | Time survived in run |
| `score` | number | Final or current score |
| `speed` | number | Speed at event time |
| `difficulty` | number | Difficulty level at event time |
| `pattern_id` | string | Active pattern ID (future) |
| `death_reason` | string | e.g. `obstacle_collision`, `fall` |

## KPIs

| KPI | Description | Target |
|---|---|---|
| Median Run Duration | 50th percentile run length | 30–120s |
| Runs / Session | Average runs per session | DESIGN_PENDING |
| Retry Rate | % of deaths followed by retry | > 80% |
| 30s Survival % | % of runs reaching 30s | DESIGN_PENDING |
| 60s Survival % | % of runs reaching 60s | DESIGN_PENDING |
| 120s Survival % | % of runs reaching 120s | DESIGN_PENDING |
| D1 Retention | Day 1 return rate | DESIGN_PENDING |
| D3 Retention | Day 3 return rate | DESIGN_PENDING |
| D7 Retention | Day 7 return rate | DESIGN_PENDING |

## Implementation Notes

- Analytics module: `src/analytics/` (reserved, not yet created)
- Feature flag: `analyticsV1` — default: OFF
- Must not block game loop or add latency to input
- Portal-specific SDK wrappers (CrazyGames, Poki) as adapters

## Privacy

- No PII collection without portal requirements
- Follow GDPR/COPPA as applicable per portal
- Local-only mode when analytics disabled

## Acceptance Criteria (Future)

- [ ] All events fire at correct game state transitions
- [ ] Properties accurately reflect game state
- [ ] Analytics disabled via feature flag has zero overhead
- [ ] Portal SDK integration tested on each target platform
