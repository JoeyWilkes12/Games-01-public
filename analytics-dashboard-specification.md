# 2048 AI Analytics Dashboard - React + Vite + Tailwind Migration Specification

> **Document Version:** 1.0  
> **Source Files Analyzed:** `definitions.html` (167 lines), `dashboard.html` (168 lines), `research.html` (122 lines), `dashboard.js` (521 lines), `dashboard.css` (684 lines), `dashboard_data.js` (1203 lines)  
> **Last Updated:** 2026-01-11

---

## Table of Contents

1. [Dashboard Overview](#1-dashboard-overview)
2. [Page Structure](#2-page-structure)
3. [Technology Stack Migration](#3-technology-stack-migration)
4. [Application Architecture](#4-application-architecture)
5. [State Management](#5-state-management)
6. [Component Hierarchy](#6-component-hierarchy)
7. [Page Specifications](#7-page-specifications)
   - [7.1 Definitions Page](#71-definitions-page)
   - [7.2 Dashboard Page](#72-dashboard-page)
   - [7.3 Research Page](#73-research-page)
8. [Component Specifications](#8-component-specifications)
9. [Data & Charting](#9-data--charting)
10. [Styling & Design System](#10-styling--design-system)
11. [Navigation & Routing](#11-navigation--routing)
12. [Testing Requirements](#12-testing-requirements)
13. [Migration Checklist](#13-migration-checklist)

---

## 1. Dashboard Overview

### Purpose
The 2048 AI Analytics Dashboard is a 3-page web application that presents research data from systematic testing of AI algorithms playing 2048. It provides educational content about algorithms, interactive data visualizations, and academic references.

### Pages

| Page | Route | Purpose |
|------|-------|---------|
| **Definitions** | `/definitions` | Algorithm explanations, scoring rules, grid sizes |
| **Dashboard** | `/dashboard` | Interactive charts, data exploration, run logs |
| **Research** | `/research` | Academic references and citations |

### Key Features

| Feature | Description |
|---------|-------------|
| **Algorithm Explanations** | Monte Carlo, Expectimax, IDDFS Graph Search, Reinforcement Learning |
| **Interactive Charts** | Chart.js visualizations with filtering |
| **Data Explorer** | Pivot-style grouping and metrics |
| **Run Log Table** | Paginated, searchable data table |
| **Academic References** | Linked research papers |
| **Responsive Design** | Mobile-friendly layout |

---

## 2. Page Structure

### Navigation Flow

```
                    ┌─────────────────────────────────────┐
                    │           SHARED HEADER              │
                    │ ← Back to Hub    Title    Menu ▼    │
                    │                           ├─ Definitions
                    │                           ├─ Dashboard
                    │                           └─ Research
                    └─────────────────────────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
    ┌──────▼──────┐           ┌───────▼───────┐          ┌───────▼───────┐
    │ DEFINITIONS │           │   DASHBOARD   │          │   RESEARCH    │
    │             │           │               │          │               │
    │ • Score Def │           │ • Stats Cards │          │ • References  │
    │ • Algorithms│           │ • Best Algo   │          │ • Citations   │
    │ • Grid Sizes│           │ • Grid Winner │          │ • Paper Links │
    │ • Context   │           │ • Explorer    │          │               │
    │             │           │ • Charts ×4   │          │               │
    │             │           │ • Data Table  │          │               │
    └─────────────┘           └───────────────┘          └───────────────┘
```

---

## 3. Technology Stack Migration

### Current Stack
```
HTML5 + Vanilla CSS + Vanilla JavaScript + Chart.js
```

### Target Stack
```
React 18+ | Vite 5+ | Tailwind CSS 3+ | TypeScript | React Router
```

### Recommended Libraries

| Library | Purpose |
|---------|---------|
| `react-router-dom` | Page routing |
| `chart.js` + `react-chartjs-2` | Chart rendering |
| `zustand` | Lightweight state management |
| `tailwind-merge` | Class utilities |
| `@tanstack/react-table` | Data table with pagination |

---

## 4. Application Architecture

### File Structure (Proposed)

```
src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   ├── NavDropdown.tsx
│   │   └── BackLink.tsx
│   ├── definitions/
│   │   ├── ScoreDefinitionCard.tsx
│   │   ├── AlgorithmGrid.tsx
│   │   ├── AlgorithmCard.tsx
│   │   ├── GridSizeSection.tsx
│   │   ├── GridSizeCard.tsx
│   │   └── ResearchContext.tsx
│   ├── dashboard/
│   │   ├── SummaryGrid.tsx
│   │   ├── StatCard.tsx
│   │   ├── BestAlgorithmChart.tsx
│   │   ├── GridSizeAnalysis.tsx
│   │   ├── GridWinnerCard.tsx
│   │   ├── GridSizeChart.tsx
│   │   ├── DataExplorer.tsx
│   │   ├── ExplorerControls.tsx
│   │   ├── ChartsGrid.tsx
│   │   ├── ScoreDistributionChart.tsx
│   │   ├── MaxTileFrequencyChart.tsx
│   │   ├── TimelineChart.tsx
│   │   └── DataTable.tsx
│   ├── research/
│   │   ├── ReferencesList.tsx
│   │   └── ReferenceItem.tsx
│   └── ui/
│       ├── Card.tsx
│       ├── ChartCard.tsx
│       ├── Button.tsx
│       ├── Select.tsx
│       └── SearchInput.tsx
├── hooks/
│   ├── useDashboardData.ts
│   ├── useChartData.ts
│   └── usePagination.ts
├── lib/
│   ├── dataAggregation.ts
│   ├── chartConfigs.ts
│   └── algorithmNames.ts
├── types/
│   ├── dashboard.ts
│   └── research.ts
├── data/
│   └── dashboardData.ts
├── pages/
│   ├── DefinitionsPage.tsx
│   ├── DashboardPage.tsx
│   └── ResearchPage.tsx
└── App.tsx
```

---

## 5. State Management

### Dashboard Data Interface

```typescript
interface DashboardRecord {
  Index: number;
  Algorithm: AlgorithmCode;
  "Full Name": string | null;
  "Grid Area": number;        // 16 (4×4) or 25 (5×5)
  Score: number;
  Notes: string | null;
}

type AlgorithmCode = 'Mc' | 'E' | 'Igs' | 'Rl';

interface DashboardData {
  records: DashboardRecord[];
}
```

### Algorithm Mapping

```typescript
const ALGORITHM_NAMES: Record<AlgorithmCode, string> = {
  'Mc': 'Monte Carlo',
  'E': 'Expectimax Tree',
  'Igs': 'IDDFS Graph Search',
  'Rl': 'Reinforcement Learning',
};

const GRID_NAMES: Record<number, string> = {
  9: '3×3',
  16: '4×4',
  25: '5×5',
};
```

### Table Pagination State

```typescript
interface TableState {
  currentPage: number;
  recordsPerPage: number;       // 5, 10, 25, 50, 100, 'all'
  searchQuery: string;
  filteredRecords: DashboardRecord[];
}
```

### Explorer State

```typescript
interface ExplorerState {
  groupBy: 'Algorithm' | 'Grid Area' | 'Max Tile';
  metric: 'Score' | 'Moves' | 'Count';
}
```

---

## 6. Component Hierarchy

### Shared Layout

```
App (Router)
├── DefinitionsPage
├── DashboardPage
└── ResearchPage

Each page uses:
└── DashboardLayout
    ├── Header
    │   ├── NavLeft (BackLink → "← Back to Hub")
    │   ├── NavCenter (Title + Subtitle)
    │   └── NavRight (NavDropdown)
    │       └── DropdownContent
    │           ├── NavLink → Definitions
    │           ├── NavLink → Dashboard
    │           └── NavLink → Research
    └── Main (dashboard-container)
        └── [Page-specific content]
```

### Definitions Page Hierarchy

```
DefinitionsPage
└── DashboardLayout
    └── Main
        ├── ScoreDefinitionCard (highlight-card)
        │   ├── InfoIcon (📊)
        │   ├── Title ("Understanding the Score")
        │   ├── Definition (emphasized text)
        │   └── Example (styled quote)
        │
        ├── DefinitionsSection
        │   ├── Title ("Algorithm Explanations")
        │   ├── Intro
        │   └── AlgorithmGrid (4 cards)
        │       ├── AlgorithmCard (Mc - Monte Carlo)
        │       │   ├── AlgoHeader (abbrev badge + name)
        │       │   ├── Description
        │       │   └── Traits (tags)
        │       ├── AlgorithmCard (E - Expectimax)
        │       ├── AlgorithmCard (Igs - IDDFS)
        │       └── AlgorithmCard (Rl - Reinforcement Learning)
        │
        ├── GridSizeSection
        │   ├── Title ("Grid Sizes Tested")
        │   └── GridSizes
        │       ├── GridSizeCard (4×4)
        │       └── GridSizeCard (5×5)
        │
        └── ResearchContextSection
            ├── Title ("Research Context")
            ├── Intro
            ├── ContextList (bullet points)
            └── Links (→ Dashboard, → Research)
```

### Dashboard Page Hierarchy

```
DashboardPage
└── DashboardLayout
    └── Main
        ├── SummaryGrid (3 stat cards)
        │   ├── StatCard (Total Runs)
        │   ├── StatCard (Highest Score)
        │   └── StatCard (Avg Max Tile)
        │
        ├── AnalysisSection (Best Algorithm)
        │   └── ChartCard (full-width)
        │       ├── Title ("🏆 Best Performing Algorithm")
        │       └── Canvas (bestAlgoChart)
        │
        ├── GridAnalysisSection
        │   ├── SectionHeader ("📐 Best Algorithm by Grid Size")
        │   ├── GridWinnerCards (dynamic)
        │   │   ├── GridWinnerCard (4×4 → winner)
        │   │   └── GridWinnerCard (5×5 → winner)
        │   └── ChartCard (full-width)
        │       ├── Title ("Algorithm Performance by Grid Size")
        │       └── Canvas (gridSizeChart)
        │
        ├── ExplorerSection
        │   ├── SectionHeader
        │   │   ├── Title ("Data Explorer")
        │   │   └── Controls
        │   │       ├── GroupBy Select
        │   │       └── Metric Select
        │   └── ChartCard (full-width, explorerChart)
        │
        ├── ChartsGrid (Row 1 - 2 charts)
        │   ├── ChartCard (Score Distribution)
        │   └── ChartCard (Max Tile Frequency)
        │
        ├── ChartsGrid (Row 2 - 1 full-width)
        │   └── ChartCard (Timeline, full-width)
        │
        └── DataSection
            ├── SectionHeader
            │   ├── Title ("Detailed Run Log")
            │   └── Controls
            │       ├── RowsLimit Select
            │       └── SearchInput
            ├── TableContainer
            │   └── ScrollContainer
            │       └── Table (#runs-table)
            │           ├── THead (sticky)
            │           │   └── Row (ID, Algorithm, Grid Size, Score, Notes)
            │           └── TBody (dynamic rows)
            └── PaginationControls
                ├── PrevButton
                ├── PageInfo ("Page X of Y")
                └── NextButton
```

### Research Page Hierarchy

```
ResearchPage
└── DashboardLayout
    └── Main
        └── ResearchSection
            ├── SectionHeader ("Algorithm Research & References")
            └── ReferencesList (grid)
                ├── ReferenceItem
                │   ├── RefContent
                │   │   ├── Title
                │   │   ├── Citation
                │   │   └── Link ("View Paper")
                │   └── ...
                └── ... (7 reference items)
```

---

## 7. Page Specifications

### 7.1 Definitions Page

**Route:** `/definitions.html` → `/definitions`

**Purpose:** Educational content explaining 2048 scoring, AI algorithms, and grid configurations.

#### Sections

##### 7.1.1 Score Definition Card

```html
<section class="info-card highlight-card">
  <div class="info-icon">📊</div>
  <h2>Understanding the Score</h2>
  <p class="score-definition">
    The <strong>score</strong> in 2048 is the <em>cumulative sum of all tile merges</em>...
  </p>
  <p class="score-example">
    For example: When two 2-tiles merge into a 4, you earn 4 points...
  </p>
</section>
```

**Key Points:**
- Score = sum of all merges (not max tile value)
- Examples: 2+2=4 → +4 points, 4+4=8 → +8 points

##### 7.1.2 Algorithm Grid

| Algorithm | Abbreviation | Color Gradient | Traits |
|-----------|--------------|----------------|--------|
| Monte Carlo | Mc | Blue (#38bdf8 → #0ea5e9) | Statistical, Random Sampling |
| Expectimax Tree | E | Green (#10b981 → #059669) | Tree Search, Expected Value |
| IDDFS Graph Search | Igs | Purple (#8b5cf6 → #7c3aed) | Graph Search, Iterative Deepening |
| Reinforcement Learning | Rl | Orange (#f59e0b → #d97706) | Machine Learning, Adaptive |

##### 7.1.3 Grid Sizes

| Grid | Visual Size | Description | Area |
|------|-------------|-------------|------|
| 4×4 | 80×80px | Standard grid | 16 cells |
| 5×5 | 100×100px | Extended grid | 25 cells |

##### 7.1.4 Research Context

- Evaluates average score per algorithm
- Measures consistency across runs
- Analyzes grid size effects
- Identifies dominant algorithms

---

### 7.2 Dashboard Page

**Route:** `/dashboard.html` → `/dashboard`

**Purpose:** Interactive data visualization and exploration of AI performance data.

#### Sections

##### 7.2.1 Summary Statistics

| Stat | ID | Calculation |
|------|----|-------------|
| Total Runs | `#stat-total-runs` | `records.length` |
| Highest Score | `#stat-high-score` | `Math.max(...records.map(r => r.Score))` |
| Avg Max Tile | `#stat-avg-tile` | Average of inferred max tiles |

##### 7.2.2 Best Algorithm Chart

- **Type:** Horizontal Bar Chart
- **Data:** Average score per algorithm across all runs
- **Rendering:** Chart.js with custom gradient colors

```typescript
interface BestAlgoData {
  algorithm: string;
  avgScore: number;
  runCount: number;
}
```

##### 7.2.3 Grid Size Analysis

- **Winner Cards:** Show best algorithm per grid size
- **Comparison Chart:** Grouped bar chart (algorithms × grid sizes)

```typescript
interface GridWinner {
  gridArea: number;
  gridName: string;      // "4×4", "5×5"
  winnerAlgo: string;
  avgScore: number;
}
```

##### 7.2.4 Data Explorer

**Controls:**
| Control | Options | Default |
|---------|---------|---------|
| Group By | Algorithm, Grid Area, Max Tile | Algorithm |
| Metric | Average Score, Average Moves, Count of Runs | Score |

**Chart:** Dynamic bar chart based on selections

##### 7.2.5 Charts Grid

| Chart | Type | Description |
|-------|------|-------------|
| Score Distribution | Bar | Histogram of scores |
| Max Tile Frequency | Doughnut/Pie | Distribution of max tiles achieved |
| Timeline | Line | Scores over run sequence |

##### 7.2.6 Data Table

**Columns:**
| Column | Field | Sortable |
|--------|-------|----------|
| Run ID | Index | Yes |
| Algorithm | Algorithm (expanded name) | Yes |
| Grid Size | Grid Area (formatted) | Yes |
| Score | Score (formatted) | Yes |
| Notes | Notes | No |

**Features:**
- Pagination (5, 10, 25, 50, 100, All)
- Search filter
- Sticky header
- Scroll container (max 500px height)

---

### 7.3 Research Page

**Route:** `/research.html` → `/research`

**Purpose:** Academic references for algorithms tested.

#### References List

| Paper Title | Authors | Source |
|------------|---------|--------|
| End-to-End One-Shot Path-Planning Algorithm | Bian, Xing, Zolotas (2022) | Sensors 22(24) |
| Mastering 2048 with Delayed Temporal Coherence Learning | Jaśkowski (2016) | arXiv |
| Dynamic Simulation Monte-Carlo Tree Search | Lan et al. (2020) | arXiv |
| BSNN: Bistable Neurons | Li, Zeng, Zhao (2021) | arXiv |
| Minimax and Expectimax Algorithm | Munir (n.d.) | ITB PDF |
| Investigation into 2048 AI Strategies | Rodgers & Levine (2014) | IEEE CIG |
| DeepSearch via Monte Carlo Tree Search | Wu et al. (2025) | arXiv |

---

## 8. Component Specifications

### 8.1 AlgorithmCard Component

```typescript
interface AlgorithmCardProps {
  abbreviation: string;
  name: string;
  description: string;
  traits: string[];
  colorVariant: 'default' | 'e' | 'igs' | 'rl';
}
```

**Abbreviation Badge Styling:**
| Variant | Gradient |
|---------|----------|
| default (Mc) | #38bdf8 → #0ea5e9 (blue) |
| e | #10b981 → #059669 (green) |
| igs | #8b5cf6 → #7c3aed (purple) |
| rl | #f59e0b → #d97706 (orange) |

### 8.2 StatCard Component

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
}
```

**Styling:**
- Card background with blur
- Title: uppercase, secondary color
- Value: large font, gradient text (cyan → purple)

### 8.3 ChartCard Component

```typescript
interface ChartCardProps {
  title: string;
  fullWidth?: boolean;
  children: React.ReactNode;  // Canvas element
}
```

**Dimensions:**
- Height: 400px
- Canvas: flex-grow with max-height 320px

### 8.4 GridWinnerCard Component

```typescript
interface GridWinnerCardProps {
  gridSize: string;      // "4×4", "5×5"
  winnerAlgo: string;
  avgScore: number;
}
```

### 8.5 ReferenceItem Component

```typescript
interface ReferenceItemProps {
  title: string;
  citation: string;
  link?: string;
}
```

---

## 9. Data & Charting

### 9.1 Data Aggregation Functions

```typescript
// Calculate average score per algorithm
function getAlgorithmAverages(records: DashboardRecord[]): AlgoStats[] {
  const byAlgo = groupBy(records, 'Algorithm');
  return Object.entries(byAlgo).map(([algo, recs]) => ({
    algorithm: ALGORITHM_NAMES[algo as AlgorithmCode],
    avgScore: average(recs.map(r => r.Score)),
    count: recs.length,
  }));
}

// Calculate best algorithm per grid size
function getGridWinners(records: DashboardRecord[]): GridWinner[] {
  const byGrid = groupBy(records, 'Grid Area');
  
  return Object.entries(byGrid).map(([area, recs]) => {
    const byAlgo = groupBy(recs, 'Algorithm');
    
    let best = { algo: '', avgScore: 0 };
    for (const [algo, algoRecs] of Object.entries(byAlgo)) {
      const avg = average(algoRecs.map(r => r.Score));
      if (avg > best.avgScore) {
        best = { algo, avgScore: avg };
      }
    }
    
    return {
      gridArea: Number(area),
      gridName: GRID_NAMES[Number(area)],
      winnerAlgo: ALGORITHM_NAMES[best.algo as AlgorithmCode],
      avgScore: best.avgScore,
    };
  });
}
```

### 9.2 Chart Configurations

```typescript
// Best Algorithm Bar Chart
const bestAlgoChartConfig: ChartConfiguration = {
  type: 'bar',
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: 'white' },
      },
      y: {
        grid: { display: false },
        ticks: { color: 'white' },
      },
    },
  },
};

// Score Distribution Chart
const scoreChartConfig: ChartConfiguration = {
  type: 'bar',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    // ... similar styling
  },
};

// Max Tile Frequency (Doughnut)
const tileChartConfig: ChartConfiguration = {
  type: 'doughnut',
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
    },
  },
};

// Timeline (Line)
const timelineConfig: ChartConfiguration = {
  type: 'line',
  options: {
    responsive: true,
    tension: 0.3,
    // ... styling
  },
};
```

### 9.3 Dashboard Data Format

```typescript
// Sample record from dashboard_data.js
const sampleRecord: DashboardRecord = {
  Index: 6.0,
  Algorithm: "E",
  "Full Name": "Expectimax Tree",
  "Grid Area": 16.0,
  Score: 25500.0,
  Notes: "It achieved 2048"
};

// Data file exports
export const dashboardData: DashboardData = {
  records: [/* ~100+ records */]
};
```

---

## 10. Styling & Design System

### 10.1 CSS Variables

```javascript
// tailwind.config.js extension for dashboard
module.exports = {
  theme: {
    extend: {
      colors: {
        'chart-bg': 'rgba(15, 23, 42, 0.6)',
        'table-header-bg': 'rgba(30, 41, 59, 0.9)',
        'table-row-hover': 'rgba(56, 189, 248, 0.1)',
      },
      backdropBlur: {
        'card': '12px',
      },
    },
  },
};
```

### 10.2 Card Styles

```css
.stat-card, .chart-card, .info-card {
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}

.highlight-card {
  background: linear-gradient(135deg, 
    rgba(56, 189, 248, 0.1) 0%, 
    rgba(139, 92, 246, 0.1) 100%
  );
  border-color: rgba(56, 189, 248, 0.3);
}
```

### 10.3 Gradient Text

```css
.stat-card p {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 10.4 Dropdown Menu

```css
.dropdown-content {
  background-color: #1e293b;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-content a.active {
  background-color: rgba(56, 189, 248, 0.1);
  color: var(--accent-color);
}
```

---

## 11. Navigation & Routing

### 11.1 React Router Setup

```tsx
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/definitions" element={<DefinitionsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/" element={<Navigate to="/definitions" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 11.2 NavDropdown Component

```typescript
interface NavDropdownProps {
  currentPage: 'definitions' | 'dashboard' | 'research';
}

const navItems = [
  { label: 'Definitions', path: '/definitions' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Research', path: '/research' },
];
```

---

## 12. Testing Requirements

### 12.1 Test Selectors (IDs to preserve)

```typescript
const testSelectors = {
  // Summary stats
  statTotalRuns: '#stat-total-runs',
  statHighScore: '#stat-high-score',
  statAvgTile: '#stat-avg-tile',
  
  // Charts
  bestAlgoChart: '#bestAlgoChart',
  gridSizeChart: '#gridSizeChart',
  explorerChart: '#explorerChart',
  scoreChart: '#scoreChart',
  tileChart: '#tileChart',
  timelineChart: '#timelineChart',
  
  // Grid winners
  gridWinners: '#grid-winners',
  
  // Explorer controls
  groupBySelect: '#group-by',
  metricSelect: '#metric',
  
  // Table
  runsTable: '#runs-table',
  rowsLimit: '#rows-limit',
  searchInput: '#search-input',
  prevPage: '#prev-page',
  nextPage: '#next-page',
  pageInfo: '#page-info',
};
```

### 12.2 Test Categories

| Category | Tests |
|----------|-------|
| Data Loading | Dashboard data loads, records parse correctly |
| Summary Stats | Calculations match expected values |
| Charts | Canvas elements render, Chart.js instantiates |
| Explorer | GroupBy/Metric changes update chart |
| Table | Pagination works, search filters data |
| Navigation | Routes work, active state updates |
| Responsive | Layout adapts to screen sizes |

---

## 13. Migration Checklist

### Phase 1: Project Setup
- [ ] Initialize Vite + React + TypeScript
- [ ] Configure Tailwind CSS with dark theme
- [ ] Install Chart.js, react-chartjs-2
- [ ] Set up React Router

### Phase 2: Data Layer
- [ ] Convert `dashboard_data.js` to TypeScript module
- [ ] Create data aggregation utilities
- [ ] Create chart configuration utilities

### Phase 3: Shared Components
- [ ] DashboardLayout with Header
- [ ] NavDropdown with routing
- [ ] Card components (StatCard, ChartCard, InfoCard)
- [ ] UI primitives (Button, Select, SearchInput)

### Phase 4: Definitions Page
- [ ] ScoreDefinitionCard
- [ ] AlgorithmGrid + AlgorithmCard
- [ ] GridSizeSection
- [ ] ResearchContext

### Phase 5: Dashboard Page
- [ ] SummaryGrid
- [ ] BestAlgorithmChart
- [ ] GridSizeAnalysis (winners + chart)
- [ ] DataExplorer with controls
- [ ] ChartsGrid (Score, Tile, Timeline)
- [ ] DataTable with pagination

### Phase 6: Research Page
- [ ] ReferencesList
- [ ] ReferenceItem

### Phase 7: Testing
- [ ] Verify all chart renders
- [ ] Test pagination and search
- [ ] Test navigation
- [ ] Responsive testing

### Phase 8: Polish
- [ ] Animate page transitions
- [ ] Optimize chart performance
- [ ] Accessibility audit

---

## Appendix A: Algorithm Descriptions

### Monte Carlo (Mc)
A probabilistic algorithm that uses random sampling to evaluate possible moves. It simulates many random games from the current state and chooses the move that leads to the best average outcome across all simulations.

**Traits:** Statistical, Random Sampling

### Expectimax Tree (E)
A game tree search algorithm designed for games with random elements. Unlike Minimax, Expectimax considers chance nodes (random tile spawns) and computes expected values rather than worst-case scenarios.

**Traits:** Tree Search, Expected Value

### IDDFS Graph Search (Igs)
Iterative Deepening Depth-First Search with graph-based state management. Combines the space efficiency of DFS with the completeness of BFS, incrementally exploring deeper levels while avoiding revisiting duplicate states.

**Traits:** Graph Search, Iterative Deepening

### Reinforcement Learning (Rl)
A machine learning approach where an agent learns optimal strategies through trial and error. The algorithm develops a policy by receiving rewards for successful moves and adjusting its behavior over many training episodes.

**Traits:** Machine Learning, Adaptive

---

## Appendix B: Original Function Reference

| Function | Lines | Purpose |
|----------|-------|---------|
| `initDashboard` | 29-41 | Initialize all dashboard components |
| `updateSummaryStats` | 43-62 | Calculate and display summary stats |
| `renderGridSizeAnalysis` | 68-141 | Grid winner cards and chart |
| `renderGridSizeChart` | 143-195 | Grouped bar chart for grid comparison |
| `renderAnalysis` | 201-261 | Best algorithm chart |
| `initExplorer` | 263-349 | Data explorer with controls |
| `renderCharts` | 351-433 | All visualization charts |
| `initTable` | 439-484 | Table with pagination setup |
| `renderTable` | 486-520 | Render table rows |

---

*End of 2048 AI Analytics Dashboard Specification Document*
