# Game Hub - Test Commands Reference

This document describes all available test commands for validating the Game Hub application.

---

## Quick Start

Run all tests at once:
```bash
./run-all-tests.sh
```

---

## Playwright Tests

### Demo Recording (Video)
Creates a full demonstration video of all playable games.

```bash
npx playwright test --project=demo
```

Output: Video recording saved to `./test-results/`

### All Unit/Seeded Tests
```bash
npx playwright test --project=tests
```

### Random Event Dice - Seeded Tests
Comprehensive tests using deterministic seeds for reproducibility.

```bash
npx playwright test apps/games/Random\ Event\ Dice/seeded-tests.spec.js --project=tests
```

Tests include:
- Configuration file validation
- Seeded RNG determinism
- Analytics tracker accuracy
- Skip to End functionality
- Event definition logic

### Random Event Dice - Basic E2E Tests
```bash
npx playwright test apps/games/Random\ Event\ Dice/playwright.test.js
```

Tests include:
- Page load verification
- Start/Pause/Resume functionality
- Analytics panel visibility
- Settings panel toggle
- Timer countdown

---

## HTML-Based Tests

These tests run directly in the browser.

### Sliding Puzzle 3x3
```bash
open apps/games/Sliding\ Puzzle\ 3x3/tests.html
# Or navigate to: file:///path/to/Games 01/apps/games/Sliding Puzzle 3x3/tests.html
```

Tests include:
- Solver algorithm (A*)
- Move validation
- Win condition detection

### 2048
```bash
open apps/games/2048/tests.html
```

Tests include:
- Grid operations
- Merge logic
- Score calculation
- Expectimax AI validation

---

## View Test Report

After running Playwright tests, view the HTML report:

```bash
npx playwright show-report
```

This opens an interactive report in your browser showing:
- Test pass/fail status
- Screenshots on failure
- Video recordings (if enabled)
- Trace files for debugging

---

## Test Configuration Files

Sample configuration files for seeded testing are located in:
- `apps/games/Random Event Dice/sample configuration files/`
- `apps/games/2048/sample configuration files/`

### Key Configuration Files

| File | Purpose |
|------|---------|
| `analytics-test-seed-12345.json` | Full analytics test with 15 players, seed 12345 |
| `minimal-test-seed-42.json` | Minimal config with 3 players, seed 42 |
| `test_specifications.json` | Comprehensive test specifications |
| `test_specifications.xml` | XML format test specifications |

---

## CI/CD Integration

For continuous integration, use:

```bash
npx playwright test --project=tests --reporter=junit
```

This outputs JUnit-compatible XML for CI systems like GitHub Actions.

---

## Troubleshooting

### Tests failing to find game elements?
Ensure the local file server is accessible. Playwright uses `file://` protocol.

### Video not recording?
Check that you're using the `demo` project:
```bash
npx playwright test --project=demo
```

### Need verbose output?
```bash
npx playwright test --project=tests --debug
```

---

## Test File Locations

| Game | Test File(s) |
|------|-------------|
| Random Event Dice | `apps/games/Random Event Dice/seeded-tests.spec.js`, `playwright.test.js` |
| 2048 | `apps/games/2048/tests.html` |
| Sliding Puzzle | `apps/games/Sliding Puzzle 3x3/tests.html`, `test_logic.js` |
| Demo Recording | `demo-recording.spec.js` |
