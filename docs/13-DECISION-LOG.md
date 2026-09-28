# Neon Dash — Decision Log

## Template

| Field | Description |
|---|---|
| Decision ID | Unique identifier (#NNN) |
| Date | Decision date |
| Decision | What was decided |
| Reason | Why this decision |
| Alternatives | What else was considered |
| Expected impact | Predicted effect on product |
| Risk | Potential downsides |
| Owner | Who owns this decision |
| Status | active / superseded / reversed |

---

## #001 — Primary Run Duration = 30–120s

| Field | Value |
|---|---|
| Date | 2026-09-27 |
| Decision | Target primary run duration is 30–120 seconds |
| Reason | Casual audience; short sessions drive retry; aligns with portal session patterns |
| Alternatives | Longer runs (3–5 min), shorter runs (< 15s) |
| Expected impact | Higher retry rate, better session frequency |
| Risk | Skilled players may find early game too easy |
| Owner | Game Director |
| Status | active |

## #002 — One-More-Run > Maximum Survival

| Field | Value |
|---|---|
| Date | 2026-09-27 |
| Decision | Optimize for "one more run" feeling over maximum survival time |
| Reason | Retention metric; quick deaths with instant retry drive engagement |
| Alternatives | Optimize for longest runs, optimize for score chasing only |
| Expected impact | Higher runs/session, better D1 retention |
| Risk | May feel too easy or too punishing if not tuned correctly |
| Owner | Game Director |
| Status | active |

## #003 — Fair Randomness > Pure Randomness

| Field | Value |
|---|---|
| Date | 2026-09-27 |
| Decision | Obstacle patterns must be fair and learnable, not purely random |
| Reason | Unfair deaths destroy retry motivation |
| Alternatives | Pure random spawn, fixed sequences only |
| Expected impact | Deaths feel earned; higher retry rate |
| Risk | Pattern system adds complexity; needs validation |
| Owner | Game Director |
| Status | active |

## #004 — Difficulty Director > Simple Speed Ramp

| Field | Value |
|---|---|
| Date | 2026-09-27 |
| Decision | Use phase-based Difficulty Director instead of naive linear speed ramp |
| Reason | Better pacing control; supports LEARN/FLOW/PRESSURE/MASTERY phases |
| Alternatives | Linear speed increase, step-based difficulty levels |
| Expected impact | Smoother difficulty curve; better new player experience |
| Risk | More complex to implement and tune; needs playtesting |
| Owner | Game Director |
| Status | active (not yet implemented) |

## #005 — Shield Is Optional and Must Not Compensate for Unfair Difficulty

| Field | Value |
|---|---|
| Date | 2026-09-27 |
| Decision | Shield is an optional feature that must not mask poor difficulty design |
| Reason | Shield saves feel good only when difficulty is fair; otherwise they feel like RNG |
| Alternatives | No shield, shield as core mechanic, shield as monetization gate |
| Expected impact | Shield adds excitement without compromising fairness |
| Risk | If overused, reduces tension; if monetized, may feel pay-to-win |
| Owner | Game Director |
| Status | active (not yet implemented) |

## #006 — Vanilla JS Foundation, No Framework

| Field | Value |
|---|---|
| Date | 2026-09-27 |
| Decision | Use Vanilla JavaScript with ES Modules, no game framework |
| Reason | Portal compatibility, minimal dependencies, AI-friendly codebase |
| Alternatives | Phaser, PixiJS, custom engine |
| Expected impact | Smaller bundle, easier portal integration, simpler handoff |
| Risk | More manual work for rendering/input; no built-in physics |
| Owner | Senior Software Architect |
| Status | active |
