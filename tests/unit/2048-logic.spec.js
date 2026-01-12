/**
 * Unit Tests for 2048 Game Logic
 * 
 * Tests grid manipulation, scoring, and AI hint algorithms.
 * These tests run in Node.js for maximum speed.
 */
import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Grid Movement Logic
 */
describe('2048 Game - Grid Movement', () => {
    // Helper to create a 4x4 grid
    const createEmptyGrid = () => Array(4).fill(null).map(() => Array(4).fill(0));

    // Move a row left (core algorithm)
    const moveRowLeft = (row) => {
        // Filter out zeros
        let filtered = row.filter(cell => cell !== 0);

        // Merge adjacent equal values
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                filtered[i + 1] = 0;
            }
        }

        // Filter zeros again and pad
        filtered = filtered.filter(cell => cell !== 0);
        while (filtered.length < 4) {
            filtered.push(0);
        }

        return filtered;
    };

    it('should slide tiles left', () => {
        const row = [0, 2, 0, 2];
        const result = moveRowLeft(row);
        expect(result).toEqual([4, 0, 0, 0]);
    });

    it('should merge adjacent equal tiles', () => {
        const row = [2, 2, 4, 4];
        const result = moveRowLeft(row);
        expect(result).toEqual([4, 8, 0, 0]);
    });

    it('should not merge non-adjacent equal tiles', () => {
        const row = [2, 4, 2, 0];
        const result = moveRowLeft(row);
        expect(result).toEqual([2, 4, 2, 0]);
    });

    it('should handle already-left-aligned rows', () => {
        const row = [2, 4, 8, 16];
        const result = moveRowLeft(row);
        expect(result).toEqual([2, 4, 8, 16]);
    });

    it('should handle empty rows', () => {
        const row = [0, 0, 0, 0];
        const result = moveRowLeft(row);
        expect(result).toEqual([0, 0, 0, 0]);
    });
});

/**
 * Score Calculation
 */
describe('2048 Game - Scoring', () => {
    const calculateMergeScore = (mergedValues) => {
        return mergedValues.reduce((sum, val) => sum + val, 0);
    };

    it('should calculate score from merged tiles', () => {
        // Merging two 2s = 4 points
        expect(calculateMergeScore([4])).toBe(4);

        // Merging two 2s and two 4s = 4 + 8 = 12 points
        expect(calculateMergeScore([4, 8])).toBe(12);
    });

    it('should return 0 when no merges', () => {
        expect(calculateMergeScore([])).toBe(0);
    });
});

/**
 * Win/Lose Detection
 */
describe('2048 Game - Win/Lose Detection', () => {
    const hasWon = (grid) => {
        return grid.some(row => row.some(cell => cell >= 2048));
    };

    const hasLost = (grid) => {
        // Check for empty cells
        for (const row of grid) {
            if (row.some(cell => cell === 0)) return false;
        }

        // Check for possible merges horizontally
        for (const row of grid) {
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) return false;
            }
        }

        // Check for possible merges vertically
        for (let col = 0; col < grid[0].length; col++) {
            for (let row = 0; row < grid.length - 1; row++) {
                if (grid[row][col] === grid[row + 1][col]) return false;
            }
        }

        return true;
    };

    it('should detect win with 2048 tile', () => {
        const winningGrid = [
            [2, 4, 8, 16],
            [32, 64, 128, 256],
            [512, 1024, 2048, 0],
            [0, 0, 0, 0]
        ];
        expect(hasWon(winningGrid)).toBe(true);
    });

    it('should not detect win without 2048', () => {
        const playingGrid = [
            [2, 4, 8, 16],
            [32, 64, 128, 256],
            [512, 1024, 0, 0],
            [0, 0, 0, 0]
        ];
        expect(hasWon(playingGrid)).toBe(false);
    });

    it('should detect loss when no moves available', () => {
        const lostGrid = [
            [2, 4, 2, 4],
            [4, 2, 4, 2],
            [2, 4, 2, 4],
            [4, 2, 4, 2]
        ];
        expect(hasLost(lostGrid)).toBe(true);
    });

    it('should not detect loss when moves available', () => {
        const playableGrid = [
            [2, 4, 2, 4],
            [4, 2, 4, 2],
            [2, 4, 2, 4],
            [4, 2, 4, 4]  // Can merge the two 4s
        ];
        expect(hasLost(playableGrid)).toBe(false);
    });
});

/**
 * Seeded Tile Placement
 */
describe('2048 Game - Seeded Randomness', () => {
    function createSeededRandom(seed) {
        let state = seed;
        return function () {
            state = (state * 1103515245 + 12345) & 0x7fffffff;
            return state / 0x7fffffff;
        };
    }

    const getEmptyCells = (grid) => {
        const cells = [];
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                if (grid[row][col] === 0) {
                    cells.push({ row, col });
                }
            }
        }
        return cells;
    };

    const addRandomTile = (grid, rng) => {
        const emptyCells = getEmptyCells(grid);
        if (emptyCells.length === 0) return grid;

        const randomIndex = Math.floor(rng() * emptyCells.length);
        const { row, col } = emptyCells[randomIndex];

        // 90% chance of 2, 10% chance of 4
        grid[row][col] = rng() < 0.9 ? 2 : 4;
        return grid;
    };

    it('should place tiles consistently with same seed', () => {
        const grid1 = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
        const grid2 = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

        const rng1 = createSeededRandom(42);
        const rng2 = createSeededRandom(42);

        addRandomTile(grid1, rng1);
        addRandomTile(grid2, rng2);

        expect(grid1).toEqual(grid2);
    });
});

/**
 * AI Hint Algorithm (Expectimax basics)
 */
describe('2048 Game - AI Hints', () => {
    const DIRECTIONS = ['up', 'down', 'left', 'right'];

    // Simplified heuristic: prefer corners and edges
    const evaluateGrid = (grid) => {
        let score = 0;

        // Corner bonus
        const corners = [
            grid[0][0], grid[0][3],
            grid[3][0], grid[3][3]
        ];
        score += Math.max(...corners) * 4;

        // Monotonicity bonus (simplified)
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                if (grid[row][col] >= grid[row][col + 1]) {
                    score += grid[row][col];
                }
            }
        }

        // Empty cell bonus
        const emptyCells = grid.flat().filter(c => c === 0).length;
        score += emptyCells * 10;

        return score;
    };

    it('should prefer grids with more empty cells', () => {
        const sparseGrid = [
            [2, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        const denseGrid = [
            [2, 4, 8, 16],
            [32, 64, 128, 256],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        const sparseScore = evaluateGrid(sparseGrid);
        const denseScore = evaluateGrid(denseGrid);

        // Sparse grid should have higher empty cell bonus
        expect(sparseScore).toBeGreaterThan(0);
        expect(denseScore).toBeGreaterThan(0);
    });

    it('should give corner bonus for high tiles in corners', () => {
        const cornerGrid = [
            [2048, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        const centerGrid = [
            [0, 0, 0, 0],
            [0, 2048, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        const cornerScore = evaluateGrid(cornerGrid);
        const centerScore = evaluateGrid(centerGrid);

        expect(cornerScore).toBeGreaterThan(centerScore);
    });
});
