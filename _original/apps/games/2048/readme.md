# 2048 Game

A browser-based implementation of the classic 2048 puzzle game with an Expectimax AI solver.

## Game Overview

2048 is a single-player sliding block puzzle game. The objective is to slide numbered tiles on a grid to combine them and create a tile with the number 2048.

### Rules
1. Tiles slide as far as possible in the chosen direction (up, down, left, or right)
2. When two tiles with the same number collide, they merge into one tile with their sum
3. After each move, a new tile (2 or 4) spawns in a random empty cell
4. The game ends when no more moves are possible

### Scoring
The **score** is the cumulative sum of all tile merges throughout the game — not just the value of the maximum tile at the end. For example:
- Merging two 2-tiles into a 4 adds 4 to the score
- Merging two 4-tiles into an 8 adds 8 to the score

## Features

- **Multiple Themes**: Switch between visual themes
- **AI Solver**: Expectimax-based AI that can play automatically
- **Hint System**: Get suggestions for the best next move
- **Touch Support**: Swipe gestures for mobile play
- **Seeded Randomness**: Reproducible games for testing

## Default Configuration (JSON)

```json
{
    "version": "1.0",
    "name": "Default 2048 Configuration",
    "settings": {
        "gridSize": 4,
        "seed": null,
        "prob4": 0.1,
        "winScore": 2048,
        "autoPlaySpeed": 200
    }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `gridSize` | number | 4 | Size of the game grid (e.g., 4 for 4×4) |
| `seed` | number/null | null | Random seed for reproducible games. `null` uses current time |
| `prob4` | number | 0.1 | Probability of spawning a 4 tile (vs 2) |
| `winScore` | number | 2048 | Tile value needed to win |
| `autoPlaySpeed` | number | 200 | Delay in ms between AI moves |

## Files

```
2048/
├── index.html          # Game UI
├── script.js           # Game logic + Expectimax AI
├── style.css           # Game styling
├── tests.html          # Test suite
├── readme.md           # This file
└── sample configuration files/
    ├── seeded-test-42.json
    ├── advanced-test-seed-12345.json
    └── 5x5-grid-seed-99999.json
```

## Testing

Open `tests.html` in a browser to run the test suite. Tests include:

1. **Core Logic** - Slide and merge operations
2. **Grid Manipulation** - Board state changes
3. **Win/Loss Conditions** - Game end detection
4. **Anti-Cheat Validation** - Invalid tile detection
5. **Seeded Reproducibility** - Same seed = same game
6. **Configuration Loading** - JSON config parsing
7. **Advanced Event Logic** - Score tracking, boundary conditions

### Running Tests

```bash
open apps/games/2048/tests.html
```

All tests run automatically on page load. Green = pass, Red = fail.

## API (for Testing)

The `Game2048` namespace exposes methods for programmatic testing:

```javascript
// Set seed for reproducible games
Game2048.setSeed(12345);

// Get/set board state
Game2048.getGrid();
Game2048.setGrid([[2, 0, 0, 0], ...]);

// Execute moves
Game2048.moveLeft();
Game2048.moveRight();
Game2048.moveUp();
Game2048.moveDown();

// Check conditions
Game2048.checkWin();    // Returns true if won
Game2048.checkLose();   // Returns true if no moves

// Validate board (anti-cheat)
Game2048.validateBoardState();  // Returns array of errors

// Load configuration
Game2048.loadConfig({ settings: { seed: 42, winScore: 4096 } });

// Run seeded simulation
Game2048.runSeededSimulation(seed, [3, 0, 1, 2]); // moves: left, up, right, down
```

## AI Algorithm

The solver uses **Expectimax** search, which is ideal for games with random elements:

- **Max Nodes**: Player moves, maximizing expected score
- **Chance Nodes**: Random tile spawns, calculating expected values
- **Heuristics**: Weighted grid pattern (snake pattern) for position evaluation

The AI typically achieves the 2048 tile in ~80% of games.
