# Games 01 - Proposed Enhancements

> **Based on:** All game specifications, readmes, tests.md, and existing Bank enhancements.md  
> **Generated:** 2026-01-11

---

## Table of Contents

1. [Cross-Game Shared Enhancements](#1-cross-game-shared-enhancements)
2. [Bank Game Enhancements](#2-bank-game-enhancements)
3. [Random Event Dice Enhancements](#3-random-event-dice-enhancements)
4. [2048 Enhancements](#4-2048-enhancements)
5. [Sliding Puzzle Enhancements](#5-sliding-puzzle-enhancements)
6. [Analytics Dashboard Enhancements](#6-analytics-dashboard-enhancements)
7. [Infrastructure & DevOps](#7-infrastructure--devops)
8. [React Migration Priorities](#8-react-migration-priorities)

---

## 1. Cross-Game Shared Enhancements

### 🔴 High Priority

#### 1.1 Unified Settings System
**Gap Identified:** Each game has its own settings implementation with duplicated theming logic.

| Aspect | Current | Proposed |
|--------|---------|----------|
| Themes | 4 themes duplicated per game | Shared theme context |
| Storage | Per-game localStorage keys | Unified settings store |
| UI | Duplicate modal implementations | Shared SettingsModal component |

**Complexity:** Medium | **Model:** Gemini 3 Pro

#### 1.2 Global Audio System
**Gap Identified:** No games currently have audio. All specs propose Web Audio API.

| Feature | Description |
|---------|-------------|
| Sound Effects | Dice roll, tile merge, win, lose |
| Background Music | Optional ambient tracks |
| Volume Controls | Global + per-game settings |
| Mute Persistence | Remember across sessions |

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

#### 1.3 Consistent Exit Confirmation
**Gap Identified:** All games share `confirm-exit.css` but duplicate JS logic.

**Proposed:** Extract to shared module with:
- `confirmGameExit()` function
- Configurable messages per game
- Track "game modified" state consistently

**Complexity:** Low | **Model:** Gemini 3 Flash

---

### 🟡 Medium Priority

#### 1.4 Global High Score / Stats Aggregator
**Gap Identified:** No cross-game statistics tracking.

| Metric | Games |
|--------|-------|
| Total Time Played | All |
| Games Completed | All |
| Best Scores | 2048, Bank, Random Event Dice |
| Achievements | All (proposed) |

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

#### 1.5 Keyboard Navigation Accessibility
**Gap Identified:** Inconsistent keyboard support across games.

| Game | Current | Proposed |
|------|---------|----------|
| 2048 | ✅ Arrow keys | Add Tab navigation |
| Sliding Puzzle | ❌ Click only | Add arrow keys |
| Bank | ❌ Click only | Add Enter/Space for actions |
| Random Event Dice | ❌ Click only | Add Start/Stop hotkeys |

**Complexity:** Low-Medium | **Model:** Gemini 3 Flash

#### 1.6 PWA (Progressive Web App) Support
**Gap Identified:** Games not installable on mobile.

| Feature | Benefit |
|---------|---------|
| Service Worker | Offline play |
| Manifest.json | Install to home screen |
| Icons | App icons for all platforms |

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

---

### 🟢 Lower Priority

#### 1.7 Multi-Language Support (i18n)
**Gap Identified:** All games English-only.

**Proposed Languages:** EN, ES, FR, DE, JP

**Complexity:** High | **Model:** Claude Opus 4.5

#### 1.8 Color Blind Mode
**Gap Identified:** All games rely on color for tile/player differentiation.

**Proposed:** Add patterns/icons alongside colors.

**Complexity:** Medium | **Model:** Gemini 3 Pro

---

## 2. Bank Game Enhancements

> *Note: Bank already has comprehensive `enhancements.md`. Below are additional items from spec analysis.*

### 🔴 High Priority

#### 2.1 Undo History Visualization
**Gap in Spec:** Undo stack exists but no UI to see history.

| Feature | Description |
|---------|-------------|
| History Panel | Show last 5-10 states |
| Replay | Step through game history |
| Branch Points | Mark banking decisions |

**Complexity:** Medium | **Model:** Gemini 3 Pro

#### 2.2 Player Avatars from Emoji Database
**Gap in Spec:** `getPlayerDisplayName()` uses emojis but limited selection.

**Proposed:** 
- Integration with emojidb.org
- Random avatar assignment
- Avatar picker in settings

**Complexity:** Low | **Model:** Gemini 3 Flash

---

### 🟡 Medium Priority

#### 2.3 Probability Dashboard Enhancements
**Gap in Spec:** Dashboard shows static probabilities.

| Enhancement | Description |
|-------------|-------------|
| Conditional Odds | "Chance of 7 given current roll count" |
| Risk Calculator | "Expected value of rolling vs banking" |
| Historical Analysis | "Your 7-rate vs expected" |

**Complexity:** Medium-High | **Model:** Claude Sonnet 4.5 (Thinking)

#### 2.4 Pass-and-Play Timer
**Gap in Spec:** No time limit per player.

**Proposed:**
- Configurable turn timer (30s, 60s, unlimited)
- Visual countdown
- Auto-bank on timeout (optional)

**Complexity:** Low | **Model:** Gemini 3 Flash

---

## 3. Random Event Dice Enhancements

### 🔴 High Priority

#### 3.1 Custom Event Builder UI
**Gap in Spec:** Events defined only via JSON import.

| Feature | Description |
|---------|-------------|
| Visual Event Editor | Drag-and-drop condition builder |
| Condition Templates | "Doubles", "Sum > 10", etc. |
| Live Preview | Show probability of event |
| Export to JSON | Generate configuration |

**Complexity:** High | **Model:** Claude Opus 4.5

#### 3.2 Multiple Dice Configurations
**Gap in Spec:** Currently 2d6 only.

| Config | Use Case |
|--------|----------|
| 1d6 | Simple events |
| 2d6 | Standard (current) |
| 3d6 | Extended probability range |
| Custom | User-defined sides |

**Complexity:** Medium | **Model:** Gemini 3 Pro

---

### 🟡 Medium Priority

#### 3.3 Real-Time Probability Overlays
**Gap in Spec:** Heatmap shows history, not predictions.

**Proposed:**
- Overlay expected frequency on heatmap
- Highlight "overdue" combinations
- Chi-square test display

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

#### 3.4 Export Analytics to CSV/Excel
**Gap in Spec:** JSON export only.

**Proposed:** Add CSV and Excel export options for leaderboard and timeline data.

**Complexity:** Low | **Model:** Gemini 3 Flash

#### 3.5 Session Comparison
**Gap in Spec:** No way to compare past sessions.

| Feature | Description |
|---------|-------------|
| Save Session | Snapshot current analytics |
| Load Sessions | Import previous data |
| Side-by-Side Compare | Two sessions' statistics |

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

---

### 🟢 Lower Priority

#### 3.6 Dice Skins/Themes
**Gap in Spec:** Dice appearance static.

**Proposed:** Multiple dice visual themes (classic, casino, digital, custom images).

**Complexity:** Low | **Model:** Gemini 3 Flash + `generate_image`

#### 3.7 Sound Per Event
**Gap in Spec:** No audio.

**Proposed:** Configurable sounds per event type (success chime, alert, etc.).

**Complexity:** Low | **Model:** GPT-OSS 120B

---

## 4. 2048 Enhancements

### 🔴 High Priority

#### 4.1 Game State Persistence
**Gap in Spec:** Only best score persisted.

| Feature | Current | Proposed |
|---------|---------|----------|
| Best Score | ✅ localStorage | ✅ Keep |
| Current Game | ❌ Lost on refresh | ✅ Auto-save |
| Game History | ❌ None | ✅ Last 5 games |

**Complexity:** Low | **Model:** Gemini 3 Flash

#### 4.2 Multiple Grid Sizes
**Gap in Spec:** Dashboard references 4×4 and 5×5, but game only supports 4×4.

| Grid | Status |
|------|--------|
| 4×4 | ✅ Implemented |
| 5×5 | ⏳ Research data exists |
| 3×3 | ⏳ Could add for kids |
| 6×6 | ⏳ Challenge mode |

**Complexity:** Medium | **Model:** Gemini 3 Pro

#### 4.3 Undo Functionality
**Gap in Spec:** No undo, unlike Bank game.

**Proposed:**
- Undo last move (1 level or configurable)
- Limited undos per game (3-5)
- Optional "unlimited undo" practice mode

**Complexity:** Medium | **Model:** Gemini 3 Pro

---

### 🟡 Medium Priority

#### 4.4 AI Algorithm Selector
**Gap in Spec:** Only Expectimax, but dashboard shows multiple algorithms.

| Algorithm | Status |
|-----------|--------|
| Expectimax | ✅ Implemented |
| Monte Carlo | ⏳ Research data |
| IDDFS | ⏳ Research data |
| Reinforcement Learning | ⏳ Advanced |

**Complexity:** High | **Model:** Claude Opus 4.5 (Thinking)

#### 4.5 Move Replay/Animation
**Gap in Spec:** Tiles pop in but no slide animation.

**Proposed:**
- Smooth tile sliding animations
- Merge bounce effect
- Optional slow-motion replay

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

#### 4.6 Leaderboard Integration
**Gap in Spec:** Best score local only.

**Proposed:** Optional anonymous leaderboard (cloud-based).

**Complexity:** High | **Model:** Claude Opus 4.5

---

### 🟢 Lower Priority

#### 4.7 Pastel/Neon Theme Polish
**Gap in Spec:** Themes defined but pastel/neon may need refinement.

**Proposed:** Full tile color palettes for each theme.

**Complexity:** Low | **Model:** Gemini 3 Flash + design iteration

#### 4.8 Score Prediction Display
**Gap in Spec:** AI evaluates but doesn't show expected score.

**Proposed:** Display "Expected final score: X" during auto-play.

**Complexity:** Low | **Model:** Gemini 3 Pro

---

## 5. Sliding Puzzle Enhancements

### 🔴 High Priority

#### 5.1 Grid Size Options
**Gap in Spec:** Referenced in readme "Future Improvements".

| Grid | Description |
|------|-------------|
| 3×3 | ✅ Implemented |
| 4×4 | ⏳ Classic 15-puzzle |
| 5×5 | ⏳ Challenge mode |

**Complexity:** Medium | **Model:** Gemini 3 Pro

#### 5.2 Timer / Speed Run Mode
**Gap in Spec:** No time tracking.

| Feature | Description |
|---------|-------------|
| Timer | Elapsed time display |
| Best Time | Per difficulty persistence |
| Speed Run | Countdown mode with ranking |

**Complexity:** Low | **Model:** Gemini 3 Flash

---

### 🟡 Medium Priority

#### 5.3 Custom Image Puzzles
**Gap in Spec:** Color tiles only.

**Proposed:**
- Upload image
- Slice into tiles
- Photo puzzle mode

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

#### 5.4 Difficulty Presets
**Gap in Spec:** Random walk with fixed moves.

| Difficulty | Scramble Moves | Hint Limit |
|------------|----------------|------------|
| Easy | 15 | Unlimited |
| Medium | 30 | 5 |
| Hard | 50 | 0 |
| Expert | 100 | 0 |

**Complexity:** Low | **Model:** Gemini 3 Flash

#### 5.5 Solver Animation Speed
**Gap in Spec:** Auto-solve uses fixed speed.

**Proposed:** Real-time slider (like Random Event Dice has).

**Complexity:** Low | **Model:** Gemini 3 Flash

---

### 🟢 Lower Priority

#### 5.6 Tile Numbering in Kids Mode
**Gap in Spec:** Kids mode shows colors, no optional numbers.

**Proposed:** Toggle to show numbers on colored tiles.

**Complexity:** Low | **Model:** Gemini 3 Flash

#### 5.7 Puzzle Sharing
**Gap in Spec:** No way to share specific puzzle.

**Proposed:** Generate shareable URL with seed for same puzzle.

**Complexity:** Low | **Model:** Gemini 3 Flash

---

## 6. Analytics Dashboard Enhancements

### 🔴 High Priority

#### 6.1 Live Data Integration
**Gap in Spec:** Static JSON data only.

| Feature | Description |
|---------|-------------|
| API Endpoint | Fetch data from backend |
| Refresh Button | Reload without page refresh |
| Real-Time Updates | WebSocket for live runs |

**Complexity:** High | **Model:** Claude Opus 4.5

#### 6.2 Algorithm Comparison Tool
**Gap in Spec:** Charts show data but no head-to-head comparison.

| Feature | Description |
|---------|-------------|
| Select 2 Algorithms | Side-by-side stats |
| Statistical Significance | T-test / ANOVA results |
| Win Rate Comparison | Which is better? |

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

---

### 🟡 Medium Priority

#### 6.3 Data Filtering by Grid Size
**Gap in Spec:** Explorer has GroupBy but no filter.

**Proposed:** Add checkboxes to filter charts by grid size.

**Complexity:** Low | **Model:** Gemini 3 Flash

#### 6.4 Export Charts as Images
**Gap in Spec:** No way to save charts.

**Proposed:** Download chart as PNG/SVG.

**Complexity:** Low | **Model:** Gemini 3 Flash

#### 6.5 Additional Chart Types
**Gap in Spec:** Limited to bar, doughnut, line.

| Chart Type | Use Case |
|------------|----------|
| Box Plot | Score distribution per algorithm |
| Scatter | Score vs. moves correlation |
| Heatmap | Algorithm × Grid performance |

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

---

### 🟢 Lower Priority

#### 6.6 Dark/Light Theme Toggle
**Gap in Spec:** Dashboard is dark theme only.

**Complexity:** Low | **Model:** Gemini 3 Flash

#### 6.7 Mobile-Optimized Dashboard
**Gap in Spec:** CSS has mobile breakpoints but charts may overflow.

**Proposed:** Touch-friendly controls, swipeable charts.

**Complexity:** Medium | **Model:** Gemini 3 Pro

---

## 7. Infrastructure & DevOps

### 🔴 High Priority

#### 7.1 Playwright Test Coverage
**Gap in Spec:** Some games lack Playwright tests.

| Game | Playwright Tests | Coverage |
|------|------------------|----------|
| Bank | ✅ seeded-tests.spec.js | Good |
| Random Event Dice | ✅ Multiple spec files | Excellent |
| 2048 | ❌ HTML tests only | Needs migration |
| Sliding Puzzle | ❌ HTML tests only | Needs migration |

**Recommendation:** Migrate all tests to Playwright.

**Complexity:** Medium | **Model:** Gemini 3 Pro

#### 7.2 CI/CD Pipeline
**Gap in Spec:** No GitHub Actions.

| Feature | Description |
|---------|-------------|
| Auto-Tests | Run on PR |
| Lint/Format | ESLint, Prettier |
| Deploy | Auto-deploy to GH Pages |

**Complexity:** Medium | **Model:** Claude Sonnet 4.5

---

### 🟡 Medium Priority

#### 7.3 TypeScript Migration
**Gap in Spec:** All games are plain JavaScript.

**Benefit:** Type safety, better tooling, easier refactoring.

**Complexity:** High | **Model:** Claude Opus 4.5

#### 7.4 Component Library Extraction
**Gap in Spec:** Many shared UI patterns.

| Component | Shared By |
|-----------|-----------|
| Modal | All games |
| Button (primary/secondary) | All games |
| StatCard | Bank, 2048, Dashboard |
| ChartCard | Dashboard |
| Toggle | All settings modals |

**Complexity:** Medium | **Model:** Gemini 3 Pro

---

## 8. React Migration Priorities

Based on specification analysis, recommended migration order:

### Phase 1: Shared Foundation
1. Theme system
2. Settings modal
3. Exit confirmation
4. Audio system

### Phase 2: Dashboard (Standalone)
- Easiest to migrate (no game logic)
- Uses Chart.js (react-chartjs-2)
- Good test case for patterns

### Phase 3: Sliding Puzzle
- Simplest game logic
- A* solver already clean
- Good React component structure

### Phase 4: 2048
- Medium complexity
- Expectimax AI well-documented
- Theme system aligns with shared

### Phase 5: Random Event Dice
- Complex analytics tracker
- Most configuration options
- Benefits from prior patterns

### Phase 6: Bank
- Most complex (multiplayer)
- Undo system needs care
- Benefits from all shared components

---

## Summary Table

| Area | High | Medium | Low | Total |
|------|------|--------|-----|-------|
| Cross-Game | 3 | 3 | 2 | 8 |
| Bank | 2 | 2 | 0 | 4 |
| Random Event Dice | 2 | 3 | 2 | 7 |
| 2048 | 3 | 3 | 2 | 8 |
| Sliding Puzzle | 2 | 3 | 2 | 7 |
| Analytics Dashboard | 2 | 3 | 2 | 7 |
| Infrastructure | 2 | 2 | 0 | 4 |
| **Total** | **16** | **19** | **10** | **45** |

---

## Implementation Notes

When implementing enhancements:

1. **Verify existing tests pass** before changes
2. **Add tests** for new functionality
3. **Update specifications** if behavior changes
4. **Test on mobile** viewports
5. **Use recommended AI model** for complexity level
6. **Commit incrementally** with descriptive messages

---

*Document generated from analysis of all game specifications and documentation.*
