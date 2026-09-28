# Neon Dash — UX Flow

## Primary Flow

```
BOOT → MENU → PLAY → RUN → DEATH → GAME OVER → RETRY → RUN
```

## Screen Responsibilities

### BOOT

- Initialize game systems
- Load configuration
- Prepare canvas
- Transition to MENU automatically
- **Duration:** < 1 second target

### MENU

- Display game title, tagline, polished layout
- Show personal best score (when available)
- Runner skin selector (`‹ label ›`) — arrows or tap row edges
- `PLAY` CTA + `SPACE / TAP` instruction
- Single action (outside skin row) starts run
- **No shop, no login**

### PLAY / RUN

- Active gameplay state
- HUD visible: current score, optional speed indicator
- Input: Space / tap = jump
- No pause button in foundation (PAUSED state reserved)

### DEATH (DYING)

- Brief transition state
- Triggered on obstacle collision
- **Duration:** DESIGN_PENDING (target: 0.3–0.5s)
- Leads to GAME OVER

### GAME OVER (UX V1 — implemented)

**Visual hierarchy (prominence):**

1. `▶ PLAY AGAIN` CTA (dominant; only continuous pulse animation)
2. Current score (large)
3. `NEW BEST!` (cyan, one-shot pop) **or** `N pts to beat best` (static)
4. Best score (secondary)
5. `GAME OVER` label (small, static, not dominant)
6. `SPACE · TAP · CLICK` (instruction)

**Behavior:**

- Space / click / tap anywhere on overlay → instant retry → `PLAYING`
- **Does not** return to Start Screen
- Preserves runner skin, theme, persisted best score
- No extra navigation, settings, or selectors on Game Over
- Death shake/flash unchanged; flash not drawn over Game Over UI layer

### RETRY

- Resets run state (see Gameplay Spec reset requirements)
- Transitions directly to PLAYING
- No intermediate loading

## State Diagram

```
┌──────┐     ┌──────┐     ┌─────────┐
│ BOOT │────▶│ MENU │────▶│ PLAYING │
└──────┘     └──────┘     └────┬────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
               ┌────────┐ ┌───────┐ ┌───────────┐
               │ PAUSED │ │ DYING │ │ GAME_OVER │
               └────────┘ └───┬───┘ └─────┬─────┘
                              │           │
                              ▼           │
                         ┌──────────┐     │
                         │GAME_OVER │◀────┘
                         └────┬─────┘
                              │ retry
                              ▼
                         ┌─────────┐
                         │ PLAYING │
                         └─────────┘
```

## UX Principles

- Zero friction retry — one input to restart
- Score always visible during run
- Death is clear and immediate
- No modal dialogs or confirmation prompts
- Touch-friendly tap targets (minimum 44px for any interactive UI)

## Not Yet Implemented

- Pause menu
- Settings screen
- Tutorial overlay
- Animated transitions
