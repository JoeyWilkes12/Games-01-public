# Sliding Puzzle 3x3 - React + Vite + Tailwind Migration Specification

> **Document Version:** 1.0  
> **Source Files Analyzed:** `index.html` (124 lines), `script.js` (498 lines/37 functions), `style.css` (661 lines)  
> **Last Updated:** 2026-01-11

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Technology Stack Migration](#2-technology-stack-migration)
3. [Application Architecture](#3-application-architecture)
4. [State Management](#4-state-management)
5. [Component Hierarchy](#5-component-hierarchy)
6. [Component Specifications](#6-component-specifications)
7. [Game Logic & Solver](#7-game-logic--solver)
8. [UI/UX Specifications](#8-uiux-specifications)
9. [Styling & Theming System](#9-styling--theming-system)
10. [Audio System](#10-audio-system)
11. [Configuration & Persistence](#11-configuration--persistence)
12. [Testing Requirements](#12-testing-requirements)
13. [Migration Checklist](#13-migration-checklist)

---

## 1. Game Overview

### Game Description
A classic 3×3 sliding tile puzzle with two modes:
- **Kids Mode**: Color-matching puzzle with 5 unique colors (no numbers)
- **Advanced Mode**: Traditional numbered puzzle (1-8)

### Core Rules

| Rule | Description |
|------|-------------|
| **Grid** | 3×3 grid with 8 tiles and 1 empty space |
| **Movement** | Click tiles adjacent to empty space to slide them |
| **Kids Mode** | Match the scrambled colors to the target pattern |
| **Advanced Mode** | Arrange tiles 1-8 in order with empty space at end |
| **Win Condition** | Current state matches target state |

### Features

| Feature | Description |
|---------|-------------|
| **Two Game Modes** | Kids (colors) and Advanced (numbers 1-8) |
| **Target Display** | Shows the pattern to match |
| **Move Counter** | Tracks moves taken |
| **Optimal Moves** | Shows A* solver's solution length |
| **Hint System** | Highlights the best tile to move |
| **Auto-Solve** | AI solves puzzle automatically |
| **Multiple Themes** | Classic Toy, Dark Mode, Pastel Dream, Neon Arcade |
| **Stats Toggle** | Show/hide move counters |

---

## 2. Technology Stack Migration

### Current Stack
```
HTML5 + Vanilla CSS + Vanilla JavaScript
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
| `framer-motion` | Tile slide animations |

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
│   │   ├── MainContent.tsx
│   │   ├── TargetPanel.tsx
│   │   ├── PlayPanel.tsx
│   │   ├── Grid.tsx
│   │   ├── Tile.tsx
│   │   └── StatsBar.tsx
│   ├── controls/
│   │   ├── Controls.tsx
│   │   ├── NewGameButton.tsx
│   │   ├── AdvancedToggle.tsx
│   │   ├── HintButton.tsx
│   │   └── SolveButton.tsx
│   ├── modals/
│   │   ├── SettingsModal.tsx
│   │   ├── WinOverlay.tsx
│   │   └── ConfirmExitModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Select.tsx
│       ├── RangeSlider.tsx
│       └── ToggleSwitch.tsx
├── hooks/
│   ├── useGameState.ts
│   ├── useSolver.ts
│   ├── useAutoSolve.ts
│   └── useTheme.ts
├── lib/
│   ├── gridOperations.ts
│   ├── solver.ts
│   └── puzzleGenerator.ts
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
type TileValue = number;  // 0 = empty, 1-8 = numbered, or color index

interface GameState {
  // Puzzle state
  currentState: TileValue[];    // Current 9-element array
  targetState: TileValue[];     // Target pattern
  
  // Game mode
  isAdvancedMode: boolean;
  
  // Tracking
  movesTaken: number;
  optimalMoves: number | null;  // null if not calculated
  
  // UI state
  theme: 'classic' | 'dark' | 'pastel' | 'neon';
  showStats: boolean;
  hintTileIndex: number | null;
  
  // Auto-solve state
  isSolving: boolean;
  isAutoSolving: boolean;
  autoSolveSpeed: number;       // 100-1000ms
  
  // Win state
  hasWon: boolean;
}
```

### Color Constants

```typescript
const COLORS_KIDS = [
  'color-red',
  'color-blue',
  'color-green',
  'color-yellow',
  'color-orange',
] as const;

const COLORS_ADVANCED = [
  'color-red',
  'color-blue',
  'color-green',
  'color-yellow',
  'color-orange',
  'color-purple',
  'color-cyan',
  'color-pink',
] as const;
```

### Solver State

```typescript
interface SolverNode {
  state: number[];
  path: number[];          // Indices of tiles to click
  g: number;               // Cost to reach this state
  h: number;               // Heuristic estimate
  f: number;               // g + h
}
```

---

## 5. Component Hierarchy

```
App
└── ThemeProvider (data-theme attribute)
    └── GameContainer
        ├── Header
        │   ├── HomeButton (🏠)
        │   ├── Title ("Color Match!")
        │   └── SettingsButton (⚙️)
        │
        ├── MainContent (flex container)
        │   ├── TargetPanel
        │   │   ├── Title ("Make This:")
        │   │   └── Grid (mini-grid, 150×150px)
        │   │       └── Tile (×9, non-interactive)
        │   │
        │   └── PlayPanel
        │       ├── StatsBar (optional)
        │       │   ├── MoveCount
        │       │   └── OptimalCount ("Best: --")
        │       └── Grid (main-grid, 300×300px)
        │           └── Tile (×9, interactive)
        │
        ├── Controls
        │   ├── NewGameButton (↻ icon)
        │   ├── AdvancedToggle (🎓 Advanced)
        │   └── HintGroup
        │       ├── HintButton (💡 Hint)
        │       └── SolveButton (🤖 Play for Me)
        │
        ├── SettingsModal
        │   ├── ModalHeader
        │   │   ├── Title ("Settings")
        │   │   └── CloseButton
        │   ├── ThemePicker (select)
        │   ├── StatsToggle (Show Stats)
        │   └── SpeedSlider (Auto-Play Speed)
        │
        ├── WinOverlay
        │   ├── Message ("You Did It! 🎉")
        │   └── PlayAgainButton
        │
        └── ConfirmExitModal
```

---

## 6. Component Specifications

### 6.1 Tile Component

```typescript
interface TileProps {
  value: number;           // 0 = empty, 1+ = tile
  colorClass: string;      // e.g., "color-red"
  index: number;
  isAdvanced: boolean;     // Show number
  isInteractive: boolean;  // Main grid vs target grid
  isHint: boolean;         // Highlight for hint
  onClick?: () => void;
}
```

**Visual States:**
| State | Appearance |
|-------|------------|
| Normal | Color background, shine overlay |
| Empty | Transparent with inset shadow |
| Hint | Pulse animation, white border |
| Advanced | Shows number (font-size: 2rem) |
| Kids | No number (font-size: 0) |

**Dimensions:**
| Grid Type | Tile Size |
|-----------|-----------|
| Main Grid (300×300) | ~90×90px |
| Mini Grid (150×150) | ~45×45px |

### 6.2 Grid Component

```typescript
interface GridProps {
  state: number[];
  isAdvancedMode: boolean;
  isInteractive: boolean;
  size: 'main' | 'mini';
  hintIndex: number | null;
  onTileClick?: (index: number) => void;
}
```

**Layout:**
- CSS Grid: 3×3
- Gap: 8px (main), 4px (mini)
- Padding: 8px (main), 4px (mini)
- Border radius: 10px
- Background: Wood frame color

### 6.3 StatsBar Component

```typescript
interface StatsBarProps {
  movesTaken: number;
  optimalMoves: number | null;
  isVisible: boolean;
}
```

**Display:**
- "Moves: **{movesTaken}**"
- "Best: **{optimalMoves}**" (or "--" if null)

### 6.4 AdvancedToggle Component

```typescript
interface AdvancedToggleProps {
  isActive: boolean;
  onToggle: () => void;
}
```

**States:**
- Inactive: Default button styling
- Active: `active` class with accent styling

---

## 7. Game Logic & Solver

### 7.1 Grid Operations

```typescript
const GRID_SIZE = 3;

function getNeighbors(index: number): number[] {
  const neighbors: number[] = [];
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  
  if (row > 0) neighbors.push(index - GRID_SIZE);           // Up
  if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE); // Down
  if (col > 0) neighbors.push(index - 1);                    // Left
  if (col < GRID_SIZE - 1) neighbors.push(index + 1);        // Right
  
  return neighbors;
}

function canMove(state: number[], tileIndex: number): boolean {
  const emptyIndex = state.indexOf(0);
  return getNeighbors(emptyIndex).includes(tileIndex);
}

function performMove(state: number[], tileIndex: number): number[] {
  const emptyIndex = state.indexOf(0);
  if (!getNeighbors(emptyIndex).includes(tileIndex)) {
    return state; // Invalid move
  }
  
  const newState = [...state];
  [newState[emptyIndex], newState[tileIndex]] = [newState[tileIndex], newState[emptyIndex]];
  return newState;
}

function checkWin(current: number[], target: number[]): boolean {
  return JSON.stringify(current) === JSON.stringify(target);
}
```

### 7.2 Puzzle Generation

```typescript
// Generate solvable puzzle via random walk
function randomWalk(state: number[], moves: number): number[] {
  const result = [...state];
  let lastEmpty = -1;
  
  for (let i = 0; i < moves; i++) {
    const emptyIdx = result.indexOf(0);
    const neighbors = getNeighbors(emptyIdx).filter(n => n !== lastEmpty);
    
    if (neighbors.length === 0) continue;
    
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    [result[emptyIdx], result[randomNeighbor]] = [result[randomNeighbor], result[emptyIdx]];
    lastEmpty = emptyIdx;
  }
  
  return result;
}

// Kids Mode: 5 unique colors
function setupKidsGame(): { current: number[]; target: number[] } {
  // Colors repeat: [1,2,3,4,5,1,2,3,0] for example
  const colorIndices = [1, 2, 3, 4, 5, 1, 2, 3, 0];
  const target = randomWalk(colorIndices, 50);
  const current = randomWalk(target, 40);
  return { current, target };
}

// Advanced Mode: 1-8 numbered
function setupAdvancedGame(): { current: number[]; target: number[] } {
  const canonical = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const target = randomWalk(canonical, 50);
  const current = randomWalk(target, 40);
  return { current, target };
}
```

### 7.3 A* Solver Implementation

```typescript
interface SolverResult {
  path: number[];      // Indices of tiles to click
  iterations: number;
}

class Solver {
  start: number[];
  target: number[];
  isAdvanced: boolean;
  
  constructor(start: number[], target: number[], isAdvanced: boolean) {
    this.start = start;
    this.target = target;
    this.isAdvanced = isAdvanced;
  }
  
  solve(): number[] | null {
    const openSet: SolverNode[] = [];
    const closedSet = new Set<string>();
    
    const startH = this.heuristic(this.start);
    openSet.push({
      state: this.start,
      path: [],
      g: 0,
      h: startH,
      f: startH,
    });
    
    let iterations = 0;
    const MAX_ITERATIONS = 5000;
    
    while (openSet.length > 0) {
      iterations++;
      if (iterations > MAX_ITERATIONS) return null;
      
      // Sort by f-score (lowest first)
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      
      const currentStr = JSON.stringify(current.state);
      if (currentStr === JSON.stringify(this.target)) {
        return current.path;
      }
      
      closedSet.add(currentStr);
      
      const emptyIdx = current.state.indexOf(0);
      const neighbors = getNeighbors(emptyIdx);
      
      for (const nIdx of neighbors) {
        const nextState = [...current.state];
        [nextState[emptyIdx], nextState[nIdx]] = [nextState[nIdx], nextState[emptyIdx]];
        
        const nextStr = JSON.stringify(nextState);
        if (closedSet.has(nextStr)) continue;
        
        const gScore = current.g + 1;
        const hScore = this.heuristic(nextState);
        const fScore = gScore + hScore;
        
        const existing = openSet.find(n => JSON.stringify(n.state) === nextStr);
        if (existing) {
          if (gScore < existing.g) {
            existing.g = gScore;
            existing.f = fScore;
            existing.path = [...current.path, nIdx];
          }
        } else {
          openSet.push({
            state: nextState,
            path: [...current.path, nIdx],
            g: gScore,
            h: hScore,
            f: fScore,
          });
        }
      }
    }
    
    return null; // No solution found
  }
  
  heuristic(state: number[]): number {
    let total = 0;
    
    if (this.isAdvanced) {
      // Manhattan distance for unique tiles
      for (let i = 0; i < state.length; i++) {
        const val = state[i];
        if (val === 0) continue;
        const targetIdx = this.target.indexOf(val);
        total += this.manhattan(i, targetIdx);
      }
    } else {
      // Handle duplicate colors - find minimum assignment
      const currentPos: Record<number, number[]> = {};
      const targetPos: Record<number, number[]> = {};
      
      state.forEach((v, i) => {
        if (v !== 0) {
          (currentPos[v] ||= []).push(i);
        }
      });
      
      this.target.forEach((v, i) => {
        if (v !== 0) {
          (targetPos[v] ||= []).push(i);
        }
      });
      
      for (const val in currentPos) {
        const sources = currentPos[val];
        const dests = targetPos[val];
        
        sources.forEach(sIdx => {
          let minD = Infinity;
          dests.forEach(dIdx => {
            const d = this.manhattan(sIdx, dIdx);
            if (d < minD) minD = d;
          });
          total += minD;
        });
      }
    }
    
    return total;
  }
  
  manhattan(idx1: number, idx2: number): number {
    const row1 = Math.floor(idx1 / GRID_SIZE);
    const col1 = idx1 % GRID_SIZE;
    const row2 = Math.floor(idx2 / GRID_SIZE);
    const col2 = idx2 % GRID_SIZE;
    
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  }
}
```

### 7.4 Hint & Auto-Solve

```typescript
function getHintMove(current: number[], target: number[], isAdvanced: boolean): number | null {
  const solver = new Solver(current, target, isAdvanced);
  const path = solver.solve();
  
  if (path && path.length > 0) {
    return path[0]; // First move in solution
  }
  return null;
}

function getOptimalMoveCount(current: number[], target: number[], isAdvanced: boolean): number | null {
  const solver = new Solver(current, target, isAdvanced);
  const path = solver.solve();
  return path ? path.length : null;
}
```

---

## 8. UI/UX Specifications

### 8.1 Layout

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                               │
│ 🏠   Color Match!                               ⚙️  │
├─────────────────────────────────────────────────────┤
│                                                      │
│   MAIN CONTENT                                       │
│                                                      │
│   ┌────────────────┐    ┌────────────────────────┐  │
│   │  Make This:    │    │  Moves: 0   Best: --   │  │
│   │ ┌─┬─┬─┐        │    │ ┌───┬───┬───┐          │  │
│   │ │R│B│G│        │    │ │ B │ R │ G │          │  │
│   │ ├─┼─┼─┤        │    │ ├───┼───┼───┤          │  │
│   │ │Y│O│R│        │    │ │ Y │ O │ R │          │  │
│   │ ├─┼─┼─┤        │    │ ├───┼───┼───┤          │  │
│   │ │B│G│ │        │    │ │ B │   │ G │          │  │
│   │ └─┴─┴─┘        │    │ └───┴───┴───┘          │  │
│   └────────────────┘    └────────────────────────┘  │
│                                                      │
│                    CONTROLS                          │
│                     ( ↻ )                            │
│                [🎓 Advanced]                         │
│            [💡 Hint]  [🤖 Play for Me]              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 8.2 Responsive Behavior

**Mobile Height Optimizations:**

| Viewport Height | Grid Sizes | Padding |
|-----------------|------------|---------|
| > 700px | Main: 300×300, Mini: 150×150 | Normal |
| 600-700px | Main: 260×260, Mini: 120×120 | Reduced |
| < 600px | Main: 220×220, Mini: 100×100 | Minimal |

---

## 9. Styling & Theming System

### 9.1 Theme Variables

```javascript
// tailwind.config.js
const themes = {
  classic: {
    bgColor: '#f0f8ff',
    primaryColor: '#ff6b6b',
    textColor: '#333',
    woodFrame: '#e0c097',
    woodBg: '#fdf5e6',
    tileRed: '#e74c3c',
    tileBlue: '#3498db',
    tileGreen: '#2ecc71',
    tileYellow: '#f1c40f',
    tileOrange: '#e67e22',
    tilePurple: '#9b59b6',
    tileCyan: '#1abc9c',
    tilePink: '#ff9ff3',
  },
  dark: {
    bgColor: '#2c3e50',
    primaryColor: '#e74c3c',
    textColor: '#ffffff',
    woodFrame: '#34495e',
    woodBg: '#2c3e50',
    tileRed: '#c0392b',
    tileBlue: '#2980b9',
    tileGreen: '#27ae60',
    tileYellow: '#f39c12',
    tileOrange: '#d35400',
  },
  pastel: {
    bgColor: '#fdf2e9',
    primaryColor: '#ffb8b8',
    textColor: '#636e72',
    woodFrame: '#dfe6e9',
    woodBg: '#fff',
    tileRed: '#fab1a0',
    tileBlue: '#74b9ff',
    tileGreen: '#55efc4',
    tileYellow: '#ffeaa7',
    tileOrange: '#fdcb6e',
  },
  neon: {
    bgColor: '#000',
    primaryColor: '#f0f',
    textColor: '#0f0',
    woodFrame: '#111',
    woodBg: '#000',
    tileRed: '#ff0055',
    tileBlue: '#00ccff',
    tileGreen: '#39ff14',
    tileYellow: '#ffff00',
    tileOrange: '#ff5e00',
  },
};
```

### 9.2 Tile Color Classes

```css
.color-red { background-color: var(--tile-red); }
.color-blue { background-color: var(--tile-blue); }
.color-green { background-color: var(--tile-green); }
.color-yellow { background-color: var(--tile-yellow); }
.color-orange { background-color: var(--tile-orange); }
.color-purple { background-color: var(--tile-purple); }
.color-cyan { background-color: var(--tile-cyan); }
.color-pink { background-color: var(--tile-pink); }
```

### 9.3 Animations

```css
/* Hint pulse animation */
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.tile.hint-suggested {
  animation: pulse 1.5s infinite;
  z-index: 10;
  border: 3px solid white;
}

/* Win overlay pop-in */
@keyframes popIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

## 10. Audio System

The current implementation does not include audio. If desired for migration:

```typescript
interface AudioSystem {
  playTileMove(): void;
  playWin(): void;
  setVolume(volume: number): void;
}
```

---

## 11. Configuration & Persistence

### 11.1 Settings Persistence

```typescript
interface GameSettings {
  theme: 'classic' | 'dark' | 'pastel' | 'neon';
  showStats: boolean;
  autoSolveSpeed: number;
}

const STORAGE_KEY = 'sliding-puzzle-settings';

function saveSettings(settings: GameSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadSettings(): GameSettings {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    theme: 'classic',
    showStats: false,
    autoSolveSpeed: 500,
  };
}
```

---

## 12. Testing Requirements

### 12.1 Test Categories

| Category | Description |
|----------|-------------|
| Core Logic | Tile movement, valid moves |
| Win Detection | State comparison |
| Solver | A* algorithm correctness |
| Heuristic | Manhattan distance calculation |
| Puzzle Generation | Solvability via random walk |
| UI Modes | Kids vs Advanced mode switching |

### 12.2 Test Selectors (IDs to preserve)

```typescript
const testSelectors = {
  // Grids
  targetGrid: '#target-grid',
  gameGrid: '#game-grid',
  
  // Stats
  statsPanel: '#stats-panel',
  moveCount: '#move-count',
  optimalCount: '#optimal-count',
  
  // Controls
  newGameBtn: '#new-game-btn',
  advancedBtn: '#advanced-btn',
  hintBtn: '#hint-btn',
  solveBtn: '#solve-btn',
  
  // Settings modal
  settingsBtn: '#settings-btn',
  settingsModal: '#settings-modal',
  closeSettings: '#close-settings',
  themePicker: '#theme-picker',
  statsToggle: '#stats-toggle',
  speedRange: '#speed-range',
  
  // Overlays
  winOverlay: '#win-overlay',
  playAgainBtn: '#play-again-btn',
  
  // Exit modal
  homeBtn: '#home-btn',
  confirmExitModal: '#confirm-exit-modal',
  confirmStayBtn: '#confirm-stay-btn',
  confirmLeaveBtn: '#confirm-leave-btn',
};
```

---

## 13. Migration Checklist

### Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS with theme system
- [ ] Set up folder structure per specification
- [ ] Install dependencies

### Phase 2: Core Logic
- [ ] Implement grid operations (getNeighbors, canMove)
- [ ] Implement move execution
- [ ] Implement win detection
- [ ] Implement puzzle generation (random walk)

### Phase 3: A* Solver
- [ ] Implement Solver class
- [ ] Implement Manhattan distance heuristic
- [ ] Handle duplicate colors for Kids mode
- [ ] Implement hint functionality

### Phase 4: UI Components
- [ ] Tile component with color classes
- [ ] Grid component (main and mini sizes)
- [ ] StatsBar component
- [ ] Controls (new game, advanced toggle, hint, solve)

### Phase 5: Game Modes
- [ ] Kids mode setup (5 colors)
- [ ] Advanced mode setup (1-8 numbers)
- [ ] Mode toggle functionality

### Phase 6: Theming
- [ ] Implement theme provider
- [ ] Create CSS variables for each theme
- [ ] Theme picker in settings modal

### Phase 7: Modals
- [ ] SettingsModal (theme, stats, speed)
- [ ] WinOverlay (success celebration)
- [ ] ConfirmExitModal

### Phase 8: Auto-Solve
- [ ] Implement auto-solve loop
- [ ] Configurable speed (100-1000ms)
- [ ] Stop on win or cancel

### Phase 9: Testing
- [ ] Migrate tests from tests.html
- [ ] Verify all test selectors
- [ ] Run full test suite

### Phase 10: Polish
- [ ] Verify tile animations
- [ ] Test responsive behavior
- [ ] Accessibility audit

---

## Appendix A: Color Mapping

```typescript
// Kids mode: 5 colors mapping
const KIDS_COLOR_MAP: Record<number, string> = {
  0: '',             // Empty
  1: 'color-red',
  2: 'color-blue',
  3: 'color-green',
  4: 'color-yellow',
  5: 'color-orange',
};

// Advanced mode: 8 colors mapping
const ADVANCED_COLOR_MAP: Record<number, string> = {
  0: '',             // Empty
  1: 'color-red',
  2: 'color-blue',
  3: 'color-green',
  4: 'color-yellow',
  5: 'color-orange',
  6: 'color-purple',
  7: 'color-cyan',
  8: 'color-pink',
};
```

## Appendix B: Original Function Reference

| Function | Lines | Purpose |
|----------|-------|---------|
| `init` | 47-107 | Game initialization |
| `startNewGame` | 109-120 | Reset and setup game |
| `setupKidsGame` | 124-134 | Kids mode setup |
| `setupAdvancedGame` | 136-146 | Advanced mode setup |
| `randomWalk` | 148-163 | Generate solvable puzzle |
| `getNeighbors` | 165-174 | Get adjacent indices |
| `handleTileClick` | 178-183 | Handle tile interaction |
| `performMove` | 185-201 | Execute tile move |
| `checkWin` | 203-208 | Check win condition |
| `render` | 212-237 | Render grid UI |
| `Solver.solve` | 260-323 | A* algorithm |
| `Solver.heuristic` | 325-354 | Calculate h-score |
| `Solver.manhattan` | 356-362 | Manhattan distance |
| `showHint` | 367-381 | Display hint |
| `updateOptimalMoveCount` | 383-393 | Update best moves display |
| `toggleAutoSolve` | 411-417 | Auto-solve toggle |
| `startAutoSolve` | 419-428 | Start auto-solve |
| `stopAutoSolve` | 430-436 | Stop auto-solve |
| `executeNextAutoMove` | 438-457 | Execute one auto move |
| `confirmGameExit` | 461-474 | Exit confirmation |

---

*End of Sliding Puzzle 3x3 Specification Document*
