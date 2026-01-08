/**
 * Random Event Dice 2.0 - Comprehensive Test Suite
 * Tests include: SeededRNG, SamplePool, Event Validation, JSON Config, and Game Logic
 * 
 * Run via: node tests.js (or open tests.html in browser)
 */

// ============================================================================
// SeededRNG Class (copied from script.js for standalone testing)
// ============================================================================
class SeededRNG {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    roll(sides) {
        return Math.floor(this.next() * sides) + 1;
    }
}

// ============================================================================
// SamplePool Class (copied from script.js for standalone testing)
// ============================================================================
class SamplePool {
    constructor(diceCount, diceSides, seed = null) {
        this.diceCount = diceCount;
        this.diceSides = diceSides;
        this.seed = seed;
        this.samples = [];
        this.currentIndex = 0;
        this.rng = seed !== null ? new SeededRNG(seed) : null;
    }

    static calculateRequiredSamples(durationMin, intervalMs, resetDurationMs) {
        const totalSeconds = durationMin * 60;
        const cycleTime = (intervalMs + resetDurationMs) / 1000;
        return Math.ceil(totalSeconds / cycleTime) + 100;
    }

    generate(count) {
        const samplesToGenerate = Math.max(0, count - this.samples.length);
        if (samplesToGenerate === 0) return;

        for (let i = 0; i < samplesToGenerate; i++) {
            const roll = [];
            for (let d = 0; d < this.diceCount; d++) {
                const value = this.rng
                    ? this.rng.roll(this.diceSides)
                    : Math.floor(Math.random() * this.diceSides) + 1;
                roll.push(value);
            }
            this.samples.push(roll);
        }
    }

    getNext() {
        if (this.currentIndex >= this.samples.length) {
            this.generate(this.samples.length + 100);
        }
        return this.samples[this.currentIndex++];
    }

    reset() {
        this.currentIndex = 0;
    }

    regenerate(seed) {
        this.seed = seed;
        this.rng = seed !== null ? new SeededRNG(seed) : null;
        this.samples = [];
        this.currentIndex = 0;
    }
}

// ============================================================================
// Event Validation Logic (copied from script.js for standalone testing)
// ============================================================================
function validateEventDefinitions(definitions) {
    const warnings = [];

    definitions.forEach((def, index) => {
        const rulesByDie = {};
        def.rules.forEach(rule => {
            if (!rulesByDie[rule.dieIndex]) {
                rulesByDie[rule.dieIndex] = [];
            }
            rulesByDie[rule.dieIndex].push(rule);
        });

        Object.entries(rulesByDie).forEach(([dieIndex, rules]) => {
            const equalRules = rules.filter(r => r.operator === '==');
            const notEqualRules = rules.filter(r => r.operator === '!=');
            const greaterRules = rules.filter(r => r.operator === '>');
            const lessRules = rules.filter(r => r.operator === '<');

            // Check for conflicting == values
            if (equalRules.length > 1) {
                const values = equalRules.map(r => r.value);
                const uniqueValues = [...new Set(values)];
                if (uniqueValues.length > 1) {
                    warnings.push(`Event #${index + 1}: Die ${parseInt(dieIndex) + 1} impossible`);
                }
            }

            // Check for == and != with same value
            equalRules.forEach(eq => {
                notEqualRules.forEach(neq => {
                    if (eq.value === neq.value) {
                        warnings.push(`Event #${index + 1}: Die ${parseInt(dieIndex) + 1} impossible`);
                    }
                });
            });

            // Check for > and < with impossible range
            if (greaterRules.length > 0 && lessRules.length > 0) {
                const maxGreater = Math.max(...greaterRules.map(r => r.value));
                const minLess = Math.min(...lessRules.map(r => r.value));
                if (maxGreater >= minLess) {
                    warnings.push(`Event #${index + 1}: Die ${parseInt(dieIndex) + 1} impossible`);
                }
            }
        });
    });

    return warnings;
}

// ============================================================================
// Event Checking Logic
// ============================================================================
function checkCondition(diceValues, definitions) {
    for (const def of definitions) {
        const rulesMet = def.rules.every(rule => {
            const dieVal = diceValues[rule.dieIndex];
            if (dieVal === undefined) return false;

            switch (rule.operator) {
                case '==': return dieVal == rule.value;
                case '!=': return dieVal != rule.value;
                case '>': return dieVal > rule.value;
                case '<': return dieVal < rule.value;
                default: return false;
            }
        });
        if (rulesMet) return true;
    }
    return false;
}

// ============================================================================
// Test Suite
// ============================================================================
let passCount = 0;
let failCount = 0;

function pass(testName, message) {
    passCount++;
    console.log(`✅ PASS: ${testName} - ${message}`);
}

function fail(testName, message) {
    failCount++;
    console.error(`❌ FAIL: ${testName} - ${message}`);
}

async function runTests() {
    console.log("=".repeat(60));
    console.log("Random Event Dice 2.0 - Comprehensive Test Suite");
    console.log("=".repeat(60));
    console.log("");

    // =========================================================================
    // Test 1: SeededRNG Determinism
    // =========================================================================
    console.log("--- Test 1: SeededRNG Determinism ---");

    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);

    const sequence1 = [rng1.roll(6), rng1.roll(6), rng1.roll(6), rng1.roll(6), rng1.roll(6)];
    const sequence2 = [rng2.roll(6), rng2.roll(6), rng2.roll(6), rng2.roll(6), rng2.roll(6)];

    if (JSON.stringify(sequence1) === JSON.stringify(sequence2)) {
        pass("Determinism", `Same seed produces same sequence: [${sequence1.join(', ')}]`);
    } else {
        fail("Determinism", `Sequences differ: [${sequence1}] vs [${sequence2}]`);
    }

    // Different seeds produce different sequences
    const rng3 = new SeededRNG(42);
    const sequence3 = [rng3.roll(6), rng3.roll(6), rng3.roll(6), rng3.roll(6), rng3.roll(6)];

    if (JSON.stringify(sequence1) !== JSON.stringify(sequence3)) {
        pass("Different Seeds", `Different seeds produce different sequences`);
    } else {
        fail("Different Seeds", `Different seeds produced same sequence unexpectedly`);
    }

    // =========================================================================
    // Test 2: SamplePool Pre-generation
    // =========================================================================
    console.log("\n--- Test 2: SamplePool Pre-generation ---");

    const pool = new SamplePool(2, 6, 12345);
    const requiredSamples = SamplePool.calculateRequiredSamples(60, 1000, 1000);
    pool.generate(requiredSamples);

    if (pool.samples.length >= requiredSamples) {
        pass("Pool Size", `Generated ${pool.samples.length} samples (required: ${requiredSamples})`);
    } else {
        fail("Pool Size", `Only generated ${pool.samples.length}, needed ${requiredSamples}`);
    }

    // Pool never shrinks
    const oldLength = pool.samples.length;
    pool.generate(10); // Request fewer samples
    if (pool.samples.length === oldLength) {
        pass("No Shrink", `Pool did not shrink (still ${pool.samples.length})`);
    } else {
        fail("No Shrink", `Pool shrunk from ${oldLength} to ${pool.samples.length}`);
    }

    // Pool expands when needed
    pool.generate(oldLength + 50);
    if (pool.samples.length === oldLength + 50) {
        pass("Pool Expansion", `Pool expanded to ${pool.samples.length}`);
    } else {
        fail("Pool Expansion", `Expected ${oldLength + 50}, got ${pool.samples.length}`);
    }

    // =========================================================================
    // Test 3: SamplePool with Seed produces deterministic samples
    // =========================================================================
    console.log("\n--- Test 3: Seeded SamplePool Determinism ---");

    const poolA = new SamplePool(2, 6, 777);
    poolA.generate(10);

    const poolB = new SamplePool(2, 6, 777);
    poolB.generate(10);

    const samplesMatch = JSON.stringify(poolA.samples) === JSON.stringify(poolB.samples);
    if (samplesMatch) {
        pass("Seeded Pool", `Same seed produces identical sample sequences`);
    } else {
        fail("Seeded Pool", `Sample sequences differ with same seed`);
    }

    // =========================================================================
    // Test 4: Event Validation - Impossible Events
    // =========================================================================
    console.log("\n--- Test 4: Event Validation - Impossible Events ---");

    // Die 1 == 1 AND Die 1 == 2 (impossible)
    const impossibleDef1 = [{
        id: 1,
        rules: [
            { dieIndex: 0, operator: '==', value: 1 },
            { dieIndex: 0, operator: '==', value: 2 }
        ]
    }];

    let warnings = validateEventDefinitions(impossibleDef1);
    if (warnings.length > 0) {
        pass("Impossible ==", `Detected impossible event: Die 1 == 1 AND Die 1 == 2`);
    } else {
        fail("Impossible ==", `Failed to detect impossible event`);
    }

    // Die 1 == 3 AND Die 1 != 3 (impossible)
    const impossibleDef2 = [{
        id: 2,
        rules: [
            { dieIndex: 0, operator: '==', value: 3 },
            { dieIndex: 0, operator: '!=', value: 3 }
        ]
    }];

    warnings = validateEventDefinitions(impossibleDef2);
    if (warnings.length > 0) {
        pass("Impossible == and !=", `Detected: Die 1 == 3 AND Die 1 != 3`);
    } else {
        fail("Impossible == and !=", `Failed to detect`);
    }

    // Die 1 > 5 AND Die 1 < 4 (impossible)
    const impossibleDef3 = [{
        id: 3,
        rules: [
            { dieIndex: 0, operator: '>', value: 5 },
            { dieIndex: 0, operator: '<', value: 4 }
        ]
    }];

    warnings = validateEventDefinitions(impossibleDef3);
    if (warnings.length > 0) {
        pass("Impossible > and <", `Detected: Die 1 > 5 AND Die 1 < 4`);
    } else {
        fail("Impossible > and <", `Failed to detect`);
    }

    // Valid event (should have no warnings)
    const validDef = [{
        id: 4,
        rules: [
            { dieIndex: 0, operator: '==', value: 1 },
            { dieIndex: 1, operator: '==', value: 1 }
        ]
    }];

    warnings = validateEventDefinitions(validDef);
    if (warnings.length === 0) {
        pass("Valid Event", `No false positives on valid doubles event`);
    } else {
        fail("Valid Event", `False positive warning on valid event`);
    }

    // =========================================================================
    // Test 5: Event Checking with Default Doubles
    // =========================================================================
    console.log("\n--- Test 5: Default Doubles Event Logic ---");

    const defaultDefs = [];
    for (let i = 1; i <= 6; i++) {
        defaultDefs.push({
            id: i,
            rules: [
                { dieIndex: 0, operator: '==', value: i },
                { dieIndex: 1, operator: '==', value: i }
            ]
        });
    }

    // Test all doubles trigger
    for (let i = 1; i <= 6; i++) {
        if (checkCondition([i, i], defaultDefs)) {
            pass(`Doubles [${i},${i}]`, "Triggered correctly");
        } else {
            fail(`Doubles [${i},${i}]`, "Failed to trigger");
        }
    }

    // Test non-doubles don't trigger
    const nonDoubles = [[1, 2], [3, 4], [5, 6], [2, 5]];
    for (const dice of nonDoubles) {
        if (!checkCondition(dice, defaultDefs)) {
            pass(`Non-doubles [${dice}]`, "Correctly ignored");
        } else {
            fail(`Non-doubles [${dice}]`, "Incorrectly triggered");
        }
    }

    // =========================================================================
    // Test 6: JSON Config Structure
    // =========================================================================
    console.log("\n--- Test 6: JSON Config Structure ---");

    const sampleConfig = {
        version: "2.0",
        settings: {
            interval: 1000,
            resetDuration: 1000,
            diceCount: 2,
            diceSides: 6,
            duration: 60,
            volume: 0,
            soundEnabled: true,
            seed: 12345
        },
        eventDefinitions: [
            {
                id: 1,
                rules: [
                    { dieIndex: 0, operator: "==", value: 1 },
                    { dieIndex: 1, operator: "==", value: 1 }
                ]
            }
        ]
    };

    // Verify structure
    if (sampleConfig.version === "2.0" &&
        sampleConfig.settings &&
        Array.isArray(sampleConfig.eventDefinitions)) {
        pass("Config Structure", "Valid JSON config structure");
    } else {
        fail("Config Structure", "Invalid structure");
    }

    // Verify roundtrip (serialize and parse)
    const serialized = JSON.stringify(sampleConfig);
    const parsed = JSON.parse(serialized);

    if (parsed.settings.seed === 12345 &&
        parsed.eventDefinitions[0].rules[0].value === 1) {
        pass("JSON Roundtrip", "Config survives JSON roundtrip");
    } else {
        fail("JSON Roundtrip", "Data lost in roundtrip");
    }

    // =========================================================================
    // Test 7: Deterministic Game Simulation with Seed
    // =========================================================================
    console.log("\n--- Test 7: Deterministic Game Simulation ---");

    // Simulate a short game with seed 42
    const gamePool = new SamplePool(2, 6, 42);
    gamePool.generate(100);

    // Record when events trigger (doubles)
    const eventIndices = [];
    for (let i = 0; i < 50; i++) {
        const roll = gamePool.getNext();
        if (checkCondition(roll, defaultDefs)) {
            eventIndices.push(i);
        }
    }

    // Replay with same seed - should get identical event indices
    gamePool.reset();
    const replayIndices = [];
    for (let i = 0; i < 50; i++) {
        const roll = gamePool.getNext();
        if (checkCondition(roll, defaultDefs)) {
            replayIndices.push(i);
        }
    }

    if (JSON.stringify(eventIndices) === JSON.stringify(replayIndices)) {
        pass("Deterministic Sim", `Event indices match: [${eventIndices.slice(0, 5).join(', ')}...]`);
    } else {
        fail("Deterministic Sim", "Event indices differ on replay");
    }

    // =========================================================================
    // Test 8: Advanced Event Logic with Multiple Operators
    // =========================================================================
    console.log("\n--- Test 8: Advanced Event Logic ---");

    // Die 1 > 3 AND Die 2 < 4
    const advancedDef = [{
        id: 100,
        rules: [
            { dieIndex: 0, operator: '>', value: 3 },
            { dieIndex: 1, operator: '<', value: 4 }
        ]
    }];

    // Should trigger
    if (checkCondition([4, 3], advancedDef)) {
        pass("Advanced Logic", "[4, 3] triggers (4 > 3 AND 3 < 4)");
    } else {
        fail("Advanced Logic", "[4, 3] should trigger");
    }

    if (checkCondition([6, 1], advancedDef)) {
        pass("Advanced Logic", "[6, 1] triggers (6 > 3 AND 1 < 4)");
    } else {
        fail("Advanced Logic", "[6, 1] should trigger");
    }

    // Should NOT trigger
    if (!checkCondition([3, 3], advancedDef)) {
        pass("Advanced Logic", "[3, 3] correctly ignored (3 is NOT > 3)");
    } else {
        fail("Advanced Logic", "[3, 3] should not trigger");
    }

    if (!checkCondition([5, 5], advancedDef)) {
        pass("Advanced Logic", "[5, 5] correctly ignored (5 is NOT < 4)");
    } else {
        fail("Advanced Logic", "[5, 5] should not trigger");
    }

    // =========================================================================
    // Test 9: Not Equals Operator
    // =========================================================================
    console.log("\n--- Test 9: Not Equals Operator ---");

    const notEqDef = [{
        id: 200,
        rules: [
            { dieIndex: 0, operator: '!=', value: 1 },
            { dieIndex: 1, operator: '!=', value: 6 }
        ]
    }];

    if (checkCondition([2, 5], notEqDef)) {
        pass("Not Equals", "[2, 5] triggers (2 != 1 AND 5 != 6)");
    } else {
        fail("Not Equals", "[2, 5] should trigger");
    }

    if (!checkCondition([1, 3], notEqDef)) {
        pass("Not Equals", "[1, 3] ignored (Die 1 equals excluded value)");
    } else {
        fail("Not Equals", "[1, 3] should not trigger");
    }

    // =========================================================================
    // Test 10: AnalyticsTracker Player Rotation
    // =========================================================================
    console.log("\n--- Test 10: AnalyticsTracker Player Rotation ---");

    const testPlayers = { 1: "Alice", 2: "Bob", 3: "Charlie" };
    const tracker = new AnalyticsTracker(testPlayers, 2, 6);

    if (tracker.getCurrentPlayerName() === "Alice") {
        pass("Player Init", "First player is Alice");
    } else {
        fail("Player Init", `Expected Alice, got ${tracker.getCurrentPlayerName()}`);
    }

    tracker.startTurn();
    tracker.recordRoll([1, 2]);
    tracker.recordRoll([3, 4]);
    tracker.endTurn();

    if (tracker.getCurrentPlayerName() === "Bob") {
        pass("Player Rotation", "After event, player rotated to Bob");
    } else {
        fail("Player Rotation", `Expected Bob, got ${tracker.getCurrentPlayerName()}`);
    }

    // Check stats for Alice
    const aliceStats = tracker.playerStats[1];
    if (aliceStats.totalRolls === 2 && aliceStats.turnCount === 1) {
        pass("Player Stats", "Alice: 2 rolls, 1 turn recorded correctly");
    } else {
        fail("Player Stats", `Alice stats wrong: ${aliceStats.totalRolls} rolls, ${aliceStats.turnCount} turns`);
    }

    // =========================================================================
    // Test 11: AnalyticsTracker Timeline
    // =========================================================================
    console.log("\n--- Test 11: AnalyticsTracker Timeline ---");

    // Continue from previous test - Bob's turn
    tracker.startTurn();
    tracker.recordRoll([5, 5]);
    tracker.endTurn();

    // Charlie's turn
    tracker.startTurn();
    tracker.recordRoll([1, 1]);
    tracker.recordRoll([2, 2]);
    tracker.recordRoll([3, 3]);
    tracker.endTurn();

    if (tracker.timeline.length === 3) {
        pass("Timeline Length", "Timeline has 3 entries");
    } else {
        fail("Timeline Length", `Expected 3, got ${tracker.timeline.length}`);
    }

    // Most recent first
    if (tracker.timeline[0].playerName === "Charlie" && tracker.timeline[0].rolls === 3) {
        pass("Timeline Order", "Most recent turn (Charlie, 3 rolls) is first");
    } else {
        fail("Timeline Order", "Timeline order incorrect");
    }

    // =========================================================================
    // Test 12: AnalyticsTracker Heatmap (2d6)
    // =========================================================================
    console.log("\n--- Test 12: AnalyticsTracker Heatmap ---");

    const heatmapTracker = new AnalyticsTracker({ 1: "Test" }, 2, 6);
    heatmapTracker.recordRoll([1, 1]); // [0][0]
    heatmapTracker.recordRoll([1, 1]); // [0][0]
    heatmapTracker.recordRoll([6, 6]); // [5][5]
    heatmapTracker.recordRoll([3, 4]); // [2][3]

    if (heatmapTracker.heatmap[0][0] === 2) {
        pass("Heatmap [1,1]", "Double 1s recorded twice");
    } else {
        fail("Heatmap [1,1]", `Expected 2, got ${heatmapTracker.heatmap[0][0]}`);
    }

    if (heatmapTracker.heatmap[5][5] === 1) {
        pass("Heatmap [6,6]", "Double 6s recorded once");
    } else {
        fail("Heatmap [6,6]", `Expected 1, got ${heatmapTracker.heatmap[5][5]}`);
    }

    if (heatmapTracker.totalRolls === 4) {
        pass("Heatmap Total", "Total rolls is 4");
    } else {
        fail("Heatmap Total", `Expected 4, got ${heatmapTracker.totalRolls}`);
    }

    const heatmapData = heatmapTracker.getHeatmapData();
    if (heatmapData && heatmapData[0][0].count === 2) {
        pass("Heatmap Data", "getHeatmapData returns correct data structure");
    } else {
        fail("Heatmap Data", "Heatmap data structure incorrect");
    }

    // =========================================================================
    // Test 13: AnalyticsTracker Leaderboard
    // =========================================================================
    console.log("\n--- Test 13: AnalyticsTracker Leaderboard ---");

    // Use the tracker from test 10 (Alice: 2, Bob: 1, Charlie: 3)
    const leaderboard = tracker.getLeaderboard();

    if (leaderboard[0].playerName === "Charlie" && leaderboard[0].totalRolls === 3) {
        pass("Leaderboard #1", "Charlie is first with 3 rolls");
    } else {
        fail("Leaderboard #1", `Expected Charlie, got ${leaderboard[0].playerName}`);
    }

    if (leaderboard[1].playerName === "Alice" && leaderboard[1].totalRolls === 2) {
        pass("Leaderboard #2", "Alice is second with 2 rolls");
    } else {
        fail("Leaderboard #2", `Expected Alice, got ${leaderboard[1].playerName}`);
    }

    // =========================================================================
    // Test 14: AnalyticsTracker Reset
    // =========================================================================
    console.log("\n--- Test 14: AnalyticsTracker Reset ---");

    tracker.reset();

    if (tracker.getCurrentPlayerName() === "Alice" && tracker.turnNumber === 0) {
        pass("Reset Player", "Reset returns to first player and turn 0");
    } else {
        fail("Reset Player", "Reset did not properly reset state");
    }

    if (tracker.timeline.length === 0 && tracker.totalRolls === 0) {
        pass("Reset Data", "Timeline and total rolls cleared");
    } else {
        fail("Reset Data", "Reset did not clear data");
    }

    // =========================================================================
    // Test 15: Deterministic Simulation with Seed
    // =========================================================================
    console.log("\n--- Test 15: Deterministic Simulation with Seed 12345 ---");

    // Simulate with known seed
    const simPool = new SamplePool(2, 6, 12345);
    simPool.generate(100);

    const simTracker = new AnalyticsTracker({ 1: "P1", 2: "P2" }, 2, 6);
    simTracker.startTurn();

    let eventCount = 0;
    for (let i = 0; i < 50; i++) {
        const roll = simPool.getNext();
        simTracker.recordRoll(roll);
        if (checkCondition(roll, defaultDefs)) {
            simTracker.endTurn();
            eventCount++;
        }
    }

    // Same seed should give same results
    const simPool2 = new SamplePool(2, 6, 12345);
    simPool2.generate(100);

    const simTracker2 = new AnalyticsTracker({ 1: "P1", 2: "P2" }, 2, 6);
    simTracker2.startTurn();

    let eventCount2 = 0;
    for (let i = 0; i < 50; i++) {
        const roll = simPool2.getNext();
        simTracker2.recordRoll(roll);
        if (checkCondition(roll, defaultDefs)) {
            simTracker2.endTurn();
            eventCount2++;
        }
    }

    if (eventCount === eventCount2) {
        pass("Deterministic Sim", `Both runs had ${eventCount} events`);
    } else {
        fail("Deterministic Sim", `Event counts differ: ${eventCount} vs ${eventCount2}`);
    }

    if (simTracker.totalRolls === simTracker2.totalRolls) {
        pass("Deterministic Rolls", `Both trackers have ${simTracker.totalRolls} total rolls`);
    } else {
        fail("Deterministic Rolls", "Roll counts differ");
    }

    // =========================================================================
    // Test 16: Skip To End Simulation (Time Tracking)
    // =========================================================================
    console.log("\n--- Test 16: Skip To End Simulation (Time Tracking) ---");

    const skipSamplePool = new SamplePool(2, 6, 12345);
    skipSamplePool.generate(100);
    const skipTracker = new AnalyticsTracker({ 1: "P1", 2: "P2" }, 2, 6);

    // Default definitions (doubles)
    const skipDefs = [];
    for (let i = 1; i <= 6; i++) {
        skipDefs.push({
            id: i,
            rules: [{ dieIndex: 0, operator: '==', value: i }, { dieIndex: 1, operator: '==', value: i }]
        });
    }

    const intervalSec = 2.5; // Custom interval
    const skipResults = skipTracker.simulateToEnd(
        skipSamplePool,
        skipDefs,
        (roll, defs) => checkCondition(roll, defs),
        intervalSec
    );

    const totalCalculatedTime = skipResults.totalRolls * intervalSec;

    // Sum player times
    const p1Stats = skipTracker.playerStats[1];
    const p2Stats = skipTracker.playerStats[2];
    const summedPlayerTime = p1Stats.totalTime + p2Stats.totalTime;

    if (Math.abs(summedPlayerTime - totalCalculatedTime) < 0.001) {
        pass("Time Integrity", `Total player time (${summedPlayerTime}) matches total rolls time (${totalCalculatedTime})`);
    } else {
        fail("Time Integrity", `Time mismatch: Players=${summedPlayerTime}, Rolls=${totalCalculatedTime}`);
    }

    if (p1Stats.totalTime > 0 && p2Stats.totalTime > 0) {
        pass("Player Accumulation", `Players have accumulated time: P1=${p1Stats.totalTime}, P2=${p2Stats.totalTime}`);
    } else {
        fail("Player Accumulation", "Players have 0 time");
    }

    // =========================================================================
    // Summary
    // =========================================================================
    console.log("\n" + "=".repeat(60));
    console.log(`TEST SUMMARY: ${passCount} passed, ${failCount} failed`);
    console.log("=".repeat(60));

    if (failCount === 0) {
        console.log("🎉 All tests passed!");
    } else {
        console.log("⚠️ Some tests failed. Please review.");
    }

    return failCount === 0;
}

// ============================================================================
// AnalyticsTracker Class (copied from script.js for standalone testing)
// ============================================================================
class AnalyticsTracker {
    constructor(players, diceCount, diceSides) {
        this.players = players;
        this.playerCount = Object.keys(players).length;
        this.diceCount = diceCount;
        this.diceSides = diceSides;

        this.currentPlayerIndex = 1;
        this.currentTurnRolls = 0;
        this.currentTurnStartTime = null;
        this.turnNumber = 0;

        this.playerStats = {};
        for (let i = 1; i <= this.playerCount; i++) {
            this.playerStats[i] = { totalRolls: 0, totalTime: 0, turnCount: 0 };
        }

        this.timeline = [];

        this.heatmap = [];
        if (diceCount === 2 && diceSides === 6) {
            for (let i = 0; i < 6; i++) {
                this.heatmap[i] = new Array(6).fill(0);
            }
        }
        this.totalRolls = 0;
    }

    startTurn() {
        this.currentTurnStartTime = Date.now();
        this.currentTurnRolls = 0;
    }

    recordRoll(diceValues) {
        this.currentTurnRolls++;
        this.totalRolls++;

        if (this.heatmap.length > 0 && diceValues.length === 2) {
            const d1 = diceValues[0] - 1;
            const d2 = diceValues[1] - 1;
            if (d1 >= 0 && d1 < 6 && d2 >= 0 && d2 < 6) {
                this.heatmap[d1][d2]++;
            }
        }
    }

    endTurn() {
        const elapsed = this.currentTurnStartTime
            ? (Date.now() - this.currentTurnStartTime) / 1000
            : 0;

        const stats = this.playerStats[this.currentPlayerIndex];
        stats.totalRolls += this.currentTurnRolls;
        stats.totalTime += elapsed;
        stats.turnCount++;

        this.turnNumber++;

        this.timeline.unshift({
            turnNumber: this.turnNumber,
            playerId: this.currentPlayerIndex,
            playerName: this.players[this.currentPlayerIndex],
            rolls: this.currentTurnRolls,
            time: elapsed
        });

        if (this.timeline.length > 10) {
            this.timeline.pop();
        }

        this.currentPlayerIndex = (this.currentPlayerIndex % this.playerCount) + 1;
        this.startTurn();
    }

    getCurrentPlayerName() {
        return this.players[this.currentPlayerIndex] || `Player ${this.currentPlayerIndex}`;
    }

    getLeaderboard() {
        const leaderboard = [];
        for (const [id, stats] of Object.entries(this.playerStats)) {
            leaderboard.push({
                playerId: parseInt(id),
                playerName: this.players[id],
                totalRolls: stats.totalRolls,
                totalTime: stats.totalTime,
                turnCount: stats.turnCount,
                isCurrent: parseInt(id) === this.currentPlayerIndex
            });
        }
        return leaderboard.sort((a, b) => b.totalRolls - a.totalRolls);
    }

    getHeatmapData() {
        if (this.heatmap.length === 0) return null;

        const data = [];
        const expected = 1 / 36;

        for (let i = 0; i < 6; i++) {
            const row = [];
            for (let j = 0; j < 6; j++) {
                const count = this.heatmap[i][j];
                const proportion = this.totalRolls > 0 ? count / this.totalRolls : 0;
                let heatLevel = 3;
                if (this.totalRolls > 0) {
                    const deviation = proportion - expected;
                    if (deviation < -expected * 0.5) heatLevel = 0;
                    else if (deviation < -expected * 0.25) heatLevel = 1;
                    else if (deviation < 0) heatLevel = 2;
                    else if (deviation < expected * 0.25) heatLevel = 3;
                    else if (deviation < expected * 0.5) heatLevel = 4;
                    else if (deviation < expected) heatLevel = 5;
                    else heatLevel = 6;
                }
                row.push({ count, proportion, heatLevel });
            }
            data.push(row);
        }
        return data;
    }

    simulateToEnd(samplePool, eventDefinitions, checkConditionFn, intervalSeconds) {
        const results = { events: 0, totalRolls: 0 };
        const rollTime = intervalSeconds;

        while (samplePool.currentIndex < samplePool.samples.length) {
            const roll = samplePool.getNext();
            this.currentTurnRolls++;
            this.totalRolls++;

            // Update heatmap
            if (this.heatmap.length > 0 && roll.length === 2) {
                const d1 = roll[0] - 1;
                const d2 = roll[1] - 1;
                if (d1 >= 0 && d1 < 6 && d2 >= 0 && d2 < 6) this.heatmap[d1][d2]++;
            }

            results.totalRolls++;

            if (checkConditionFn(roll, eventDefinitions)) {
                // Manually end turn with simulated time
                const stats = this.playerStats[this.currentPlayerIndex];
                stats.totalRolls += this.currentTurnRolls;
                stats.totalTime += (this.currentTurnRolls * rollTime);
                stats.turnCount++;
                this.turnNumber++;

                // Add to timeline
                this.timeline.unshift({
                    turnNumber: this.turnNumber,
                    playerId: this.currentPlayerIndex,
                    playerName: this.players[this.currentPlayerIndex],
                    rolls: this.currentTurnRolls,
                    time: (this.currentTurnRolls * rollTime)
                });
                if (this.timeline.length > 10) this.timeline.pop();

                this.currentPlayerIndex = (this.currentPlayerIndex % this.playerCount) + 1;
                this.currentTurnRolls = 0; // Reset for next turn

                results.events++;
            }
        }

        // Commit pending rolls for the last partial turn
        if (this.currentTurnRolls > 0) {
            const stats = this.playerStats[this.currentPlayerIndex];
            stats.totalRolls += this.currentTurnRolls;
            stats.totalTime += (this.currentTurnRolls * rollTime);
            stats.turnCount++;
            this.turnNumber++;

            // Add to timeline
            this.timeline.unshift({
                turnNumber: this.turnNumber,
                playerId: this.currentPlayerIndex,
                playerName: this.players[this.currentPlayerIndex],
                rolls: this.currentTurnRolls,
                time: (this.currentTurnRolls * rollTime)
            });
            if (this.timeline.length > 10) this.timeline.pop();
        }

        return results;
    }

    reset() {
        this.currentPlayerIndex = 1;
        this.currentTurnRolls = 0;
        this.currentTurnStartTime = null;
        this.turnNumber = 0;

        for (let i = 1; i <= this.playerCount; i++) {
            this.playerStats[i] = { totalRolls: 0, totalTime: 0, turnCount: 0 };
        }

        this.timeline = [];

        if (this.heatmap.length > 0) {
            for (let i = 0; i < 6; i++) {
                this.heatmap[i] = new Array(6).fill(0);
            }
        }
        this.totalRolls = 0;
    }
}

// Run tests
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
} else {
    // Browser environment
    runTests();
}
