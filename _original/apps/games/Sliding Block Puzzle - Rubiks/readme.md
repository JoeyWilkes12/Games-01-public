# Sliding Block Puzzle - Rubiks

This section explores permutation puzzles, specifically focusing on sliding block puzzles (like the 15-puzzle) and their 3D rotational counterparts like the Rubik's Cube.

## Game Mechanics
In a sliding block puzzle, tiles are arranged on a grid with one empty space. The objective is to rearrange the tiles into a specific order by sliding them into the empty space. The Rubik's Cube extends this concept to 3 dimensions, where groups of "cubies" are rotated around a central axis.

## Algorithmic Context
These puzzles are excellent test permutations for:
- **State Space Search**: The number of possible configurations is vast ($16!/2$ for the 15-puzzle, $4.3 \times 10^{19}$ for Rubik's Cube).
- **Heuristics**: Developing functions (like Manhattan distance) to estimate the distance to the goal state is crucial for efficient solvers like A* or IDA*.
- **Group Theory**: Analyzing the mathematical structure of valid moves and solvable states.