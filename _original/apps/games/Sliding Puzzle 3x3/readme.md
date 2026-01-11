# Sliding Puzzle 3x3

A classic sliding tile puzzle game where the objective is to rearrange scrambled tiles into numerical order (1-8).

## Game Overview

The 3x3 Sliding Puzzle consists of a grid with 8 numbered tiles and one empty space. Tiles adjacent to the empty space can be moved into it. The goal is to reach the solved state where tiles are ordered 1 through 8, typically row by row.

## Features

- **Interactive Gameplay**: Click tiles to slide them into the empty space.
- **Move Counter**: Tracks the number of moves made in the current game.
- **Timer**: Tracks the duration of the current solve attempt.
- **New Game Generation**: Randomly generates solvable puzzle states.
- **Advanced Mode**: toggles visibility of advanced settings or debug features (if applicable).
- **Responsive Design**: Playable on desktop and mobile devices.

## How to Play

1. **Objective**: Arrange tiles in ascending order:
   ```
   1 2 3
   4 5 6
   7 8
   ```
2. **Controls**: Click any tile adjacent to the empty space to move it.
3. **Winning**: The game detects when the puzzle is solved and congratulates the player.

## Development & Testing

This game includes a comprehensive test suite to ensure logic correctness.

### Running Tests
Open `tests.html` or `integration_tests.html` in your browser to run the automated test suite.

- **Unit Tests**: Verify core logic like tile movement, valid moves, and win condition checking.
- **Integration Tests**: Verify the full game flow including UI updates and game resets.

### Files
- `index.html`: Main game interface.
- `script.js`: Game logic and UI handling.
- `style.css`: Visual styling.
- `test_logic.js`: Core logic separated for testing.
- `test_runner.js`: Test execution framework.

## Future Improvements
- 4x4 and 5x5 grid options.
- A* solver integration for hints.
- Leaderboard for fastest times.
