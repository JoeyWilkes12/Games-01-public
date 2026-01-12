# 2048 Game - React + Vite + Tailwind Migration Specification

> **Document Version:** 1.0  
> **Source Files Analyzed:** `index.html` (111 lines), `script.js` (736 lines/63 functions), `style.css` (395 lines)  
> **Last Updated:** 2026-01-11

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Technology Stack Migration](#2-technology-stack-migration)
3. [Application Architecture](#3-application-architecture)
4. [State Management](#4-state-management)
5. [Component Hierarchy](#5-component-hierarchy)
6. [Component Specifications](#6-component-specifications)
7. [Game Logic & AI](#7-game-logic--ai)
8. [UI/UX Specifications](#8-uiux-specifications)
9. [Styling & Theming System](#9-styling--theming-system)
10. [Touch & Input Handling](#10-touch--input-handling)
11. [Audio System](#11-audio-system)
12. [Configuration & Persistence](#12-configuration--persistence)
13. [Testing Requirements](#13-testing-requirements)
14. [Migration Checklist](#14-migration-checklist)

---

## 1. Game Overview

### Game Description
2048 is a single-player sliding block puzzle game. The objective is to slide numbered tiles on a 4×4 grid to combine them and create a tile with the number 2048.

### Core Rules

| Rule | Description |
|------|-------------|
| **Movement** | Tiles slide as far as possible in chosen direction (Up, Down, Left, Right) |
| **Merging** | When two tiles with same number collide, they merge into one tile with their sum |
| **Spawning** | After each move, a new tile (2 or 4) spawns in a random empty cell |
| **Game Over** | When no more moves are possible |
| **Win Condition** | Creating a 2048 tile (can continue playing after) |

### Scoring System
The **score** is the cumulative sum of all tile merges throughout the game:
- Merging two 2-tiles into a 4 adds **4** to the score
- Merging two 4-tiles into an 8 adds **8** to the score
- And so on...

### Features

| Feature | Description |
|---------|-------------|
| **Multiple Themes** | Classic Toy, Dark Mode, Pastel Dream, Neon Arcade |
| **AI Solver** | Expectimax-based AI that can play automatically |
| **Hint System** | Suggests best next move |
| **Auto-Play** | AI plays continuously with configurable speed |
| **Touch Support** | Swipe gestures for mobile |
| **Seeded RNG** | Reproducible games for testing |
| **Best Score** | Persisted in localStorage |

---

## 2. Technology Stack Migration

### Current Stack
```
HTML5 + Vanilla CSS + Vanilla JavaScript (Namespace-based)
```

### Target Stack
```
React 18+ | Vite 5+ | Tailwind CSS 3+ | TypeScript
```

### Recommended Additional Libraries

| Library | Purpose |
|---------|---------|
| `zustand` | Lightweight state management |
| `tailwind-merge` | Class merging utilities |
| `clsx` | Conditional class names |
| `@headlessui/react` | Accessible modal |
| `framer-motion` | Tile animations |
| `use-gesture` | Swipe gesture handling |

---

## 3. Application Architecture

### File Structure (Proposed)

```
src/
├── components/
│   ├── layout/
│   │   ├── GameContainer.tsx
│   │   ├── Header.tsx
│   │   ├── HomeButton.tsx
│   │   └── ResearchButton.tsx
│   ├── game/
│   │   ├── GameArea.tsx
│   │   ├── GridContainer.tsx
│   │   ├── Tile.tsx
│   │   ├── GameMessage.tsx
│   │   └── StatsPanel.tsx
│   ├── controls/
│   │   ├── Controls.tsx
│   │   ├── NewGameButton.tsx
│   │   ├── HintButton.tsx
│   │   └── SolveButton.tsx
│   ├── modals/
│   │   ├── SettingsModal.tsx
│   │   └── ConfirmExitModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Select.tsx
│       └── RangeSlider.tsx
├── hooks/
│   ├── useGameState.ts
│   ├── useSeededRandom.ts
│   ├── useSwipeGesture.ts
│   ├── useKeyboard.ts
│   ├── useAI.ts
│   └── useTheme.ts
├── lib/
│   ├── SeededRandom.ts
│   ├── gridOperations.ts
│   ├── ai/
│   │   ├── expectimax.ts
│   │   └── heuristics.ts
│   └── gameLogic.ts
├── types/
│   └── game.ts
├── stores/
│   └── gameStore.ts
└── App.tsx
```

---

## 4. State Management

### Core Game State Interface

```typescript
type Grid = number[][];  // 4×4 array, 0 = empty

interface GameState {
  // Grid state
  board: Grid;           // Current 4×4 grid
  score: number;
  bestScore: number;
  
  // Game flow
  gameOver: boolean;
  gameWon: boolean;
  keepPlaying: boolean;  // Continue after reaching 2048
  
  // AI state
  isAutoPlaying: boolean;
  autoPlaySpeed: number; // ms between moves (50-500)
  
  // UI state
  theme: 'classic' | 'dark' | 'pastel' | 'neon';
  settingsOpen: boolean;
  hintDirection: Direction | null;
  
  // For tracking modifications
  gameModified: boolean;
}

type Direction = 0 | 1 | 2 | 3;  // Up, Right, Down, Left

interface MoveResult {
  board: Grid;
  score: number;       // Points gained from merges
  moved: boolean;      // Whether any tiles actually moved
}
```

### SeededRandom State

```typescript
interface SeededRandomState {
  seed: number;
  current: number;
}

class SeededRandom {
  seed: number;
  current: number;
  
  constructor(seed: number = Date.now()) {
    this.seed = seed;
    this.current = seed;
  }
  
  // Linear Congruential Generator
  next(): number {
    this.current = (this.current * 16807) % 2147483647;
    return this.current / 2147483647;
  }
  
  reset(): void {
    this.current = this.seed;
  }
}
```

### Game Configuration

```typescript
interface GameConfig {
  gridSize: number;        // Default 4
  seed: number | null;     // null = random
  prob4: number;           // Probability of 4 vs 2 (default 0.1)
  winScore: number;        // Tile value to win (default 2048)
  autoPlaySpeed: number;   // ms between AI moves
}

const DEFAULT_CONFIG: GameConfig = {
  gridSize: 4,
  seed: null,
  prob4: 0.1,
  winScore: 2048,
  autoPlaySpeed: 200,
};
```

---

## 5. Component Hierarchy

```
App
└── ThemeProvider (data-theme attribute)
    └── GameContainer
        ├── Header
        │   ├── HeaderLeft
        │   │   ├── HomeButton (→ ConfirmExitModal)
        │   │   └── Title ("2048!")
        │   └── HeaderRight
        │       ├── ResearchButton ("AI, Analytics & Research →")
        │       └── SettingsButton (⚙️)
        │
        ├── MainContent
        │   ├── StatsPanel
        │   │   ├── StatBox (SCORE)
        │   │   └── StatBox (BEST)
        │   │
        │   └── GameArea
        │       ├── GameMessage (win overlay)
        │       │   ├── Message ("You Win!")
        │       │   └── KeepPlayingButton
        │       └── GridContainer
        │           └── Tile (×16)
        │
        ├── Controls
        │   ├── NewGameButton (↻ icon)
        │   └── HintGroup
        │       ├── HintButton (💡 Hint)
        │       └── SolveButton (🤖 Play for Me)
        │
        ├── SettingsModal
        │   ├── ModalHeader
        │   │   ├── Title ("Settings")
        │   │   └── CloseButton
        │   ├── ThemePicker (select)
        │   ├── SpeedSlider (Slow - Fast)
        │   └── ModalNote ("Use Arrow Keys or Swipe!")
        │
        └── ConfirmExitModal
```

---

## 6. Component Specifications

### 6.1 Tile Component

```typescript
interface TileProps {
  value: number;           // 0 = empty, 2, 4, 8, 16, ...
  row: number;
  col: number;
  isNew?: boolean;         // For pop animation
  isHint?: boolean;        // Highlight for hint
}
```

**Value-Based Styling:**

| Value | Background | Text Color | Font Size | Special |
|-------|------------|------------|-----------|---------|
| 0 (empty) | `#cdc1b4` | - | - | - |
| 2 | `#eee4da` | `#776e65` | 2rem | - |
| 4 | `#ede0c8` | `#776e65` | 2rem | - |
| 8 | `#f2b179` | `#f9f6f2` | 2rem | - |
| 16 | `#f59563` | `#f9f6f2` | 2rem | - |
| 32 | `#f67c5f` | `#f9f6f2` | 2rem | - |
| 64 | `#f65e3b` | `#f9f6f2` | 2rem | - |
| 128 | `#edcf72` | `#f9f6f2` | 1.8rem | - |
| 256 | `#edcc61` | `#f9f6f2` | 1.8rem | - |
| 512 | `#edc850` | `#f9f6f2` | 1.8rem | - |
| 1024 | `#edc53f` | `#f9f6f2` | 1.5rem | - |
| 2048 | `#edc22e` | `#f9f6f2` | 1.5rem | Gold glow |

**Animations:**
- New tile: `pop` animation (scale 0 → 1) over 0.2s
- Hint highlight: Yellow inner glow with pulse

### 6.2 GridContainer Component

```typescript
interface GridContainerProps {
  board: Grid;
  hintDirection: Direction | null;
}
```

**Layout:**
- CSS Grid: 4×4
- Gap: 10px
- Aspect ratio: 1:1
- Background: `#bbada0`
- Padding: 10px
- Border radius: 6px

### 6.3 StatsPanel Component

```typescript
interface StatsPanelProps {
  score: number;
  bestScore: number;
}
```

**Layout:**
- Flex row, space-between
- Two StatBox components
- StatBox: Grid background, white text

### 6.4 GameMessage Component

```typescript
interface GameMessageProps {
  isVisible: boolean;
  message: string;
  onKeepPlaying: () => void;
}
```

**Layout:**
- Absolute overlay on game area
- Semi-transparent background
- Centered message
- "Keep Playing" button below

### 6.5 SettingsModal Component

```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  autoPlaySpeed: number;
  onSpeedChange: (speed: number) => void;
}
```

**Settings:**
1. Theme picker (select):
   - Classic Toy
   - Dark Mode
   - Pastel Dream
   - Neon Arcade
2. Auto-Play Speed (range slider):
   - Min: 50ms (Fast)
   - Max: 500ms (Slow)
   - Default: 200ms

---

## 7. Game Logic & AI

### 7.1 Core Movement Logic

```typescript
const GRID_SIZE = 4;

// Slide and merge a single row to the left
function slideAndMergeRow(row: number[]): { row: number[]; score: number } {
  // Remove zeros
  const filtered = row.filter(val => val !== 0);
  const merged: number[] = [];
  let score = 0;
  
  for (let i = 0; i < filtered.length; i++) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      // Merge
      const mergedValue = filtered[i] * 2;
      merged.push(mergedValue);
      score += mergedValue;
      i++; // Skip next tile (already merged)
    } else {
      merged.push(filtered[i]);
    }
  }
  
  // Pad with zeros
  while (merged.length < GRID_SIZE) {
    merged.push(0);
  }
  
  return { row: merged, score };
}

// Apply slideLeft to entire grid
function slideLeft(grid: Grid): MoveResult {
  let totalScore = 0;
  const newGrid = grid.map(row => {
    const result = slideAndMergeRow(row);
    totalScore += result.score;
    return result.row;
  });
  
  const moved = JSON.stringify(grid) !== JSON.stringify(newGrid);
  return { board: newGrid, score: totalScore, moved };
}
```

### 7.2 Rotation for Other Directions

```typescript
// Rotate grid 90° clockwise
function rotateClockwise(grid: Grid): Grid {
  const size = grid.length;
  const rotated: Grid = [];
  
  for (let c = 0; c < size; c++) {
    const newRow: number[] = [];
    for (let r = size - 1; r >= 0; r--) {
      newRow.push(grid[r][c]);
    }
    rotated.push(newRow);
  }
  
  return rotated;
}

// Rotate grid N times (90° each)
function rotateBoard(grid: Grid, rotations: number): Grid {
  let result = grid;
  for (let i = 0; i < rotations % 4; i++) {
    result = rotateClockwise(result);
  }
  return result;
}

// Direction mapping to rotations
// Up (0): rotate 3, slide left, rotate 1
// Right (1): rotate 2, slide left, rotate 2
// Down (2): rotate 1, slide left, rotate 3
// Left (3): rotate 0, slide left, rotate 0

function move(grid: Grid, direction: Direction): MoveResult {
  const rotations = [3, 2, 1, 0][direction];
  const reverseRotations = (4 - rotations) % 4;
  
  const rotated = rotateBoard(grid, rotations);
  const slid = slideLeft(rotated);
  const finalBoard = rotateBoard(slid.board, reverseRotations);
  
  return {
    board: finalBoard,
    score: slid.score,
    moved: slid.moved,
  };
}
```

### 7.3 Tile Spawning

```typescript
function addRandomTile(grid: Grid, rng: SeededRandom, prob4: number = 0.1): Grid {
  const empty: { r: number; c: number }[] = [];
  
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        empty.push({ r, c });
      }
    }
  }
  
  if (empty.length === 0) return grid;
  
  const idx = Math.floor(rng.next() * empty.length);
  const spot = empty[idx];
  const value = rng.next() < prob4 ? 4 : 2;
  
  const newGrid = grid.map(row => [...row]);
  newGrid[spot.r][spot.c] = value;
  
  return newGrid;
}
```

### 7.4 Game Over Detection

```typescript
function checkGameOver(grid: Grid): boolean {
  // Check for any empty cell
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  
  // Check for any possible merges
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      
      // Check right neighbor
      if (c + 1 < GRID_SIZE && grid[r][c + 1] === val) return false;
      
      // Check bottom neighbor
      if (r + 1 < GRID_SIZE && grid[r + 1][c] === val) return false;
    }
  }
  
  return true;
}

function checkWin(grid: Grid, winScore: number = 2048): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] >= winScore) return true;
    }
  }
  return false;
}
```

### 7.5 Expectimax AI Solver

```typescript
// Weight matrix (snake pattern for corner strategy)
const WEIGHT_MATRIX = [
  [65536, 32768, 16384, 8192],
  [512,   1024,  2048,  4096],
  [256,   128,   64,    32],
  [2,     4,     8,     16],
];

function evaluateGrid(grid: Grid): number {
  let score = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      score += grid[r][c] * WEIGHT_MATRIX[r][c];
    }
  }
  return score;
}

function getEmptySpots(grid: Grid): { r: number; c: number }[] {
  const empty: { r: number; c: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) empty.push({ r, c });
    }
  }
  return empty;
}

function expectimax(
  grid: Grid,
  depth: number,
  isPlayer: boolean
): number {
  if (depth === 0) return evaluateGrid(grid);
  
  if (isPlayer) {
    // Max node: try all 4 moves
    let bestScore = -Infinity;
    let anyMove = false;
    
    for (let dir = 0; dir < 4; dir++) {
      const result = move(grid, dir as Direction);
      if (result.moved) {
        anyMove = true;
        const score = expectimax(result.board, depth - 1, false);
        if (score > bestScore) bestScore = score;
      }
    }
    
    return anyMove ? bestScore : -999999; // Loss state
  } else {
    // Chance node: average over all possible spawns
    const empty = getEmptySpots(grid);
    if (empty.length === 0) return evaluateGrid(grid);
    
    let avgScore = 0;
    
    empty.forEach(spot => {
      // Spawn 2 (90% probability)
      const grid2 = grid.map(row => [...row]);
      grid2[spot.r][spot.c] = 2;
      avgScore += expectimax(grid2, depth - 1, true) * 0.9;
      
      // Spawn 4 (10% probability)
      const grid4 = grid.map(row => [...row]);
      grid4[spot.r][spot.c] = 4;
      avgScore += expectimax(grid4, depth - 1, true) * 0.1;
    });
    
    return avgScore / empty.length;
  }
}

function getBestMove(grid: Grid, depth: number = 3): Direction {
  let bestScore = -Infinity;
  let bestMove: Direction = 3; // Default: left
  
  for (let dir = 0; dir < 4; dir++) {
    const result = move(grid, dir as Direction);
    if (result.moved) {
      const score = expectimax(result.board, depth - 1, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = dir as Direction;
      }
    }
  }
  
  return bestMove;
}
```

---

## 8. UI/UX Specifications

### 8.1 Layout

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                               │
│ 🏠  2048!          [AI, Analytics & Research →] ⚙️  │
├─────────────────────────────────────────────────────┤
│                                                      │
│   ┌────────────────┐  ┌────────────────┐            │
│   │     SCORE      │  │      BEST      │            │
│   │       0        │  │       0        │            │
│   └────────────────┘  └────────────────┘            │
│                                                      │
│   ┌──────────────────────────────────────────┐      │
│   │ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │      │
│   │ │    │ │  2 │ │    │ │    │              │      │
│   │ └────┘ └────┘ └────┘ └────┘              │      │
│   │ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │      │
│   │ │    │ │    │ │  4 │ │    │              │      │
│   │ └────┘ └────┘ └────┘ └────┘              │      │
│   │ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │      │
│   │ │    │ │    │ │    │ │  2 │              │      │
│   │ └────┘ └────┘ └────┘ └────┘              │      │
│   │ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │      │
│   │ │    │ │    │ │    │ │    │              │      │
│   │ └────┘ └────┘ └────┘ └────┘              │      │
│   └──────────────────────────────────────────┘      │
│                                                      │
│                    ( ↻ )                            │
│            [💡 Hint]  [🤖 Play for Me]              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 8.2 Responsive Behavior

**Desktop (default):**
- Max width: 500px
- Full padding and margins

**Mobile (<500px):**
- 95% width
- Reduced padding
- Touch gestures enabled

---

## 9. Styling & Theming System

### 9.1 Theme Variables

```javascript
// tailwind.config.js
const themes = {
  classic: {
    bgColor: '#ecf0f1',
    primaryColor: '#ff6b6b',
    textColor: '#2c3e50',
    woodFrame: '#bdc3c7',
    woodBg: '#ecf0f1',
    gridBg: '#bbada0',
    tileEmpty: '#cdc1b4',
    textTileDark: '#776e65',
    textTileLight: '#f9f6f2',
  },
  dark: {
    bgColor: '#2c3e50',
    primaryColor: '#e74c3c',
    textColor: '#ffffff',
    woodFrame: '#34495e',
    woodBg: '#2c3e50',
    gridBg: '#576574',
    tileEmpty: '#8395a7',
    textTileDark: '#2c3e50',
    textTileLight: '#f9f6f2',
  },
  pastel: {
    bgColor: '#fef6e4',
    primaryColor: '#f582ae',
    textColor: '#172c66',
    woodFrame: '#f3d2c1',
    woodBg: '#fef6e4',
    gridBg: '#8bd3dd',
    tileEmpty: '#d4e6e4',
    textTileDark: '#172c66',
    textTileLight: '#ffffff',
  },
  neon: {
    bgColor: '#0d0d0d',
    primaryColor: '#00ff88',
    textColor: '#ffffff',
    woodFrame: '#1a1a2e',
    woodBg: '#0d0d0d',
    gridBg: '#16213e',
    tileEmpty: '#1a1a2e',
    textTileDark: '#00ff88',
    textTileLight: '#ffffff',
  },
};
```

### 9.2 Tile Color Scale

```typescript
const TILE_COLORS: Record<number, string> = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
};

function getTileTextColor(value: number): string {
  return value >= 8 ? '#f9f6f2' : '#776e65';
}

function getTileFontSize(value: number): string {
  if (value >= 1024) return '1.5rem';
  if (value >= 128) return '1.8rem';
  return '2rem';
}
```

### 9.3 Animations

```css
/* Tile pop animation */
@keyframes pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* Hint pulse */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.tile[data-new="true"] {
  animation: pop 0.2s ease-in-out;
}

.hint-highlight {
  box-shadow: 0 0 0 4px #f1c40f inset;
  animation: pulse 1s infinite;
}
```

---

## 10. Touch & Input Handling

### 10.1 Keyboard Input

```typescript
function handleKeyDown(e: KeyboardEvent): void {
  if (gameOver) return;
  
  const keyDirectionMap: Record<string, Direction> = {
    'ArrowUp': 0,
    'ArrowRight': 1,
    'ArrowDown': 2,
    'ArrowLeft': 3,
  };
  
  const direction = keyDirectionMap[e.key];
  if (direction !== undefined) {
    e.preventDefault();
    performMove(direction);
  }
}
```

### 10.2 Touch/Swipe Input

```typescript
interface SwipeState {
  startX: number;
  startY: number;
}

function handleTouchStart(e: TouchEvent, state: SwipeState): void {
  state.startX = e.touches[0].clientX;
  state.startY = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent, state: SwipeState): void {
  const dx = e.changedTouches[0].clientX - state.startX;
  const dy = e.changedTouches[0].clientY - state.startY;
  
  const MIN_SWIPE = 30;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal swipe
    if (dx > MIN_SWIPE) performMove(1);      // Right
    else if (dx < -MIN_SWIPE) performMove(3); // Left
  } else {
    // Vertical swipe
    if (dy > MIN_SWIPE) performMove(2);      // Down
    else if (dy < -MIN_SWIPE) performMove(0); // Up
  }
}
```

---

## 11. Audio System

The current implementation does not include audio. If desired for migration:

```typescript
interface AudioSystem {
  playMerge(value: number): void;  // Higher pitch for higher values
  playWin(): void;
  playLose(): void;
  setVolume(volume: number): void;
}
```

---

## 12. Configuration & Persistence

### 12.1 JSON Configuration Schema

```typescript
interface GameConfig {
  version: '1.0';
  name: string;
  settings: {
    gridSize: number;
    seed: number | null;
    prob4: number;
    winScore: number;
    autoPlaySpeed: number;
  };
}
```

### 12.2 Local Storage Persistence

```typescript
// Best score persistence
const BEST_SCORE_KEY = '2048-best';

function saveBestScore(score: number): void {
  localStorage.setItem(BEST_SCORE_KEY, score.toString());
}

function loadBestScore(): number {
  return parseInt(localStorage.getItem(BEST_SCORE_KEY) || '0', 10);
}
```

### 12.3 Game2048 Namespace (Testing API)

```typescript
const Game2048 = {
  setSeed(seed: number): void,
  getGrid(): Grid,
  setGrid(grid: Grid): void,
  getScore(): number,
  
  // Movement
  moveLeft(): MoveResult,
  moveRight(): MoveResult,
  moveUp(): MoveResult,
  moveDown(): MoveResult,
  
  // Conditions
  checkWin(): boolean,
  checkLose(): boolean,
  
  // Validation
  validateBoardState(): string[],  // Returns array of errors
  
  // Config
  loadConfig(config: GameConfig): void,
  
  // Simulation
  runSeededSimulation(seed: number, moves: Direction[]): {
    finalGrid: Grid;
    finalScore: number;
    gameOver: boolean;
    gameWon: boolean;
  },
};
```

---

## 13. Testing Requirements

### 13.1 Test Categories

| Category | Description |
|----------|-------------|
| Core Logic | Slide and merge operations |
| Grid Manipulation | Board state changes |
| Win/Loss Conditions | Game end detection |
| Anti-Cheat Validation | Invalid tile detection |
| Seeded Reproducibility | Same seed = same game |
| Configuration Loading | JSON config parsing |
| AI Behavior | Best move calculation |

### 13.2 Test Selectors (IDs to preserve)

```typescript
const testSelectors = {
  // Main elements
  gridContainer: '#grid-container',
  scoreValue: '#score-value',
  bestValue: '#best-value',
  gameMessage: '#game-message',
  keepPlayingBtn: '#keep-playing-btn',
  
  // Controls
  newGameBtn: '#new-game-btn',
  hintBtn: '#hint-btn',
  solveBtn: '#solve-btn',
  
  // Settings modal
  settingsBtn: '#settings-btn',
  settingsModal: '#settings-modal',
  closeSettings: '#close-settings',
  themePicker: '#theme-picker',
  speedRange: '#speed-range',
  
  // Exit modal
  homeBtn: '#home-btn',
  confirmExitModal: '#confirm-exit-modal',
  confirmStayBtn: '#confirm-stay-btn',
  confirmLeaveBtn: '#confirm-leave-btn',
};
```

### 13.3 Board Validation

```typescript
function validateBoardState(grid: Grid): string[] {
  const errors: string[] = [];
  
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      
      // Must be 0 or power of 2
      if (val !== 0 && (val & (val - 1)) !== 0) {
        errors.push(`Invalid tile value at (${r},${c}): ${val}`);
      }
      
      // Must be positive
      if (val < 0) {
        errors.push(`Negative tile value at (${r},${c}): ${val}`);
      }
    }
  }
  
  return errors;
}
```

---

## 14. Migration Checklist

### Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS with theme system
- [ ] Set up folder structure per specification
- [ ] Install dependencies

### Phase 2: Core Logic
- [ ] Implement `SeededRandom` class
- [ ] Implement grid operations (slide, merge, rotate)
- [ ] Implement move function for all directions
- [ ] Implement tile spawning
- [ ] Implement win/lose detection

### Phase 3: AI Solver
- [ ] Implement weight matrix heuristics
- [ ] Implement `evaluateGrid` function
- [ ] Implement `expectimax` function
- [ ] Implement `getBestMove` function

### Phase 4: UI Components
- [ ] Tile component with value-based styling
- [ ] GridContainer with 4×4 layout
- [ ] StatsPanel (score, best)
- [ ] GameMessage overlay
- [ ] Controls (new game, hint, solve)

### Phase 5: Theming
- [ ] Implement theme provider
- [ ] Create CSS variables for each theme
- [ ] Theme picker in settings modal

### Phase 6: Input Handling
- [ ] Keyboard arrow key handling
- [ ] Touch swipe gesture handling
- [ ] AI auto-play with speed control

### Phase 7: Modals
- [ ] SettingsModal (theme, speed)
- [ ] ConfirmExitModal

### Phase 8: Persistence
- [ ] localStorage for best score
- [ ] Expose Game2048 namespace for testing

### Phase 9: Testing
- [ ] Migrate tests from tests.html
- [ ] Verify all test selectors
- [ ] Run full test suite

### Phase 10: Polish
- [ ] Verify tile animations
- [ ] Test responsive behavior
- [ ] Accessibility audit

---

## Appendix A: Direction Constants

```typescript
const DIRECTION_NAMES = ['Up', 'Right', 'Down', 'Left'] as const;

type Direction = 0 | 1 | 2 | 3;
type DirectionName = typeof DIRECTION_NAMES[number];

function getDirectionName(dir: Direction): DirectionName {
  return DIRECTION_NAMES[dir];
}
```

## Appendix B: Original Function Reference

| Function | Lines | Purpose |
|----------|-------|---------|
| `SeededRandom` | 9-24 | Deterministic RNG |
| `setSeed` | 30-33 | Set RNG seed |
| `getGrid/setGrid` | 35-43 | Board state access |
| `slideRow/combineRow` | 61-78 | Row operations |
| `move` (final) | 413-438 | Full move with rotation |
| `slideLeft` | 330-351 | Core slide logic |
| `rotateBoard` | 353-376 | Grid rotation |
| `addRandomTile` | 440-452 | Spawn new tile |
| `checkGameOver` | 454-467 | Game end detection |
| `getBestMove` | 567-583 | AI entry point |
| `expectimax` | 585-629 | Expectimax algorithm |
| `evaluateGrid` | 670-678 | Heuristic evaluation |
| `showHint` | 509-517 | Display hint |
| `toggleAutoPlay` | 519-525 | AI auto-play toggle |

---

*End of 2048 Game Specification Document*
