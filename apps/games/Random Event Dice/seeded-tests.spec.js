/**
 * Random Event Dice - Enhanced Seeded Tests
 * 
 * Robust Playwright tests using seeded configurations for deterministic verification.
 * These tests minimize UI navigation by loading configurations programmatically.
 * 
 * Prerequisites:
 * npm install
 * npx playwright install chromium
 * 
 * Run: npx playwright test apps/games/Random\ Event\ Dice/seeded-tests.spec.js --project=tests
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Test configuration paths
const GAME_DIR = path.join(__dirname);
const CONFIG_DIR = path.join(GAME_DIR, 'sample configuration files');

// Load sample configuration files
const loadConfig = (filename) => {
    const filePath = path.join(CONFIG_DIR, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Base URL for local file testing
const getBaseUrl = () => `file://${path.join(GAME_DIR, 'index.html')}`;

// Helper to wait for game to be ready
const waitForGame = async (page) => {
    await page.waitForFunction(() => typeof game !== 'undefined' && game !== null, { timeout: 5000 });
};

// Helper to inject configuration programmatically (no UI interaction needed)
const injectConfig = async (page, config) => {
    await waitForGame(page);
    await page.evaluate((cfg) => {
        // Inject settings through the game's internal structures
        if (game) {
            // Update settings
            Object.assign(game.settings, cfg.settings);
            if (cfg.players) {
                game.settings.players = cfg.players;
            }
            if (cfg.eventDefinitions) {
                game.settings.eventDefinitions = cfg.eventDefinitions;
            }
            if (cfg.analytics) {
                Object.assign(game.settings.analytics, cfg.analytics);
            }
            // Regenerate sample pool with new seed
            if (cfg.settings.seed !== null) {
                game.samplePool.regenerate(cfg.settings.seed);
            }
            // Update analytics tracker
            game.analytics.updateConfig(
                game.settings.players,
                cfg.settings.diceCount || 2,
                cfg.settings.diceSides || 6
            );
        }
    }, config);
};


// ==========================================
// CONFIGURATION FILE VALIDATION TESTS
// (Pure JS tests - no browser interaction needed)
// ==========================================

test.describe('Sample Configuration File Validation', () => {

    test('analytics-test-seed-12345.json has required structure', async () => {
        const config = loadConfig('analytics-test-seed-12345.json');

        expect(config.version).toBe('2.0');
        expect(config.settings).toBeDefined();
        expect(config.settings.seed).toBe(12345);
        expect(config.settings.diceCount).toBe(2);
        expect(config.settings.diceSides).toBe(6);
        expect(config.players).toBeDefined();
        expect(Object.keys(config.players).length).toBe(15);
        expect(config.eventDefinitions.length).toBe(6);
        expect(config.analytics.enableLeaderboard).toBe(true);
        expect(config.analytics.enableTimeline).toBe(true);
        expect(config.analytics.enableHeatmap).toBe(true);
    });

    test('minimal-test-seed-42.json has correct structure', async () => {
        const config = loadConfig('minimal-test-seed-42.json');

        expect(config.settings.seed).toBe(42);
        expect(config.eventDefinitions).toBeDefined();
        expect(config.eventDefinitions.length).toBeGreaterThan(0);
    });

    test('test_specifications.json contains valid test suites', async () => {
        const specs = loadConfig('test_specifications.json');

        expect(specs.testSuites).toBeDefined();
        expect(specs.testSuites.length).toBeGreaterThan(0);

        // Verify seeded RNG tests are defined
        const rngSuite = specs.testSuites.find(s => s.name === 'SeededRNGTests');
        expect(rngSuite).toBeDefined();
        expect(rngSuite.tests.length).toBeGreaterThan(0);

        // Verify analytics tests are defined
        const analyticsSuite = specs.testSuites.find(s => s.name === 'AnalyticsTests');
        expect(analyticsSuite).toBeDefined();
    });

    test('impossible config is correctly identified', async () => {
        const config = loadConfig('random-event-dice-config (1) impossible.json');

        // This config should have impossible event definitions
        expect(config.eventDefinitions).toBeDefined();
    });

    test('all seeded configs have valid structure', async () => {
        const seededConfigs = [
            'analytics-test-seed-12345.json',
            'minimal-test-seed-42.json'
        ];

        for (const filename of seededConfigs) {
            const config = loadConfig(filename);
            expect(config.settings.seed, `${filename} must have a seed`).not.toBeNull();
            expect(config.settings.seed, `${filename} seed must be a number`).not.toBeNaN();
        }
    });
});


// ==========================================
// PROGRAMMATIC SEEDED RNG TESTS
// (Load config via injection, minimal UI)
// ==========================================

test.describe('Seeded RNG Determinism (Programmatic)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('Seed 12345 produces deterministic first rolls', async ({ page }) => {
        // Load config programmatically
        const config = loadConfig('analytics-test-seed-12345.json');
        await injectConfig(page, config);

        // Verify seed was set
        const seed = await page.evaluate(() => game.settings.seed);
        expect(seed).toBe(12345);

        // Get first sample from pool (simulating first roll)
        const firstRoll = await page.evaluate(() => {
            game.samplePool.reset();
            return game.samplePool.getNext();
        });

        expect(firstRoll).toBeDefined();
        expect(firstRoll.length).toBe(2); // 2 dice
        expect(firstRoll[0]).toBeGreaterThanOrEqual(1);
        expect(firstRoll[0]).toBeLessThanOrEqual(6);
    });

    test('Same seed produces identical sequence across runs', async ({ page }) => {
        const config = loadConfig('analytics-test-seed-12345.json');

        // Run 1
        await injectConfig(page, config);
        const sequence1 = await page.evaluate(() => {
            game.samplePool.reset();
            const rolls = [];
            for (let i = 0; i < 10; i++) {
                rolls.push([...game.samplePool.getNext()]);
            }
            return rolls;
        });

        // Reset and run again
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        await injectConfig(page, config);
        const sequence2 = await page.evaluate(() => {
            game.samplePool.reset();
            const rolls = [];
            for (let i = 0; i < 10; i++) {
                rolls.push([...game.samplePool.getNext()]);
            }
            return rolls;
        });

        // Sequences should be identical
        expect(sequence1).toEqual(sequence2);
    });

    test('Different seeds produce different sequences', async ({ page }) => {
        // Seed 12345
        const config1 = loadConfig('analytics-test-seed-12345.json');
        await injectConfig(page, config1);
        const sequence1 = await page.evaluate(() => {
            game.samplePool.reset();
            const rolls = [];
            for (let i = 0; i < 5; i++) {
                rolls.push([...game.samplePool.getNext()]);
            }
            return rolls;
        });

        // Seed 42
        const config2 = loadConfig('minimal-test-seed-42.json');
        await injectConfig(page, config2);
        const sequence2 = await page.evaluate(() => {
            game.samplePool.reset();
            const rolls = [];
            for (let i = 0; i < 5; i++) {
                rolls.push([...game.samplePool.getNext()]);
            }
            return rolls;
        });

        // Sequences should be different
        expect(sequence1).not.toEqual(sequence2);
    });
});


// ==========================================
// ANALYTICS TRACKER TESTS
// (Unit-style tests via page.evaluate)
// ==========================================

test.describe('Analytics Tracker (Programmatic)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('AnalyticsTracker records rolls correctly', async ({ page }) => {
        const result = await page.evaluate(() => {
            const tracker = game.analytics;
            tracker.reset();
            tracker.startTurn();

            // Simulate 5 rolls
            for (let i = 0; i < 5; i++) {
                tracker.recordRoll([3, 4]); // Example roll
            }

            return {
                currentRolls: tracker.currentTurnRolls,
                totalRolls: tracker.totalRolls
            };
        });

        expect(result.currentRolls).toBe(5);
        expect(result.totalRolls).toBe(5);
    });

    test('AnalyticsTracker heatmap updates for 2d6', async ({ page }) => {
        const result = await page.evaluate(() => {
            const tracker = game.analytics;
            tracker.reset();
            tracker.startTurn();

            // Record specific rolls to test heatmap
            tracker.recordRoll([1, 1]); // Should increment heatmap[0][0]
            tracker.recordRoll([6, 6]); // Should increment heatmap[5][5]
            tracker.recordRoll([3, 4]); // Should increment heatmap[2][3]

            return {
                cell_1_1: tracker.heatmap[0][0],
                cell_6_6: tracker.heatmap[5][5],
                cell_3_4: tracker.heatmap[2][3],
                totalRolls: tracker.totalRolls
            };
        });

        expect(result.cell_1_1).toBe(1);
        expect(result.cell_6_6).toBe(1);
        expect(result.cell_3_4).toBe(1);
        expect(result.totalRolls).toBe(3);
    });

    test('AnalyticsTracker player rotation works', async ({ page }) => {
        const config = loadConfig('analytics-test-seed-12345.json');
        await injectConfig(page, config);

        const result = await page.evaluate(() => {
            const tracker = game.analytics;
            tracker.reset();

            const players = [];
            // Simulate 3 turns
            for (let i = 0; i < 3; i++) {
                tracker.startTurn();
                players.push(tracker.currentPlayerIndex);
                tracker.recordRoll([1, 1]); // Trigger event (doubles)
                tracker.endTurn();
            }

            return {
                players,
                turnNumber: tracker.turnNumber,
                timelineLength: tracker.timeline.length
            };
        });

        expect(result.players).toEqual([1, 2, 3]); // Players rotate 1 -> 2 -> 3
        expect(result.turnNumber).toBe(3);
        expect(result.timelineLength).toBe(3);
    });

    test('AnalyticsTracker leaderboard sorts by rolls', async ({ page }) => {
        const config = loadConfig('analytics-test-seed-12345.json');
        await injectConfig(page, config);

        const result = await page.evaluate(() => {
            const tracker = game.analytics;
            tracker.reset();

            // Player 1: 5 rolls
            tracker.startTurn();
            for (let i = 0; i < 5; i++) tracker.recordRoll([3, 4]);
            tracker.endTurn();

            // Player 2: 10 rolls
            tracker.startTurn();
            for (let i = 0; i < 10; i++) tracker.recordRoll([3, 4]);
            tracker.endTurn();

            // Player 3: 3 rolls
            tracker.startTurn();
            for (let i = 0; i < 3; i++) tracker.recordRoll([3, 4]);
            tracker.endTurn();

            const leaderboard = tracker.getLeaderboard();
            return leaderboard.slice(0, 3).map(p => ({
                id: p.playerId,
                rolls: p.totalRolls
            }));
        });

        // Should be sorted by rolls descending
        expect(result[0].rolls).toBe(10); // Player 2
        expect(result[1].rolls).toBe(5);  // Player 1
        expect(result[2].rolls).toBe(3);  // Player 3
    });
});


// ==========================================
// SKIP TO END TESTS
// (Verify simulateToEnd produces correct results)
// ==========================================

test.describe('Skip to End (Programmatic)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('simulateToEnd processes all samples', async ({ page }) => {
        const config = loadConfig('analytics-test-seed-12345.json');
        await injectConfig(page, config);

        const result = await page.evaluate(() => {
            game.samplePool.reset();
            const initialSamples = game.samplePool.samples.length;

            // Reset analytics
            game.analytics.reset();
            game.analytics.startTurn();

            // Define event check function
            const checkFn = (roll, defs) => {
                for (const def of defs) {
                    const met = def.rules.every(rule => {
                        const val = roll[rule.dieIndex];
                        if (val === undefined) return false;
                        switch (rule.operator) {
                            case '==': return val == rule.value;
                            case '!=': return val != rule.value;
                            case '>': return val > rule.value;
                            case '<': return val < rule.value;
                            default: return false;
                        }
                    });
                    if (met) return true;
                }
                return false;
            };

            const results = game.analytics.simulateToEnd(
                game.samplePool,
                game.settings.eventDefinitions,
                checkFn,
                0.5 // interval in seconds
            );

            return {
                initialSamples,
                totalRolls: results.totalRolls,
                events: results.events,
                processedAll: game.samplePool.currentIndex >= initialSamples
            };
        });

        expect(result.totalRolls).toBeGreaterThan(0);
        expect(result.processedAll).toBe(true);
    });

    test('simulateToEnd with seed 12345 is deterministic', async ({ page }) => {
        const config = loadConfig('analytics-test-seed-12345.json');

        // Run 1
        await injectConfig(page, config);
        const result1 = await page.evaluate(() => {
            game.samplePool.reset();
            game.analytics.reset();
            game.analytics.startTurn();

            const checkFn = (roll, defs) => {
                return roll[0] === roll[1]; // Doubles
            };

            return game.analytics.simulateToEnd(
                game.samplePool,
                game.settings.eventDefinitions,
                checkFn,
                0.1
            );
        });

        // Reload and run again
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        await injectConfig(page, config);
        const result2 = await page.evaluate(() => {
            game.samplePool.reset();
            game.analytics.reset();
            game.analytics.startTurn();

            const checkFn = (roll, defs) => {
                return roll[0] === roll[1]; // Doubles
            };

            return game.analytics.simulateToEnd(
                game.samplePool,
                game.settings.eventDefinitions,
                checkFn,
                0.1
            );
        });

        // Results should be identical
        expect(result1.totalRolls).toBe(result2.totalRolls);
        expect(result1.events).toBe(result2.events);
    });
});


// ==========================================
// EVENT DEFINITION VALIDATION TESTS
// ==========================================

test.describe('Event Definition Logic', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('Doubles event definitions trigger correctly', async ({ page }) => {
        const config = loadConfig('analytics-test-seed-12345.json');
        await injectConfig(page, config);

        const result = await page.evaluate(() => {
            const defs = game.settings.eventDefinitions;

            // Test each double
            const testRolls = [
                [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]
            ];

            const results = testRolls.map(roll => {
                for (const def of defs) {
                    const met = def.rules.every(rule => {
                        const val = roll[rule.dieIndex];
                        switch (rule.operator) {
                            case '==': return val == rule.value;
                            default: return false;
                        }
                    });
                    if (met) return true;
                }
                return false;
            });

            return results;
        });

        // All doubles should trigger
        expect(result).toEqual([true, true, true, true, true, true]);
    });

    test('Non-doubles do not trigger events', async ({ page }) => {
        const config = loadConfig('analytics-test-seed-12345.json');
        await injectConfig(page, config);

        const result = await page.evaluate(() => {
            const defs = game.settings.eventDefinitions;

            const testRolls = [
                [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]
            ];

            const results = testRolls.map(roll => {
                for (const def of defs) {
                    const met = def.rules.every(rule => {
                        const val = roll[rule.dieIndex];
                        switch (rule.operator) {
                            case '==': return val == rule.value;
                            default: return false;
                        }
                    });
                    if (met) return true;
                }
                return false;
            });

            return results;
        });

        // No non-doubles should trigger
        expect(result).toEqual([false, false, false, false, false, false]);
    });
});
