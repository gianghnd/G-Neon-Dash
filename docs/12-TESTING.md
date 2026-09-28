# Neon Dash — Testing Strategy

## Philosophy

> **Code pass test ≠ gameplay tốt.**
> Gameplay vẫn cần human playtest.

Automated tests verify correctness of logic. Human playtests verify fun, feel, and retention.

## Test Layers

### Unit Tests

- **Target:** Pure logic modules (GameState, ScoreSystem, CollisionSystem, math utils)
- **Runner:** Node.js built-in test runner (`node:test`)
- **Location:** `/tests`
- **Run:** `npm test`

### Integration Tests

- **Target:** System interactions (Game + ScoreSystem, Spawn + Collision)
- **Status:** Future — add as systems mature
- **Location:** `/tests/integration/` (future)

### Gameplay Tests

- **Target:** Run simulation, state transition sequences
- **Status:** Future — requires more gameplay implementation
- **Approach:** Headless game loop with scripted input

### Playwright Tests (Future)

- **Target:** Browser rendering, input, full flow
- **Status:** NOT SET UP in foundation phase
- **When:** After core gameplay is playable

### Static Audits

- **Script:** `scripts/validate-project.js`
- **Checks:** File structure, required docs, config exports, no secrets
- **Run:** `npm run build`

### Manual Playtest

- **Required for:** Feel, difficulty, retention, UX flow
- **Frequency:** After every gameplay milestone
- **Owner:** Game Director + external reviewers

## Current Test Coverage

**Total: 92 tests / 16 suites** (last verified 2026-09-28)

| Module | Focus | Status |
|---|---|---|
| GameState | State transitions | ✅ |
| ScoreSystem | Score, best | ✅ |
| CollisionSystem | AABB overlap | ✅ |
| InputManager | Jump callbacks | ✅ |
| Game | V1 gameplay integration | ✅ |
| SpawnSystem | Spawn lifecycle | ✅ |
| Player | Jump physics | ✅ |
| Playability | Jump/obstacle clearance | ✅ |
| RetentionSystem | localStorage persistence | ✅ |
| PatternFairness | Fairness math, P1–P10, director | ✅ |
| HazardSkins | Rect dimensions, wide-skin gate | ✅ |

## Running Tests

```bash
npm test
```

## Adding Tests

1. Create test file in `/tests` matching module name: `ModuleName.test.js`
2. Import module from `../src/...`
3. Use `node:test` and `node:assert`
4. Update this document's coverage table
5. Include test results in handoff document

## CI (Future)

- Run `npm test` and `npm run build` on every push
- Block merge on test failure
- Not configured in foundation phase
