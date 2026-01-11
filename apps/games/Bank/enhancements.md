# Bank Game - Proposed Enhancements

This document outlines potential enhancements for the Bank dice game, categorized by priority and complexity.

## High Priority (Recommended for Next Sprint)

### 1. Game History & Statistics
- **Description**: Track gameplay statistics across sessions (total games played, win rates per player, average score per round)
- **Complexity**: Medium
- **Dependencies**: LocalStorage or IndexedDB for persistence
- **Model Recommendation**: Claude Sonnet 4.5

### 2. Tournament Mode
- **Description**: Multi-round tournament bracket for larger groups (8-16 players)
- **Features**: 
  - Bracket visualization
  - Semi-finals and finals
  - Cumulative scoring across tournament matches
- **Complexity**: High
- **Model Recommendation**: Claude Opus 4.5 (Thinking)

### 3. Custom Rule Variants
- **Description**: Allow users to modify game rules via settings
- **Variant Options**:
  - Adjustable protection period (1-5 rolls instead of fixed 3)
  - Custom 7 penalty (lose all vs. lose half)
  - Doubles multiplier (2x, 3x, or flat bonus)
- **Complexity**: Medium
- **Model Recommendation**: Gemini 3 Pro

---

## Medium Priority

### 4. Animated Avatars
- **Description**: Add animated player avatars that react to game events (dancing on doubles, crying on 7)
- **Complexity**: Low-Medium
- **Model Recommendation**: Gemini 3 Flash + generate_image tool

### 5. Sound Pack System
- **Description**: Multiple sound themes (classic, arcade, nature, custom)
- **Complexity**: Low
- **Model Recommendation**: GPT-OSS 120B

### 6. Online Multiplayer
- **Description**: WebSocket-based real-time multiplayer
- **Features**:
  - Room codes for joining games
  - Spectator mode
  - Chat functionality
- **Complexity**: Very High
- **Dependencies**: Backend server (Node.js/WebSocket)
- **Model Recommendation**: Claude Opus 4.5 (Thinking)

### 7. AI Computer Players
- **Description**: Add AI opponents with different strategies
- **Strategies**:
  - Conservative (banks early, low risk)
  - Aggressive (pushes luck, high risk)
  - Adaptive (adjusts based on scores)
- **Complexity**: Medium-High
- **Model Recommendation**: Claude Sonnet 4.5 (Thinking)

---

## Lower Priority (Nice to Have)

### 8. Achievements System
- **Description**: Unlock achievements for various accomplishments
- **Examples**:
  - "Lucky Seven" - Roll 7 three times in protected phase
  - "Double Trouble" - Get doubles 3 times in one round
  - "The Banker" - Bank 500+ points in a single bank
- **Complexity**: Low
- **Model Recommendation**: Gemini 3 Flash

### 9. Dark/Light Theme Toggle
- **Description**: Add theme switcher (currently dark only)
- **Complexity**: Low
- **Model Recommendation**: Gemini 3 Flash

### 10. Haptic Feedback (Mobile)
- **Description**: Vibration feedback on dice rolls and banking
- **Complexity**: Low
- **Dependencies**: Vibration API
- **Model Recommendation**: GPT-OSS 120B

### 11. Dice Rolling Physics
- **Description**: 3D dice with realistic physics simulation
- **Complexity**: High
- **Dependencies**: Three.js or similar 3D library
- **Model Recommendation**: Claude Opus 4.5

---

## Recently Completed Enhancements ✅

| Feature | Date | Description |
|---------|------|-------------|
| JSON Import/Export | 2026-01-10 | Save and load game configurations |
| Summary Scoreboard | 2026-01-10 | Compact view with gap calculations and tie handling |
| Collapsible UI Elements | 2026-01-10 | Stats dashboard and bank panel are collapsible |
| Mobile Enhancements | 2026-01-10 | Touch-friendly targets, responsive layouts |
| 1-Round Testing Mode | 2026-01-10 | Quick games for testing |
| Sample Configuration Files | 2026-01-10 | Pre-built JSON configs for testing |

---

## Implementation Notes

When implementing new features:
1. Ensure all tests continue to pass (`./node_modules/.bin/playwright test apps/games/Bank/seeded-tests.spec.js`)
2. Update `readme.md` with new features
3. Add relevant seeded tests for new functionality
4. Test on mobile viewports
5. Commit changes with descriptive messages
