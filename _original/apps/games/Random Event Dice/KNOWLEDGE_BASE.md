# Random Event Dice - Knowledge Base

## Project Overview
A dice rolling game with event triggers, analytics dashboard, and multi-player leaderboard support.

## Key Files
| File | Purpose |
|------|---------|
| `script.js` | Main game logic (~1860 lines) |
| `tests.js` | Node.js test suite (46 tests) |
| `playwright.test.js` | E2E browser tests |
| `sample configuration files/` | JSON/XML test specs |

## Known Bug Patterns (Fixed 2026-01-07)

### 1. Copy-Paste Duplication Errors
Junior developers introduced duplicate lines during merge:
- Duplicate object properties: `rolls: this.currentTurnRolls,` × 2
- Duplicate comments: `// Simulate remaining game to end (skip to end)` × 2
- Duplicate function calls with incomplete first call

### 2. Missing Method Definitions
When adding calls to new methods like `this.checkWarning()`, ensure the method is actually defined in the class.

## Testing Strategy

### Unit Tests (tests.js)
Run via: `node tests.js`

Key test categories:
- SeededRNG determinism (seed 12345 → [3, 1, 3, 2, 2])
- SamplePool generation and expansion
- Event validation (impossible events detection)
- Analytics tracking (player rotation, leaderboard, heatmap)
- Time tracking integrity for Skip-to-End

### E2E Tests (playwright.test.js)
Run via: `npx playwright test`

Tests UI interactions:
- Start/Pause/Resume buttons
- Analytics panel toggle
- Settings modal
- Skip to End simulation

## Configuration Structure

```json
{
  "version": "2.0",
  "settings": {
    "interval": 1000,
    "resetDuration": 1000,
    "diceCount": 2,
    "diceSides": 6,
    "duration": 60,
    "volume": 0,
    "soundEnabled": true,
    "seed": 12345
  },
  "players": { "1": "Player1", ... },
  "eventDefinitions": [
    { "id": 1, "rules": [{ "dieIndex": 0, "operator": "==", "value": 1 }, ...] }
  ]
}
```

## Branch History
- `main`: Stable working version
- `dice_enhancements_02`: Added Pause/Resume, Analytics 2.0, then bug fixes

## QA Checklist for Future Changes
- [ ] Run `node tests.js` (expect 46 pass, 0 fail)
- [ ] Test in browser: Start → Pause → Resume → Skip to End
- [ ] Verify leaderboard populates correctly
- [ ] Check for duplicate lines in diffs before committing
