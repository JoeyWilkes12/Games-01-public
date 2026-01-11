# Game Hub - Testing Documentation

This document describes how to run all tests for the Game Hub React application.

## Prerequisites

1. **Node.js** (v18+)
2. **Install dependencies**: `npm install`
3. **Install Playwright browsers**: `npx playwright install chromium`

---

## Quick Start

```bash
# Run all tests (starts dev server automatically)
./run-all-tests.sh

# Run with visible browser
./run-all-tests.sh --headed

# Run full demo recording
./run-all-tests.sh --demo
```

---

## Test Categories

### 1. React Migration Tests (Primary)
Comprehensive tests for the React + Vite + Tailwind migration.

```bash
# Run React tests (auto-starts Vite dev server)
./run-all-tests.sh --tests

# Or manually
npx playwright test tests/react-migration.spec.js --project=react-tests
```

Tests include:
- **Navigation**: Hub → game pages, back navigation
- **2048**: Grid display, keyboard controls, hint, AI link
- **Bank**: Roll dice, scoreboard, exit confirmation
- **Sliding Puzzle**: Both grids, advanced mode toggle
- **Random Event Dice**: Timer, start/stop, dashboard
- **Definitions/Dashboard/Research**: Page load, tab navigation
- **Mobile**: Responsive layout, touch targets

### 2. Seeded Game Tests
Deterministic tests for game logic validation.

```bash
# Bank seeded tests
npx playwright test tests/seeded-bank.spec.js --project=react-tests

# 2048 seeded tests
npx playwright test tests/seeded-2048.spec.js --project=react-tests
```

**Bank tests include:**
- Initial game state verification
- Dice rolling and bank updates
- Probability cheatsheet display
- Undo functionality
- Settings panel
- Exit confirmation modal

**2048 tests include:**
- 4x4 grid rendering
- Arrow key input handling
- Hint button functionality
- Auto-play toggle
- Settings modal
- AI research link navigation

### 3. Mobile Responsiveness Tests
Runs React tests on iPhone 14 viewport.

```bash
npx playwright test tests/react-migration.spec.js --project=mobile-tests
```

### 3. Split Demo Tests (Parallel)
Individual game demos that run in parallel for faster execution.

```bash
# Run parallel demos
./run-all-tests.sh --split

# With speed modifier (2x faster)
./run-all-tests.sh --split --speed=2.0
```

### 4. Full Demo Recording
A complete sequential walkthrough of the entire application.

```bash
# Run full demo (slower, sequential)
./run-all-tests.sh --demo

# With visible browser
./run-all-tests.sh --demo --headed
```

---

## Command-Line Options

| Option | Description |
|--------|-------------|
| `--tests` | Run React migration tests |
| `--split` | Run split demo tests (parallel) |
| `--demo` | Run full demo recording (sequential) |
| `--all` | Run all tests (tests + split + demo) |
| `--headed` | Run in visible browser mode |
| `--speed=N` | Speed multiplier (e.g., `--speed=2.0` for 2x faster) |
| `--report` | Open HTML report after tests |

---

## Test File Structure

```
icy-gemini/
├── tests/
│   ├── react-migration.spec.js  # React app tests
│   ├── demo-red.spec.js         # Random Event Dice demo
│   ├── demo-2048.spec.js        # 2048 demo
│   └── demo-sliding-puzzle.spec.js # Sliding Puzzle demo
├── _original/apps/games/        # Legacy vanilla JS tests
│   ├── Random Event Dice/
│   │   ├── seeded-tests.spec.js
│   │   └── new-seeded-tests.spec.js
│   └── Bank/
│       └── seeded-tests.spec.js
├── demo-recording.spec.js       # Full sequential demo
├── playwright.config.js         # Test configuration
└── run-all-tests.sh            # Test runner script
```

---

## Playwright Projects

| Project | Description | Auto-starts Dev Server |
|---------|-------------|------------------------|
| `react-tests` | React navigation & functionality | ✅ Yes |
| `mobile-tests` | React on iPhone 14 viewport | ✅ Yes |
| `split-demos` | Parallel game demos | ✅ Yes |
| `demo` | Full sequential demo | ✅ Yes |
| `legacy-tests` | Original vanilla JS tests | ❌ No (file://) |

---

## Running Individual Tests

```bash
# Specific test file
npx playwright test tests/react-migration.spec.js --project=react-tests

# Specific test by name
npx playwright test --project=react-tests --grep="2048"

# With visible browser
npx playwright test --project=react-tests --headed

# Generate video
npx playwright test --project=react-tests --video=on
```

---

## View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

---

## Dev Server

The Playwright config automatically starts the Vite dev server:

```javascript
// playwright.config.js
webServer: {
  command: 'npm run dev -- --port 5173',
  url: 'http://localhost:5173/Games-01-public/',
  reuseExistingServer: !process.env.CI,
}
```

If you already have the dev server running, it will reuse it (unless in CI mode).

---

## Examples

```bash
# Quick verification
./run-all-tests.sh

# Full verification with visible browser
./run-all-tests.sh --all --headed

# Fast parallel demos (2x speed)
./run-all-tests.sh --split --speed=2.0

# Debug a specific test
npx playwright test tests/react-migration.spec.js --project=react-tests --headed --grep="Bank"

# Run only mobile tests
npx playwright test tests/react-migration.spec.js --project=mobile-tests
```

---

## Troubleshooting

### Dev server not starting
Make sure port 5173 is available:
```bash
lsof -i :5173  # Check if port is in use
```

### "No tests found" Error
Ensure the project name matches:
```bash
npx playwright test tests/ --project=react-tests
```

### Tests timing out
Increase timeout or reduce demo speed:
```bash
DEMO_SPEED=0.5 npx playwright test --project=split-demos
```

---

## CI/CD Integration

For continuous integration:

```bash
# Run all React tests with JUnit reporter
npx playwright test --project=react-tests --reporter=junit

# GitHub Actions example
npx playwright test --project=react-tests --reporter=github
```

---

## Legacy Tests

Original vanilla JS tests are preserved in `_original/` and can be run with:

```bash
npx playwright test apps/games/Random\ Event\ Dice/seeded-tests.spec.js --project=legacy-tests
```

Note: Legacy tests use `file://` protocol and don't require the dev server.
