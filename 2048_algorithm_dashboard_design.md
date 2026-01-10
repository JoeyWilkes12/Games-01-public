# 2048 Algorithm Runtime Dashboard - Design Document

## Overview

This document outlines the design for a real-time visualization dashboard that shows what's happening "under the hood" during AI gameplay. Each algorithm (Expectimax, MCTS, Greedy) will have its own visualization tailored to how it works.

---

## Dashboard Concept

### Vision
A collapsible side panel or overlay that provides real-time insight into the AI's decision-making process. The dashboard should be:
- **Non-intrusive**: Can be toggled on/off without affecting gameplay
- **Educational**: Helps users understand how each algorithm works
- **Algorithm-specific**: Shows relevant metrics for each algorithm type

### Location Options
1. **Side Panel** (recommended): Slides in from the right, ~300px wide
2. **Overlay Mode**: Semi-transparent overlay on top of the game
3. **Bottom Drawer**: Slides up from below the game grid

---

## Algorithm-Specific Visualizations

### 1. Expectimax Dashboard

**Core Concept**: Shows the search tree being explored

```
┌─────────────────────────────────────┐
│ 🧠 EXPECTIMAX AI                    │
├─────────────────────────────────────┤
│ Current Depth: 4/5                  │
│ Nodes Evaluated: 1,247              │
│ Time: 45ms                          │
├─────────────────────────────────────┤
│ MOVE SCORES:                        │
│  ⬆️ UP:    284,500 ████████░░  85%  │
│  ⬅️ LEFT:  267,200 ███████░░░  78%  │
│  ⬇️ DOWN:  198,400 █████░░░░░  58%  │
│  ➡️ RIGHT: 145,600 ████░░░░░░  42%  │
├─────────────────────────────────────┤
│ HEURISTICS BREAKDOWN:               │
│  Position:     +182,400             │
│  Monotonicity: +54,200              │
│  Smoothness:   +12,800              │
│  Empty Cells:  +35,100              │
├─────────────────────────────────────┤
│ 📊 Decision: UP (85% confidence)    │
└─────────────────────────────────────┘
```

**Metrics to Display:**
- Current search depth (with adaptive indicator)
- Total nodes evaluated this move
- Decision time in milliseconds
- Score breakdown by direction (with mini bar charts)
- Heuristic contribution breakdown
- Final decision with confidence score
- "Why this move?" tooltip explanation

**Visual Elements:**
- Animated search depth indicator
- Color-coded move scores (green = best, red = worst)
- Pie chart for heuristic contributions
- Tree visualization preview (simplified)

---

### 2. Monte Carlo Tree Search (MCTS) Dashboard

**Core Concept**: Shows simulations being run and win rates

```
┌─────────────────────────────────────┐
│ 🎲 MONTE CARLO AI                   │
├─────────────────────────────────────┤
│ Simulations: 100 / 100              │
│ Rollout Depth: 38 avg               │
│ Time: 120ms                         │
├─────────────────────────────────────┤
│ WIN RATES BY MOVE:                  │
│  ⬆️ UP:    72% ████████░░ (25 sims) │
│  ⬅️ LEFT:  68% ███████░░░ (25 sims) │
│  ⬇️ DOWN:  45% █████░░░░░ (25 sims) │
│  ➡️ RIGHT: 31% ███░░░░░░░ (25 sims) │
├─────────────────────────────────────┤
│ SIMULATION STATS:                   │
│  Avg Final Score: 12,480            │
│  Max Score Seen: 28,640             │
│  Avg Moves/Sim: 38                  │
├─────────────────────────────────────┤
│ 🎯 LIVE ROLLOUTS:                   │
│  [████████░░] 72% → UP              │
│  Current sim reaching: 2048 tile!   │
├─────────────────────────────────────┤
│ 📊 Decision: UP (72% win rate)      │
└─────────────────────────────────────┘
```

**Metrics to Display:**
- Simulations completed / total
- Average rollout depth
- Win rate per move direction
- Number of simulations per move
- Live simulation feed (shows what's happening in current sim)
- Average/max scores from simulations
- "Hot streaks" indicator for moves doing well

**Visual Elements:**
- Animated progress bar for simulations
- Live simulation mini-game visualization
- Histogram of final scores from simulations
- Confidence meters for each move

---

### 3. Greedy Dashboard

**Core Concept**: Shows immediate evaluation comparison

```
┌─────────────────────────────────────┐
│ ⚡ GREEDY AI                        │
├─────────────────────────────────────┤
│ Evaluation Time: <1ms               │
│ Mode: Immediate + Heuristic         │
├─────────────────────────────────────┤
│ MOVE EVALUATION:                    │
│  ⬆️ UP:    Immediate: +48           │
│            Heuristic: +124,800      │
│            TOTAL: 124,848 ✓ BEST    │
│  ──────────────────────────────────│
│  ⬅️ LEFT:  Immediate: +8            │
│            Heuristic: +98,200       │
│            TOTAL: 98,208            │
│  ──────────────────────────────────│
│  ⬇️ DOWN:  Immediate: +0            │
│            Heuristic: +45,600       │
│            TOTAL: 45,600            │
│  ──────────────────────────────────│
│  ➡️ RIGHT: BLOCKED (no move)        │
├─────────────────────────────────────┤
│ ⚠️ Warning: No lookahead!           │
│ Greedy may miss long-term strategy  │
├─────────────────────────────────────┤
│ 📊 Decision: UP (instant)           │
└─────────────────────────────────────┘
```

**Metrics to Display:**
- Evaluation time (should be near-instant)
- Immediate score gain for each move
- Heuristic score for each resulting board
- Combined total
- "Blocked" indicator for invalid moves
- Warning about lack of lookahead

**Visual Elements:**
- Simple comparison bars
- Checkmark on winning move
- Speed indicator (showing how fast decisions are)
- Minimal animation (matching the algorithm's speed)

---

## Shared Dashboard Elements

### Common Header
```
┌──────────────────────────────────────────────┐
│ 📈 AI Dashboard                    [X] Close │
│ ─────────────────────────────────────────────│
│ Algorithm: [🧠 Expectimax ▼]  Speed: [███░░] │
│ ─────────────────────────────────────────────│
│ Moves Made: 142    Avg Time: 23ms            │
│ Max Tile: 1024     Current Score: 12,480     │
└──────────────────────────────────────────────┘
```

### Performance History Chart
A small line chart showing:
- Decision time per move (last 20 moves)
- Score progression over time

### Toggle Controls
- [Show/Hide] Move Scores
- [Show/Hide] Heuristics
- [Show/Hide] Live Simulation (MCTS only)
- [Verbose/Compact] Mode

---

## Implementation Architecture

### 1. Data Collection Layer

```javascript
// AlgorithmStats object updated during each decision
const AlgorithmStats = {
    current: 'expectimax',
    lastMove: {
        timestamp: Date.now(),
        direction: 0, // UP
        decisionTimeMs: 45,
        nodesEvaluated: 1247,
        depth: 4,
        scores: {
            up: 284500,
            left: 267200,
            down: 198400,
            right: 145600
        },
        heuristics: {
            position: 182400,
            monotonicity: 54200,
            smoothness: 12800,
            emptyCells: 35100
        },
        confidence: 0.85
    },
    history: [], // Last 20 moves
    sessionStats: {
        totalMoves: 142,
        avgTimeMs: 23,
        maxTile: 1024
    }
};
```

### 2. Dashboard Component

```javascript
class AlgorithmDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isVisible = false;
        this.updateInterval = null;
    }
    
    show() { /* Slide in animation */ }
    hide() { /* Slide out animation */ }
    toggle() { /* Toggle visibility */ }
    
    updateStats(stats) {
        // Called after each AI move
        this.renderMoveScores(stats.scores);
        this.renderHeuristics(stats.heuristics);
        this.renderDecision(stats.lastMove);
    }
    
    startLiveMode() {
        // For MCTS: show simulations in real-time
    }
}
```

### 3. Integration Points

**In `script.js`:**
```javascript
function playNextMove() {
    const startTime = performance.now();
    
    // Get move based on algorithm
    const result = getBestMoveWithStats(board);
    
    const endTime = performance.now();
    
    // Update dashboard
    if (algorithmDashboard.isVisible) {
        algorithmDashboard.updateStats({
            decisionTimeMs: endTime - startTime,
            ...result.stats
        });
    }
    
    // Execute move
    move(result.direction);
}
```

---

## UI/UX Specifications

### Toggle Button
- Location: Next to settings gear icon
- Icon: 📊 or chart icon
- Tooltip: "Show AI Dashboard"

### Panel Animation
- Slide in from right: 300ms ease-out
- Backdrop: Optional semi-transparent overlay
- Mobile: Bottom sheet instead of side panel

### Color Scheme
- Best move: `#10b981` (green)
- Good move: `#3b82f6` (blue)
- Okay move: `#f59e0b` (amber)
- Bad move: `#ef4444` (red)
- Blocked: `#6b7280` (gray)

### Typography
- Stats numbers: Monospace font
- Labels: Sans-serif
- Large counters: Bold, slightly larger

---

## Performance Considerations

1. **Throttle Updates**: Only update DOM every 100ms during autoplay
2. **Canvas Rendering**: Use canvas for complex visualizations
3. **Memory**: Keep only last 20 moves in history
4. **Lazy Loading**: Don't compute stats if dashboard is hidden

---

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Create dashboard container in HTML
- [ ] Implement toggle button and slide animation
- [ ] Create basic stats display (time, moves)
- [ ] Add stats collection to existing algorithms

### Phase 2: Expectimax Dashboard
- [ ] Implement move score visualization
- [ ] Add heuristic breakdown display
- [ ] Show depth and node count
- [ ] Add confidence indicator

### Phase 3: MCTS Dashboard
- [ ] Implement simulation progress bar
- [ ] Add win rate per move display
- [ ] Create live simulation preview
- [ ] Add histogram visualization

### Phase 4: Greedy Dashboard
- [ ] Implement simple comparison view
- [ ] Add immediate vs heuristic split
- [ ] Show speed comparisons

### Phase 5: Polish
- [ ] Add animations and transitions
- [ ] Implement compact/verbose modes
- [ ] Add history chart
- [ ] Mobile responsive design

---

## Future Enhancements

1. **Algorithm Comparison Mode**: Run all three algorithms on same position, show comparison
2. **Replay Mode**: Step through decisions with full dashboard state
3. **Export Stats**: Download session stats as JSON/CSV
4. **Learning Mode**: Explain why each heuristic matters
5. **Custom Weights**: Let users adjust heuristic weights live

---

## References

- Expectimax algorithm visualization: https://github.com/nneonneo/2048-ai
- MCTS visualization patterns: AlphaGo documentaries
- Dashboard design inspiration: Chess engine eval bars (Lichess, Chess.com)
