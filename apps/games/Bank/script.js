/**
 * Bank - Dice Game
 * Based on rules from ThunderHive Games (thunderhivegames.com)
 * 
 * Core Rules:
 * - Players take turns rolling two dice
 * - Each roll adds to a cumulative BANK score
 * - Rolling a 7 ends the round (except first 3 rolls = 70 pts)
 * - Rolling doubles doubles the BANK score (except first 3 = face value)
 * - Any player can call "BANK" to claim current score
 * - Players who BANK sit out the rest of the round
 * - Game ends after N rounds (10, 15, or 20)
 */

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
            bankBtn: document.getElementById('bank-btn'),
            currentPlayerName: document.getElementById('current-player-name'),
            playersList: document.getElementById('players-list'),
            settingsPanel: document.getElementById('settings-panel'),
            toggleSettings: document.getElementById('toggle-settings'),
            closeSettings: document.getElementById('close-settings'),
            roundsSelect: document.getElementById('rounds-select'),
            volumeInput: document.getElementById('volume-input'),
            playerConfig: document.getElementById('player-config'),
            addPlayerBtn: document.getElementById('add-player-btn'),
            newGameBtn: document.getElementById('new-game-btn'),
            gameOverModal: document.getElementById('game-over-modal'),
            winnerDisplay: document.getElementById('winner-display'),
            finalScores: document.getElementById('final-scores'),
            playAgainBtn: document.getElementById('play-again-btn')
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

        // Bank button
        this.dom.bankBtn.addEventListener('click', () => this.bankCurrentPlayer());

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
            if (e.code === 'KeyB' && this.bankScore > 0 && !this.gameOver) {
                this.bankCurrentPlayer();
            }
        });
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

        // Roll animation
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
        // Generate actual roll
        this.die1 = Math.floor(Math.random() * 6) + 1;
        this.die2 = Math.floor(Math.random() * 6) + 1;
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

    bankCurrentPlayer() {
        if (this.bankScore === 0 || this.gameOver) return;

        const player = this.players[this.currentPlayerIndex];
        if (player.hasBankedThisRound) return;

        // Transfer bank to player
        player.score += this.bankScore;
        player.hasBankedThisRound = true;

        // Show feedback
        this.dom.lastRollInfo.textContent = `${player.name} banked ${this.bankScore} points!`;
        this.dom.lastRollInfo.className = 'last-roll-info special';
        this.playSound(true);

        // Check if all players have banked
        if (this.players.every(p => p.hasBankedThisRound)) {
            this.endRound(false);
        } else {
            this.advancePlayer();
        }

        this.renderPlayers();
        this.updateUI();
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

        // Current player
        const currentPlayer = this.players[this.currentPlayerIndex];
        this.dom.currentPlayerName.textContent = currentPlayer ? currentPlayer.name : 'Unknown';

        // Button states
        this.dom.rollBtn.disabled = this.roundOver || this.gameOver;
        this.dom.bankBtn.disabled = this.bankScore === 0 || this.gameOver || 
            (currentPlayer && currentPlayer.hasBankedThisRound);

        // Highlight bank button when score is available
        if (this.bankScore > 0 && !this.roundOver && !this.gameOver) {
            this.dom.bankBtn.classList.add('highlight');
        } else {
            this.dom.bankBtn.classList.remove('highlight');
        }
    }

    renderPlayers() {
        if (!this.dom.playersList) return;

        let html = '';
        const sorted = [...this.players].sort((a, b) => b.score - a.score);

        sorted.forEach((player, index) => {
            const isCurrent = this.players[this.currentPlayerIndex]?.id === player.id;
            const rank = index === 0 && player.score > 0 ? '🥇' : 
                         index === 1 && player.score > 0 ? '🥈' : 
                         index === 2 && player.score > 0 ? '🥉' : '';
            
            const statusText = player.hasBankedThisRound ? '✓ Banked' : 
                               isCurrent ? '🎲 Rolling' : 'Waiting';

            const classes = ['player-card'];
            if (isCurrent && !player.hasBankedThisRound) classes.push('current');
            if (player.hasBankedThisRound) classes.push('banked');

            html += `
                <div class="${classes.join(' ')}">
                    <div class="player-info">
                        <span class="player-name">${rank} ${player.name}</span>
                        <span class="player-status">${statusText}</span>
                    </div>
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
}

// Initialize game
const game = new BankGame();
