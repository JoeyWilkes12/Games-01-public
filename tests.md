# Game Hub - Testing Documentation

This document describes how to run all tests for the Game Hub React application.

## Testing Pyramid

Game Hub uses a **hybrid testing approach** with Vitest and Playwright working in tandem:

```
┌─────────────────────────────────────────────────┐
│  Unit Tests (Vitest Node.js)            ~50ms  │  ← Fastest
├─────────────────────────────────────────────────┤
│  Component Tests (Vitest Browser)       ~200ms │
├─────────────────────────────────────────────────┤
│  E2E Tests (Playwright)                 ~2min  │
├─────────────────────────────────────────────────┤
│  Demo Recordings                        ~5min  │  ← Most comprehensive
└─────────────────────────────────────────────────┘
```

| Layer | Tool | Speed | Purpose |
|-------|------|-------|---------|
| **Unit** | Vitest (Node.js) | ~50ms | Pure game logic, calculations |
| **Component** | Vitest Browser Mode | ~200ms | React components in real browser |
| **E2E** | Playwright | ~2min | Full user flows, integration |
| **Demo** | Playwright | ~5min | Recordings, visual verification |

---

## Prerequisites

1. **Node.js** (v18+)
2. **Install dependencies**: `npm install`
3. **Install Playwright browsers**: `npx playwright install chromium`

---

## Quick Start

```bash
# Run unit + E2E tests (default - most common)
./run-all-tests.sh

# Run with visible browser
./run-all-tests.sh --headed

# Run everything (unit + component + E2E + demos)
./run-all-tests.sh --all

# Run full demo recording
./run-all-tests.sh --demo
```

---

## Test Categories

### 1. Unit Tests (Vitest - Fastest)

Pure JavaScript logic tests that run in Node.js without a browser.

```bash
# Run unit tests
npm run test:unit

# Via runner script
./run-all-tests.sh --unit
```

**Unit tests include:**
- **Bank Game**: Dice probabilities, score calculations, seeded RNG, undo logic
- **2048 Game**: Grid movement, tile merging, win/lose detection, AI hints

Located in: `tests/unit/`

### 2. Component Tests (Vitest Browser Mode)

React component tests that run in a real Chromium browser via Playwright.

```bash
# Run component tests (headless)
npm run test:component

# Run headed (visible browser)
npm run test:component:headed

# Watch mode for development
npm run test:watch
```

> **Note**: Vitest browser mode uses Playwright as the browser provider, so they share the same browser infrastructure.

### 3. E2E Tests (Playwright)

Full integration tests with browser automation.

```bash
# Run all E2E tests (starts dev server automatically)
./run-all-tests.sh --tests

# Run specific test file
npx playwright test tests/react-migration.spec.js --project=react-tests
```

**E2E tests include:**
- **React Migration**: Navigation, page loading, all game functionality
- **Seeded Bank**: Deterministic dice testing, undo, settings, exit confirmation
- **Seeded 2048**: Grid mechanics, AI hints, configuration validation
- **Seeded Random Event Dice**: Timer, controls, dashboard, analytics
- **Mobile**: Responsive layout on iPhone 14 viewport

### 4. Seeded Game Tests with JSON Configurations

Enhanced tests using JSON configuration files for deterministic behavior.

```bash
# Bank seeded tests
npx playwright test tests/seeded-bank.spec.js --project=react-tests

# 2048 seeded tests
npx playwright test tests/seeded-2048.spec.js --project=react-tests

# Random Event Dice seeded tests
npx playwright test tests/seeded-red.spec.js --project=react-tests
```

**Configuration files used:**
- `apps/games/Bank/sample configuration files/bank-config-deterministic.json`
- `apps/games/2048/sample configuration files/advanced-test-seed-12345.json`
- `apps/games/Random Event Dice/sample configuration files/analytics-test-seed-12345.json`

### 5. Split Demo Tests (Parallel)

Individual game demos that run in parallel for faster execution.

```bash
# Run parallel demos
./run-all-tests.sh --split

# With speed modifier (2x faster)
./run-all-tests.sh --split --speed=2.0
```

### 6. Full Demo Recording

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
| `--unit` | Run Vitest unit tests (Node.js, fastest) |
| `--component` | Run Vitest component tests (real browser) |
| `--tests` | Run Playwright E2E seeded tests |
| `--split` | Run split demo tests (parallel) |
| `--demo` | Run full demo recording (sequential) |
| `--all` | Run all tests (unit + component + E2E + demos) |
| `--headed` | Run in visible browser mode |
| `--speed=N` | Speed multiplier (e.g., `--speed=2.0` for 2x faster) |
| `--report` | Open HTML report after tests |

---

## Test File Structure

```
game-hub/
├── tests/
│   ├── unit/                          # Vitest unit tests (Node.js)
│   │   ├── bank-logic.spec.js
│   │   └── 2048-logic.spec.js
│   ├── component/                     # Vitest component tests (browser)
│   │   └── (future component tests)
│   ├── setup.js                       # Test setup/mocks
│   ├── react-migration.spec.js        # Playwright E2E
│   ├── seeded-bank.spec.js            # Playwright seeded tests
│   ├── seeded-2048.spec.js
│   ├── seeded-red.spec.js
│   ├── demo-red.spec.js               # Split demo recordings
│   ├── demo-2048.spec.js
│   └── demo-sliding-puzzle.spec.js
├── demo-recording.spec.js             # Full sequential demo
├── playwright.config.js               # Playwright configuration
├── vitest.config.js                   # Vitest configuration
└── run-all-tests.sh                   # Test runner script
```

---

## Configuration Files

### Vitest Configuration (`vitest.config.js`)

- Uses Playwright as browser provider
- Supports unit tests (Node.js) and component tests (real browser)
- Excludes Playwright E2E tests to avoid conflicts

### Playwright Configuration (`playwright.config.js`)

| Project | Description | Auto-starts Dev Server |
|---------|-------------|------------------------|
| `react-tests` | React navigation & functionality | ✅ Yes |
| `mobile-tests` | React on iPhone 14 viewport | ✅ Yes |
| `split-demos` | Parallel game demos | ✅ Yes |
| `demo` | Full sequential demo | ✅ Yes |
| `legacy-tests` | Original vanilla JS tests | ❌ No (file://) |

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run test:unit` | Vitest unit tests (Node.js) |
| `npm run test:component` | Vitest component tests (headless Chromium) |
| `npm run test:component:headed` | Vitest component tests (visible browser) |
| `npm run test:watch` | Vitest watch mode with browser |
| `npm test` | Playwright E2E tests |
| `npm run test:headed` | Playwright tests (visible browser) |
| `npm run test:e2e` | Playwright react-tests project |
| `npm run demo` | Full demo recording (headed) |
| `npm run demo:record` | Full demo recording (headless) |

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

After running Playwright tests, view the HTML report:

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
# Quick verification (unit + E2E)
./run-all-tests.sh

# Full verification with visible browser
./run-all-tests.sh --all --headed

# Fast unit tests only
./run-all-tests.sh --unit

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

### Vitest not finding tests
Check the include patterns in `vitest.config.js`

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
