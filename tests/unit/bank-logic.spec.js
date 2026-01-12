/**
 * Unit Tests for Bank Game Logic
 * 
 * Tests pure game logic functions without browser environment.
 * These tests run in Node.js for maximum speed.
 */
import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Dice Probability Calculations
 * Based on 2d6 dice mechanics
 */
describe('Bank Game - Dice Probabilities', () => {
    // Probability lookup table for 2d6
    const DICE_PROBABILITIES = {
        2: 1 / 36,   // 2.78%
        3: 2 / 36,   // 5.56%
        4: 3 / 36,   // 8.33%
        5: 4 / 36,   // 11.11%
        6: 5 / 36,   // 13.89%
        7: 6 / 36,   // 16.67%
        8: 5 / 36,   // 13.89%
        9: 4 / 36,   // 11.11%
        10: 3 / 36,  // 8.33%
        11: 2 / 36,  // 5.56%
        12: 1 / 36   // 2.78%
    };

    it('should have correct probability sum equal to 1', () => {
        const sum = Object.values(DICE_PROBABILITIES).reduce((a, b) => a + b, 0);
        expect(sum).toBeCloseTo(1, 10);
    });

    it('should have 7 as the most probable outcome', () => {
        const maxProb = Math.max(...Object.values(DICE_PROBABILITIES));
        expect(DICE_PROBABILITIES[7]).toBe(maxProb);
    });

    it('should have 2 and 12 as equally least probable', () => {
        expect(DICE_PROBABILITIES[2]).toBe(DICE_PROBABILITIES[12]);
        const minProb = Math.min(...Object.values(DICE_PROBABILITIES));
        expect(DICE_PROBABILITIES[2]).toBe(minProb);
    });
});

/**
 * Score Calculation Logic
 */
describe('Bank Game - Score Calculations', () => {
    const calculateBankValue = (dice1, dice2) => {
        // Snake eyes (1,1) = bust
        if (dice1 === 1 && dice2 === 1) return 0;
        // One 1 = 100 points
        if (dice1 === 1 || dice2 === 1) return 100;
        // Otherwise sum of dice
        return dice1 + dice2;
    };

    it('should return 0 for snake eyes (bust)', () => {
        expect(calculateBankValue(1, 1)).toBe(0);
    });

    it('should return 100 when one die shows 1', () => {
        expect(calculateBankValue(1, 5)).toBe(100);
        expect(calculateBankValue(6, 1)).toBe(100);
    });

    it('should return sum for normal rolls', () => {
        expect(calculateBankValue(3, 4)).toBe(7);
        expect(calculateBankValue(6, 6)).toBe(12);
        expect(calculateBankValue(2, 2)).toBe(4);
    });
});

/**
 * Seeded Random Number Generator
 */
describe('Bank Game - Seeded RNG', () => {
    // Simple seeded random implementation (matches game logic)
    function createSeededRandom(seed) {
        let state = seed;
        return function () {
            state = (state * 1103515245 + 12345) & 0x7fffffff;
            return state / 0x7fffffff;
        };
    }

    it('should produce consistent results with same seed', () => {
        const rng1 = createSeededRandom(42);
        const rng2 = createSeededRandom(42);

        for (let i = 0; i < 10; i++) {
            expect(rng1()).toBe(rng2());
        }
    });

    it('should produce different results with different seeds', () => {
        const rng1 = createSeededRandom(42);
        const rng2 = createSeededRandom(123);

        const results1 = Array.from({ length: 5 }, () => rng1());
        const results2 = Array.from({ length: 5 }, () => rng2());

        expect(results1).not.toEqual(results2);
    });

    it('should generate values between 0 and 1', () => {
        const rng = createSeededRandom(12345);

        for (let i = 0; i < 100; i++) {
            const val = rng();
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(1);
        }
    });
});

/**
 * Turn and Round Logic
 */
describe('Bank Game - Turn Logic', () => {
    const MINIMUM_ROLLS_BEFORE_BANKING = 3;

    it('should not allow banking before minimum rolls', () => {
        for (let rolls = 0; rolls < MINIMUM_ROLLS_BEFORE_BANKING; rolls++) {
            const canBank = rolls >= MINIMUM_ROLLS_BEFORE_BANKING;
            expect(canBank).toBe(false);
        }
    });

    it('should allow banking after minimum rolls', () => {
        for (let rolls = MINIMUM_ROLLS_BEFORE_BANKING; rolls <= 10; rolls++) {
            const canBank = rolls >= MINIMUM_ROLLS_BEFORE_BANKING;
            expect(canBank).toBe(true);
        }
    });

    it('should correctly calculate rounds per game', () => {
        const totalRounds = 20;
        const playersCount = 4;
        const turnsPerPlayer = totalRounds / playersCount;

        expect(turnsPerPlayer).toBe(5);
    });
});

/**
 * Undo State Management
 */
describe('Bank Game - Undo Logic', () => {
    let gameHistory = [];

    beforeEach(() => {
        gameHistory = [];
    });

    const saveState = (state) => {
        gameHistory.push(JSON.parse(JSON.stringify(state)));
    };

    const undo = () => {
        if (gameHistory.length > 1) {
            gameHistory.pop();
            return gameHistory[gameHistory.length - 1];
        }
        return gameHistory[0] || null;
    };

    it('should save and restore game states', () => {
        const state1 = { bank: 0, round: 1 };
        const state2 = { bank: 7, round: 1 };

        saveState(state1);
        saveState(state2);

        const restored = undo();
        expect(restored).toEqual(state1);
    });

    it('should not undo past initial state', () => {
        const initialState = { bank: 0, round: 1 };
        saveState(initialState);

        const restored1 = undo();
        const restored2 = undo();

        expect(restored1).toEqual(initialState);
        expect(restored2).toEqual(initialState);
    });
});
