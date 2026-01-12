# Bank Game - React + Vite + Tailwind Migration Specification

> **Document Version:** 1.0  
> **Source Files Analyzed:** `index.html`, `script.js` (1659 lines), `style.css` (1568 lines)  
> **Last Updated:** 2026-01-11

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Technology Stack Migration](#2-technology-stack-migration)
3. [Application Architecture](#3-application-architecture)
4. [State Management](#4-state-management)
5. [Component Hierarchy](#5-component-hierarchy)
6. [Component Specifications](#6-component-specifications)
7. [Game Logic & Rules](#7-game-logic--rules)
8. [UI/UX Specifications](#8-uiux-specifications)
9. [Styling & Design System](#9-styling--design-system)
10. [Keyboard & Accessibility](#10-keyboard--accessibility)
11. [Audio System](#11-audio-system)
12. [Configuration & Persistence](#12-configuration--persistence)
13. [Testing Requirements](#13-testing-requirements)
14. [Migration Checklist](#14-migration-checklist)

---

## 1. Game Overview

### Game Description
Bank is a multiplayer dice game where players take turns rolling two dice, accumulating points in a shared "bank" pool. Players must decide when to claim (bank) their points before a 7 is rolled, which causes all unclaimed points to be lost.

### Core Game Rules

| Phase | Rule |
|-------|------|
| **Roll** | Click to roll both dice; sum is added to the bank |
| **Protected Phase** | First 3 rolls: 7 = +70 points (protected), Doubles = face value only |
| **Risk Phase** | After 3 rolls: 7 = round ends (bank lost), Doubles = bank doubled |
| **Banking** | Only allowed after 3+ rolls; player claims current bank amount |
| **Round End** | When 7 rolled (unprotected) or all players have banked |
| **Game End** | After configurable number of rounds (1, 5, 10, 15, 20) |

### Feature Summary
- **Multi-player support** (2+ players, configurable names & emojis)
- **BYOD Mode** (Bring Your Own Dice - manual sum entry)
- **Undo system** with two modes: "resample" (new random) and "preserve" (same rolls)
- **Multi-select banking** (bulk bank multiple players at once)
- **Seeded RNG** for deterministic testing
- **JSON import/export** for configurations
- **Responsive design** with mobile-first approach
- **Compact and full scoreboard views**
- **Probability cheatsheet panel**

---

## 2. Technology Stack Migration

### Current Stack
```
HTML5 + Vanilla CSS + Vanilla JavaScript (ES6 Class-based)
```

### Target Stack
```
React 18+ | Vite 5+ | Tailwind CSS 3+ | TypeScript (recommended)
```

### Recommended Additional Libraries
| Library | Purpose |
|---------|---------|
| `zustand` or `jotai` | Lightweight state management |
| `tailwind-merge` | Class merging utilities |
| `clsx` | Conditional class names |
| `@headlessui/react` | Accessible UI primitives (modals, dropdowns) |
| `framer-motion` | Animations (dice roll, score pulse) |
| `@tanstack/react-query` | Config loading (if backend added) |

---

## 3. Application Architecture

### File Structure (Proposed)

```
src/
├── components/
│   ├── layout/
│   │   ├── GameContainer.tsx
│   │   ├── Header.tsx
│   │   └── HomeButton.tsx
│   ├── game/
│   │   ├── RoundInfo.tsx
│   │   ├── BankDisplay.tsx
│   │   ├── DiceArea.tsx
│   │   ├── Dice.tsx
│   │   ├── ActionButtons.tsx
│   │   ├── AlertMessage.tsx
│   │   ├── CurrentPlayer.tsx
│   │   ├── BankingInfo.tsx
│   │   └── BYODPanel.tsx
│   ├── banking/
│   │   ├── BankActionGroup.tsx
│   │   ├── PlayerCheckbox.tsx
│   │   └── BankButton.tsx
│   ├── scoreboard/
│   │   ├── PlayersPanel.tsx
│   │   ├── CompactScoreboard.tsx
│   │   ├── FullScoreboard.tsx
│   │   └── PlayerCard.tsx
│   ├── settings/
│   │   ├── GameSettings.tsx
│   │   ├── PlayerSettings.tsx
│   │   └── PlayerConfigItem.tsx
│   ├── modals/
│   │   ├── GameOverModal.tsx
│   │   └── ConfirmExitModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Select.tsx
│       ├── Toggle.tsx
│       ├── Details.tsx (collapsible)
│       └── EmojiSelector.tsx
├── hooks/
│   ├── useGameState.ts
│   ├── useSeededRNG.ts
│   ├── useUndo.ts
│   ├── useAudio.ts
│   ├── useKeyboardShortcuts.ts
│   └── useLocalStorage.ts
├── lib/
│   ├── seededRNG.ts
│   ├── gameLogic.ts
│   ├── configValidator.ts
│   └── probabilities.ts
├── types/
│   └── game.ts
├── stores/
│   └── gameStore.ts
├── styles/
│   └── animations.css
└── App.tsx
```

---

## 4. State Management

### Core Game State Interface

```typescript
interface Player {
  id: number;
  name: string;
  emoji: string;
  score: number;
  hasBankedThisRound: boolean;
}

interface GameState {
  // Round state
  roundNumber: number;
  totalRounds: number;
  rollNumber: number;
  bankScore: number;
  
  // Game flow
  currentPlayerIndex: number;
  gameStarted: boolean;
  roundOver: boolean;
  gameOver: boolean;
  isRolling: boolean;
  
  // Dice
  die1: number;
  die2: number;
  
  // Players
  players: Player[];
  
  // Settings
  volume: number;
  undoMode: 'resample' | 'preserve';
  byodEnabled: boolean;
  scoreboardDynamicOrdering: boolean;
  showPlayerEmojis: boolean;
  
  // Undo
  undoStack: SerializedGameState[];
  preservedRolls: [number, number][];
}

interface SerializedGameState {
  roundNumber: number;
  rollNumber: number;
  bankScore: number;
  currentPlayerIndex: number;
  roundOver: boolean;
  gameOver: boolean;
  die1: number;
  die2: number;
  players: Player[];
  rngState: number;
}
```

### Derived State (Computed Values)

```typescript
interface DerivedState {
  currentPlayer: Player;
  isProtectedPhase: boolean;  // rollNumber <= 3
  canBank: boolean;           // rollNumber >= 3 && !gameOver && bankScore > 0
  activePlayers: Player[];    // players not banked this round
  sortedPlayers: Player[];    // by score descending
  survivalProbability: number; // (5/6)^rollNumber
  
  // Compact scoreboard metrics
  currentPlayerRank: number;
  gapToNextPlayer: number;
  gapToLeader: number;
  aheadBy: number;
}
```

### State Actions

```typescript
interface GameActions {
  // Core gameplay
  roll(): void;
  finishRoll(): void;
  bankSelectedPlayers(playerIds: number[]): void;
  
  // Round/game management
  endRound(lostToSeven: boolean): void;
  nextRound(): void;
  endGame(): void;
  startNewGame(): void;
  
  // Undo system
  pushState(): void;
  undo(): void;
  setUndoMode(mode: 'resample' | 'preserve'): void;
  
  // BYOD
  toggleBYOD(enabled: boolean): void;
  handleBYODInput(sum: number | null, isDoubles: boolean): void;
  
  // Players
  addPlayer(): void;
  removePlayer(index: number): void;
  updatePlayerName(index: number, name: string): void;
  updatePlayerEmoji(index: number, emoji: string): void;
  
  // Settings
  setTotalRounds(rounds: number): void;
  setVolume(volume: number): void;
  toggleDynamicOrdering(enabled: boolean): void;
  toggleShowEmojis(enabled: boolean): void;
  
  // Configuration
  exportConfig(): GameConfig;
  importConfig(config: GameConfig): void;
  
  // Testing
  setSeed(seed: number): void;
  getSeed(): number;
}
```

---

## 5. Component Hierarchy

```
App
└── GameContainer
    ├── Header
    │   ├── HomeButton (with ConfirmExitModal)
    │   ├── Title ("🏦 BANK")
    │   └── Subtitle
    │
    ├── MainContent
    │   ├── RoundInfo
    │   │   ├── RoundLabel + RoundNumber
    │   │   └── RollCount
    │   │
    │   ├── BankDisplay
    │   │   ├── BankLabel
    │   │   ├── BankScore (animated)
    │   │   └── BankSublabel
    │   │
    │   ├── DiceArea
    │   │   ├── DiceContainer
    │   │   │   ├── Die (×2)
    │   │   ├── BYODPanel (conditional)
    │   │   │   ├── SumButtons (2-12)
    │   │   │   └── DoublesButton
    │   │   └── LastRollInfo
    │   │
    │   ├── AlertMessage
    │   │
    │   ├── CurrentPlayerSection
    │   │
    │   ├── ActionButtons
    │   │   ├── RollButton
    │   │   └── UndoButton
    │   │
    │   ├── BankingInfo
    │   │
    │   └── BankActionGroup (collapsible <details>)
    │       ├── Summary (with All/Clear buttons)
    │       ├── PlayerCheckboxes
    │       └── BankButton
    │
    ├── PlayersPanel (sidebar)
    │   ├── PanelHeader
    │   │   ├── Title ("🎯 Scoreboard")
    │   │   └── Controls (👥 Player Settings, ⚙️ Game Settings)
    │   │
    │   ├── CompactScoreboard
    │   │   ├── PlayerName + Rank
    │   │   ├── Score
    │   │   └── Metrics (To tie next, To tie leader, Ahead by)
    │   │
    │   └── FullScoreboardDetails (collapsible)
    │       └── PlayerCard (×N)
    │
    ├── GameSettingsPanel (modal overlay)
    │   ├── Rounds Select (1, 5, 10, 15, 20)
    │   ├── Volume Slider
    │   ├── Undo Mode Select (resample, preserve)
    │   ├── BYOD Toggle
    │   ├── Dynamic Ordering Toggle
    │   ├── JSON Import/Export
    │   └── New Game Button
    │
    ├── PlayerSettingsPanel (slide-in from right)
    │   ├── Show Emojis Toggle
    │   ├── PlayerConfigItems (×N)
    │   │   ├── EmojiSelector
    │   │   ├── NameInput
    │   │   └── RemoveButton
    │   └── AddPlayerButton
    │
    ├── ProbabilityCheatsheet (fixed bottom-left)
    │   ├── SurvivalDisplay
    │   └── ProbabilityTable (2-12)
    │
    ├── GameOverModal
    │   ├── WinnerDisplay
    │   ├── ActionButtons (Play Again, Undo)
    │   └── FinalScores (scrollable)
    │
    └── ConfirmExitModal
```

---

## 6. Component Specifications

### 6.1 Die Component

```typescript
interface DieProps {
  value: number;         // 1-6 or 0 for "?"
  isRolling: boolean;
  variant: 'normal' | 'seven' | 'doubles';
  size?: 'sm' | 'md' | 'lg';
}
```

**Visual States:**
| State | Background | Border | Animation |
|-------|------------|--------|-----------|
| Normal | `linear-gradient(145deg, #ffffff, #e8e8e8)` | none | none |
| Rolling | same | none | `diceRoll` 0.1s infinite |
| Seven | `linear-gradient(145deg, #ff6b6b, #ee5a5a)` | none | none |
| Doubles | `linear-gradient(145deg, #ffd700, #ffb700)` | none | none |

**Dimensions:**
- Desktop: 80×80px, font 2.5rem
- Mobile: 70×70px, font 2rem
- Border radius: 16px

### 6.2 BankDisplay Component

```typescript
interface BankDisplayProps {
  score: number;
  isPulsing: boolean;
  isDoubled: boolean;
}
```

**Visual Details:**
- Container: `padding: 2rem 4rem`, border-radius 20px
- Border: 2px solid gold (`#ffd700`)
- Background: gradient from `bg-secondary` to `bg-tertiary`
- Box shadow: gold glow `0 0 40px rgba(255, 215, 0, 0.3)`
- Score font size: 5rem (desktop), 3.5rem (mobile)
- `pulse` animation: scale 1 → 1.1 → 1 over 0.3s
- `doubled` state: text color changes to gold

### 6.3 BYODPanel Component

```typescript
interface BYODPanelProps {
  isOpen: boolean;
  onSubmitSum: (sum: number) => void;
  onSubmitDoubles: () => void;
  disabled?: boolean;
}
```

**Layout:**
- `<details>` element with "Enter Dice Sum" summary
- Grid: 4 columns for buttons 2-12
- Special button 7: red background
- Doubles button: gold, spans all 4 columns
- Button dimensions: min-height 60px, font 1.25rem

### 6.4 PlayerCard Component

```typescript
interface PlayerCardProps {
  player: Player;
  isCurrent: boolean;
  displayName: string;  // includes emoji if enabled
  rank?: number;
  gap?: number;         // gap from leader
  showEmoji?: boolean;
}
```

**Visual States:**
- Default: `bg-tertiary` background, `border-color` border
- Current: blue border (`accent-blue`), blue glow shadow
- Banked: opacity 0.6, green border

### 6.5 CompactScoreboard Component

```typescript
interface CompactScoreboardProps {
  currentPlayer: Player;
  rank: string;       // "1st of 4"
  toTieNext: string;  // "+5" or "#1!"
  toTieLeader: string;
  aheadBy: string;
}
```

**Layout:**
- Player name: blue accent, 1.25rem
- Score: gold, 3rem font
- Metrics grid: 2 columns, last metric spans full width

### 6.6 GameOverModal Component

```typescript
interface GameOverModalProps {
  isOpen: boolean;
  winner: Player;
  finalScores: Player[];
  onPlayAgain: () => void;
  onUndo: () => void;
  canUndo: boolean;
}
```

**Layout:**
- Max height: 85vh
- Winner name: gold, 2rem
- Action buttons: flex row with gap
- Final scores: scrollable, max-height 40vh

### 6.7 ConfirmExitModal Component

```typescript
interface ConfirmExitModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}
```

**Layout:**
- Z-index: 9999
- Icon: ⚠️, 3rem
- Title: "Leave Game?", 1.25rem
- Buttons: "Stay" (green), "Leave" (gray)

---

## 7. Game Logic & Rules

### 7.1 Seeded RNG Implementation

```typescript
class SeededRNG {
  private seed: number;
  private initialSeed: number;
  
  // LCG constants
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = 2 ** 32;
  
  constructor(seed?: number) {
    this.initialSeed = seed ?? Date.now();
    this.seed = this.initialSeed;
  }
  
  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;  // [0, 1)
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  reset(): void {
    this.seed = this.initialSeed;
  }
  
  setSeed(seed: number): void {
    this.initialSeed = seed;
    this.seed = seed;
  }
  
  getState(): number {
    return this.seed;  // For preserve mode
  }
  
  setState(state: number): void {
    this.seed = state;  // For preserve mode restoration
  }
}
```

### 7.2 Roll Logic

```typescript
function processRoll(
  die1: number,
  die2: number,
  rollNumber: number,
  currentBankScore: number
): RollResult {
  const sum = die1 + die2;
  const isDoubles = die1 === die2;
  const isSeven = sum === 7;
  const isProtected = rollNumber <= 3;
  
  let newBankScore = currentBankScore;
  let roundEnded = false;
  let message = '';
  
  if (isSeven) {
    if (isProtected) {
      newBankScore += 70;
      message = '🛡️ Protected! 7 = +70 points';
    } else {
      roundEnded = true;
      message = '💥 SEVEN! Round over - bank lost!';
    }
  } else if (isDoubles) {
    if (isProtected) {
      newBankScore += die1 * 2;  // face value only
      message = `🛡️ Protected doubles! +${die1 * 2} (face value)`;
    } else {
      newBankScore *= 2;  // double the bank!
      message = `🎉 DOUBLES! Bank doubled: ${currentBankScore} → ${newBankScore}`;
    }
  } else {
    newBankScore += sum;
    message = `+${sum}`;
  }
  
  return {
    newBankScore,
    roundEnded,
    message,
    dieVariant: isSeven ? 'seven' : isDoubles ? 'doubles' : 'normal',
    isSpecial: isSeven || isDoubles,
  };
}
```

### 7.3 Banking Rules

```typescript
function canBank(
  rollNumber: number,
  bankScore: number,
  gameOver: boolean
): boolean {
  return rollNumber >= 3 && bankScore > 0 && !gameOver;
}

function bankPlayers(
  players: Player[],
  playerIds: number[],
  bankScore: number
): Player[] {
  return players.map(player => {
    if (playerIds.includes(player.id) && !player.hasBankedThisRound) {
      return {
        ...player,
        score: player.score + bankScore,
        hasBankedThisRound: true,
      };
    }
    return player;
  });
}
```

### 7.4 Player Advancement Logic

```typescript
function getNextActivePlayer(
  players: Player[],
  currentIndex: number
): number {
  const count = players.length;
  let nextIndex = (currentIndex + 1) % count;
  let attempts = 0;
  
  while (players[nextIndex].hasBankedThisRound && attempts < count) {
    nextIndex = (nextIndex + 1) % count;
    attempts++;
  }
  
  return nextIndex;
}
```

### 7.5 Probability Calculations

```typescript
// 2d6 probability distribution
const DICE_PROBABILITIES: Record<number, { probability: number; ways: number }> = {
  2:  { probability: 2.78,  ways: 1 },
  3:  { probability: 5.56,  ways: 2 },
  4:  { probability: 8.33,  ways: 3 },
  5:  { probability: 11.11, ways: 4 },
  6:  { probability: 13.89, ways: 5 },
  7:  { probability: 16.67, ways: 6 },  // Danger!
  8:  { probability: 13.89, ways: 5 },
  9:  { probability: 11.11, ways: 4 },
  10: { probability: 8.33,  ways: 3 },
  11: { probability: 5.56,  ways: 2 },
  12: { probability: 2.78,  ways: 1 },
};

// Survival probability: no 7 in N rolls
function getSurvivalProbability(rollNumber: number): number {
  return Math.pow(5/6, rollNumber) * 100;  // percentage
}
```

---

## 8. UI/UX Specifications

### 8.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                           HEADER                                 │
│  🏠                    🏦 BANK                                   │
│            Roll the dice. Bank your points. Don't get busted!   │
├──────────────────────────────────────────┬──────────────────────┤
│                MAIN CONTENT              │   PLAYERS PANEL      │
│  ┌────────────────────────────────────┐  │   ┌──────────────┐   │
│  │ Round 1 / 20    Roll #3           │  │   │ 🎯 Scoreboard│   │
│  └────────────────────────────────────┘  │   │   [👥] [⚙️]  │   │
│                                          │   ├──────────────┤   │
│  ┌────────────────────────────────────┐  │   │  COMPACT     │   │
│  │         B A N K                    │  │   │  - Name/Rank │   │
│  │           42                       │  │   │  - Score     │   │
│  │    Points available to claim       │  │   │  - Metrics   │   │
│  └────────────────────────────────────┘  │   ├──────────────┤   │
│                                          │   │ ▶ Full Board │   │
│        ┌──────┐    ┌──────┐              │   │  - Player 1  │   │
│        │  4   │    │  6   │              │   │  - Player 2  │   │
│        └──────┘    └──────┘              │   │  - ...       │   │
│                +10                       │   └──────────────┘   │
│                                          │                      │
│     Current Roller: Player 1             │                      │
│                                          │                      │
│   ┌─────────────┐  ┌─────────────┐       │                      │
│   │  🎲 Roll    │  │  ↶ Undo    │       │                      │
│   └─────────────┘  └─────────────┘       │                      │
│                                          │                      │
│   ┌────────────────────────────────┐     │                      │
│   │ ▶ Select players to BANK       │     │                      │
│   │   ☑ Player 1  ☑ Player 2       │     │                      │
│   │   ☑ Player 3  ☐ Player 4       │     │                      │
│   │   [🏦 BANK Selected]           │     │                      │
│   └────────────────────────────────┘     │                      │
├──────────────────────────────────────────┴──────────────────────┤
│ [📊 Probability Cheatsheet - bottom left, fixed position]       │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| Desktop (>900px) | Two-column: main + sidebar (300px) |
| Tablet (768-900px) | Single column, players panel on top |
| Mobile (<768px) | Single column, reduced padding, smaller fonts |

### 8.3 Mobile Adaptations

**Game Container:**
- Grid becomes single column
- Players panel moves to top (order: -1)
- Max height: 250px for players panel

**Typography:**
- Header h1: 2rem (down from 3rem)
- Bank score: 3.5rem (down from 5rem)

**Buttons:**
- Full width, stacked vertically
- Min height: 48px (touch target)

**Probability Cheatsheet:**
- Max width: 150px
- Positioned bottom-left

### 8.4 Touch Targets (pointer: coarse)

```css
@media (pointer: coarse) {
  .btn {
    min-height: 48px;
    min-width: 48px;
  }
  .btn-small {
    min-height: 40px;
  }
  .btn-icon {
    min-width: 44px;
    min-height: 44px;
  }
  .bank-player-checkbox {
    padding: 0.75rem 1rem;
  }
}
```

---

## 9. Styling & Design System

### 9.1 CSS Variables → Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0d1117',
        'bg-secondary': '#161b22',
        'bg-tertiary': '#21262d',
        'text-primary': '#f0f6fc',
        'text-secondary': '#8b949e',
        'accent-gold': '#ffd700',
        'accent-green': '#238636',
        'accent-green-light': '#2ea043',
        'accent-red': '#f85149',
        'accent-blue': '#58a6ff',
        'border-color': '#30363d',
      },
      boxShadow: {
        'glow': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'glow-gold': '0 0 40px rgba(255, 215, 0, 0.3)',
        'glow-blue': '0 0 10px rgba(88, 166, 255, 0.3)',
        'glow-green': '0 4px 15px rgba(35, 134, 54, 0.4)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'dice-roll': 'diceRoll 0.1s ease infinite',
        'score-pulse': 'scorePulse 0.3s ease',
        'alert-pulse': 'alertPulse 0.5s ease',
        'bank-glow': 'bankGlow 1s ease infinite',
        'confirm-pop': 'confirmPopIn 0.2s ease',
      },
      keyframes: {
        diceRoll: {
          '0%': { transform: 'rotate(-5deg) scale(1.05)' },
          '50%': { transform: 'rotate(5deg) scale(0.95)' },
          '100%': { transform: 'rotate(-5deg) scale(1.05)' },
        },
        scorePulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        alertPulse: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bankGlow: {
          '0%, 100%': { boxShadow: '0 4px 15px rgba(35, 134, 54, 0.4)' },
          '50%': { boxShadow: '0 4px 30px rgba(35, 134, 54, 0.8)' },
        },
        confirmPopIn: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
};
```

### 9.2 Button Variants (Component Classes)

```typescript
const buttonVariants = {
  roll: `
    bg-gradient-to-br from-accent-blue to-[#4090e0]
    text-white shadow-glow-blue
    hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(88,166,255,0.5)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  bank: `
    bg-gradient-to-br from-accent-green to-accent-green-light
    text-white shadow-glow-green
    hover:translate-y-[-2px]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  undo: `
    bg-gradient-to-br from-[#6c757d] to-[#495057]
    text-white shadow-[0_4px_15px_rgba(108,117,125,0.3)]
    hover:translate-y-[-2px]
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  newGame: `
    bg-gradient-to-br from-accent-gold to-[#ffa500]
    text-[#1a1a1a] w-full
    hover:translate-y-[-2px]
  `,
  addPlayer: `
    bg-bg-tertiary text-text-secondary
    text-sm w-full mt-2
    hover:bg-border-color hover:text-text-primary
  `,
  icon: `
    bg-transparent border-none text-xl
    p-2 rounded-lg transition-colors
    hover:bg-bg-tertiary
  `,
  small: `
    px-2 py-1 text-xs
    bg-bg-secondary border border-border-color rounded
    text-text-secondary transition-colors
    hover:bg-accent-green hover:text-white
  `,
};
```

### 9.3 Background Gradients

```css
/* Body background - preserve this effect */
body {
  background: var(--bg-primary);
  background-image:
    radial-gradient(ellipse at 20% 0%, rgba(35, 134, 54, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
}
```

### 9.4 Dice Gradients

```javascript
const diceStyles = {
  normal: 'bg-gradient-to-br from-white to-[#e8e8e8] text-[#1a1a1a]',
  seven: 'bg-gradient-to-br from-[#ff6b6b] to-[#ee5a5a] text-white',
  doubles: 'bg-gradient-to-br from-accent-gold to-[#ffb700] text-[#1a1a1a]',
};
```

---

## 10. Keyboard & Accessibility

### 10.1 Keyboard Shortcuts

| Key | Action | Condition |
|-----|--------|-----------|
| `Space` | Roll dice | Not rolling, game not over |
| `B` | Bank selected players | Banking enabled |
| `Ctrl+Z` / `Cmd+Z` | Undo | Undo stack not empty |
| `Escape` | Close open modal/panel | Modal or panel open |

### 10.2 Focus Management

- **Game start**: Focus on Roll button
- **After roll**: Focus remains on Roll button
- **Modal open**: Trap focus within modal
- **Modal close**: Return focus to trigger element

### 10.3 ARIA Attributes

```tsx
// Roll button
<button 
  aria-label="Roll dice"
  aria-pressed={isRolling}
  aria-disabled={gameOver}
>

// Bank score live region
<div 
  role="status" 
  aria-live="polite"
  aria-label={`Bank score: ${bankScore} points`}
>

// Scoreboard
<section 
  aria-label="Scoreboard"
  role="region"
>

// Modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="game-over-title"
>
```

### 10.4 Screen Reader Announcements

Announce on:
- Roll result (sum, special conditions)
- Banking action (who banked, points)
- Round end (seven rolled, or all banked)
- Game end (winner announcement)

---

## 11. Audio System

### 11.1 Web Audio API Implementation

```typescript
interface AudioSystem {
  audioCtx: AudioContext | null;
  volume: number;  // 0-100
  
  playSound(positive: boolean): void;
  setVolume(volume: number): void;
}

function playSound(positive: boolean): void {
  if (!this.audioCtx) {
    this.audioCtx = new AudioContext();
  }
  
  const oscillator = this.audioCtx.createOscillator();
  const gainNode = this.audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(this.audioCtx.destination);
  
  // Positive: ascending tone, Negative: descending
  oscillator.frequency.value = positive ? 440 : 220;
  oscillator.type = 'sine';
  
  gainNode.gain.value = this.volume / 100;
  
  oscillator.start();
  oscillator.stop(this.audioCtx.currentTime + 0.15);
}
```

### 11.2 Sound Events

| Event | Sound |
|-------|-------|
| Normal roll | None |
| Protected 7 | Positive (ascending) |
| Unprotected 7 | Negative (descending) |
| Doubles (any) | Positive (ascending) |
| Banking | Positive (ascending) |

---

## 12. Configuration & Persistence

### 12.1 JSON Configuration Schema

```typescript
interface GameConfig {
  name: string;
  version: string;
  seed?: number;
  settings: {
    totalRounds: number;
    volume: number;
    undoMode: 'resample' | 'preserve';
  };
  players: Array<{
    id: number;
    name: string;
    emoji?: string;
  }>;
  deterministic?: {
    seed: number;
    maxRolls: number | null;
    expectedFinalScores: Record<number, number> | null;
  };
}
```

### 12.2 Config Validation

```typescript
function validateConfigStructure(config: unknown): config is GameConfig {
  if (typeof config !== 'object' || config === null) return false;
  
  const c = config as Record<string, unknown>;
  
  // Required fields
  if (typeof c.name !== 'string') return false;
  if (typeof c.version !== 'string') return false;
  if (typeof c.settings !== 'object') return false;
  if (!Array.isArray(c.players)) return false;
  
  // Settings validation
  const s = c.settings as Record<string, unknown>;
  if (typeof s.totalRounds !== 'number' || 
      ![1, 5, 10, 15, 20].includes(s.totalRounds)) return false;
  
  // Players validation
  if (c.players.length < 2) return false;
  for (const p of c.players as unknown[]) {
    if (typeof p !== 'object' || p === null) return false;
    const player = p as Record<string, unknown>;
    if (typeof player.id !== 'number') return false;
    if (typeof player.name !== 'string') return false;
  }
  
  return true;
}
```

### 12.3 Export Functionality

```typescript
function exportConfig(state: GameState): void {
  const config: GameConfig = {
    name: 'bank-game-config',
    version: '1.0',
    seed: state.rng.initialSeed,
    settings: {
      totalRounds: state.totalRounds,
      volume: state.volume,
      undoMode: state.undoMode,
    },
    players: state.players.map(p => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
    })),
    deterministic: {
      seed: state.rng.initialSeed,
      maxRolls: null,
      expectedFinalScores: null,
    },
  };
  
  const blob = new Blob([JSON.stringify(config, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const filename = `bank-config-${new Date().toISOString().slice(0,10)}.json`;
  
  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}
```

### 12.4 Sample Configuration Files

The game includes pre-built configurations:

1. **`bank-config-deterministic.json`** - 3 rounds, seed 12345, preserve mode, 3 players
2. **`bank-config-party.json`** - 20 rounds, 8 players with fun names
3. **`bank-config-two-players.json`** - Quick 2-player game

---

## 13. Testing Requirements

### 13.1 Playwright Test Categories

| Category | Count | Description |
|----------|-------|-------------|
| Core mechanics | ~10 | Rolling, scoring, player turns |
| Protected phase | ~6 | First 3 rolls behavior |
| Doubles scoring | ~4 | Face value vs bank doubling |
| Banking | ~8 | Multi-select, validation, rounds |
| Undo system | ~5 | Resample vs preserve modes |
| BYOD mode | ~5 | Manual input, sum buttons |
| Settings | ~3 | Rounds, volume, dynamic ordering |

### 13.2 Test Selectors (IDs to preserve)

```typescript
const testSelectors = {
  // Game controls
  rollBtn: '#roll-btn',
  undoBtn: '#undo-btn',
  bankBtn: '#bank-btn',
  
  // Displays
  roundNumber: '#round-number',
  totalRounds: '#total-rounds',
  rollNumber: '#roll-number',
  bankScore: '#bank-score',
  die1: '#die-1',
  die2: '#die-2',
  lastRollInfo: '#last-roll-info',
  alertMessage: '#alert-message',
  currentPlayerName: '#current-player-name',
  
  // Banking panel
  bankActionGroup: '#bank-action-group',
  bankPlayerOptions: '#bank-player-options',
  bankSelectAll: '#bank-select-all',
  bankClearAll: '#bank-clear-all',
  
  // Scoreboard
  playersList: '#players-list',
  compactScoreboard: '#compact-scoreboard',
  fullScoreboardDetails: '#full-scoreboard-details',
  
  // Settings
  settingsPanel: '#settings-panel',
  roundsSelect: '#rounds-select',
  undoModeSelect: '#undo-mode-select',
  byodToggle: '#byod-toggle',
  byodPanel: '#byod-panel',
  
  // Modals
  gameOverModal: '#game-over-modal',
  playAgainBtn: '#play-again-btn',
  confirmExitModal: '#confirm-exit-modal',
  
  // Cheatsheet
  survivalProb: '#survival-prob',
  probabilityCheatsheet: '#probability-cheatsheet',
};
```

### 13.3 Seeded Test Pattern

```typescript
// Pattern for deterministic tests
test('seed 12345 produces expected sequence', async ({ page }) => {
  await page.goto('/bank');
  
  // Set seed via window.game
  await page.evaluate(() => {
    window.game.setSeed(12345);
    window.game.startNewGame();
  });
  
  // Roll and verify
  await page.click('#roll-btn');
  await expect(page.locator('#die-1')).toHaveText('3');
  await expect(page.locator('#die-2')).toHaveText('5');
  await expect(page.locator('#bank-score')).toHaveText('8');
});
```

---

## 14. Migration Checklist

### Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up folder structure per specification
- [ ] Install dependencies (zustand, framer-motion, etc.)

### Phase 2: Core Types & Logic
- [ ] Define TypeScript interfaces
- [ ] Implement SeededRNG class
- [ ] Implement game logic functions
- [ ] Create Zustand store with all actions

### Phase 3: UI Components (Bottom Up)
- [ ] UI primitives (Button, Select, Toggle, Details)
- [ ] Die component with animations
- [ ] BankDisplay with pulse animation
- [ ] AlertMessage component
- [ ] EmojiSelector component

### Phase 4: Game Components
- [ ] RoundInfo
- [ ] DiceArea + BYODPanel
- [ ] CurrentPlayer section
- [ ] ActionButtons (Roll, Undo)
- [ ] BankActionGroup with checkboxes

### Phase 5: Scoreboard & Panels
- [ ] PlayerCard
- [ ] CompactScoreboard with metrics
- [ ] FullScoreboard (collapsible)
- [ ] PlayersPanel container

### Phase 6: Settings & Modals
- [ ] GameSettingsPanel
- [ ] PlayerSettingsPanel (slide-in)
- [ ] GameOverModal
- [ ] ConfirmExitModal
- [ ] HomeButton integration

### Phase 7: Integration
- [ ] Keyboard shortcuts hook
- [ ] Audio system hook
- [ ] Config import/export
- [ ] Probability cheatsheet

### Phase 8: Testing
- [ ] Migrate Playwright tests
- [ ] Verify all selectors work
- [ ] Run full test suite
- [ ] Fix any regressions

### Phase 9: Polish
- [ ] Verify all animations
- [ ] Test responsive breakpoints
- [ ] Accessibility audit
- [ ] Performance optimization

---

## Appendix A: Emoji Curated List

```typescript
const CURATED_EMOJIS = [
  '🎲', '🎯', '🏆', '🎮', '⭐', '🔥', '💎', '🎪',
  '🚀', '⚡', '🌟', '🎸', '🎭', '🃏', '🦊', '🐱',
  '🐶', '🦁', '🐻', '🐼', '🦄', '🐲', '🌈', '🍀',
];
```

## Appendix B: Original Class Methods Reference

| Method | Lines | Purpose |
|--------|-------|---------|
| `constructor` | 56-175 | Initialize state and DOM refs |
| `init` | 177-182 | Game initialization |
| `bindEvents` | 184-330 | Event listener setup |
| `confirmExit` | 332-347 | Exit confirmation |
| `roll` | 355-379 | Start rolling animation |
| `finishRoll` | 381-463 | Complete roll, apply rules |
| `advancePlayer` | 465-477 | Move to next player |
| `bankSelectedPlayer` | 479-522 | Bank single player |
| `bankSelectedPlayers` | 595-642 | Bank multiple players |
| `updateBankPanel` | 644-673 | Refresh checkbox panel |
| `endRound` | 695-712 | End round logic |
| `nextRound` | 714-729 | Start new round |
| `endGame` | 731-757 | Show game over |
| `startNewGame` | 759-784 | Reset game state |
| `updateUI` | 786-843 | Refresh all UI |
| `renderPlayers` | 845-898 | Render player cards |
| `toggleBYOD` | 999-1035 | Enable/disable BYOD |
| `handleBYODInput` | 1037-1138 | Process manual dice entry |
| `undo` | 1200-1225 | Restore previous state |
| `updateCompactScoreboard` | 1364-1425 | Calculate and display metrics |
| `exportConfig` | 1470-1509 | Save config to JSON file |
| `importConfig` | 1511-1558 | Load config from JSON |

---

*End of Bank Game Specification Document*
