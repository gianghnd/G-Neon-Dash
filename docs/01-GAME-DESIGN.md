# Neon Dash — Game Design

## Game Vision

Neon Dash is a neon-styled endless runner where the player survives as long as possible by jumping over ground and floating obstacles. The game optimizes for the **"one more run"** feeling — quick deaths, instant retries, and visible progress.

## Player Experience

- **Immediate engagement:** Run starts within seconds of opening
- **Simple controls:** Space or tap to jump — nothing else during a run
- **Clear feedback:** Score visible at all times; death is obvious; retry is one action
- **Fair challenge:** Deaths feel earned, not random (future: Difficulty Director + Pattern System)
- **Short sessions:** Most runs end in 30–120 seconds; skilled players push further

## Core Loop

```
RUN → DODGE → FAIL → RETRY
```

1. **RUN** — Character auto-runs; world scrolls
2. **DODGE** — Player jumps to avoid ground and floating obstacles
3. **FAIL** — Collision with obstacle = death
4. **RETRY** — Instant restart; score resets; best score persists

## Difficulty Philosophy

- Difficulty should come from **player mastery**, not unfair randomness
- Speed and obstacle density increase over time, but always within learnable bounds
- Future **Difficulty Director** will orchestrate pacing across LEARN → FLOW → PRESSURE → MASTERY phases
- Shield (future) must not compensate for poor difficulty design

## Feedback Philosophy

- Feedback supports gameplay awareness without distracting from the run
- Priority-based arbitration (future): death > high score > shield save > near miss > hype
- Cooldowns prevent feedback spam
- Death is a full-screen game-over event, not a toast

## Replayability

- Personal best score tracking
- Increasing speed creates natural escalation
- Future: pattern variety, near-miss hype, milestone celebrations
- Fast retry removes friction between attempts

## One-More-Run Philosophy

Primary design objective is **"One more run"**, not **"Survive as long as possible."**

| Optimize For | Do Not Optimize For |
|---|---|
| Quick retry | Longest possible runs |
| Visible progress (score, best) | Feature count |
| Fair, learnable patterns | Pure randomness |
| 30–120s primary run duration | Infinite scaling without pacing |

## Design Constraints

- HTML5 Canvas, Vanilla JavaScript — no heavy frameworks
- Must run on portal embed environments (YouTube Playables, CrazyGames, Poki)
- Touch + keyboard input required
- Configuration-driven tuning
- Feature flags for incremental rollout

## Future Systems

| System | Status | Notes |
|---|---|---|
| Difficulty Director | NOT IMPLEMENTED | Phase-based pacing |
| Pattern Library | NOT IMPLEMENTED | Fair obstacle sequences |
| Feedback Priority | NOT IMPLEMENTED | Toast arbitration |
| Shield | NOT IMPLEMENTED | Optional safety net |
| Analytics | NOT IMPLEMENTED | Event tracking |
| Monetization | NOT IMPLEMENTED | Portal-specific ads |
| Near Miss | NOT IMPLEMENTED | Hype feedback |
