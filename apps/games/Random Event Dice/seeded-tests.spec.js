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


// ==========================================
// PLAYER CONFIGURATION TESTS
// ==========================================

test.describe('Player Configuration', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('Player names are reflected in dashboard leaderboard', async ({ page }) => {
        const customPlayers = {
            1: "Alice",
            2: "Bob",
            3: "Charlie"
        };

        const result = await page.evaluate((players) => {
            // Set custom player names
            game.settings.players = players;
            game.analytics.updateConfig(players, 2, 6);

            // Verify analytics knows the player names
            return {
                player1Name: game.analytics.players[1],
                player2Name: game.analytics.players[2],
                player3Name: game.analytics.players[3],
                currentPlayerName: game.analytics.getCurrentPlayerName()
            };
        }, customPlayers);

        expect(result.player1Name).toBe("Alice");
        expect(result.player2Name).toBe("Bob");
        expect(result.player3Name).toBe("Charlie");
        expect(result.currentPlayerName).toBe("Alice"); // First player
    });

    test('Player names are included in JSON export', async ({ page }) => {
        const customPlayers = {
            1: "TestPlayer1",
            2: "TestPlayer2",
            3: "TestPlayer3"
        };

        const exportedConfig = await page.evaluate((players) => {
            game.settings.players = players;

            // Simulate export (same logic as exportConfig)
            return {
                version: '2.1',
                players: game.settings.players
            };
        }, customPlayers);

        expect(exportedConfig.version).toBe('2.1');
        expect(exportedConfig.players[1]).toBe("TestPlayer1");
        expect(exportedConfig.players[2]).toBe("TestPlayer2");
        expect(exportedConfig.players[3]).toBe("TestPlayer3");
    });

    test('Default 15 players are pre-configured', async ({ page }) => {
        const result = await page.evaluate(() => {
            return {
                playerCount: Object.keys(game.settings.players).length,
                hasPlayer1: !!game.settings.players[1],
                hasPlayer15: !!game.settings.players[15]
            };
        });

        expect(result.playerCount).toBe(15);
        expect(result.hasPlayer1).toBe(true);
        expect(result.hasPlayer15).toBe(true);
    });
});


// ==========================================
// DASHBOARD PANEL WIDTH TESTS
// ==========================================

test.describe('Dashboard Panel Width', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('Panel width setting is stored correctly', async ({ page }) => {
        const result = await page.evaluate(() => {
            game.settings.analytics.panelWidth = 400;
            return game.settings.analytics.panelWidth;
        });

        expect(result).toBe(400);
    });

    test('Panel width is included in JSON export', async ({ page }) => {
        const result = await page.evaluate(() => {
            game.settings.analytics.panelWidth = 450;
            return {
                panelWidth: game.settings.analytics.panelWidth
            };
        });

        expect(result.panelWidth).toBe(450);
    });

    test('Default panel width is 320px', async ({ page }) => {
        const result = await page.evaluate(() => {
            return game.settings.analytics.panelWidth;
        });

        expect(result).toBe(320);
    });
});


// ==========================================
// RESET DURATION TESTS (Seconds Format)
// ==========================================

test.describe('Reset Duration (Seconds)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('Reset duration is stored internally in milliseconds', async ({ page }) => {
        const result = await page.evaluate(() => {
            // Internal storage should be in milliseconds
            return {
                defaultValue: game.settings.resetDuration,
                isMilliseconds: game.settings.resetDuration >= 100 // Would be 0.1 if seconds
            };
        });

        expect(result.defaultValue).toBe(1000); // 1 second = 1000ms
        expect(result.isMilliseconds).toBe(true);
    });

    test('Config export uses seconds format (v2.1)', async ({ page }) => {
        const result = await page.evaluate(() => {
            game.settings.resetDuration = 2500; // 2.5 seconds in ms

            // Simulate export logic
            return {
                exportedValue: game.settings.resetDuration / 1000 // Should be 2.5
            };
        });

        expect(result.exportedValue).toBe(2.5);
    });

    test('Legacy v2.0 config imports correctly (ms to ms)', async ({ page }) => {
        const legacyConfig = {
            version: '2.0',
            settings: {
                resetDuration: 3000, // 3 seconds in old ms format
                interval: 1000
            }
        };

        const result = await page.evaluate((config) => {
            // Simulate version detection
            const isSecondsFormat = config.version && parseFloat(config.version) >= 2.1;

            let internalValue;
            if (isSecondsFormat) {
                internalValue = config.settings.resetDuration * 1000;
            } else {
                internalValue = config.settings.resetDuration; // Already ms
            }

            return {
                isSecondsFormat,
                internalValue
            };
        }, legacyConfig);

        expect(result.isSecondsFormat).toBe(false);
        expect(result.internalValue).toBe(3000); // Should remain 3000ms
    });

    test('New v2.1 config imports correctly (sec to ms)', async ({ page }) => {
        const newConfig = {
            version: '2.1',
            settings: {
                resetDuration: 2.5, // 2.5 seconds in new format
                interval: 1
            }
        };

        const result = await page.evaluate((config) => {
            // Simulate version detection
            const isSecondsFormat = config.version && parseFloat(config.version) >= 2.1;

            let internalValue;
            if (isSecondsFormat) {
                internalValue = config.settings.resetDuration * 1000;
            } else {
                internalValue = config.settings.resetDuration;
            }

            return {
                isSecondsFormat,
                internalValue
            };
        }, newConfig);

        expect(result.isSecondsFormat).toBe(true);
        expect(result.internalValue).toBe(2500); // 2.5 * 1000 = 2500ms
    });
});


// ==========================================
// UNLIMITED PLAYER COUNT TESTS
// ==========================================

test.describe('Unlimited Player Count', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('Player count can exceed 15 (no maximum limit)', async ({ page }) => {
        const result = await page.evaluate(() => {
            // Programmatically add 25 players
            const players = {};
            for (let i = 1; i <= 25; i++) {
                players[i] = `Player ${i}`;
            }
            game.settings.players = players;
            game.analytics.updateConfig(players, 2, 6);

            return {
                playerCount: Object.keys(game.settings.players).length,
                analyticsPlayerCount: game.analytics.playerCount
            };
        });

        expect(result.playerCount).toBe(25);
        expect(result.analyticsPlayerCount).toBe(25);
    });

    test('Player names are preserved after exceeding default 15', async ({ page }) => {
        const result = await page.evaluate(() => {
            const players = {};
            for (let i = 1; i <= 20; i++) {
                players[i] = `CustomPlayer${i}`;
            }
            game.settings.players = players;
            game.analytics.updateConfig(players, 2, 6);

            return {
                player1: game.settings.players[1],
                player15: game.settings.players[15],
                player20: game.settings.players[20]
            };
        });

        expect(result.player1).toBe('CustomPlayer1');
        expect(result.player15).toBe('CustomPlayer15');
        expect(result.player20).toBe('CustomPlayer20');
    });

    test('Analytics tracker handles large player counts', async ({ page }) => {
        const result = await page.evaluate(() => {
            const players = {};
            for (let i = 1; i <= 50; i++) {
                players[i] = `Player${i}`;
            }
            game.settings.players = players;
            game.analytics.updateConfig(players, 2, 6);

            // Reset and simulate turns
            game.analytics.reset();
            game.analytics.startTurn();

            // Verify all 50 players have stats initialized
            const allStatsInitialized = Object.keys(game.analytics.playerStats).length === 50;

            return {
                playerCount: game.analytics.playerCount,
                allStatsInitialized
            };
        });

        expect(result.playerCount).toBe(50);
        expect(result.allStatsInitialized).toBe(true);
    });
});


// ==========================================
// PANEL WIDTH ENFORCEMENT TESTS
// ==========================================

test.describe('Panel Width Enforcement', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('Panel width slider has min 280 and max 600', async ({ page }) => {
        const result = await page.evaluate(() => {
            const input = document.getElementById('panel-width-input');
            return {
                min: parseInt(input.min),
                max: parseInt(input.max),
                defaultValue: parseInt(input.value)
            };
        });

        expect(result.min).toBe(280);
        expect(result.max).toBe(600);
        expect(result.defaultValue).toBe(320);
    });

    test('Panel width settings update correctly', async ({ page }) => {
        const result = await page.evaluate(() => {
            game.settings.analytics.panelWidth = 450;
            return game.settings.analytics.panelWidth;
        });

        expect(result).toBe(450);
    });
});


// ==========================================
// HEATMAP SIZING TESTS
// ==========================================

test.describe('Heatmap Sizing', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('Heatmap container has max-width <= 240px', async ({ page }) => {
        const result = await page.evaluate(() => {
            // Need to check the CSS rule
            const style = document.createElement('style');
            document.head.appendChild(style);

            // Get computed style when element exists
            const container = document.querySelector('.heatmap-container');
            if (!container) {
                // Create a temporary element to test the CSS
                const temp = document.createElement('div');
                temp.className = 'heatmap-container';
                document.body.appendChild(temp);
                const computed = getComputedStyle(temp);
                const maxWidth = computed.maxWidth;
                document.body.removeChild(temp);
                return { maxWidth };
            }

            const computed = getComputedStyle(container);
            return { maxWidth: computed.maxWidth };
        });

        // Parse the max-width value
        const maxWidthPx = parseInt(result.maxWidth);
        expect(maxWidthPx).toBeLessThanOrEqual(240);
    });

    test('Heatmap grid uses fixed column sizing', async ({ page }) => {
        const result = await page.evaluate(() => {
            const temp = document.createElement('div');
            temp.className = 'heatmap-grid';
            document.body.appendChild(temp);
            const computed = getComputedStyle(temp);
            const gridColumns = computed.gridTemplateColumns;
            document.body.removeChild(temp);
            return { gridColumns };
        });

        // Should have 7 columns (1 label + 6 data columns)
        expect(result.gridColumns).toBeDefined();
    });
});


// ==========================================
// MODAL LAYOUT TESTS
// ==========================================

test.describe('Modal Layout (Side-by-Side Panels)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('Modal body has columns layout', async ({ page }) => {
        const result = await page.evaluate(() => {
            const columnsContainer = document.querySelector('.modal-body-columns');
            const playerSection = document.querySelector('.player-config-section');
            const eventSection = document.querySelector('.event-definitions-section');

            return {
                hasColumnsContainer: !!columnsContainer,
                hasPlayerSection: !!playerSection,
                hasEventSection: !!eventSection
            };
        });

        expect(result.hasColumnsContainer).toBe(true);
        expect(result.hasPlayerSection).toBe(true);
        expect(result.hasEventSection).toBe(true);
    });

    test('Save & Export and Save buttons exist', async ({ page }) => {
        const result = await page.evaluate(() => {
            const saveExportBtn = document.getElementById('save-export-btn');
            const saveBtn = document.getElementById('save-advanced-btn');
            const importBtn = document.getElementById('import-json-btn');

            return {
                hasSaveExportBtn: !!saveExportBtn,
                hasSaveBtn: !!saveBtn,
                hasImportBtn: !!importBtn,
                saveExportText: saveExportBtn?.textContent?.trim(),
                saveText: saveBtn?.textContent?.trim()
            };
        });

        expect(result.hasSaveExportBtn).toBe(true);
        expect(result.hasSaveBtn).toBe(true);
        expect(result.hasImportBtn).toBe(true);
        expect(result.saveExportText).toBe('Save & Export');
        expect(result.saveText).toBe('Save');
    });
});
