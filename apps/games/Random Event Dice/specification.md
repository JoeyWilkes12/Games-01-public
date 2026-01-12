# Random Event Dice - React + Vite + Tailwind Migration Specification

> **Document Version:** 1.0  
> **Source Files Analyzed:** `index.html` (271 lines), `script.js` (2055 lines/96 functions), `style.css` (1327 lines)  
> **Last Updated:** 2026-01-11

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Technology Stack Migration](#2-technology-stack-migration)
3. [Application Architecture](#3-application-architecture)
4. [State Management](#4-state-management)
5. [Component Hierarchy](#5-component-hierarchy)
6. [Component Specifications](#6-component-specifications)
7. [Core Classes & Logic](#7-core-classes--logic)
8. [UI/UX Specifications](#8-uiux-specifications)
9. [Styling & Design System](#9-styling--design-system)
10. [Advanced Settings Modal](#10-advanced-settings-modal)
11. [Audio System](#11-audio-system)
12. [Configuration & Persistence](#12-configuration--persistence)
13. [Testing Requirements](#13-testing-requirements)
14. [Migration Checklist](#14-migration-checklist)

---

## 1. Game Overview

### Game Description
Random Event Dice is a highly configurable dice rolling application designed for group games, probability testing, and event simulation. The game rolls dice at configurable intervals and triggers events when predefined conditions are met (e.g., doubles). Players take turns, and their statistics are tracked in an analytics dashboard.

### Core Features

| Feature | Description |
|---------|-------------|
| **Customizable Dice** | Configure 1-10 dice with 2-100 sides each |
| **Event Triggers** | Define complex conditions using AND/OR logic |
| **Pre-generated Samples** | Dice rolls are pre-computed for faster gameplay |
| **Seeded RNG** | Optional deterministic seeds for testing |
| **Timer System** | Configurable duration with +10 minute extension |
| **Pause/Resume** | Toggle game state without losing progress |
| **Player Tracking** | Unlimited players with custom names |
| **Analytics Dashboard** | Leaderboard, timeline, heatmap visualizations |
| **JSON Import/Export** | Complete configuration persistence |
| **Event Validation** | Detects impossible event definitions |

### Game Flow

```
[Start] → [Pre-generate Samples] → [Roll Loop Begins]
                                          ↓
                              ┌──────────────────────┐
                              │ Roll at Interval     │
                              │ (check event match)  │
                              └──────────────────────┘
                                          ↓
                           ┌──────── Match? ────────┐
                           │                        │
                          Yes                       No
                           ↓                        ↓
                    [Trigger Alert]          [Continue]
                    [End Turn]                    ↓
                    [Next Player]           [Update UI]
                           ↓                        ↓
                    [Reset Pause] ───────→ [Loop Back]
                                          
                    [Timer Expired] → [Game End] / [Extend]
```

---

## 2. Technology Stack Migration

### Current Stack
```
HTML5 + Vanilla CSS + Vanilla JavaScript (ES6 Class-based)
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
| `@headlessui/react` | Accessible modal, toggles |
| `framer-motion` | Dice shake animations |
| `react-hook-form` | Advanced settings form |
| `canvas` / `recharts` | Timeline graph rendering |

---

## 3. Application Architecture

### File Structure (Proposed)

```
src/
├── components/
│   ├── layout/
│   │   ├── AppContainer.tsx
│   │   ├── Header.tsx
│   │   ├── HomeButton.tsx
│   │   └── TimerDisplay.tsx
│   ├── game/
│   │   ├── DiceContainer.tsx
│   │   ├── Die.tsx
│   │   ├── AlertMessage.tsx
│   │   ├── RollsCounter.tsx
│   │   └── ExtendButton.tsx
│   ├── controls/
│   │   ├── ControlsPanel.tsx
│   │   ├── SettingsContent.tsx
│   │   ├── ActionButtons.tsx
│   │   └── ControlGroup.tsx
│   ├── analytics/
│   │   ├── AnalyticsPanel.tsx
│   │   ├── AnalyticsToggleBtn.tsx
│   │   ├── CurrentTurnInfo.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── LeaderboardItem.tsx
│   │   ├── Timeline.tsx
│   │   ├── TimelineItem.tsx
│   │   ├── TimelineGraph.tsx
│   │   ├── Heatmap.tsx
│   │   ├── HeatmapLegend.tsx
│   │   └── SkipToEndButton.tsx
│   ├── modals/
│   │   ├── AdvancedSettingsModal.tsx
│   │   ├── PlayerConfigSection.tsx
│   │   ├── PlayerInput.tsx
│   │   ├── EventDefinitionsSection.tsx
│   │   ├── EventDefinition.tsx
│   │   ├── RuleBadge.tsx
│   │   └── ConfirmExitModal.tsx
│   ├── debug/
│   │   ├── DebugConsole.tsx
│   │   └── DebugMessage.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Checkbox.tsx
│       ├── RangeSlider.tsx
│       └── IconButton.tsx
├── hooks/
│   ├── useGameState.ts
│   ├── useSeededRNG.ts
│   ├── useSamplePool.ts
│   ├── useAnalytics.ts
│   ├── useTimer.ts
│   ├── useRollLoop.ts
│   ├── useAudio.ts
│   └── useDebugConsole.ts
├── lib/
│   ├── SeededRNG.ts
│   ├── SamplePool.ts
│   ├── AnalyticsTracker.ts
│   ├── eventMatcher.ts
│   ├── eventValidator.ts
│   └── configValidator.ts
├── types/
│   ├── game.ts
│   ├── events.ts
│   ├── analytics.ts
│   └── config.ts
├── stores/
│   └── gameStore.ts
└── App.tsx
```

---

## 4. State Management

### Core Game State Interface

```typescript
interface GameState {
  // Game flow
  isPlaying: boolean;
  isPaused: boolean;
  isResetting: boolean;
  
  // Timer state
  duration: number;         // Total game duration in minutes
  remainingTime: number;    // Seconds remaining
  timerVisible: boolean;
  
  // Dice configuration
  diceCount: number;        // 1-10
  diceSides: number;        // 2-100
  diceValues: number[];     // Current dice values
  
  // Roll settings
  interval: number;         // Roll interval in seconds (0.1+)
  resetDuration: number;    // Pause after event in seconds
  
  // Audio
  soundEnabled: boolean;
  volume: number;           // 0-100
  
  // Seed
  seed: number | null;      // null = random
  
  // Player tracking
  players: Record<number, string>;  // {1: "Joey", 2: "Brinlee", ...}
  
  // Event definitions
  eventDefinitions: EventDefinition[];
  
  // Analytics settings
  analyticsEnabled: {
    leaderboard: boolean;
    timeline: boolean;
    heatmap: boolean;
  };
  panelWidth: number;       // 280-600px
  
  // Runtime state
  rollsSinceLastEvent: number;
  debugMessages: DebugMessage[];
}

interface EventDefinition {
  id: number;
  enabled: boolean;         // optional, defaults to true
  rules: EventRule[];       // All rules must match (AND logic)
}

interface EventRule {
  dieIndex: number;         // 0-based index
  operator: '==' | '!=' | '>' | '<';
  value: number;
}

interface DebugMessage {
  type: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
}
```

### Analytics State Interface

```typescript
interface AnalyticsState {
  // Current turn
  currentPlayerIndex: number;   // 1-based
  currentTurnRolls: number;
  currentTurnStartTime: number | null;
  turnNumber: number;
  
  // Player stats
  playerStats: Record<number, PlayerStats>;
  
  // Timeline (last 10 turns)
  timeline: TurnRecord[];
  
  // Heatmap (6x6 grid for 2d6)
  heatmap: number[][];
  totalRolls: number;
}

interface PlayerStats {
  totalRolls: number;
  totalTime: number;        // Seconds
  turnCount: number;
}

interface TurnRecord {
  turnNumber: number;
  playerId: number;
  playerName: string;
  rolls: number;
  time: number;             // Seconds
}

interface HeatmapData {
  grid: number[][];         // Raw counts
  proportions: number[][];  // Actual vs expected ratio
  totalRolls: number;
}
```

### Sample Pool State

```typescript
interface SamplePoolState {
  diceCount: number;
  diceSides: number;
  seed: number | null;
  samples: number[][];      // Pre-generated dice rolls
  currentIndex: number;
}
```

---

## 5. Component Hierarchy

```
App
└── AppContainer
    ├── Header
    │   ├── HomeButton (→ ConfirmExitModal)
    │   ├── Title ("Random Event Dice")
    │   └── TimerContainer
    │       ├── TimerDisplay ("60:00")
    │       └── ToggleTimerButton
    │
    ├── GameArea (main)
    │   ├── DiceContainer
    │   │   └── Die (×N, dynamic count)
    │   ├── AlertMessage ("EVENT TRIGGERED!")
    │   ├── RollsCounter
    │   └── ExtendButton ("+10 Minutes", conditional)
    │
    ├── AnalyticsPanel (fixed left sidebar)
    │   ├── AnalyticsHeader
    │   │   ├── Title ("📊 Analytics Dashboard")
    │   │   └── ToggleButton
    │   └── AnalyticsContent
    │       ├── CurrentTurnInfo
    │       │   ├── PlayerName
    │       │   └── TurnStats (Rolls, Time)
    │       ├── LeaderboardSection
    │       │   ├── SectionTitle ("🏆 Leaderboard")
    │       │   └── Leaderboard
    │       │       └── LeaderboardItem (×N)
    │       ├── TimelineSection
    │       │   ├── SectionTitle ("📅 Recent Turns")
    │       │   ├── TimelineGraph (canvas)
    │       │   └── Timeline
    │       │       └── TimelineItem (×10 max)
    │       ├── HeatmapSection
    │       │   ├── SectionTitle ("🔥 Dice Heatmap")
    │       │   ├── HeatmapLegend
    │       │   └── HeatmapGrid
    │       └── AnalyticsActions
    │           ├── SkipToEndButton
    │           └── MobileWarning
    │
    ├── AnalyticsToggleBtn (fixed, visible when panel hidden)
    │
    ├── ControlsPanel (bottom panel)
    │   ├── ControlsHeader
    │   │   ├── Title ("Settings")
    │   │   └── ToggleButton (gear icon)
    │   ├── SettingsContent (collapsible grid)
    │   │   ├── ControlGroup: Roll Interval
    │   │   ├── ControlGroup: Number of Dice
    │   │   ├── ControlGroup: Sides per Die
    │   │   ├── ControlGroup: Duration (minutes)
    │   │   ├── ControlGroup: Sound Toggle
    │   │   ├── ControlGroup: Volume Slider
    │   │   ├── ControlGroup: Reset Duration
    │   │   ├── ControlGroup: Panel Width
    │   │   ├── ControlGroup: Seed Select
    │   │   └── AdvancedSettingsButton
    │   └── ActionButtons
    │       ├── StartButton
    │       └── StopButton
    │
    ├── DebugConsole (fixed right sidebar, collapsed default)
    │   ├── DebugHeader
    │   │   ├── Title
    │   │   └── ToggleButton
    │   └── DebugContent
    │       └── DebugMessages
    │           └── DebugMessage (×N)
    │
    ├── AdvancedSettingsModal
    │   ├── ModalHeader
    │   │   ├── Title ("Advanced Event Logic")
    │   │   └── CloseButton
    │   ├── ModalBody (side-by-side columns)
    │   │   ├── PlayerConfigSection
    │   │   │   ├── SectionTitle ("👥 Player Configuration")
    │   │   │   ├── PlayerList
    │   │   │   │   └── PlayerInput (×N)
    │   │   │   └── AddPlayerButton
    │   │   └── EventDefinitionsSection
    │   │       ├── SectionTitle ("⚡ Event Logic")
    │   │       ├── IntroText
    │   │       ├── EventDefinitionsList
    │   │       │   └── EventDefinition (×N)
    │   │       │       ├── Header (ID, Remove)
    │   │       │       ├── RuleGroup
    │   │       │       │   ├── RuleBadge (×N)
    │   │       │       │   └── LogicOperator ("AND")
    │   │       │       └── AddRuleButton
    │   │       └── AddEventButton
    │   └── ModalFooter
    │       ├── ImportButton (📤 icon)
    │       └── SaveButtonGroup
    │           ├── SaveExportButton
    │           └── SaveButton
    │
    └── ConfirmExitModal
```

---

## 6. Component Specifications

### 6.1 Die Component

```typescript
interface DieProps {
  value: number;            // 1-N or 0 for placeholder "?"
  sides: number;            // For display logic
  isRolling: boolean;
  isMatch: boolean;         // Part of event trigger
  size?: 'sm' | 'md' | 'lg';
}
```

**Visual States:**
| State | Background | Border | Animation |
|-------|------------|--------|-----------|
| Placeholder | `surface-color` | `border-color` | none |
| Normal | `surface-color` | `border-color` | none |
| Rolling | `surface-color` | `border-color` | `shake` 0.3s |
| Match | `surface-color` | `accent-color` (red) | glow |

**Dimensions:**
| Breakpoint | Size | Font |
|------------|------|------|
| Desktop | 100×100px | 2.5rem |
| Tablet | 70×70px | 2rem |
| Mobile | 55×55px | 1.5rem |

### 6.2 TimerDisplay Component

```typescript
interface TimerDisplayProps {
  remainingTime: number;    // Seconds
  isVisible: boolean;       // Text visibility toggle
}

// Format: "MM:SS"
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

**Visual States:**
- Visible: Blue text with blue background tint
- Hidden: Container present but text transparent (prevents layout shift)

### 6.3 AnalyticsPanel Component

```typescript
interface AnalyticsPanelProps {
  isVisible: boolean;
  width: number;            // 280-600px
  onToggle: () => void;
}
```

**Layout:**
- Fixed left sidebar, full viewport height
- Min width: 280px, Max width: 600px
- Blue left border (2px, `primary-color`)
- Hidden via `transform: translateX(-100%)`

### 6.4 Heatmap Component

```typescript
interface HeatmapProps {
  data: HeatmapData;
  diceCount: number;
  diceSides: number;
}
```

**Only renders for 2d6 configuration.**

**Grid Layout:**
- 7×7 grid (1 header row + 6 data rows, 1 header col + 6 data cols)
- Fixed cell sizes: headers 24px, data cells 28px
- Max container width: 240px

**Heat Scale:**
| Class | Color | Meaning |
|-------|-------|---------|
| `heat-0` | Blue 10% | Very cold |
| `heat-1` | Blue 30% | Cold |
| `heat-2` | Blue 50% | Below expected |
| `heat-3` | Green 40% | Near expected |
| `heat-4` | Yellow 40% | Above expected |
| `heat-5` | Red 40% | Hot |
| `heat-6` | Red 70% | Very hot |

### 6.5 LeaderboardItem Component

```typescript
interface LeaderboardItemProps {
  rank: number;
  playerName: string;
  totalRolls: number;
  totalTime: number;
  isCurrent: boolean;
}
```

**Visual States:**
- Normal: `rgba(255, 255, 255, 0.05)` background
- Current: Blue background tint, blue border

**Rank Styling:**
- 1st: Gold (`#fbbf24`)
- 2nd: Silver (`#9ca3af`)
- 3rd: Bronze (`#cd7f32`)
- 4th+: Default secondary color

### 6.6 TimelineGraph Component

```typescript
interface TimelineGraphProps {
  timeline: TurnRecord[];
  maxTurns?: number;        // Default 10
}
```

**Canvas Drawing:**
- Height: 100px
- X-axis: Turn numbers (0-10)
- Y-axis: Rolls per turn
- Line: Cyan/blue color
- Points: Filled circles at data points

### 6.7 EventDefinition Component

```typescript
interface EventDefinitionProps {
  definition: EventDefinition;
  index: number;
  diceCount: number;
  onUpdate: (def: EventDefinition) => void;
  onRemove: () => void;
}
```

**Layout:**
- Card container with header (ID + remove button)
- Rule badges in flex wrap layout
- "AND" operators between rules
- Add rule button dropdown

---

## 7. Core Classes & Logic

### 7.1 SeededRNG Implementation

```typescript
class SeededRNG {
  private seed: number;
  
  // LCG constants (same as Bank game for consistency)
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = 2 ** 32;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;  // [0, 1)
  }
  
  roll(sides: number): number {
    return Math.floor(this.next() * sides) + 1;
  }
}
```

### 7.2 SamplePool Implementation

```typescript
class SamplePool {
  diceCount: number;
  diceSides: number;
  seed: number | null;
  rng: SeededRNG | null;
  samples: number[][];
  currentIndex: number;
  
  constructor(diceCount: number, diceSides: number, seed: number | null = null) {
    this.diceCount = diceCount;
    this.diceSides = diceSides;
    this.seed = seed;
    this.rng = seed !== null ? new SeededRNG(seed) : null;
    this.samples = [];
    this.currentIndex = 0;
  }
  
  calculateRequiredSamples(
    durationMin: number,
    intervalMs: number,
    resetDurationMs: number
  ): number {
    const rollsPerMinute = 60000 / intervalMs;
    const buffer = 1.5; // 50% extra for resets
    return Math.ceil(durationMin * rollsPerMinute * buffer);
  }
  
  generate(count: number): void {
    const startIdx = this.samples.length;
    for (let i = startIdx; i < count; i++) {
      const roll: number[] = [];
      for (let d = 0; d < this.diceCount; d++) {
        if (this.rng) {
          roll.push(this.rng.roll(this.diceSides));
        } else {
          roll.push(Math.floor(Math.random() * this.diceSides) + 1);
        }
      }
      this.samples.push(roll);
    }
  }
  
  getNext(): number[] {
    if (this.currentIndex >= this.samples.length) {
      this.generate(this.samples.length + 100);
    }
    return this.samples[this.currentIndex++];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  regenerate(seed: number | null): void {
    this.seed = seed;
    this.rng = seed !== null ? new SeededRNG(seed) : null;
    this.samples = [];
    this.currentIndex = 0;
  }
  
  updateConfig(diceCount: number, diceSides: number): void {
    if (this.diceCount !== diceCount || this.diceSides !== diceSides) {
      this.diceCount = diceCount;
      this.diceSides = diceSides;
      this.regenerate(this.seed);
    }
  }
}
```

### 7.3 Event Matching Logic

```typescript
function checkEventMatch(
  diceValues: number[],
  eventDefinitions: EventDefinition[]
): boolean {
  // OR logic: any definition matching triggers event
  return eventDefinitions.some(def => {
    if (def.enabled === false) return false;
    
    // AND logic: all rules in definition must match
    return def.rules.every(rule => {
      const dieValue = diceValues[rule.dieIndex];
      if (dieValue === undefined) return false;
      
      switch (rule.operator) {
        case '==': return dieValue === rule.value;
        case '!=': return dieValue !== rule.value;
        case '>':  return dieValue > rule.value;
        case '<':  return dieValue < rule.value;
        default:   return false;
      }
    });
  });
}
```

### 7.4 Event Validation (Impossible Events)

```typescript
interface ValidationResult {
  valid: boolean;
  warnings: string[];
}

function validateEventDefinitions(
  definitions: EventDefinition[],
  diceCount: number,
  diceSides: number
): ValidationResult {
  const warnings: string[] = [];
  
  for (const def of definitions) {
    // Check for impossible rules
    for (const rule of def.rules) {
      // Die index out of bounds
      if (rule.dieIndex >= diceCount) {
        warnings.push(`Event ${def.id}: Die ${rule.dieIndex + 1} doesn't exist`);
        continue;
      }
      
      // Value out of range
      if (rule.value < 1 || rule.value > diceSides) {
        if (rule.operator === '==' || rule.operator === '<') {
          warnings.push(`Event ${def.id}: Value ${rule.value} impossible for ${diceSides}-sided die`);
        }
      }
      
      // Impossible comparisons
      if (rule.operator === '>' && rule.value >= diceSides) {
        warnings.push(`Event ${def.id}: ${rule.value} can never be exceeded`);
      }
      if (rule.operator === '<' && rule.value <= 1) {
        warnings.push(`Event ${def.id}: Nothing is less than ${rule.value}`);
      }
    }
    
    // Check for conflicting rules on same die
    const rulesByDie: Record<number, EventRule[]> = {};
    for (const rule of def.rules) {
      if (!rulesByDie[rule.dieIndex]) rulesByDie[rule.dieIndex] = [];
      rulesByDie[rule.dieIndex].push(rule);
    }
    
    for (const [dieIdx, rules] of Object.entries(rulesByDie)) {
      const equalRules = rules.filter(r => r.operator === '==');
      if (equalRules.length > 1) {
        const values = new Set(equalRules.map(r => r.value));
        if (values.size > 1) {
          warnings.push(`Event ${def.id}: Die ${Number(dieIdx) + 1} cannot equal multiple values`);
        }
      }
    }
  }
  
  return { valid: warnings.length === 0, warnings };
}
```

### 7.5 AnalyticsTracker Key Methods

```typescript
class AnalyticsTracker {
  // Start a new turn for player
  startTurn(): void {
    this.currentTurnRolls = 0;
    this.currentTurnStartTime = Date.now();
  }
  
  // Record a single roll
  recordRoll(diceValues: number[]): void {
    this.currentTurnRolls++;
    this.totalRolls++;
    
    // Update heatmap for 2d6
    if (this.heatmap.length > 0 && diceValues.length === 2) {
      const d1 = diceValues[0] - 1;
      const d2 = diceValues[1] - 1;
      if (d1 >= 0 && d1 < 6 && d2 >= 0 && d2 < 6) {
        this.heatmap[d1][d2]++;
      }
    }
  }
  
  // End turn (event triggered)
  endTurn(): void {
    const elapsedTime = this.currentTurnStartTime
      ? (Date.now() - this.currentTurnStartTime) / 1000
      : 0;
    
    // Update player stats
    const stats = this.playerStats[this.currentPlayerIndex];
    stats.totalRolls += this.currentTurnRolls;
    stats.totalTime += elapsedTime;
    stats.turnCount++;
    this.turnNumber++;
    
    // Add to timeline
    this.timeline.unshift({
      turnNumber: this.turnNumber,
      playerId: this.currentPlayerIndex,
      playerName: this.players[this.currentPlayerIndex],
      rolls: this.currentTurnRolls,
      time: elapsedTime,
    });
    if (this.timeline.length > 10) this.timeline.pop();
    
    // Advance to next player
    this.currentPlayerIndex = (this.currentPlayerIndex % this.playerCount) + 1;
  }
  
  // Get leaderboard sorted by total rolls
  getLeaderboard(): LeaderboardEntry[] {
    return Object.entries(this.playerStats)
      .map(([id, stats]) => ({
        playerId: Number(id),
        playerName: this.players[Number(id)],
        ...stats,
      }))
      .sort((a, b) => b.totalRolls - a.totalRolls);
  }
  
  // Get heatmap data with proportions
  getHeatmapData(): HeatmapData {
    const expected = 1 / 36;  // 2.78% per combination
    const proportions: number[][] = [];
    
    for (let i = 0; i < 6; i++) {
      proportions[i] = [];
      for (let j = 0; j < 6; j++) {
        const actual = this.totalRolls > 0
          ? this.heatmap[i][j] / this.totalRolls
          : 0;
        proportions[i][j] = this.totalRolls > 0
          ? actual / expected
          : 1;  // Default to expected
      }
    }
    
    return {
      grid: this.heatmap,
      proportions,
      totalRolls: this.totalRolls,
    };
  }
}
```

---

## 8. UI/UX Specifications

### 8.1 Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              HEADER                                      │
│  🏠   Random Event Dice                                    [60:00] [→]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────┐                                                   │
│  │ 📊 Analytics      │                                                   │
│  │ ─────────────────│                    GAME AREA                      │
│  │ Current Turn:    │                                                   │
│  │ Joey             │         ┌────────┐    ┌────────┐                  │
│  │ Rolls: 5  Time:  │         │   3    │    │   5    │                  │
│  │ ─────────────────│         └────────┘    └────────┘                  │
│  │ 🏆 Leaderboard   │                                                   │
│  │ 1. Joey (45)     │              EVENT TRIGGERED!                     │
│  │ 2. Brinlee (32)  │                                                   │
│  │ ─────────────────│         Rolls since last event: 8                 │
│  │ 📅 Recent Turns  │                                                   │
│  │ [Graph]          │              [+10 Minutes]                        │
│  │ 1. Joey - 5      │                                                   │
│  │ 2. Brinlee - 3   │                                                   │
│  │ ─────────────────│                                                   │
│  │ 🔥 Heatmap       │                                                   │
│  │ [6×6 Grid]       │                                                   │
│  │ ─────────────────│                                                   │
│  │ [⏩ Skip to End] │                                                   │
│  └───────────────────┘                                                   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                          CONTROLS PANEL                                  │
│  Settings  [⚙️]                                                          │
│  ┌────────────────┬────────────────┬────────────────┬────────────────┐  │
│  │ Roll Interval  │ Number of Dice │ Sides per Die  │ Duration       │  │
│  │ [1.0     ]     │ [2        ]    │ [6        ]    │ [60       ]    │  │
│  ├────────────────┼────────────────┼────────────────┼────────────────┤  │
│  │ ☑ Sound Alert  │ Volume [====] │ Reset Duration │ Panel Width    │  │
│  │                │ 0%             │ [1.0     ]     │ [====] 320px   │  │
│  └────────────────┴────────────────┴────────────────┴────────────────┘  │
│  [Advanced Event Settings]                                              │
│                                               [Start Game]  [Stop]      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| Desktop (>768px) | Full layout with side panels |
| Tablet (≤768px) | Analytics panel full-width overlay, modal columns stack |
| Mobile (≤480px) | Single column settings, hide debug console |

### 8.3 Mobile Adaptations

**App Container:**
- Full viewport width/height
- No border radius

**Analytics Panel:**
- Full viewport width (100vw)
- Overlay on top of game area

**Controls Panel:**
- Reduced padding
- Single-column settings grid on mobile

**Dice:**
- Smaller sizes (55×55px on mobile)
- Reduced gap

**Modal:**
- Columns stack vertically
- 95% width

---

## 9. Styling & Design System

### 9.1 CSS Variables → Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg': '#0f172a',
        'text': '#e2e8f0',
        'primary': '#3b82f6',
        'primary-hover': '#2563eb',
        'secondary': '#94a3b8',
        'accent': '#ef4444',
        'accent-bright': '#dc2626',
        'surface': '#1e293b',
        'border': '#334155',
        'input-bg': '#0f172a',
        'input-text': '#e2e8f0',
      },
      borderRadius: {
        'DEFAULT': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'shake': 'shake 0.3s ease-in-out',
        'pulse-extend': 'pulseExtend 2s infinite',
        'analytics-flash': 'analyticsFlash 0.5s ease-out',
      },
      keyframes: {
        shake: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(5deg) scale(0.95)' },
          '50%': { transform: 'rotate(-5deg) scale(1.05)' },
          '75%': { transform: 'rotate(5deg) scale(0.95)' },
          '100%': { transform: 'rotate(0deg) scale(1)' },
        },
        pulseExtend: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)' },
        },
        analyticsFlash: {
          '0%, 100%': { background: '#1e293b' },
          '50%': { background: 'rgba(239, 68, 68, 0.3)' },
        },
      },
    },
  },
};
```

### 9.2 Alert State Background

```css
/* When event triggers, body background flashes red */
body.alert-active {
  background-color: #dc2626;
}

body.alert-active .app-container {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.4);
  border: 3px solid #fca5a5;
}
```

### 9.3 Button Variants

```typescript
const buttonVariants = {
  primary: `
    bg-primary text-white
    hover:bg-primary-hover hover:translate-y-[-1px]
    hover:shadow-[0_4px_6px_-1px_rgba(59,130,246,0.3)]
  `,
  primaryPaused: `
    bg-amber-500 text-white
    hover:bg-amber-600
  `,
  secondary: `
    bg-white/10 text-text border border-border
    hover:bg-white/15
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  secondaryDashed: `
    border-2 border-dashed border-border bg-transparent
    hover:border-primary hover:text-primary
  `,
  icon: `
    bg-transparent border-none text-secondary
    p-1 rounded hover:bg-white/10 hover:text-text
  `,
};
```

---

## 10. Advanced Settings Modal

### 10.1 Modal Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Advanced Event Logic                                        ✕   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │ 👥 Player Configuration │  │ ⚡ Event Logic              │   │
│  │ ─────────────────────── │  │ ───────────────────────────│   │
│  │ 1: [Joey           ] ✕  │  │ Alerts trigger if ANY      │   │
│  │ 2: [Brinlee        ] ✕  │  │ enabled Event Definition   │   │
│  │ 3: [Braxton        ] ✕  │  │ is met.                    │   │
│  │ ...                     │  │ ───────────────────────────│   │
│  │ [+ Add Player]          │  │ ┌─────────────────────────┐│   │
│  │                         │  │ │ Event #1           [✕]  ││   │
│  │                         │  │ │ [Die 1 == 1] AND        ││   │
│  │                         │  │ │ [Die 2 == 1]            ││   │
│  │                         │  │ │ [+ Add Rule ▾]          ││   │
│  │                         │  │ └─────────────────────────┘│   │
│  │                         │  │ ┌─────────────────────────┐│   │
│  │                         │  │ │ Event #2           [✕]  ││   │
│  │                         │  │ │ ...                     ││   │
│  │                         │  │ └─────────────────────────┘│   │
│  │                         │  │ [+ Add Event Definition]  │   │
│  └─────────────────────────┘  └─────────────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ [📤]                               [Save & Export] [Save]       │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Player Input Component

```typescript
interface PlayerInputProps {
  index: number;            // 1-based display index
  name: string;
  onUpdate: (name: string) => void;
  onRemove: () => void;
  canRemove: boolean;       // Min 1 player
}
```

### 10.3 Split Save Buttons

```tsx
<div className="save-button-group">
  <button 
    className="primary-btn split-left"
    onClick={handleSaveAndExport}
  >
    Save & Export
  </button>
  <button 
    className="primary-btn split-right"
    onClick={handleSaveOnly}
  >
    Save
  </button>
</div>
```

---

## 11. Audio System

### 11.1 Web Audio API Implementation

```typescript
interface AudioSystem {
  audioCtx: AudioContext | null;
  volume: number;           // 0-100
  enabled: boolean;
  
  playBeep(): void;
  setVolume(volume: number): void;
  setEnabled(enabled: boolean): void;
}

function playBeep(): void {
  if (!this.enabled || this.volume === 0) return;
  
  if (!this.audioCtx) {
    this.audioCtx = new AudioContext();
  }
  
  const oscillator = this.audioCtx.createOscillator();
  const gainNode = this.audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(this.audioCtx.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(660, this.audioCtx.currentTime);
  oscillator.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.1);
  
  gainNode.gain.value = this.volume / 100;
  
  oscillator.start();
  oscillator.stop(this.audioCtx.currentTime + 0.2);
}
```

---

## 12. Configuration & Persistence

### 12.1 JSON Configuration Schema

```typescript
interface GameConfig {
  version: '2.0';
  name: string;
  settings: {
    interval: number;       // Milliseconds
    resetDuration: number;  // Milliseconds (or seconds if >=2.1)
    diceCount: number;
    diceSides: number;
    duration: number;       // Minutes
    volume: number;
    soundEnabled: boolean;
    seed: number | null;
  };
  players: Record<string, string>;  // {"1": "Joey", "2": "Brinlee", ...}
  analytics: {
    enableLeaderboard: boolean;
    enableTimeline: boolean;
    enableHeatmap: boolean;
    panelWidth: number;
  };
  eventDefinitions: EventDefinition[];
}
```

### 12.2 Config Validation

```typescript
function validateConfigStructure(config: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (typeof config !== 'object' || config === null) {
    return { valid: false, errors: ['Config must be an object'] };
  }
  
  const c = config as Record<string, unknown>;
  
  // Version check
  if (c.version !== '2.0') {
    errors.push(`Unsupported version: ${c.version}`);
  }
  
  // Settings validation
  if (typeof c.settings !== 'object') {
    errors.push('Missing settings object');
  } else {
    const s = c.settings as Record<string, unknown>;
    if (typeof s.interval !== 'number' || s.interval < 100) {
      errors.push('Invalid interval');
    }
    if (typeof s.diceCount !== 'number' || s.diceCount < 1 || s.diceCount > 10) {
      errors.push('Dice count must be 1-10');
    }
    if (typeof s.diceSides !== 'number' || s.diceSides < 2 || s.diceSides > 100) {
      errors.push('Dice sides must be 2-100');
    }
  }
  
  // Players validation
  if (typeof c.players !== 'object') {
    errors.push('Missing players object');
  } else {
    const playerCount = Object.keys(c.players as object).length;
    if (playerCount < 1) {
      errors.push('At least 1 player required');
    }
  }
  
  // Event definitions validation
  if (!Array.isArray(c.eventDefinitions)) {
    errors.push('eventDefinitions must be an array');
  }
  
  return { valid: errors.length === 0, errors };
}
```

### 12.3 Legacy Import Compatibility

```typescript
// Handle old ms-based resetDuration
function applyConfig(config: GameConfig): void {
  let resetDurationSec = config.settings.resetDuration;
  
  // If value is >= 100, assume it's milliseconds (legacy)
  if (resetDurationSec >= 100) {
    resetDurationSec = resetDurationSec / 1000;
  }
  
  this.settings.resetDuration = resetDurationSec;
}
```

---

## 13. Testing Requirements

### 13.1 Test Categories

| Category | Count | Description |
|----------|-------|-------------|
| Config Validation | ~5 | JSON structure, required fields |
| Seeded RNG | ~3 | Deterministic sequences |
| Analytics Tracker | ~4 | Rolls, heatmap, player rotation |
| Skip to End | ~2 | Simulation produces correct results |
| Event Logic | ~2 | Matching, validation |
| Player Config | ~3 | Names, unlimited count |
| Panel Width | ~3 | Bounds enforcement (280-600px) |
| Reset Duration | ~4 | Seconds format, legacy ms import |
| Heatmap Sizing | ~2 | Container constraints |
| Modal Layout | ~2 | Side-by-side, split buttons |

### 13.2 Test Selectors (IDs to preserve)

```typescript
const testSelectors = {
  // Header
  timerDisplay: '#timer-display',
  toggleTimerVisibility: '#toggle-timer-visibility',
  homeBtn: '#home-btn',
  
  // Game area
  diceContainer: '#dice-container',
  alertMessage: '#alert-message',
  rollsCount: '#rolls-count',
  extendBtn: '#extend-btn',
  
  // Analytics
  analyticsPanel: '#analytics-panel',
  analyticsContent: '#analytics-content',
  toggleAnalytics: '#toggle-analytics',
  showAnalyticsBtn: '#show-analytics-btn',
  currentPlayerName: '#current-player-name',
  currentTurnRolls: '#current-turn-rolls',
  currentTurnTime: '#current-turn-time',
  leaderboard: '#leaderboard',
  timeline: '#timeline',
  timelineCanvas: '#timeline-canvas',
  heatmapContainer: '#heatmap-container',
  skipToEndBtn: '#skip-to-end-btn',
  
  // Controls
  settingsContent: '#settings-content',
  toggleSettings: '#toggle-settings',
  intervalInput: '#interval-input',
  diceCountInput: '#dice-count-input',
  diceSidesInput: '#dice-sides-input',
  durationInput: '#duration-input',
  soundToggle: '#sound-toggle',
  volumeInput: '#volume-input',
  resetDurationInput: '#reset-duration-input',
  panelWidthInput: '#panel-width-input',
  panelWidthDisplay: '#panel-width-display',
  seedSelect: '#seed-select',
  advancedSettingsBtn: '#advanced-settings-btn',
  startBtn: '#start-btn',
  stopBtn: '#stop-btn',
  
  // Advanced modal
  advancedModal: '#advanced-modal',
  closeModal: '#close-modal',
  playerList: '#player-list',
  addPlayerBtn: '#add-player-btn',
  eventDefinitionsList: '#event-definitions-list',
  addEventBtn: '#add-event-btn',
  importJsonBtn: '#import-json-btn',
  jsonFileInput: '#json-file-input',
  saveExportBtn: '#save-export-btn',
  saveAdvancedBtn: '#save-advanced-btn',
  
  // Debug
  debugConsole: '#debug-console',
  debugContent: '#debug-content',
  debugMessages: '#debug-messages',
  toggleDebug: '#toggle-debug',
  
  // Exit modal
  confirmExitModal: '#confirm-exit-modal',
  confirmStayBtn: '#confirm-stay-btn',
  confirmLeaveBtn: '#confirm-leave-btn',
};
```

### 13.3 Seeded Test Pattern

```typescript
test('seed 12345 produces deterministic rolls', async ({ page }) => {
  await page.goto('/random-event-dice');
  
  // Import test config with seed
  await page.evaluate(() => {
    const config = {
      version: '2.0',
      settings: { seed: 12345, diceCount: 2, diceSides: 6, ... },
      ...
    };
    game.applyConfig(config);
    game.preGenerateSamples();
  });
  
  // Start and verify first roll
  await page.click('#start-btn');
  await page.waitForTimeout(200);
  
  const dice = await page.$$eval('.die', els => 
    els.map(el => parseInt(el.textContent))
  );
  
  expect(dice).toEqual([3, 5]); // Expected from seed
});
```

---

## 14. Migration Checklist

### Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS with dark theme
- [ ] Set up folder structure per specification
- [ ] Install dependencies

### Phase 2: Core Logic Classes
- [ ] Implement `SeededRNG` class
- [ ] Implement `SamplePool` class
- [ ] Implement `AnalyticsTracker` class
- [ ] Implement event matching/validation functions

### Phase 3: UI Primitives
- [ ] Button variants (primary, secondary, icon)
- [ ] Input components (text, number, range, select, checkbox)
- [ ] Die component with animations
- [ ] IconButton component

### Phase 4: Layout Components
- [ ] AppContainer with dark theme
- [ ] Header with timer
- [ ] GameArea
- [ ] ControlsPanel (collapsible)
- [ ] DebugConsole (collapsible)

### Phase 5: Analytics Dashboard
- [ ] AnalyticsPanel (fixed sidebar)
- [ ] CurrentTurnInfo
- [ ] Leaderboard + LeaderboardItem
- [ ] Timeline + TimelineItem
- [ ] TimelineGraph (canvas)
- [ ] Heatmap + HeatmapLegend
- [ ] SkipToEndButton

### Phase 6: Game Logic Integration
- [ ] Roll loop with interval
- [ ] Event matching and alerts
- [ ] Player turn rotation
- [ ] Timer countdown
- [ ] Pause/Resume functionality

### Phase 7: Modals
- [ ] AdvancedSettingsModal
- [ ] PlayerConfigSection
- [ ] EventDefinitionsSection
- [ ] ConfirmExitModal

### Phase 8: Configuration
- [ ] JSON import/export
- [ ] Config validation
- [ ] Legacy format migration

### Phase 9: Testing
- [ ] Migrate Playwright tests
- [ ] Verify all selectors
- [ ] Run full test suite

### Phase 10: Polish
- [ ] Verify all animations
- [ ] Test responsive breakpoints
- [ ] Accessibility audit
- [ ] Performance optimization

---

## Appendix A: Default Players

```typescript
const DEFAULT_PLAYERS: Record<number, string> = {
  1: 'Joey',
  2: 'Brinlee',
  3: 'Braxton',
  4: 'Gavin',
  5: 'Hinckley',
  6: 'London',
  7: 'Bode',
  8: 'Macey',
  9: 'Ryder',
  10: 'Lily',
  11: 'Jack',
  12: 'Cole',
  13: 'Gracen',
  14: 'Connor',
  15: 'Friend',
};
```

## Appendix B: Default Event Definitions (Doubles)

```typescript
const DEFAULT_EVENT_DEFINITIONS: EventDefinition[] = [
  { id: 1, rules: [{ dieIndex: 0, operator: '==', value: 1 }, { dieIndex: 1, operator: '==', value: 1 }] },
  { id: 2, rules: [{ dieIndex: 0, operator: '==', value: 2 }, { dieIndex: 1, operator: '==', value: 2 }] },
  { id: 3, rules: [{ dieIndex: 0, operator: '==', value: 3 }, { dieIndex: 1, operator: '==', value: 3 }] },
  { id: 4, rules: [{ dieIndex: 0, operator: '==', value: 4 }, { dieIndex: 1, operator: '==', value: 4 }] },
  { id: 5, rules: [{ dieIndex: 0, operator: '==', value: 5 }, { dieIndex: 1, operator: '==', value: 5 }] },
  { id: 6, rules: [{ dieIndex: 0, operator: '==', value: 6 }, { dieIndex: 1, operator: '==', value: 6 }] },
];
```

## Appendix C: Original Class Methods Reference

| Class/Function | Lines | Purpose |
|----------------|-------|---------|
| `SeededRNG` | 5-20 | Deterministic RNG |
| `SamplePool` | 26-99 | Pre-generate dice rolls |
| `AnalyticsTracker` | 105-371 | Player statistics tracking |
| `DiceGame` | 373-2013 | Main game controller |
| `DiceGame.rollDice` | 1831-1856 | Execute single roll |
| `DiceGame.checkAlertCondition` | 1864-1895 | Check event triggers |
| `DiceGame.triggerAlert` | 1897-1926 | Handle event match |
| `DiceGame.skipToEnd` | 774-827 | Simulate remaining game |
| `DiceGame.exportConfig` | 1241-1282 | Export JSON |
| `DiceGame.importConfig` | 1284-1335 | Import JSON |
| `confirmGameExit` | 2022-2035 | Exit confirmation |

---

*End of Random Event Dice Specification Document*
