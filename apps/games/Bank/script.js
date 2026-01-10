/**
 * Bank - Dice Game
 * Based on rules from ThunderHive Games (thunderhivegames.com)
 * 
 * Core Rules:
 * - Players take turns rolling two dice
 * - Each roll adds to a cumulative BANK score
 * - Rolling a 7 ends the round (except first 3 rolls = 70 pts)
 * - Rolling doubles doubles the BANK score (except first 3 = face value)
 * - Any player can call "BANK" to claim current score (after roll 3)
 * - Players who BANK sit out the rest of the round
 * - Game ends after N rounds (10, 15, or 20)
 */

/**
 * Seeded Random Number Generator
 * Uses Linear Congruential Generator (LCG) for deterministic randomness
 */
class SeededRNG {
    constructor(seed = null) {
        this.initialSeed = seed;
        this.seed = seed !== null ? seed : Date.now();
        this.current = this.seed;
    }

    /** Generate next random float [0, 1) */
    next() {
        this.current = (this.current * 1103515245 + 12345) & 0x7fffffff;
        return this.current / 0x7fffffff;
    }

    /** Generate random integer in [min, max] inclusive */
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    /** Reset to initial seed */
    reset() {
        this.current = this.seed;
    }

    /** Set new seed */
    setSeed(seed) {
        this.initialSeed = seed;
        this.seed = seed;
        this.current = seed;
    }

    /** Get current seed for reproducibility */
    getSeed() {
        return this.seed;
    }
}

class BankGame {
    constructor() {
        // Game state
        this.roundNumber = 1;
        this.totalRounds = 20;
        this.rollNumber = 0; // Roll count within current round
        this.bankScore = 0; // Cumulative score in current round
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        this.roundOver = false;
        this.gameOver = false;

        // Dice values
        this.die1 = 0;
        this.die2 = 0;

        // Audio
        this.audioCtx = null;
        this.volume = 50;

        // Default players
        this.defaultPlayers = [
            { id: 1, name: "Player 1" },
            { id: 2, name: "Player 2" },
            { id: 3, name: "Player 3" },
            { id: 4, name: "Player 4" }
        ];

        // Players: {id, name, score, hasBankedThisRound}
        this.players = this.defaultPlayers.map(p => ({
            ...p,
            score: 0,
            hasBankedThisRound: false
        }));

        // Seeded RNG for deterministic testing
        this.rng = new SeededRNG();

        // Undo functionality
        this.undoStack = [];
        this.undoMode = 'resample'; // 'resample' or 'preserve'
        this.preservedRolls = []; // Store dice values for preserve mode


        // DOM elements
        this.dom = {
            roundNumber: document.getElementById('round-number'),
            totalRounds: document.getElementById('total-rounds'),
            rollNumber: document.getElementById('roll-number'),
            bankScore: document.getElementById('bank-score'),
            die1: document.getElementById('die-1'),
            die2: document.getElementById('die-2'),
            lastRollInfo: document.getElementById('last-roll-info'),
            alertMessage: document.getElementById('alert-message'),
            alertText: document.getElementById('alert-text'),
            rollBtn: document.getElementById('roll-btn'),
            undoBtn: document.getElementById('undo-btn'),
            bankBtn: document.getElementById('bank-btn'),
            bankPlayerSelect: document.getElementById('bank-player-select'),
            bankPlayerPanel: document.getElementById('bank-player-panel'),
            bankPlayerOptions: document.getElementById('bank-player-options'),
            bankSelectAll: document.getElementById('bank-select-all'),
            bankClearAll: document.getElementById('bank-clear-all'),
            bankActionGroup: document.getElementById('bank-action-group'),
            bankingInfo: document.getElementById('banking-info'),
            currentPlayerName: document.getElementById('current-player-name'),
            playersList: document.getElementById('players-list'),
            settingsPanel: document.getElementById('settings-panel'),
            toggleSettings: document.getElementById('toggle-settings'),
            closeSettings: document.getElementById('close-settings'),
            roundsSelect: document.getElementById('rounds-select'),
            volumeInput: document.getElementById('volume-input'),
            undoModeSelect: document.getElementById('undo-mode-select'),
            playerConfig: document.getElementById('player-config'),
            addPlayerBtn: document.getElementById('add-player-btn'),
            newGameBtn: document.getElementById('new-game-btn'),
            gameOverModal: document.getElementById('game-over-modal'),
            winnerDisplay: document.getElementById('winner-display'),
            finalScores: document.getElementById('final-scores'),
            playAgainBtn: document.getElementById('play-again-btn'),
            survivalProb: document.getElementById('survival-prob'),
            probabilityCheatsheet: document.getElementById('probability-cheatsheet'),
            // New elements for summary scoreboard
            summaryScoreboard: document.getElementById('summary-scoreboard'),
            summaryCurrentName: document.getElementById('summary-current-name'),
            summaryCurrentScore: document.getElementById('summary-current-score'),
            summaryGapNext: document.getElementById('summary-gap-next'),
            summaryGapLeader: document.getElementById('summary-gap-leader'),
            summaryRankings: document.getElementById('summary-rankings'),
            toggleScoreboardView: document.getElementById('toggle-scoreboard-view'),
            // JSON import/export
            importJsonBtn: document.getElementById('import-json-btn'),
            exportJsonBtn: document.getElementById('export-json-btn'),
            jsonFileInput: document.getElementById('json-file-input')
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderPlayers();
        this.renderPlayerConfig();
        this.updateUI();
    }

    bindEvents() {
        // Roll button
        this.dom.rollBtn.addEventListener('click', () => this.roll());

        // Undo button
        if (this.dom.undoBtn) {
            this.dom.undoBtn.addEventListener('click', () => this.undo());
        }

        // Bank button - banks all selected players
        this.dom.bankBtn.addEventListener('click', () => this.bankSelectedPlayers());

        // Bank player select dropdown (fallback for single-select)
        if (this.dom.bankPlayerSelect) {
            this.dom.bankPlayerSelect.addEventListener('change', () => this.updateBankButtonState());
        }

        // Multi-select bank controls
        if (this.dom.bankSelectAll) {
            this.dom.bankSelectAll.addEventListener('click', () => this.selectAllBankPlayers());
        }
        if (this.dom.bankClearAll) {
            this.dom.bankClearAll.addEventListener('click', () => this.clearAllBankPlayers());
        }

        // Settings toggle
        this.dom.toggleSettings.addEventListener('click', () => this.toggleSettings());
        this.dom.closeSettings.addEventListener('click', () => this.toggleSettings());

        // Rounds select
        this.dom.roundsSelect.addEventListener('change', (e) => {
            this.totalRounds = parseInt(e.target.value);
            this.dom.totalRounds.textContent = this.totalRounds;
        });

        // Volume
        this.dom.volumeInput.addEventListener('input', (e) => {
            this.volume = parseInt(e.target.value);
        });

        // Undo mode select
        if (this.dom.undoModeSelect) {
            this.dom.undoModeSelect.addEventListener('change', (e) => {
                this.setUndoMode(e.target.value);
            });
        }

        // Add player
        this.dom.addPlayerBtn.addEventListener('click', () => this.addPlayer());

        // New game
        this.dom.newGameBtn.addEventListener('click', () => {
            this.toggleSettings();
            this.startNewGame();
        });

        // Play again
        this.dom.playAgainBtn.addEventListener('click', () => {
            this.dom.gameOverModal.classList.add('hidden');
            this.startNewGame();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.roundOver && !this.gameOver) {
                e.preventDefault();
                this.roll();
            }
            if (e.code === 'KeyB' && this.bankScore > 0 && !this.gameOver && this.rollNumber >= 3) {
                // Bank all selected players
                this.bankSelectedPlayers();
            }
            if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey) && this.undoStack.length > 0) {
                e.preventDefault();
                this.undo();
            }
        });

        // Summary scoreboard toggle
        if (this.dom.toggleScoreboardView) {
            this.dom.toggleScoreboardView.addEventListener('click', () => this.toggleScoreboardView());
        }

        // JSON import/export
        if (this.dom.importJsonBtn) {
            this.dom.importJsonBtn.addEventListener('click', () => this.dom.jsonFileInput?.click());
        }
        if (this.dom.jsonFileInput) {
            this.dom.jsonFileInput.addEventListener('change', (e) => this.importConfig(e));
        }
        if (this.dom.exportJsonBtn) {
            this.dom.exportJsonBtn.addEventListener('click', () => this.exportConfig());
        }
    }

    roll() {
        if (this.roundOver || this.gameOver) return;
        if (this.isRolling) return;

        this.isRolling = true;
        this.gameStarted = true;

        // Animate dice
        this.dom.die1.classList.add('rolling');
        this.dom.die2.classList.add('rolling');
        this.dom.die1.classList.remove('seven', 'doubles');
        this.dom.die2.classList.remove('seven', 'doubles');

        // Roll animation (visual only, uses Math.random for performance)
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            this.dom.die1.textContent = Math.floor(Math.random() * 6) + 1;
            this.dom.die2.textContent = Math.floor(Math.random() * 6) + 1;
            rollCount++;
            if (rollCount >= 8) {
                clearInterval(rollInterval);
                this.finishRoll();
            }
        }, 50);
    }

    finishRoll() {
        // Save state for undo before the roll
        this.pushState();

        // Generate actual roll using seeded RNG
        this.die1 = this.rng.nextInt(1, 6);
        this.die2 = this.rng.nextInt(1, 6);
        const sum = this.die1 + this.die2;
        const isDoubles = this.die1 === this.die2;
        const isSeven = sum === 7;

        this.rollNumber++;
        const isProtected = this.rollNumber <= 3;

        // Update dice display
        this.dom.die1.textContent = this.die1;
        this.dom.die2.textContent = this.die2;
        this.dom.die1.classList.remove('rolling');
        this.dom.die2.classList.remove('rolling');

        // Handle roll outcome
        let message = '';

        if (isSeven) {
            if (isProtected) {
                // First 3 rolls: 7 = 70 points
                this.bankScore += 70;
                message = `🛡️ Protected! 7 = +70 points`;
                this.dom.lastRollInfo.className = 'last-roll-info special';
                this.dom.die1.classList.add('seven');
                this.dom.die2.classList.add('seven');
            } else {
                // Round ends, bank is lost
                this.endRound(true);
                message = `💥 SEVEN! Round over - bank lost!`;
                this.dom.lastRollInfo.className = 'last-roll-info';
                this.dom.die1.classList.add('seven');
                this.dom.die2.classList.add('seven');
                this.showAlert('SEVEN! Round Over! 💥');
                this.playSound(false);
            }
        } else if (isDoubles) {
            if (isProtected) {
                // First 3 rolls: doubles = face value only
                const faceValue = this.die1 * 2;
                this.bankScore += faceValue;
                message = `🛡️ Protected doubles! +${faceValue} (face value)`;
                this.dom.lastRollInfo.className = 'last-roll-info special';
            } else {
                // Doubles after protection: double the bank!
                const oldBank = this.bankScore;
                this.bankScore *= 2;
                message = `🎉 DOUBLES! Bank doubled: ${oldBank} → ${this.bankScore}`;
                this.dom.lastRollInfo.className = 'last-roll-info special';
                this.dom.bankScore.classList.add('doubled');
                setTimeout(() => this.dom.bankScore.classList.remove('doubled'), 500);
            }
            this.dom.die1.classList.add('doubles');
            this.dom.die2.classList.add('doubles');
            this.playSound(true);
        } else {
            // Normal roll: add sum to bank
            this.bankScore += sum;
            message = `+${sum}`;
            this.dom.lastRollInfo.className = 'last-roll-info';
        }

        if (!isSeven || isProtected) {
            this.dom.lastRollInfo.textContent = message;
        }

        // Move to next player
        if (!this.roundOver) {
            this.advancePlayer();
        }

        // Pulse animation
        this.dom.bankScore.classList.add('pulse');
        setTimeout(() => this.dom.bankScore.classList.remove('pulse'), 300);

        this.updateUI();
        this.isRolling = false;
    }

    advancePlayer() {
        // Find next player who hasn't banked
        let attempts = 0;
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            attempts++;
        } while (this.players[this.currentPlayerIndex].hasBankedThisRound && attempts < this.players.length);

        // Check if all players have banked
        if (this.players.every(p => p.hasBankedThisRound)) {
            this.endRound(false);
        }
    }

    /**
     * Bank the selected player from dropdown (after roll 3)
     * Before roll 3, only current player can bank
     */
    bankSelectedPlayer() {
        if (this.bankScore === 0 || this.gameOver) return;

        let playerToBankIndex;

        // After roll 3, use dropdown selection; before roll 3, use current player
        if (this.rollNumber >= 3 && this.dom.bankPlayerSelect) {
            const selectedId = parseInt(this.dom.bankPlayerSelect.value);
            if (!selectedId) return; // No player selected
            playerToBankIndex = this.players.findIndex(p => p.id === selectedId);
            if (playerToBankIndex === -1) return;
        } else {
            playerToBankIndex = this.currentPlayerIndex;
        }

        const player = this.players[playerToBankIndex];
        if (player.hasBankedThisRound) return;

        // Transfer bank to player
        player.score += this.bankScore;
        player.hasBankedThisRound = true;

        // Show feedback
        this.dom.lastRollInfo.textContent = `${player.name} banked ${this.bankScore} points!`;
        this.dom.lastRollInfo.className = 'last-roll-info special';
        this.playSound(true);

        // Update dropdown
        this.updateBankDropdown();

        // Check if all players have banked
        if (this.players.every(p => p.hasBankedThisRound)) {
            this.endRound(false);
        } else {
            this.advancePlayer();
        }

        this.renderPlayers();
        this.updateUI();
    }

    /**
     * Legacy method for backwards compatibility with tests
     */
    bankCurrentPlayer() {
        // For tests and keyboard shortcuts before multi-select is active
        if (this.rollNumber >= 3) {
            // If after roll 3 and dropdown exists, select first available player
            const available = this.players.find(p => !p.hasBankedThisRound);
            if (available && this.dom.bankPlayerSelect) {
                this.dom.bankPlayerSelect.value = available.id;
            }
        }
        this.bankSelectedPlayer();
    }

    /**
     * Update the bank player dropdown with available players
     */
    updateBankDropdown() {
        if (!this.dom.bankPlayerSelect) return;

        const canUseDropdown = this.rollNumber >= 3 && this.bankScore > 0 && !this.roundOver && !this.gameOver;
        const availablePlayers = this.players.filter(p => !p.hasBankedThisRound);

        // Build options
        let options = '<option value="">Select player to BANK</option>';
        availablePlayers.forEach(player => {
            options += `<option value="${player.id}">${player.name}</option>`;
        });
        this.dom.bankPlayerSelect.innerHTML = options;

        // Enable/disable dropdown
        this.dom.bankPlayerSelect.disabled = !canUseDropdown || availablePlayers.length === 0;

        // Update visual state
        if (canUseDropdown && availablePlayers.length > 0) {
            this.dom.bankPlayerSelect.classList.add('active');
            if (this.dom.bankingInfo) this.dom.bankingInfo.classList.add('active');
        } else {
            this.dom.bankPlayerSelect.classList.remove('active');
            if (this.dom.bankingInfo) this.dom.bankingInfo.classList.remove('active');
        }
    }

    /**
     * Update bank button enabled state based on dropdown/checkbox selection
     */
    updateBankButtonState() {
        const selectedCount = this.getSelectedPlayerIds().length;
        const canBank = this.bankScore > 0 && !this.gameOver && !this.roundOver && this.rollNumber >= 3;
        this.dom.bankBtn.disabled = selectedCount === 0 || !canBank;
    }

    // ==================== MULTI-SELECT BANKING ====================

    /**
     * Get array of selected player IDs from checkboxes or dropdown
     */
    getSelectedPlayerIds() {
        // First try checkbox panel
        if (this.dom.bankPlayerOptions) {
            const checkboxes = this.dom.bankPlayerOptions.querySelectorAll('input[type="checkbox"]:checked');
            return Array.from(checkboxes).map(cb => parseInt(cb.value));
        }
        // Fallback to dropdown
        if (this.dom.bankPlayerSelect && this.dom.bankPlayerSelect.value) {
            return [parseInt(this.dom.bankPlayerSelect.value)];
        }
        return [];
    }

    /**
     * Bank all selected players (multi-select)
     */
    bankSelectedPlayers() {
        if (this.bankScore === 0 || this.gameOver || this.rollNumber < 3) return;

        const selectedIds = this.getSelectedPlayerIds();
        if (selectedIds.length === 0) return;

        // Save state for undo before banking
        this.pushState();

        const bankedNames = [];
        const scorePerPlayer = this.bankScore;

        selectedIds.forEach(id => {
            const player = this.players.find(p => p.id === id);
            if (player && !player.hasBankedThisRound) {
                player.score += scorePerPlayer;
                player.hasBankedThisRound = true;
                bankedNames.push(player.name);
            }
        });

        if (bankedNames.length > 0) {
            // Show feedback
            const message = bankedNames.length === 1
                ? `${bankedNames[0]} banked ${scorePerPlayer} points!`
                : `${bankedNames.join(', ')} each banked ${scorePerPlayer} points!`;
            this.dom.lastRollInfo.textContent = message;
            this.dom.lastRollInfo.className = 'last-roll-info special';
            this.playSound(true);
        }

        // Update UI
        this.updateBankPanel();
        this.updateBankDropdown();

        // Check if all players have banked
        if (this.players.every(p => p.hasBankedThisRound)) {
            this.endRound(false);
        } else {
            this.advancePlayer();
        }

        this.renderPlayers();
        this.updateUI();
    }

    /**
     * Update the multi-select bank panel with checkboxes
     */
    updateBankPanel() {
        if (!this.dom.bankPlayerOptions) return;

        const canBank = this.rollNumber >= 3 && this.bankScore > 0 && !this.roundOver && !this.gameOver;
        const availablePlayers = this.players.filter(p => !p.hasBankedThisRound);

        let html = '';
        availablePlayers.forEach(player => {
            html += `
                <label class="bank-player-checkbox">
                    <input type="checkbox" value="${player.id}" onchange="window.game.updateBankButtonState()">
                    <span>${player.name}</span>
                </label>
            `;
        });
        this.dom.bankPlayerOptions.innerHTML = html;

        // Enable/disable panel
        if (this.dom.bankPlayerPanel) {
            if (canBank && availablePlayers.length > 0) {
                this.dom.bankPlayerPanel.classList.remove('disabled');
            } else {
                this.dom.bankPlayerPanel.classList.add('disabled');
            }
        }
    }

    /**
     * Select all available players in bank panel
     */
    selectAllBankPlayers() {
        if (!this.dom.bankPlayerOptions) return;
        const checkboxes = this.dom.bankPlayerOptions.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);
        this.updateBankButtonState();
    }

    /**
     * Clear all selections in bank panel
     */
    clearAllBankPlayers() {
        if (!this.dom.bankPlayerOptions) return;
        const checkboxes = this.dom.bankPlayerOptions.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        this.updateBankButtonState();
    }

    endRound(lostToSeven) {
        this.roundOver = true;

        if (lostToSeven) {
            this.bankScore = 0;
        }

        // Check for game over
        if (this.roundNumber >= this.totalRounds) {
            this.endGame();
            return;
        }

        // Auto-continue to next round after delay
        setTimeout(() => {
            this.nextRound();
        }, 2000);
    }

    nextRound() {
        this.roundNumber++;
        this.rollNumber = 0;
        this.bankScore = 0;
        this.roundOver = false;
        this.currentPlayerIndex = 0;

        // Reset player banking status
        this.players.forEach(p => p.hasBankedThisRound = false);

        // Hide alert
        this.hideAlert();

        this.renderPlayers();
        this.updateUI();
    }

    endGame() {
        this.gameOver = true;

        // Find winner
        const sorted = [...this.players].sort((a, b) => b.score - a.score);
        const winner = sorted[0];

        // Show modal
        this.dom.winnerDisplay.innerHTML = `
            <div class="winner-name">${winner.name}</div>
            <div class="winner-score">with ${winner.score} points!</div>
        `;

        let scoresHtml = '';
        sorted.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            scoresHtml += `
                <div class="player-final">
                    <span>${medal} ${player.name}</span>
                    <span>${player.score}</span>
                </div>
            `;
        });
        this.dom.finalScores.innerHTML = scoresHtml;

        this.dom.gameOverModal.classList.remove('hidden');
    }

    startNewGame() {
        this.roundNumber = 1;
        this.rollNumber = 0;
        this.bankScore = 0;
        this.currentPlayerIndex = 0;
        this.gameStarted = false;
        this.roundOver = false;
        this.gameOver = false;

        // Reset player scores
        this.players.forEach(p => {
            p.score = 0;
            p.hasBankedThisRound = false;
        });

        // Reset dice display
        this.dom.die1.textContent = '?';
        this.dom.die2.textContent = '?';
        this.dom.die1.classList.remove('seven', 'doubles', 'rolling');
        this.dom.die2.classList.remove('seven', 'doubles', 'rolling');

        this.hideAlert();
        this.dom.lastRollInfo.textContent = '';
        this.renderPlayers();
        this.updateUI();
    }

    updateUI() {
        // Round info
        this.dom.roundNumber.textContent = this.roundNumber;
        this.dom.totalRounds.textContent = this.totalRounds;
        this.dom.rollNumber.textContent = this.rollNumber;

        // Bank score
        this.dom.bankScore.textContent = this.bankScore;

        // Survival probability
        if (this.dom.survivalProb) {
            const survivalPct = (this.getSurvivalProbability() * 100).toFixed(1);
            this.dom.survivalProb.textContent = survivalPct + '%';
        }

        // Current player
        const currentPlayer = this.players[this.currentPlayerIndex];
        this.dom.currentPlayerName.textContent = currentPlayer ? currentPlayer.name : 'Unknown';

        // Button states
        this.dom.rollBtn.disabled = this.roundOver || this.gameOver;

        // Update bank dropdown (legacy) and bank panel (multi-select)
        this.updateBankDropdown();
        this.updateBankPanel();

        // Bank action group enabled/disabled based on roll number
        const canBank = this.rollNumber >= 3 && this.bankScore > 0 && !this.roundOver && !this.gameOver;
        if (this.dom.bankActionGroup) {
            if (canBank) {
                this.dom.bankActionGroup.classList.remove('disabled');
            } else {
                this.dom.bankActionGroup.classList.add('disabled');
            }
        }

        // Bank button state
        this.updateBankButtonState();

        // Highlight bank button when score is available
        if (this.bankScore > 0 && !this.roundOver && !this.gameOver && this.rollNumber >= 3) {
            this.dom.bankBtn.classList.add('highlight');
        } else {
            this.dom.bankBtn.classList.remove('highlight');
        }

        // Hide banking info after roll 3 (no longer relevant)
        if (this.dom.bankingInfo) {
            if (this.rollNumber >= 3) {
                this.dom.bankingInfo.classList.add('hidden');
            } else {
                this.dom.bankingInfo.classList.remove('hidden');
            }
        }

        // Update summary scoreboard if visible
        this.updateSummaryScoreboard();
    }

    renderPlayers() {
        if (!this.dom.playersList) return;

        let html = '';
        const sorted = [...this.players].sort((a, b) => b.score - a.score);
        const leaderScore = sorted.length > 0 ? sorted[0].score : 0;

        sorted.forEach((player, index) => {
            const isCurrent = this.players[this.currentPlayerIndex]?.id === player.id;
            const rank = index === 0 && player.score > 0 ? '🥇' :
                index === 1 && player.score > 0 ? '🥈' :
                    index === 2 && player.score > 0 ? '🥉' : '';

            const statusText = player.hasBankedThisRound ? '✓ Banked' :
                isCurrent ? '🎲 Rolling' : 'Waiting';

            // Gap column: difference from leader
            const gap = index === 0 ? '-' : `+${leaderScore - player.score}`;
            const gapClass = index === 0 ? 'player-gap leader' : 'player-gap';

            const classes = ['player-card'];
            if (isCurrent && !player.hasBankedThisRound) classes.push('current');
            if (player.hasBankedThisRound) classes.push('banked');

            html += `
                <div class="${classes.join(' ')}">
                    <div class="player-info">
                        <span class="player-name">${rank} ${player.name}</span>
                        <span class="player-status">${statusText}</span>
                    </div>
                    <span class="${gapClass}">${gap}</span>
                    <span class="player-score">${player.score}</span>
                </div>
            `;
        });

        this.dom.playersList.innerHTML = html;
    }

    toggleSettings() {
        this.dom.settingsPanel.classList.toggle('hidden');
    }

    renderPlayerConfig() {
        if (!this.dom.playerConfig) return;

        let html = '';
        this.players.forEach((player, index) => {
            html += `
                <div class="player-config-item" data-index="${index}">
                    <input type="text" value="${player.name}" 
                           onchange="game.updatePlayerName(${index}, this.value)">
                    ${this.players.length > 2 ?
                    `<button class="btn-remove" onclick="game.removePlayer(${index})">✕</button>` :
                    ''}
                </div>
            `;
        });

        this.dom.playerConfig.innerHTML = html;
    }

    updatePlayerName(index, name) {
        if (this.players[index]) {
            this.players[index].name = name || `Player ${index + 1}`;
            this.renderPlayers();
        }
    }

    addPlayer() {
        const newId = Math.max(...this.players.map(p => p.id)) + 1;
        this.players.push({
            id: newId,
            name: `Player ${this.players.length + 1}`,
            score: 0,
            hasBankedThisRound: false
        });
        this.renderPlayerConfig();
        this.renderPlayers();
    }

    removePlayer(index) {
        if (this.players.length <= 2) return;
        this.players.splice(index, 1);
        if (this.currentPlayerIndex >= this.players.length) {
            this.currentPlayerIndex = 0;
        }
        this.renderPlayerConfig();
        this.renderPlayers();
        this.updateUI();
    }

    showAlert(message) {
        this.dom.alertText.textContent = message;
        this.dom.alertMessage.classList.remove('hidden');
    }

    hideAlert() {
        this.dom.alertMessage.classList.add('hidden');
    }

    playSound(positive) {
        if (this.volume === 0) return;

        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            oscillator.type = positive ? 'sine' : 'square';
            oscillator.frequency.value = positive ? 880 : 220;

            gainNode.gain.value = this.volume / 100 * 0.3;

            oscillator.start();
            oscillator.stop(this.audioCtx.currentTime + 0.15);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }

    // ==================== STATE MANAGEMENT & UNDO ====================

    /**
     * Serialize current game state for undo stack
     */
    serializeState() {
        return {
            roundNumber: this.roundNumber,
            rollNumber: this.rollNumber,
            bankScore: this.bankScore,
            currentPlayerIndex: this.currentPlayerIndex,
            gameStarted: this.gameStarted,
            roundOver: this.roundOver,
            gameOver: this.gameOver,
            die1: this.die1,
            die2: this.die2,
            players: JSON.parse(JSON.stringify(this.players)),
            rngState: this.rng.current // Save RNG state for preserve mode
        };
    }

    /**
     * Push current state onto undo stack
     */
    pushState() {
        const state = this.serializeState();
        this.undoStack.push(state);
        // Limit stack size to 50 states
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
        this.updateUndoButton();
    }

    /**
     * Undo last action by restoring previous state
     */
    undo() {
        if (this.undoStack.length === 0) return;

        const previousState = this.undoStack.pop();
        this.restoreState(previousState);

        // In 'preserve' mode, restore RNG state so next roll will be same
        if (this.undoMode === 'preserve') {
            this.rng.current = previousState.rngState;
        }
        // In 'resample' mode, RNG continues from current position (new random)

        this.hideAlert();
        this.renderPlayers();
        this.updateUI();
        this.updateUndoButton();
    }

    /**
     * Restore game state from serialized object
     */
    restoreState(state) {
        this.roundNumber = state.roundNumber;
        this.rollNumber = state.rollNumber;
        this.bankScore = state.bankScore;
        this.currentPlayerIndex = state.currentPlayerIndex;
        this.gameStarted = state.gameStarted;
        this.roundOver = state.roundOver;
        this.gameOver = state.gameOver;
        this.die1 = state.die1;
        this.die2 = state.die2;
        this.players = JSON.parse(JSON.stringify(state.players));

        // Update dice display
        this.dom.die1.textContent = state.die1 || '?';
        this.dom.die2.textContent = state.die2 || '?';
    }

    /**
     * Update undo button enabled state
     */
    updateUndoButton() {
        if (this.dom.undoBtn) {
            this.dom.undoBtn.disabled = this.undoStack.length === 0;
        }
    }

    /**
     * Set undo mode ('resample' or 'preserve')
     */
    setUndoMode(mode) {
        if (mode === 'resample' || mode === 'preserve') {
            this.undoMode = mode;
        }
    }

    // ==================== SEEDED RNG API ====================

    /**
     * Set RNG seed for deterministic testing
     */
    setSeed(seed) {
        this.rng.setSeed(seed);
    }

    /**
     * Get current RNG seed
     */
    getSeed() {
        return this.rng.getSeed();
    }

    // ==================== PROBABILITY CONSTANTS ====================

    /**
     * Static 2d6 probability data for cheatsheet
     * Probability of rolling each sum with two dice
     */
    static DICE_PROBABILITIES = {
        2: { ways: 1, prob: 1 / 36, percent: '2.78%' },
        3: { ways: 2, prob: 2 / 36, percent: '5.56%' },
        4: { ways: 3, prob: 3 / 36, percent: '8.33%' },
        5: { ways: 4, prob: 4 / 36, percent: '11.11%' },
        6: { ways: 5, prob: 5 / 36, percent: '13.89%' },
        7: { ways: 6, prob: 6 / 36, percent: '16.67%' },
        8: { ways: 5, prob: 5 / 36, percent: '13.89%' },
        9: { ways: 4, prob: 4 / 36, percent: '8.33%' },
        10: { ways: 3, prob: 3 / 36, percent: '8.33%' },
        11: { ways: 2, prob: 2 / 36, percent: '5.56%' },
        12: { ways: 1, prob: 1 / 36, percent: '2.78%' }
    };

    /**
     * Calculate survival probability (no 7 in N rolls)
     * P(survive) = (5/6)^rollNumber
     */
    getSurvivalProbability() {
        return Math.pow(5 / 6, this.rollNumber);
    }

    // ==================== SUMMARY SCOREBOARD ====================

    /**
     * Toggle between full scoreboard and summary view
     */
    toggleScoreboardView() {
        this.dom.summaryScoreboard?.classList.toggle('hidden');
        this.dom.playersList?.classList.toggle('hidden');
        this.updateSummaryScoreboard();
    }

    /**
     * Update the summary scoreboard view
     */
    updateSummaryScoreboard() {
        if (!this.dom.summaryScoreboard || this.dom.summaryScoreboard.classList.contains('hidden')) return;

        const currentPlayer = this.players[this.currentPlayerIndex];
        if (!currentPlayer) return;

        const sorted = [...this.players].sort((a, b) => b.score - a.score);

        // Current player info
        if (this.dom.summaryCurrentName) {
            this.dom.summaryCurrentName.textContent = currentPlayer.name;
        }
        if (this.dom.summaryCurrentScore) {
            this.dom.summaryCurrentScore.textContent = currentPlayer.score;
        }

        // Find current player's rank position
        const currentRank = sorted.findIndex(p => p.id === currentPlayer.id);
        const leaderScore = sorted[0]?.score || 0;

        // Gap to next player (player above in rankings)
        if (this.dom.summaryGapNext) {
            if (currentRank > 0) {
                const nextPlayer = sorted[currentRank - 1];
                const gapToNext = nextPlayer.score - currentPlayer.score + 1;
                this.dom.summaryGapNext.textContent = `+${gapToNext}`;
            } else {
                this.dom.summaryGapNext.textContent = 'You are #1!';
            }
        }

        // Gap to leader
        if (this.dom.summaryGapLeader) {
            if (currentRank > 0) {
                const gapToLeader = leaderScore - currentPlayer.score + 1;
                this.dom.summaryGapLeader.textContent = `+${gapToLeader}`;
            } else {
                this.dom.summaryGapLeader.textContent = '--';
            }
        }

        // Rankings with ties
        this.renderSummaryRankings(sorted);
    }

    /**
     * Render the summary rankings with tie handling
     */
    renderSummaryRankings(sorted) {
        if (!this.dom.summaryRankings) return;

        let html = '';
        let currentRank = 1;
        let previousScore = null;

        sorted.forEach((player, index) => {
            // Same rank for tied scores
            if (previousScore !== null && player.score < previousScore) {
                currentRank = index + 1;
            }
            previousScore = player.score;

            const isCurrent = this.players[this.currentPlayerIndex]?.id === player.id;
            const rankDisplay = `#${currentRank}`;

            html += `
                <div class="summary-rank-item ${isCurrent ? 'current' : ''}">
                    <span class="rank">${rankDisplay}</span>
                    <span class="name">${player.name}</span>
                    <span class="score">${player.score}</span>
                </div>
            `;
        });

        this.dom.summaryRankings.innerHTML = html;
    }

    // ==================== JSON IMPORT/EXPORT ====================

    /**
     * Export configuration to JSON file
     */
    exportConfig() {
        const config = {
            name: "bank-game-config",  // Unused key for identification
            version: "1.0",
            seed: this.rng.getSeed(),
            settings: {
                totalRounds: this.totalRounds,
                volume: this.volume,
                undoMode: this.undoMode
            },
            players: this.players.map(p => ({
                id: p.id,
                name: p.name
            })),
            // Deterministic gameplay support
            deterministic: {
                seed: this.rng.initialSeed,
                maxRolls: null,  // Optional: limit total rolls for testing
                expectedFinalScores: null  // Optional: for test validation
            }
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bank-game-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.debug('[Export] Configuration exported successfully');
    }

    /**
     * Import configuration from JSON file
     */
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

                // Validate config structure
                const validationResult = this.validateConfigStructure(config);
                if (!validationResult.valid) {
                    console.error('[Import] Invalid configuration:', validationResult.error);
                    alert(`Import failed: ${validationResult.error}`);
                    return;
                }

                this.applyConfig(config);
                console.debug('[Import] Configuration imported successfully');

            } catch (error) {
                console.error('[Import] Failed to parse JSON:', error.message);
                alert(`Failed to import configuration: ${error.message}`);
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

    /**
     * Apply imported configuration
     */
    applyConfig(config) {
        if (config.settings) {
            if (config.settings.totalRounds !== undefined) {
                this.totalRounds = config.settings.totalRounds;
                if (this.dom.roundsSelect) {
                    this.dom.roundsSelect.value = this.totalRounds;
                }
                if (this.dom.totalRounds) {
                    this.dom.totalRounds.textContent = this.totalRounds;
                }
            }
            if (config.settings.volume !== undefined) {
                this.volume = config.settings.volume;
                if (this.dom.volumeInput) {
                    this.dom.volumeInput.value = this.volume;
                }
            }
            if (config.settings.undoMode) {
                this.undoMode = config.settings.undoMode;
                if (this.dom.undoModeSelect) {
                    this.dom.undoModeSelect.value = this.undoMode;
                }
            }
        }

        if (config.players && Array.isArray(config.players)) {
            this.players = config.players.map(p => ({
                id: p.id,
                name: p.name,
                score: 0,
                hasBankedThisRound: false
            }));
            this.renderPlayerConfig();
            this.renderPlayers();
        }

        // Apply seed for deterministic testing
        if (config.deterministic?.seed !== undefined) {
            this.rng.setSeed(config.deterministic.seed);
        } else if (config.seed !== undefined) {
            this.rng.setSeed(config.seed);
        }

        this.updateUI();
    }

    /**
     * Validate configuration structure
     */
    validateConfigStructure(config) {
        if (typeof config !== 'object' || config === null) {
            return { valid: false, error: 'Configuration must be an object' };
        }

        if (config.players) {
            if (!Array.isArray(config.players)) {
                return { valid: false, error: 'Players must be an array' };
            }
            if (config.players.length < 2) {
                return { valid: false, error: 'At least 2 players are required' };
            }
            for (const player of config.players) {
                if (!player.id || !player.name) {
                    return { valid: false, error: 'Each player must have id and name' };
                }
            }
        }

        if (config.settings?.totalRounds !== undefined) {
            const rounds = config.settings.totalRounds;
            if (rounds < 1 || rounds > 100) {
                return { valid: false, error: 'Rounds must be between 1 and 100' };
            }
        }

        return { valid: true };
    }
}

// Initialize game and expose to window for tests
window.game = new BankGame();
