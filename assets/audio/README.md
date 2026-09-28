# Neon Dash — Audio V2 Assets

Place generated SFX files here. The game resolves paths from **semantic event IDs** in
`src/audio/audioAssetCatalog.js` — do not reference these filenames from gameplay code.

## Expected files (12 total, 10 semantic events)

```
assets/audio/
├── jump/
│   ├── jump_a.mp3
│   └── jump_b.mp3
├── land/
│   ├── land_a.mp3
│   └── land_b.mp3
├── hit/
│   └── hit.mp3
├── play/
│   └── play.mp3
├── ui_confirm/
│   └── ui_confirm.mp3
├── new_best/
│   └── new_best.mp3
├── near_miss/
│   └── near_miss.mp3
├── coin/
│   └── coin.mp3
├── shield/
│   └── shield.mp3
└── timed_gate/
    └── timed_gate.mp3
```

## Behavior

- **Variations:** `jump` and `land` alternate between `_a` and `_b` on each play.
- **Fallback:** If a file is missing or decode fails, `AudioSystem` plays the matching
  procedural tone from `AUDIO_CONFIG` in `gameConfig.js`.
- **Format:** `.mp3` by default (see `AUDIO_ASSETS.extension` in the catalog).

## Wired in gameplay today (Audio V1 flag)

| Semantic event | Trigger |
|---|---|
| `jump` | Successful jump during PLAYING |
| `land` | Player lands (grounded transition) |
| `hit` | Obstacle collision (death) |
| `play` | Start run / retry from menu or game over |
| `ui_confirm` | Runner carousel navigation on menu |
| `new_best` | Game over when score beats best |

## Reserved for Content V2 (assets only — no gameplay wiring yet)

| Semantic event | Future use |
|---|---|
| `near_miss` | Near-miss feedback |
| `coin` | Coin pickup |
| `shield` | Shield save / pickup |
| `timed_gate` | Timed gate pass/fail |
