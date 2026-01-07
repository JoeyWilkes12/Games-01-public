/**
 * Seeded Random Number Generator (Linear Congruential Generator)
 * Used for deterministic testing with specific seeds
 */
class SeededRNG {
    constructor(seed) {
        this.seed = seed;
    }

    // Returns number between 0 (inclusive) and 1 (exclusive)
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    // Roll a die with given sides
    roll(sides) {
        return Math.floor(this.next() * sides) + 1;
    }
}

/**
 * Sample Pool for pre-generating dice roll samples
 * Generates samples ahead of time for better performance
 */
class SamplePool {
    constructor(diceCount, diceSides, seed = null) {
        this.diceCount = diceCount;
        this.diceSides = diceSides;
        this.seed = seed;
        this.samples = [];
        this.currentIndex = 0;
        this.rng = seed !== null ? new SeededRNG(seed) : null;
    }

    // Calculate required samples based on game parameters
    static calculateRequiredSamples(durationMin, intervalMs, resetDurationMs) {
        const totalSeconds = durationMin * 60;
        // Each roll cycle takes interval + reset duration (worst case: every roll triggers event)
        const cycleTime = (intervalMs + resetDurationMs) / 1000;
        // Add buffer for safety
        return Math.ceil(totalSeconds / cycleTime) + 100;
    }

    // Generate samples (expands pool, never shrinks)
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

        console.debug(`[SamplePool] Pre-generated ${samplesToGenerate} samples (total: ${this.samples.length})`);
    }

    // Get next sample from pool
    getNext() {
        if (this.currentIndex >= this.samples.length) {
            // Generate more if needed
            this.generate(this.samples.length + 100);
        }
        return this.samples[this.currentIndex++];
    }

    // Reset index for new game
    reset() {
        this.currentIndex = 0;
    }

    // Regenerate pool with new seed
    regenerate(seed) {
        this.seed = seed;
        this.rng = seed !== null ? new SeededRNG(seed) : null;
        this.samples = [];
        this.currentIndex = 0;
        const count = SamplePool.calculateRequiredSamples(60, 1000, 1000);
        this.generate(count);
        console.debug(`[SamplePool] Regenerated with seed: ${seed === null ? 'random' : seed}`);
    }

    // Update dice configuration
    updateConfig(diceCount, diceSides) {
        if (this.diceCount !== diceCount || this.diceSides !== diceSides) {
            this.diceCount = diceCount;
            this.diceSides = diceSides;
            this.samples = [];
            this.currentIndex = 0;
            console.debug(`[SamplePool] Config updated: ${diceCount} dice, ${diceSides} sides`);
        }
    }
}

/**
 * Analytics Tracker for player statistics
 * Tracks turns, rolls per turn, time per turn, and dice heatmap
 */
class AnalyticsTracker {
    constructor(players, diceCount, diceSides) {
        this.players = players; // {1: "Joey", 2: "Brinlee", ...}
        this.playerCount = Object.keys(players).length;
        this.diceCount = diceCount;
        this.diceSides = diceSides;

        // Current turn state
        this.currentPlayerIndex = 1;
        this.currentTurnRolls = 0;
        this.currentTurnStartTime = null;
        this.turnNumber = 0;

        // Player stats: {playerId: {totalRolls, totalTime, turnCount}}
        this.playerStats = {};
        for (let i = 1; i <= this.playerCount; i++) {
            this.playerStats[i] = { totalRolls: 0, totalTime: 0, turnCount: 0 };
        }

        // Timeline: last 10 turns [{turnNumber, playerId, playerName, rolls, time}]
        this.timeline = [];

        // Heatmap: 6x6 grid for two dice (indices 0-5 represent dice values 1-6)
        this.heatmap = [];
        if (diceCount === 2 && diceSides === 6) {
            for (let i = 0; i < 6; i++) {
                this.heatmap[i] = new Array(6).fill(0);
            }
        }
        this.totalRolls = 0;

        // Settings
        this.enableLeaderboard = true;
        this.enableTimeline = true;
        this.enableHeatmap = true;
    }

    // Start a new turn
    startTurn() {
        this.currentTurnStartTime = Date.now();
        this.currentTurnRolls = 0;
    }

    // Record a roll
    recordRoll(diceValues) {
        this.currentTurnRolls++;
        this.totalRolls++;

        // Update heatmap for 2d6
        if (this.heatmap.length > 0 && diceValues.length === 2) {
            const d1 = diceValues[0] - 1; // Convert 1-6 to 0-5
            const d2 = diceValues[1] - 1;
            if (d1 >= 0 && d1 < 6 && d2 >= 0 && d2 < 6) {
                this.heatmap[d1][d2]++;
            }
        }
    }

    // End current turn (event triggered)
    endTurn() {
        const elapsed = this.currentTurnStartTime
            ? (Date.now() - this.currentTurnStartTime) / 1000
            : 0;

        // Update player stats
        const stats = this.playerStats[this.currentPlayerIndex];
        stats.totalRolls += this.currentTurnRolls;
        stats.totalTime += elapsed;
        stats.turnCount++;

        this.turnNumber++;

        // Add to timeline
        this.timeline.unshift({
            turnNumber: this.turnNumber,
            playerId: this.currentPlayerIndex,
            playerName: this.players[this.currentPlayerIndex],
            rolls: this.currentTurnRolls,
            rolls: this.currentTurnRolls,
            time: elapsed
        });

        // Keep only last 10
        if (this.timeline.length > 10) {
            this.timeline.pop();
        }

        // Draw graph if callback exists
        if (this.onTimelineUpdate) {
            this.onTimelineUpdate();
        }

        // Move to next player
        this.currentPlayerIndex = (this.currentPlayerIndex % this.playerCount) + 1;

        // Start next turn
        this.startTurn();
    }

    // Get current player name
    getCurrentPlayerName() {
        return this.players[this.currentPlayerIndex] || `Player ${this.currentPlayerIndex}`;
    }

    // Get current turn elapsed time
    getCurrentTurnTime() {
        if (!this.currentTurnStartTime) return 0;
        return (Date.now() - this.currentTurnStartTime) / 1000;
    }

    // Get leaderboard data (sorted by total rolls)
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
        // Sort by total rolls descending
        return leaderboard.sort((a, b) => b.totalRolls - a.totalRolls);
    }

    // Get heatmap data with proportions
    getHeatmapData() {
        if (this.heatmap.length === 0) return null;

        const data = [];
        const expected = 1 / 36; // Expected proportion for uniform distribution

        for (let i = 0; i < 6; i++) {
            const row = [];
            for (let j = 0; j < 6; j++) {
                const count = this.heatmap[i][j];
                const proportion = this.totalRolls > 0 ? count / this.totalRolls : 0;
                // Heat level: 0-6 based on deviation from expected
                let heatLevel = 3; // Default (expected)
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

    // Simulate remaining game to end (skip to end)
    // Simulate remaining game to end (skip to end)
    simulateToEnd(samplePool, eventDefinitions, checkConditionFn, intervalSeconds) {
        const results = { events: 0, totalRolls: 0 };
        const rollTime = intervalSeconds;

        while (samplePool.currentIndex < samplePool.samples.length) {
            const roll = samplePool.getNext();
            this.currentTurnRolls++;
            this.totalRolls++;

            // Update heatmap (copied logic for speed)
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
                // No startTurn() needed for simulation

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

    // Reset analytics
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

    // Update configuration
    updateConfig(players, diceCount, diceSides) {
        this.players = players;
        this.playerCount = Object.keys(players).length;
        this.diceCount = diceCount;
        this.diceSides = diceSides;

        // Reinitialize player stats for new player count
        this.playerStats = {};
        for (let i = 1; i <= this.playerCount; i++) {
            this.playerStats[i] = { totalRolls: 0, totalTime: 0, turnCount: 0 };
        }

        // Reinitialize heatmap for 2d6
        this.heatmap = [];
        if (diceCount === 2 && diceSides === 6) {
            for (let i = 0; i < 6; i++) {
                this.heatmap[i] = new Array(6).fill(0);
            }
        }
    }
}

class DiceGame {
    constructor() {
        // State
        this.isPlaying = false;
        this.isPaused = false;
        this.isResetting = false;
        this.timer = null;
        this.rollInterval = null;
        this.resetTimeout = null;
        this.timeLeft = 0;
        this.audioCtx = null;
        this.diceValues = [];

        // Default players (1-15)
        this.defaultPlayers = {
            1: "Joey", 2: "Brinlee", 3: "Braxton", 4: "Gavin",
            5: "Hinckley", 6: "London", 7: "Bode", 8: "Macey",
            9: "Ryder", 10: "Lily", 11: "Jack", 12: "Cole",
            13: "Gracen", 14: "Connor", 15: "Friend"
        };

        // Settings
        this.settings = {
            interval: 1000, // ms
            resetDuration: 1000, // ms
            diceCount: 2,
            diceSides: 6,
            duration: 60, // minutes
            volume: 0, // 0-100
            soundEnabled: true,
            seed: null, // null = random, number = deterministic
            eventDefinitions: this.getDefaultEventDefinitions(),
            // Player configuration
            players: { ...this.defaultPlayers },
            // Analytics settings
            analytics: {
                enableLeaderboard: true,
                enableTimeline: true,
                enableHeatmap: true,
                panelWidth: 320
            }
        };

        // Sample Pool for pre-generation
        this.samplePool = new SamplePool(
            this.settings.diceCount,
            this.settings.diceSides,
            this.settings.seed
        );

        // Analytics Tracker
        this.analytics = new AnalyticsTracker(
            this.settings.players,
            this.settings.diceCount,
            this.settings.diceSides
        );
        this.analyticsUpdateInterval = null;

        // Rolls since last event counter
        this.rollsSinceLastEvent = 0;

        // DOM Elements
        this.dom = {
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            timerDisplay: document.getElementById('timer-display'),
            diceContainer: document.getElementById('dice-container'),
            alertMessage: document.getElementById('alert-message'),
            settingsToggle: document.getElementById('toggle-settings'),
            settingsContent: document.getElementById('settings-content'),
            advancedBtn: document.getElementById('advanced-settings-btn'),
            advancedModal: document.getElementById('advanced-modal'),
            closeModalBtn: document.getElementById('close-modal'),
            saveAdvancedBtn: document.getElementById('save-advanced-btn'),
            addEventBtn: document.getElementById('add-event-btn'),
            eventList: document.getElementById('event-definitions-list'),
            inputs: {
                interval: document.getElementById('interval-input'),
                resetDuration: document.getElementById('reset-duration-input'),
                diceCount: document.getElementById('dice-count-input'),
                diceSides: document.getElementById('dice-sides-input'),
                duration: document.getElementById('duration-input'),
                volume: document.getElementById('volume-input'),
                sound: document.getElementById('sound-toggle'),
                seed: document.getElementById('seed-select')
            },
            rollsCounter: document.getElementById('rolls-count'),
            extendBtn: document.getElementById('extend-btn'),
            importJsonBtn: document.getElementById('import-json-btn'),
            exportJsonBtn: document.getElementById('export-json-btn'),
            jsonFileInput: document.getElementById('json-file-input'),
            validationWarning: null, // Will be created dynamically
            debugConsole: document.getElementById('debug-console'),
            debugMessages: document.getElementById('debug-messages'),
            toggleDebugBtn: document.getElementById('toggle-debug'),
            // Analytics DOM elements
            analyticsPanel: document.getElementById('analytics-panel'),
            analyticsToggle: document.getElementById('toggle-analytics'),
            showAnalyticsBtn: document.getElementById('show-analytics-btn'),
            currentPlayerName: document.getElementById('current-player-name'),
            currentTurnRolls: document.getElementById('current-turn-rolls'),
            currentTurnTime: document.getElementById('current-turn-time'),
            leaderboard: document.getElementById('leaderboard'),
            leaderboardSection: document.getElementById('leaderboard-section'),
            timeline: document.getElementById('timeline'),
            timelineSection: document.getElementById('timeline-section'),
            heatmapContainer: document.getElementById('heatmap-container'),
            heatmapSection: document.getElementById('heatmap-section'),
            skipToEndBtn: document.getElementById('skip-to-end-btn')
        };

        // Initialize debug console
        this.initDebugConsole();

        // Initialize analytics
        this.initAnalytics();

        // Link analytics graph update
        this.analytics.onTimelineUpdate = () => this.drawTimelineGraph();

        this.init();
    }

    initDebugConsole() {
        // Toggle debug console
        if (this.dom.toggleDebugBtn) {
            this.dom.toggleDebugBtn.addEventListener('click', () => {
                this.dom.debugConsole.classList.toggle('collapsed');
            });
        }

        // Intercept console methods to display in UI
        const originalDebug = console.debug;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalLog = console.log;

        console.debug = (...args) => {
            originalDebug.apply(console, args);
            this.addDebugMessage('debug', args.join(' '));
        };

        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.addDebugMessage('warn', args.join(' '));
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            this.addDebugMessage('error', args.join(' '));
        };

        // Add initial message
        this.addDebugMessage('info', 'Debug console initialized');
    }

    addDebugMessage(type, message) {
        if (!this.dom.debugMessages) return;

        const timestamp = new Date().toLocaleTimeString();
        const messageEl = document.createElement('div');
        messageEl.className = `debug-message ${type}`;

        // Extract tag if message starts with [Tag]
        let tag = '';
        let content = message;
        const tagMatch = message.match(/^\[([^\]]+)\]\s*(.*)/);
        if (tagMatch) {
            tag = tagMatch[1];
            content = tagMatch[2];
        }

        messageEl.innerHTML = `
            <span class="timestamp">${timestamp}</span>
            ${tag ? `<span class="tag">[${tag}]</span>` : ''}
            <span>${content}</span>
        `;

        this.dom.debugMessages.appendChild(messageEl);

        // Auto-scroll to bottom
        if (this.dom.debugMessages.parentElement) {
            this.dom.debugMessages.parentElement.scrollTop = this.dom.debugMessages.parentElement.scrollHeight;
        }

        // Limit to last 100 messages
        const messages = this.dom.debugMessages.children;
        if (messages.length > 100) {
            this.dom.debugMessages.removeChild(messages[0]);
        }
    }

    getDefaultEventDefinitions() {
        // Default: Doubles for 2 dice (1-1 to 6-6)
        // Structure: Array of Event Definitions.
        // Event Definition: Array of Rule Groups (AND logic within group is implied if we had multiple conditions interacting, 
        // but for now let's say an Event Definition is a SET of conditions that must ALL be true (AND).
        // If ANY Event Definition is true (OR), alert triggers.

        const definitions = [];
        // Per user request "Default ... 6 instances: 1) if both die are 1... etc"
        for (let i = 1; i <= 6; i++) {
            definitions.push({
                id: Date.now() + i,
                rules: [
                    { dieIndex: 0, operator: '==', value: i }, // Die 1 is i
                    { dieIndex: 1, operator: '==', value: i }  // AND Die 2 is i
                ]
            });
        }
        return definitions;
    }

    // Initialize analytics panel and listeners
    initAnalytics() {
        // Toggle analytics panel
        if (this.dom.analyticsToggle) {
            this.dom.analyticsToggle.addEventListener('click', () => {
                this.hideAnalyticsPanel();
            });
        }

        if (this.dom.showAnalyticsBtn) {
            this.dom.showAnalyticsBtn.addEventListener('click', () => {
                this.showAnalyticsPanel();
            });
        }

        // Skip to end button
        if (this.dom.skipToEndBtn) {
            this.dom.skipToEndBtn.addEventListener('click', () => {
                this.skipToEnd();
            });
        }

        // Apply initial section visibility based on settings
        this.updateAnalyticsSectionVisibility();

        console.debug('[Analytics] Initialized');
    }

    showAnalyticsPanel() {
        if (this.dom.analyticsPanel) {
            this.dom.analyticsPanel.classList.remove('hidden');
        }
        if (this.dom.showAnalyticsBtn) {
            this.dom.showAnalyticsBtn.classList.add('hidden');
        }
    }

    hideAnalyticsPanel() {
        if (this.dom.analyticsPanel) {
            this.dom.analyticsPanel.classList.add('hidden');
        }
        if (this.dom.showAnalyticsBtn) {
            this.dom.showAnalyticsBtn.classList.remove('hidden');
        }
    }

    updateAnalyticsSectionVisibility() {
        if (this.dom.leaderboardSection) {
            this.dom.leaderboardSection.style.display = this.settings.analytics.enableLeaderboard ? 'block' : 'none';
        }
        if (this.dom.timelineSection) {
            this.dom.timelineSection.style.display = this.settings.analytics.enableTimeline ? 'block' : 'none';
        }
        if (this.dom.heatmapSection) {
            const show = this.settings.analytics.enableHeatmap && this.settings.diceCount === 2 && this.settings.diceSides === 6;
            this.dom.heatmapSection.style.display = show ? 'block' : 'none';
        }
    }

    // Update analytics UI
    updateAnalyticsUI() {
        // Current turn info
        if (this.dom.currentPlayerName) {
            this.dom.currentPlayerName.textContent = this.analytics.getCurrentPlayerName();
        }
        if (this.dom.currentTurnRolls) {
            this.dom.currentTurnRolls.textContent = this.analytics.currentTurnRolls;
        }
        if (this.dom.currentTurnTime) {
            const elapsed = this.analytics.getCurrentTurnTime();
            const mins = Math.floor(elapsed / 60);
            const secs = Math.floor(elapsed % 60);
            this.dom.currentTurnTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        // Update leaderboard
        this.renderLeaderboard();

        // Update timeline
        this.renderTimeline();

        // Update heatmap
        this.renderHeatmap();
    }

    renderLeaderboard() {
        if (!this.dom.leaderboard || !this.settings.analytics.enableLeaderboard) return;

        const leaderboard = this.analytics.getLeaderboard();
        if (leaderboard.every(p => p.totalRolls === 0)) {
            this.dom.leaderboard.innerHTML = '<div class="leaderboard-placeholder">Start game to see stats</div>';
            return;
        }

        let html = '';
        leaderboard.forEach((player, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const currentClass = player.isCurrent ? 'current' : '';
            html += `
                <div class="leaderboard-item ${currentClass}">
                    <span class="rank ${rankClass}">${index + 1}</span>
                    <span class="player-info">${player.playerName}</span>
                    <span class="player-stats">${player.totalRolls} rolls | ${player.totalTime.toFixed(1)}s | ${player.turnCount} turns</span>
                </div>
            `;
        });
        this.dom.leaderboard.innerHTML = html;
    }

    renderTimeline() {
        if (!this.dom.timeline || !this.settings.analytics.enableTimeline) return;

        const timeline = this.analytics.timeline;
        if (timeline.length === 0) {
            this.dom.timeline.innerHTML = '<div class="timeline-placeholder">No turns yet</div>';
            return;
        }

        let html = '';
        timeline.forEach(turn => {
            const timeStr = turn.time.toFixed(1);
            html += `
                <div class="timeline-item">
                    <span class="turn-number">#${turn.turnNumber}</span>
                    <span class="turn-player">${turn.playerName}</span>
                    <span class="turn-details">${turn.rolls} rolls | ${timeStr}s</span>
                </div>
            `;
        });
        this.dom.timeline.innerHTML = html;
        this.drawTimelineGraph();
    }

    renderHeatmap() {
        if (!this.dom.heatmapContainer || !this.settings.analytics.enableHeatmap) return;
        if (this.settings.diceCount !== 2 || this.settings.diceSides !== 6) {
            this.dom.heatmapContainer.innerHTML = '<div class="heatmap-placeholder">Available for 2 dice × 6 sides only</div>';
            return;
        }

        const data = this.analytics.getHeatmapData();
        if (!data || this.analytics.totalRolls === 0) {
            this.dom.heatmapContainer.innerHTML = '<div class="heatmap-placeholder">Roll dice to see distribution</div>';
            return;
        }

        let html = '<div class="heatmap-grid">';
        // Header row
        html += '<div class="heatmap-cell header"></div>';
        for (let j = 1; j <= 6; j++) {
            html += `<div class="heatmap-cell header">${j}</div>`;
        }
        // Data rows
        for (let i = 0; i < 6; i++) {
            html += `<div class="heatmap-cell label">${i + 1}</div>`;
            for (let j = 0; j < 6; j++) {
                const cell = data[i][j];
                const pct = (cell.proportion * 100).toFixed(1);
                html += `<div class="heatmap-cell data heat-${cell.heatLevel}" title="${cell.count} (${pct}%)">${cell.count}</div>`;
            }
        }
        html += '</div>';
        html += `<div class="heatmap-legend"><span>Cold (under)</span><span>Expected: 2.78%</span><span>Hot (over)</span></div>`;
        html += `<div style="text-align: center; font-size: 0.75rem; margin-top: 0.25rem;">Total: ${this.analytics.totalRolls} rolls</div>`;
        this.dom.heatmapContainer.innerHTML = html;
    }

    skipToEnd() {
        if (!this.isPlaying) {
            console.warn('[Analytics] Cannot skip - game not playing');
            return;
        }

        // Stop the normal game loop
        clearInterval(this.timer);
        clearInterval(this.rollInterval);
        clearTimeout(this.resetTimeout);
        clearInterval(this.analyticsUpdateInterval);

        // Simulate remaining rolls
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

        const results = this.analytics.simulateToEnd(
            this.samplePool,
            this.settings.eventDefinitions,
            checkFn
        const results = this.analytics.simulateToEnd(
                this.samplePool,
                this.settings.eventDefinitions,
                checkFn,
                this.settings.interval / 1000 // Pass interval in seconds
            );

        console.debug(`[Analytics] Skip to end: ${results.totalRolls} rolls, ${results.events} events`);

        // Update UI one final time
        this.updateAnalyticsUI();

        // End the game
        this.isPlaying = false;
        this.timeLeft = 0;
        this.dom.timerDisplay.textContent = '00:00';
        this.dom.startBtn.disabled = false;
        this.dom.stopBtn.disabled = true;
        this.setInputsDisabled(false);
        if (this.dom.skipToEndBtn) {
            this.dom.skipToEndBtn.disabled = true;
        }
    }

    // Flash analytics panel on event
    flashAnalyticsPanel() {
        if (this.dom.analyticsPanel) {
            this.dom.analyticsPanel.classList.add('event-flash');
            setTimeout(() => {
                this.dom.analyticsPanel.classList.remove('event-flash');
            }, 500);
        }
    }

    init() {
        // Attach listeners
        this.dom.startBtn.addEventListener('click', () => this.startGame());
        this.dom.stopBtn.addEventListener('click', () => this.stopGame());
        this.dom.settingsToggle.addEventListener('click', () => this.toggleSettings());

        // Advanced Modal Listeners
        this.dom.advancedBtn.addEventListener('click', () => this.openAdvancedModal());
        this.dom.closeModalBtn.addEventListener('click', () => this.closeAdvancedModal());
        this.dom.saveAdvancedBtn.addEventListener('click', () => this.saveAdvancedSettings());
        this.dom.addEventBtn.addEventListener('click', () => this.addEventDefinitionUI());

        // Input listeners
        this.dom.inputs.interval.addEventListener('change', (e) => this.updateSettings('interval', e.target.value * 1000));
        this.dom.inputs.resetDuration.addEventListener('change', (e) => this.updateSettings('resetDuration', e.target.value * 1000));
        this.dom.inputs.diceCount.addEventListener('change', (e) => this.updateSettings('diceCount', e.target.value));
        this.dom.inputs.diceSides.addEventListener('change', (e) => this.updateSettings('diceSides', e.target.value));
        this.dom.inputs.duration.addEventListener('change', (e) => this.updateSettings('duration', e.target.value));
        this.dom.inputs.volume.addEventListener('input', (e) => {
            this.updateSettings('volume', e.target.value);
            this.dom.inputs.volume.previousElementSibling.textContent = `Alert Volume (${e.target.value}%)`;
        });
        this.dom.inputs.sound.addEventListener('change', (e) => this.updateSettings('soundEnabled', e.target.checked));

        // Seed selection listener
        if (this.dom.inputs.seed) {
            this.dom.inputs.seed.addEventListener('change', (e) => {
                const seedValue = e.target.value === '' ? null : parseInt(e.target.value);
                this.updateSettings('seed', seedValue);
            });
        }

        // Extend button listener
        if (this.dom.extendBtn) {
            this.dom.extendBtn.addEventListener('click', () => this.extendGame());
        }

        // JSON Import/Export listeners
        if (this.dom.importJsonBtn) {
            this.dom.importJsonBtn.addEventListener('click', () => this.dom.jsonFileInput.click());
        }
        if (this.dom.exportJsonBtn) {
            this.dom.exportJsonBtn.addEventListener('click', () => this.exportConfig());
        }
        if (this.dom.jsonFileInput) {
            this.dom.jsonFileInput.addEventListener('change', (e) => this.importConfig(e));
        }

        // Initial render
        this.renderDice(true);

        // Pre-generate samples on app load
        this.preGenerateSamples();
    }

    preGenerateSamples() {
        const requiredSamples = SamplePool.calculateRequiredSamples(
            this.settings.duration,
            this.settings.interval,
            this.settings.resetDuration
        );
        this.samplePool.generate(requiredSamples);
    }

    updateSettings(key, value) {
        if (key !== 'soundEnabled' && key !== 'seed') {
            value = Number(value);
        }

        this.settings[key] = value;

        // Live updates logic
        if (key === 'diceCount') {
            if (!this.isPlaying) this.renderDice(true);
            this.samplePool.updateConfig(this.settings.diceCount, this.settings.diceSides);
            this.preGenerateSamples();
        }

        if (key === 'diceSides') {
            this.samplePool.updateConfig(this.settings.diceCount, this.settings.diceSides);
            this.preGenerateSamples();
        }

        // Expand sample pool if duration increases (never shrink)
        if (key === 'duration' || key === 'interval' || key === 'resetDuration') {
            this.preGenerateSamples();
        }

        // Handle seed changes
        if (key === 'seed') {
            this.samplePool.regenerate(value);
            this.preGenerateSamples();
        }

        // If interval changes while playing, restart loop
        if (this.isPlaying && key === 'interval' && !this.isResetting) {
            clearInterval(this.rollInterval);
            this.rollInterval = setInterval(() => this.rollDice(), this.settings.interval);
        }
    }

    toggleSettings() {
        this.dom.settingsContent.classList.toggle('collapsed');
        const isOpen = !this.dom.settingsContent.classList.contains('collapsed');
        this.dom.settingsToggle.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    }

    // --- Advanced Modal Logic ---

    openAdvancedModal() {
        this.dom.advancedModal.classList.remove('hidden');
        this.renderEventDefinitionsUI();
    }

    closeAdvancedModal() {
        this.dom.advancedModal.classList.add('hidden');
    }

    saveAdvancedSettings() {
        // Parse UI to update settings.eventDefinitions
        const newDefinitions = [];
        const defEls = this.dom.eventList.querySelectorAll('.event-def');

        defEls.forEach(defEl => {
            const rules = [];
            const ruleEls = defEl.querySelectorAll('.rule-item');
            ruleEls.forEach(ruleEl => {
                rules.push({
                    dieIndex: parseInt(ruleEl.dataset.dieIndex),
                    operator: ruleEl.dataset.operator,
                    value: parseInt(ruleEl.dataset.value)
                });
            });

            if (rules.length > 0) {
                newDefinitions.push({
                    id: Date.now() + Math.random(),
                    rules: rules
                });
            }
        });

        // Validate for impossible events
        const warnings = this.validateEventDefinitions(newDefinitions);
        if (warnings.length > 0) {
            this.showValidationWarning(warnings);

            // Save the definitions
            this.settings.eventDefinitions = newDefinitions;

            // Delay closing by 3 seconds to show the warning
            this.dom.saveAdvancedBtn.disabled = true;
            this.dom.saveAdvancedBtn.textContent = 'Warning shown... (3s)';

            setTimeout(() => {
                this.dom.saveAdvancedBtn.disabled = false;
                this.dom.saveAdvancedBtn.textContent = 'Save & Close';
                this.closeAdvancedModal();
            }, 3000);
            return;
        } else {
            this.hideValidationWarning();
        }

        // Save regardless of warnings (non-blocking)
        this.settings.eventDefinitions = newDefinitions;
        this.closeAdvancedModal();
    }

    validateEventDefinitions(definitions) {
        const warnings = [];

        definitions.forEach((def, index) => {
            // Group rules by die index
            const rulesByDie = {};
            def.rules.forEach(rule => {
                if (!rulesByDie[rule.dieIndex]) {
                    rulesByDie[rule.dieIndex] = [];
                }
                rulesByDie[rule.dieIndex].push(rule);
            });

            // Check each die's rules for conflicts
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
                        warnings.push(`Event #${index + 1}: Die ${parseInt(dieIndex) + 1} cannot equal ${uniqueValues.join(' AND ')} simultaneously`);
                    }
                }

                // Check for == and != with same value
                equalRules.forEach(eq => {
                    notEqualRules.forEach(neq => {
                        if (eq.value === neq.value) {
                            warnings.push(`Event #${index + 1}: Die ${parseInt(dieIndex) + 1} cannot equal ${eq.value} AND not equal ${neq.value}`);
                        }
                    });
                });

                // Check for > and < with impossible range
                if (greaterRules.length > 0 && lessRules.length > 0) {
                    const maxGreater = Math.max(...greaterRules.map(r => r.value));
                    const minLess = Math.min(...lessRules.map(r => r.value));
                    if (maxGreater >= minLess) {
                        warnings.push(`Event #${index + 1}: Die ${parseInt(dieIndex) + 1} cannot be > ${maxGreater} AND < ${minLess}`);
                    }
                }

                // Check for == outside of < or > bounds
                equalRules.forEach(eq => {
                    greaterRules.forEach(gt => {
                        if (eq.value <= gt.value) {
                            warnings.push(`Event #${index + 1}: Die ${parseInt(dieIndex) + 1} cannot equal ${eq.value} AND be > ${gt.value}`);
                        }
                    });
                    lessRules.forEach(lt => {
                        if (eq.value >= lt.value) {
                            warnings.push(`Event #${index + 1}: Die ${parseInt(dieIndex) + 1} cannot equal ${eq.value} AND be < ${lt.value}`);
                        }
                    });
                });
            });
        });

        return warnings;
    }

    showValidationWarning(warnings) {
        // Create or update warning element
        let warningEl = document.getElementById('validation-warning');
        if (!warningEl) {
            warningEl = document.createElement('div');
            warningEl.id = 'validation-warning';
            warningEl.className = 'validation-warning';
            warningEl.style.cssText = 'background: #fef3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; color: #856404; font-size: 0.9em;';
        }
        warningEl.innerHTML = `
            <strong>⚠️ Warning: Impossible Event(s) Detected</strong>
            <ul style="margin: 0.5rem 0 0 1rem; padding: 0;">
                ${warnings.map(w => `<li>${w}</li>`).join('')}
            </ul>
        `;

        // Insert at top of modal body
        const modalBody = document.querySelector('.modal-body');
        if (modalBody && !document.getElementById('validation-warning')) {
            modalBody.insertBefore(warningEl, modalBody.firstChild);
        }

        console.warn('[Validation]', warnings);
    }

    hideValidationWarning() {
        const warningEl = document.getElementById('validation-warning');
        if (warningEl) {
            warningEl.remove();
        }
    }

    // --- JSON Import/Export ---

    exportConfig() {
        const config = {
            version: '2.0',
            settings: {
                interval: this.settings.interval,
                resetDuration: this.settings.resetDuration,
                diceCount: this.settings.diceCount,
                diceSides: this.settings.diceSides,
                duration: this.settings.duration,
                volume: this.settings.volume,
                soundEnabled: this.settings.soundEnabled,
                seed: this.settings.seed
            },
            players: this.settings.players,
            analytics: {
                enableLeaderboard: this.settings.analytics.enableLeaderboard,
                enableTimeline: this.settings.analytics.enableTimeline,
                enableHeatmap: this.settings.analytics.enableHeatmap,
                panelWidth: this.settings.analytics.panelWidth
            },
            eventDefinitions: this.settings.eventDefinitions.map(def => ({
                id: def.id,
                rules: def.rules.map(rule => ({
                    dieIndex: rule.dieIndex,
                    operator: rule.operator,
                    value: rule.value
                }))
            }))
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'random-event-dice-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.debug('[Export] Configuration exported successfully');
    }

    importConfig(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;

                // Check for empty content
                if (!content || content.trim() === '' || content.trim() === '{}') {
                    console.error('[Import] JSON file is empty or contains no data');
                    alert('Import failed: JSON file is empty or contains no data.');
                    return;
                }

                const config = JSON.parse(content);

                // Validate config structure before applying
                const validationResult = this.validateConfigStructure(config);
                if (!validationResult.valid) {
                    console.error('[Import] Invalid configuration:', validationResult.error);
                    alert(`Import failed: ${validationResult.error}`);
                    return;
                }

                this.applyConfig(config);
                console.debug('[Import] Configuration imported successfully');

                // Run validation on imported event definitions
                const warnings = this.validateEventDefinitions(this.settings.eventDefinitions);
                if (warnings.length > 0) {
                    console.warn('[Import] Imported config contains impossible events:', warnings);
                }

            } catch (error) {
                console.error('[Import] Failed to parse JSON:', error.message);
                alert(`Failed to import configuration: ${error.message}`);
                // Current settings are retained on failure
            }
        };

        reader.onerror = () => {
            console.error('[Import] Failed to read file');
            alert('Failed to read the configuration file.');
        };

        reader.readAsText(file);

        // Reset file input so same file can be imported again
        event.target.value = '';
    }

    validateConfigStructure(config) {
        if (!config || typeof config !== 'object') {
            return { valid: false, error: 'Configuration must be a valid JSON object' };
        }

        // Check for required version
        if (!config.version) {
            return { valid: false, error: 'Missing version field' };
        }

        // Check settings object
        if (config.settings && typeof config.settings !== 'object') {
            return { valid: false, error: 'Settings must be an object' };
        }

        // Check eventDefinitions array
        if (config.eventDefinitions) {
            if (!Array.isArray(config.eventDefinitions)) {
                return { valid: false, error: 'Event definitions must be an array' };
            }

            // Validate each event definition
            for (let i = 0; i < config.eventDefinitions.length; i++) {
                const def = config.eventDefinitions[i];
                if (!def.rules || !Array.isArray(def.rules)) {
                    return { valid: false, error: `Event definition ${i + 1} must have a rules array` };
                }

                for (let j = 0; j < def.rules.length; j++) {
                    const rule = def.rules[j];
                    if (rule.dieIndex === undefined || rule.operator === undefined || rule.value === undefined) {
                        return { valid: false, error: `Event ${i + 1}, Rule ${j + 1}: missing required fields (dieIndex, operator, value)` };
                    }
                }
            }
        }

        return { valid: true };
    }

    applyConfig(config) {
        // Apply settings
        if (config.settings) {
            const s = config.settings;

            if (s.interval !== undefined) {
                this.settings.interval = s.interval;
                this.dom.inputs.interval.value = s.interval / 1000;
            }
            if (s.resetDuration !== undefined) {
                this.settings.resetDuration = s.resetDuration;
                this.dom.inputs.resetDuration.value = s.resetDuration;
            }
            if (s.diceCount !== undefined) {
                this.settings.diceCount = s.diceCount;
                this.dom.inputs.diceCount.value = s.diceCount;
                this.samplePool.updateConfig(s.diceCount, this.settings.diceSides);
            }
            if (s.diceSides !== undefined) {
                this.settings.diceSides = s.diceSides;
                this.dom.inputs.diceSides.value = s.diceSides;
                this.samplePool.updateConfig(this.settings.diceCount, s.diceSides);
            }
            if (s.duration !== undefined) {
                this.settings.duration = s.duration;
                this.dom.inputs.duration.value = s.duration;
            }
            if (s.volume !== undefined) {
                this.settings.volume = s.volume;
                this.dom.inputs.volume.value = s.volume;
            }
            if (s.soundEnabled !== undefined) {
                this.settings.soundEnabled = s.soundEnabled;
                this.dom.inputs.sound.checked = s.soundEnabled;
            }
            if (s.seed !== undefined) {
                this.settings.seed = s.seed;
                if (this.dom.inputs.seed) {
                    this.dom.inputs.seed.value = s.seed === null ? '' : s.seed;
                }
                this.samplePool.regenerate(s.seed);
            }
        }

        // Apply event definitions
        if (config.eventDefinitions && Array.isArray(config.eventDefinitions)) {
            this.settings.eventDefinitions = config.eventDefinitions.map(def => ({
                id: def.id || Date.now() + Math.random(),
                rules: (def.rules || []).map(rule => ({
                    dieIndex: rule.dieIndex,
                    operator: rule.operator,
                    value: rule.value
                }))
            }));
        }

        // Apply players configuration
        if (config.players && typeof config.players === 'object') {
            this.settings.players = { ...config.players };
        }

        // Apply analytics settings
        if (config.analytics && typeof config.analytics === 'object') {
            if (config.analytics.enableLeaderboard !== undefined) {
                this.settings.analytics.enableLeaderboard = config.analytics.enableLeaderboard;
            }
            if (config.analytics.enableTimeline !== undefined) {
                this.settings.analytics.enableTimeline = config.analytics.enableTimeline;
            }
            if (config.analytics.enableHeatmap !== undefined) {
                this.settings.analytics.enableHeatmap = config.analytics.enableHeatmap;
            }
            if (config.analytics.panelWidth !== undefined) {
                this.settings.analytics.panelWidth = config.analytics.panelWidth;
                if (this.dom.analyticsPanel) {
                    this.dom.analyticsPanel.style.width = config.analytics.panelWidth + 'px';
                }
            }
        }

        // Update analytics tracker configuration
        this.analytics.updateConfig(
            this.settings.players,
            this.settings.diceCount,
            this.settings.diceSides
        );

        // Update analytics section visibility
        this.updateAnalyticsSectionVisibility();

        // Update timer display
        const mins = this.settings.duration;
        this.dom.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:00`;

        // Re-render dice and pre-generate samples
        this.renderDice(true);
        this.preGenerateSamples();

        // Refresh event definitions UI to reflect imported settings
        this.renderEventDefinitionsUI();
    }

    renderEventDefinitionsUI() {
        this.dom.eventList.innerHTML = '';
        this.settings.eventDefinitions.forEach((def, index) => {
            this.addEventDefinitionUI(def, index);
        });
    }

    addEventDefinitionUI(def = null, index) {
        const id = def ? def.id : Date.now();
        const div = document.createElement('div');
        div.className = 'event-def';
        div.dataset.id = id;

        let rulesHtml = '';
        if (def && def.rules) {
            def.rules.forEach(r => {
                rulesHtml += this.createRuleBadgeHtml(r);
            });
        }

        div.innerHTML = `
            <div class="event-def-header">
                <span>Event Definition #${index !== undefined ? index + 1 : '?'} (AND Logic)</span>
                <span class="remove-event-btn" onclick="this.closest('.event-def').remove()">Remove</span>
            </div>
            <div class="rule-inputs" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                <select class="die-select" style="width: auto;">
                    ${this.getDieOptionsHtml()}
                </select>
                <select class="operator-select" style="width: auto;">
                    <option value="==">Equals</option>
                    <option value="!=">Not Equals</option>
                    <option value=">">Greater Than</option>
                    <option value="<">Less Than</option>
                </select>
                <input type="number" class="value-input" value="1" min="1" style="width: 60px;">
                <button class="secondary-btn" onclick="game.addRuleToDef(this)">+ Rule</button>
            </div>
            <div class="rule-group">
                ${rulesHtml}
            </div>
        `;
        this.dom.eventList.appendChild(div);
    }

    getDieOptionsHtml() {
        let html = '<option value="all">Any Die</option>'; // 'all' might complicate logic, let's stick to specific or simple
        // Actually user said "if first die.. AND second die.."
        for (let i = 0; i < this.settings.diceCount; i++) {
            html += `<option value="${i}">Die ${i + 1}</option>`;
        }
        return html;
    }

    createRuleBadgeHtml(rule) {
        return `
            <div class="rule-item" data-die-index="${rule.dieIndex}" data-operator="${rule.operator}" data-value="${rule.value}">
                <span>Die ${rule.dieIndex + 1} ${rule.operator} ${rule.value}</span>
                <span style="font-weight:bold; cursor:pointer;" onclick="this.parentElement.remove()">&times;</span>
            </div>
        `;
    }

    // Exposed helper for onclick in HTML string
    addRuleToDef(btn) {
        const parent = btn.parentElement;
        const dieIndex = parent.querySelector('.die-select').value;
        const operator = parent.querySelector('.operator-select').value;
        const value = parent.querySelector('.value-input').value;

        const ruleGroup = parent.nextElementSibling;

        const tempRule = { dieIndex: parseInt(dieIndex), operator, value: parseInt(value) };
        const badge = document.createElement('div');
        // Hacky way to turn string to element
        badge.innerHTML = this.createRuleBadgeHtml(tempRule).trim();
        ruleGroup.appendChild(badge.firstChild);
    }

    // --- Game Loop ---

    startGame() {
        if (this.isPlaying) {
            if (this.isPaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
            return;
        }

        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        // Validate settings before starting
        if (this.checkWarning()) {
            return; // Don't start if warning active
        }

        this.isPlaying = true;
        this.isPaused = false;
        this.isResetting = false;
        this.isExpired = false;

        // Update button to Pause state
        this.dom.startBtn.textContent = 'Pause Game';
        this.dom.startBtn.classList.remove('paused');
        this.dom.startBtn.disabled = false;

        this.dom.stopBtn.disabled = false;
        this.setInputsDisabled(true);

        // Hide extend button if visible
        if (this.dom.extendBtn) {
            this.dom.extendBtn.classList.add('hidden');
        }

        // Reset sample pool index for new game
        if (this.settings.seed !== null) {
            // Regenerate pool with seed if needed
            if (this.samplePool.seed !== this.settings.seed) {
                this.samplePool.regenerate(this.settings.seed);
            } else {
                this.samplePool.reset();
            }
        } else {
            this.samplePool.regenerate(null);
        }

        // Reset rolls counter
        this.rollsSinceLastEvent = 0;
        this.updateRollsCounter();

        // Reset and start analytics
        this.analytics.reset();
        this.analytics.updateConfig(
            this.settings.players,
            this.settings.diceCount,
            this.settings.diceSides
        );
        this.analytics.startTurn();
        this.updateAnalyticsUI();
        if (this.dom.skipToEndBtn) {
            this.dom.skipToEndBtn.disabled = false;
        }

        // Start analytics UI update interval
        this.analyticsUpdateInterval = setInterval(() => {
            this.updateAnalyticsUI();
        }, 500);

        this.startTimer(true);
        this.startRollLoop();

        console.debug('[Game] Started');
    }

    pauseGame() {
        this.isPaused = true;
        this.dom.startBtn.textContent = 'Resume Game';
        this.dom.startBtn.classList.add('paused');

        clearInterval(this.timer);
        clearInterval(this.rollInterval);
        clearTimeout(this.resetTimeout);
        // Keep analytics interval running or pause it? 
        // Let's pause it to avoid unnecessary updates
        clearInterval(this.analyticsUpdateInterval);

        console.debug('[Game] Paused');
    }

    resumeGame() {
        this.isPaused = false;
        this.dom.startBtn.textContent = 'Pause Game';
        this.dom.startBtn.classList.remove('paused');

        this.startTimer(false); // Resume timer without reset
        if (!this.isResetting) {
            this.startRollLoop();
        }

        this.analyticsUpdateInterval = setInterval(() => {
            this.updateAnalyticsUI();
        }, 500);

        console.debug('[Game] Resumed');
    }

    handleGameExpired() {
        // Stop the game loop but allow extension
        this.isPlaying = false;
        this.isExpired = true;
        clearInterval(this.timer);
        clearInterval(this.rollInterval);
        clearTimeout(this.resetTimeout);
        clearInterval(this.analyticsUpdateInterval);

        this.clearAlert();

        // Reset start button
        this.dom.startBtn.textContent = 'Start Game';
        this.dom.startBtn.classList.remove('paused');
        this.dom.startBtn.disabled = true; // Disabled until extended or stopped

        // Show extend button instead of resetting to start state
        if (this.dom.extendBtn) {
            this.dom.extendBtn.classList.remove('hidden');
        }

        // Update timer display to show 00:00
        this.dom.timerDisplay.textContent = '00:00';
    }

    extendGame() {
        // Add 10 minutes
        this.timeLeft = 10 * 60;
        this.isPlaying = true;
        this.isPaused = false;
        this.isExpired = false;

        this.dom.startBtn.textContent = 'Pause Game';
        this.dom.startBtn.disabled = false;

        // Hide extend button
        if (this.dom.extendBtn) {
            this.dom.extendBtn.classList.add('hidden');
        }

        // Generate additional samples for 10 more minutes
        const additionalSamples = SamplePool.calculateRequiredSamples(
            10, // 10 minutes extension
            this.settings.interval,
            this.settings.resetDuration
        );
        this.samplePool.generate(this.samplePool.samples.length + additionalSamples);

        this.updateTimerDisplay();

        // Restart game loop using helpers
        this.startTimer(false);
        this.startRollLoop();

        this.analyticsUpdateInterval = setInterval(() => {
            this.updateAnalyticsUI();
        }, 500);

        console.debug('[Game] Extended by 10 minutes');
    }

    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        this.isResetting = false;
        this.isExpired = false;

        clearInterval(this.timer);
        clearInterval(this.rollInterval);
        clearTimeout(this.resetTimeout);
        clearInterval(this.analyticsUpdateInterval);

        this.dom.startBtn.textContent = 'Start Game';
        this.dom.startBtn.classList.remove('paused');
        this.dom.startBtn.disabled = false;

        this.dom.stopBtn.disabled = true;
        this.setInputsDisabled(false);

        // Hide extend button
        if (this.dom.extendBtn) {
            this.dom.extendBtn.classList.add('hidden');
        }

        // Disable skip button
        if (this.dom.skipToEndBtn) {
            this.dom.skipToEndBtn.disabled = true;
        }

        this.clearAlert();
        this.dom.timerDisplay.textContent = `${this.settings.duration.toString().padStart(2, '0')}:00`;

        console.debug('[Game] Stopped');
    }

    startTimer(reset = true) {
        if (reset) {
            this.timeLeft = this.settings.duration * 60;
        }
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            if (!this.isResetting && !this.isPaused) {
                this.timeLeft--;
                this.updateTimerDisplay();
                if (this.timeLeft <= 0) {
                    this.handleGameExpired();
                }
            }
        }, 1000);
    }

    startRollLoop() {
        this.rollDice();
        this.rollInterval = setInterval(() => {
            if (!this.isResetting && !this.isPaused) {
                this.rollDice();
            }
        }, this.settings.interval);
    }

    setInputsDisabled(disabled) {
        Object.values(this.dom.inputs).forEach(input => {
            input.disabled = disabled;
        });
    }

    renderDice(placeholder = false) {
        this.dom.diceContainer.innerHTML = '';
        for (let i = 0; i < this.settings.diceCount; i++) {
            const dieFn = document.createElement('div');
            dieFn.className = 'die';
            dieFn.textContent = placeholder ? '?' : this.diceValues[i];

            // Visual config could go here (color)
            if (i === 0) dieFn.style.borderColor = "#ef4444"; // Red outline for die 1
            if (i === 1) dieFn.style.borderColor = "#3b82f6"; // Blue outline for die 2

            this.dom.diceContainer.appendChild(dieFn);
        }
    }

    rollDice() {
        const diceEls = document.querySelectorAll('.die');
        diceEls.forEach(el => {
            el.classList.add('rolling');
            setTimeout(() => el.classList.remove('rolling'), 200);
        });

        // Use pre-generated samples from the pool
        this.diceValues = this.samplePool.getNext();

        // Record roll in analytics
        this.analytics.recordRoll(this.diceValues);

        // Increment rolls since last event
        this.rollsSinceLastEvent++;
        this.updateRollsCounter();

        setTimeout(() => {
            diceEls.forEach((el, i) => {
                if (this.diceValues[i] !== undefined) {
                    el.textContent = this.diceValues[i];
                }
            });
            this.checkAlertCondition();
        }, 150);
    }

    updateRollsCounter() {
        if (this.dom.rollsCounter) {
            this.dom.rollsCounter.textContent = this.rollsSinceLastEvent;
        }
    }

    checkAlertCondition() {
        let isMatch = false;

        // Check against Event Definitions
        // OR Logic: If any definition is met, alert triggers
        for (const def of this.settings.eventDefinitions) {
            // AND Logic: All rules in definition must be true
            const rulesMet = def.rules.every(rule => {
                const dieVal = this.diceValues[rule.dieIndex];
                if (dieVal === undefined) return false; // Die index out of bounds

                switch (rule.operator) {
                    case '==': return dieVal == rule.value;
                    case '!=': return dieVal != rule.value;
                    case '>': return dieVal > rule.value;
                    case '<': return dieVal < rule.value;
                    default: return false;
                }
            });

            if (rulesMet) {
                isMatch = true;
                break; // One match is enough
            }
        }

        if (isMatch) {
            this.triggerAlert();
        } else {
            this.clearAlert();
        }
    }

    triggerAlert() {
        document.body.classList.add('alert-active');
        this.dom.alertMessage.classList.remove('hidden');

        const diceEls = document.querySelectorAll('.die');
        diceEls.forEach(el => el.classList.add('match'));

        if (this.settings.soundEnabled) {
            this.playBeep();
        }

        // Reset rolls counter on event
        this.rollsSinceLastEvent = 0;
        this.updateRollsCounter();

        // End turn and advance to next player in analytics
        this.analytics.endTurn();
        this.flashAnalyticsPanel();
        this.updateAnalyticsUI();

        // Trigger Reset Duration
        this.isResetting = true;
        this.dom.alertMessage.textContent = `Event matched! Resetting in ${this.settings.resetDuration / 1000}s...`;

        clearTimeout(this.resetTimeout);
        this.resetTimeout = setTimeout(() => {
            this.clearAlert();
            this.isResetting = false;
        }, this.settings.resetDuration);
    }

    clearAlert() {
        document.body.classList.remove('alert-active');
        this.dom.alertMessage.classList.add('hidden');
        this.dom.alertMessage.textContent = 'EVENT TRIGGERED!';
        const diceEls = document.querySelectorAll('.die');
        diceEls.forEach(el => el.classList.remove('match'));
    }

    playBeep() {
        if (!this.audioCtx) return;

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = 880;

        // Volume Control
        const volume = this.settings.volume / 100; // 0.0 to 1.0

        gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.5);
    }

    updateTimerDisplay() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        this.dom.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    drawTimelineGraph() {
        if (!this.dom.timelineSection) return;
        const canvas = document.getElementById('timeline-canvas');
        if (!canvas) return;

        const container = document.getElementById('timeline-graph-container');
        if (!container) return;

        // Set canvas size
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const data = this.analytics.timeline.slice().reverse(); // Show oldest to newest
        if (data.length < 2) return;

        // Determine max value for scaling (default to rolls, could be time)
        const getValue = d => d.rolls;
        const maxVal = Math.max(...data.map(getValue), 5); // Minimum max of 5

        const padding = 10;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;

        data.forEach((d, i) => {
            const x = padding + (i / (data.length - 1)) * graphWidth;
            const y = height - (padding + (getValue(d) / maxVal) * graphHeight);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            // Draw dot
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.stroke();
    }
}

// Global instance to allow onclick handlers to access methods
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new DiceGame();
});
