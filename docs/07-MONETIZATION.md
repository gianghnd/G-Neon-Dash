# Neon Dash — Monetization

> **Status:** Framework/documentation only. NOT IMPLEMENTED.

## Principles

1. **Monetization must not break core gameplay**
2. Ads/continues are optional, never forced mid-run without player consent
3. Portal-specific rules take precedence (YouTube Playables ≠ CrazyGames ≠ Poki)
4. No monetization until core loop is validated by playtesting
5. Feature flag: `monetizationV1` — default: OFF

## Future Possibilities

### Rewarded Ads

- Watch ad for continue (second chance)
- Watch ad for cosmetic unlock
- Player-initiated only

### Continue / Second Chance

- One continue per run via rewarded ad
- Does not apply during DYING — only at GAME OVER
- Must not trivialize difficulty

### Interstitial Ads

- Between runs (after GAME OVER, before retry)
- Frequency capped per session
- Never during active run

### Cosmetic

- Character skins, trail effects, background themes
- No gameplay advantage
- Portal-dependent availability

### Portal-Specific Monetization

| Portal | Notes |
|---|---|
| YouTube Playables | Follow YouTube ad policies; no external links |
| CrazyGames | SDK integration for ads and analytics |
| Poki | Poki SDK for ads; specific build requirements |

## Decision Framework

Before implementing any monetization feature:

| Field | Required |
|---|---|
| Reason | Why this monetization approach? |
| Expected player impact | How does it affect retention? |
| Technical scope | SDK, build changes, testing |
| Acceptance criteria | Measurable success conditions |
| Test plan | A/B or soft launch plan |

## Non-Goals

- Pay-to-win mechanics
- Energy/stamina systems
- Loot boxes or gacha
- Forced ads mid-run

## Acceptance Criteria (Future)

- [ ] Core loop validated before any monetization ships
- [ ] Game Director approval for each monetization feature
- [ ] Portal SDK integrated without breaking vanilla JS architecture
- [ ] Feature flag allows full disable for testing
