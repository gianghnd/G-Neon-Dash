# Neon Dash — Feature Flags

## Philosophy

Major features ship behind feature flags. Default is **OFF** until the feature is implemented, tested, and approved by Game Director.

## Flag Definitions

| Flag | Default | Description |
|---|---|---|
| `difficultyDirectorV2` | OFF | Phase-based difficulty orchestration |
| `patternSystemV2` | OFF | Pattern library spawn engine |
| `feedbackPriorityV2` | OFF | Priority-based feedback arbitration |
| `nearMissV2` | OFF | Near miss detection and hype |
| `shieldSystem` | OFF | Shield pickup and save mechanic |
| `personalBestV2` | OFF | Enhanced personal best tracking/persistence |
| `analyticsV1` | OFF | Analytics event tracking |
| `monetizationV1` | OFF | Ads and monetization features |

## Usage Pattern

```javascript
import { FEATURE_FLAGS } from '../config/gameConfig.js';

if (FEATURE_FLAGS.difficultyDirectorV2) {
  // Use Difficulty Director
} else {
  // Fallback to simple speed ramp
}
```

## Rules

1. Never ship a feature as ON by default without Game Director approval
2. Code behind a flag must not break the game when flag is OFF
3. Removing a flag requires: feature validated, tests passing, handoff complete
4. Flag names use camelCase matching the feature name

## Location

Feature flags defined in `src/config/gameConfig.js` under `FEATURE_FLAGS`.

## Lifecycle

```
OFF (default) → implement → test → playtest → Game Director approval → ON → validate → remove flag
```
