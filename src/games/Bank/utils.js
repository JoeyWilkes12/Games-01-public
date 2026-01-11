/**
 * Seeded Random Number Generator
 * Uses Linear Congruential Generator (LCG) for deterministic randomness
 */
export class SeededRNG {
    constructor(seed = null) {
        this.initialSeed = seed
        this.seed = seed !== null ? seed : Date.now()
        this.current = this.seed
    }

    next() {
        this.current = (this.current * 1103515245 + 12345) & 0x7fffffff
        return this.current / 0x7fffffff
    }

    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min
    }

    reset() {
        this.current = this.seed
    }

    setSeed(seed) {
        this.initialSeed = seed
        this.seed = seed
        this.current = seed
    }

    getSeed() {
        return this.seed
    }
}

/**
 * Calculate survival probability (chance of not rolling a 7)
 */
export function calculateSurvivalProbability(rollNumber) {
    if (rollNumber < 3) return 1 // Protected rolls
    const rollsAfterProtection = rollNumber - 2
    const perRollSurvival = 30 / 36 // ~83.33%
    return Math.pow(perRollSurvival, rollsAfterProtection)
}

/**
 * Calculate expected value of a roll
 */
export function calculateExpectedValue(bankScore, rollNumber) {
    if (rollNumber < 3) {
        // Protected: special rules
        const prob7 = 6 / 36
        const ev7 = 70
        const probDoubles = 6 / 36
        const evDoubles = 7 // average of 2,4,6,8,10,12
        const probNormal = 24 / 36
        const evNormal = 7 // average roll without 7 or doubles
        return prob7 * ev7 + probDoubles * evDoubles + probNormal * evNormal
    }

    // After protection: risk increases
    const prob7 = 6 / 36
    const probDoubles = 6 / 36
    const probNormal = 24 / 36
    const evNormal = 7

    // Expected if we roll (loses bank on 7)
    const evRoll = prob7 * (-bankScore) + probDoubles * bankScore + probNormal * evNormal
    return evRoll
}

/**
 * 2d6 probability distribution
 */
export const DICE_PROBABILITIES = [
    { sum: 2, probability: 1 / 36, ways: 1 },
    { sum: 3, probability: 2 / 36, ways: 2 },
    { sum: 4, probability: 3 / 36, ways: 3 },
    { sum: 5, probability: 4 / 36, ways: 4 },
    { sum: 6, probability: 5 / 36, ways: 5 },
    { sum: 7, probability: 6 / 36, ways: 6 },
    { sum: 8, probability: 5 / 36, ways: 5 },
    { sum: 9, probability: 4 / 36, ways: 4 },
    { sum: 10, probability: 3 / 36, ways: 3 },
    { sum: 11, probability: 2 / 36, ways: 2 },
    { sum: 12, probability: 1 / 36, ways: 1 },
]
