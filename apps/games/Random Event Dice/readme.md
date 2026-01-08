# Random Event Dice 2.0

A web-based dice rolling game with configurable event triggers, designed for random event generation in tabletop games or probabilistic simulations.

## Features

### Core Features
- **Customizable Dice**: Configure number of dice (1-10) and sides per die (2-100)
- **Event Triggers**: Define complex conditions using AND/OR logic
- **Pre-generated Samples**: Dice rolls are pre-computed for faster gameplay
- **Seeded RNG**: Optional deterministic seeds for testing and reproducibility
- **Timer with Extension**: Set game duration with option to add 10 more minutes
- **Pause/Resume**: Toggle game state without losing progress
- **JSON Import/Export**: Save and load complete configurations with validation
- **Event Validation**: Detects impossible event definitions with 3-second warning delay

### New in 2.1: Analytics Dashboard
- **Dark Theme**: Default dark mode with high-visibility event alerts
- **Player Tracking**: Configure players with custom names
- **Leaderboard**: Real-time rankings based on total rolls and time per player
- **Timeline**: Visual line plot and list of last 10 turns with rolls and time
- **Heatmap**: Law of Large Numbers visualization for 2d6 dice
- **Skip to End**: Simulate remaining game to calculate final analytics

### New in 2.2: UI Improvements
- **Unlimited Players**: No maximum player limit (previously capped at 15)
- **Side-by-Side Modal**: Player config and event logic panels displayed adjacently
- **Split Save Button**: "Save & Export" (saves + downloads JSON + closes) and "Save" (closes only)
- **Import Icon**: Upload icon (📥) for cleaner import button
- **Improved Heatmap Sizing**: Fixed sizing to fit within minimum 280px panel width
- **Mobile Responsive Modal**: Panels stack vertically on tablets and phones

## Quick Start

1. Open `index.html` in a browser
2. Click 📊 on the left to open the Analytics Dashboard
3. Configure settings (visible by default)
4. Click **Start Game**
5. Watch for event triggers and player rotation!

## Default JSON Configuration

```json
{
  "version": "2.0",
  "name": "",
  "settings": {
    "interval": 1000,
    "resetDuration": 1000,
    "diceCount": 2,
    "diceSides": 6,
    "duration": 60,
    "volume": 0,
    "soundEnabled": true,
    "seed": null
  },
  "players": {
    "1": "Joey", "2": "Brinlee", "3": "Braxton", "4": "Gavin",
    "5": "Hinckley", "6": "London", "7": "Bode", "8": "Macey",
    "9": "Ryder", "10": "Lily", "11": "Jack", "12": "Cole",
    "13": "Gracen", "14": "Connor", "15": "Friend"
  },
  "analytics": {
    "enableLeaderboard": true,
    "enableTimeline": true,
    "enableHeatmap": true,
    "panelWidth": 320
  },
  "eventDefinitions": [
    {
      "id": 1,
      "rules": [
        { "dieIndex": 0, "operator": "==", "value": 1 },
        { "dieIndex": 1, "operator": "==", "value": 1 }
      ]
    },
    {
      "id": 2,
      "rules": [
        { "dieIndex": 0, "operator": "==", "value": 2 },
        { "dieIndex": 1, "operator": "==", "value": 2 }
      ]
    },
    {
      "id": 3,
      "rules": [
        { "dieIndex": 0, "operator": "==", "value": 3 },
        { "dieIndex": 1, "operator": "==", "value": 3 }
      ]
    },
    {
      "id": 4,
      "rules": [
        { "dieIndex": 0, "operator": "==", "value": 4 },
        { "dieIndex": 1, "operator": "==", "value": 4 }
      ]
    },
    {
      "id": 5,
      "rules": [
        { "dieIndex": 0, "operator": "==", "value": 5 },
        { "dieIndex": 1, "operator": "==", "value": 5 }
      ]
    },
    {
      "id": 6,
      "rules": [
        { "dieIndex": 0, "operator": "==", "value": 6 },
        { "dieIndex": 1, "operator": "==", "value": 6 }
      ]
    }
  ]
}
```

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Roll Interval | Time between dice rolls (seconds) | 1.0 |
| Number of Dice | How many dice to roll | 2 |
| Sides per Die | Number of sides on each die | 6 |
| Duration | Game length in minutes | 60 |
| Enable Sound | Play audio on event trigger | On |
| Volume | Alert sound volume | 0% |
| Reset Duration | Pause after event (seconds) | 1.0 |
| Random Seed | Seed for deterministic testing | None |

## Analytics Dashboard

### Leaderboard
Shows all players ranked by total rolls received. Current player is highlighted.

### Timeline
Displays the last 10 completed turns with:
- Turn number
- Player name
- Number of rolls that turn
- Time elapsed that turn

### Heatmap (2d6 only)
Visual representation of dice roll distribution. Colors indicate deviation from expected uniform probability (2.78% per combination):
- Blue tones: Below expected
- Green: Near expected
- Red/Orange tones: Above expected

### Skip to End
Simulates the remaining pre-generated samples instantly to calculate final analytics without waiting for real-time gameplay.

## Advanced Event Logic

Click **Advanced Event Settings** to create custom event rules:

- **Event Definition**: A set of conditions that must ALL be true (AND logic)
- **Multiple Events**: If ANY event definition matches, an alert triggers (OR logic)
- **Operators**: `==` (equals), `!=` (not equals), `>` (greater than), `<` (less than)

### Player Turns
When an event triggers, the current player's turn ends and the next player begins. Analytics track:
- Rolls per turn
- Time per turn
- Total statistics per player

## Running Tests

### Unit Tests (Node.js)
```bash
node tests.js
```

Or open `tests.html` in a browser.

Unit tests cover:
- SeededRNG determinism
- SamplePool pre-generation
- Event validation (impossible events)
- JSON config roundtrip
- Event matching logic
- **AnalyticsTracker**: Player rotation, timeline, heatmap, leaderboard, reset

### Playwright Seeded Tests

Prerequisites:
```bash
# From the Games 01 root directory
npm install
npx playwright install chromium
```

Run seeded tests (16 tests, ~4 seconds):
```bash
npx playwright test apps/games/Random\ Event\ Dice/seeded-tests.spec.js --project=tests
```

Run with headed browser (visible):
```bash
npx playwright test apps/games/Random\ Event\ Dice/seeded-tests.spec.js --project=tests --headed
```

**Test Categories:**

- **Configuration File Validation** (5 tests): Validates JSON structure of sample configs
- **Seeded RNG Determinism** (3 tests): Programmatic tests verifying identical sequences
- **Analytics Tracker** (4 tests): Unit tests for rolls, heatmap, player rotation, leaderboard
- **Skip to End** (2 tests): Verifies `simulateToEnd` produces deterministic results
- **Event Definition Logic** (2 tests): Validates doubles trigger and non-doubles don't
- **Player Configuration** (3 tests): Player names reflected in dashboard and exports
- **Dashboard Panel Width** (3 tests): Panel width settings and default values
- **Reset Duration** (4 tests): Seconds format and legacy ms import compatibility
- **Unlimited Player Count** (3 tests): Supports 25+ players without limits
- **Panel Width Enforcement** (2 tests): Min 280px, max 600px enforcement
- **Heatmap Sizing** (2 tests): Container max-width and grid column sizing
- **Modal Layout** (2 tests): Side-by-side panels and split Save/Export buttons

All tests use programmatic configuration injection (`page.evaluate`) for minimal UI navigation and maximum speed.

### Demo Recording

Generate a comprehensive video walkthrough of all games:
```bash
npx playwright test demo-recording.spec.js --project=demo
```

**Demo Coverage:**
- Game Hub Landing Page (hover effects on all games)
- Random Event Dice (analytics, settings, advanced modal, 10s gameplay, pause/resume, skip to end)
- 2048 (settings, gameplay, hint, AI play, dashboard pages)
- Sliding Puzzle (settings, advanced mode, hint, AI solve)

The recording features:
- Deliberate pauses for audience viewing
- Skip logic for error resilience
- Fast roll settings (0.1s interval) for efficient demo
- Complete ~2 minute video output to `test-results/` directory

## Files

| File | Description |
|------|-------------|
| `index.html` | Main game UI |
| `style.css` | Dark theme styling |
| `script.js` | Game logic with AnalyticsTracker |
| `tests.js` | Comprehensive unit test suite (44 tests) |
| `tests.html` | Browser test runner |
| `seeded-tests.spec.js` | Playwright E2E tests with seeded configs |
| `playwright.test.js` | Legacy Playwright tests |
| `sample configuration files/` | Example JSON configs for testing |

## Sample Configuration Files

| File | Description |
|------|-------------|
| `analytics-test-seed-12345.json` | Full config with 15 players, seed 12345 |
| `minimal-test-seed-42.json` | 3 players, seed 42, double 6s only |
| `random-event-dice-config.json` | Standard doubles configuration |
| `only 6 doubles.json` | Only triggers on double 6s |
| `impossible.json` | Contains impossible event (for validation testing) |
