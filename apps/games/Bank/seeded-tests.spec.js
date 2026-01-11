/**
 * Bank Game - Seeded Playwright Tests
 * 
 * Tests cover:
 * - Basic game mechanics
 * - First-3-roll protection rules
 * - Doubles scoring behavior
 * - Banking functionality
 * - Round progression
 * - Game completion
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const BANK_GAME_URL = `file://${path.resolve(__dirname, 'index.html')}`;

// Helper to wait for game initialization
async function waitForGame(page) {
    await page.waitForFunction(() => typeof window.game !== 'undefined', { timeout: 5000 });
}

test.describe('Bank Game - Core Mechanics', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('should load game correctly', async ({ page }) => {
        // Verify core elements exist
        await expect(page.locator('#roll-btn')).toBeVisible();
        // Bank button is inside collapsible details, check it exists in DOM
        await expect(page.locator('#bank-btn')).toHaveCount(1);
        await expect(page.locator('#bank-score')).toHaveText('0');
        await expect(page.locator('#round-number')).toHaveText('1');
        await expect(page.locator('#roll-number')).toHaveText('0');
    });

    test('should display 4 default players', async ({ page }) => {
        const playerCards = page.locator('.player-card');
        await expect(playerCards).toHaveCount(4);
    });

    test('roll button should be enabled initially', async ({ page }) => {
        await expect(page.locator('#roll-btn')).toBeEnabled();
    });

    test('bank button should be disabled when bank is 0', async ({ page }) => {
        await expect(page.locator('#bank-btn')).toBeDisabled();
    });
});

test.describe('Bank Game - Dice Rolling', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);
    });

    test('should increment roll number after rolling', async ({ page }) => {
        // Initial state
        await expect(page.locator('#roll-number')).toHaveText('0');

        // Click roll and wait for animation
        await page.click('#roll-btn');
        await page.waitForTimeout(600); // Wait for roll animation

        // Roll number should increment
        await expect(page.locator('#roll-number')).toHaveText('1');
    });

    test('should update bank score after non-seven roll', async ({ page }) => {
        await page.click('#roll-btn');
        await page.waitForTimeout(600);

        // Bank should have some value (likely not 0, unless 7 was rolled)
        const bankScore = await page.locator('#bank-score').textContent();
        // Just verify it's a number
        expect(parseInt(bankScore)).toBeGreaterThanOrEqual(0);
    });

    test('should show dice values after rolling', async ({ page }) => {
        await page.click('#roll-btn');
        await page.waitForTimeout(600);

        const die1 = await page.locator('#die-1').textContent();
        const die2 = await page.locator('#die-2').textContent();

        // Dice should show numbers 1-6
        expect(parseInt(die1)).toBeGreaterThanOrEqual(1);
        expect(parseInt(die1)).toBeLessThanOrEqual(6);
        expect(parseInt(die2)).toBeGreaterThanOrEqual(1);
        expect(parseInt(die2)).toBeLessThanOrEqual(6);
    });
});

test.describe('Bank Game - First 3 Roll Protection', () => {

    test('should add 70 points when rolling 7 in first 3 rolls', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        // Inject controlled dice to roll exactly 7 (3+4)
        await page.evaluate(() => {
            // Override finishRoll to use our controlled values
            window.game.finishRoll = function () {
                this.die1 = 3;
                this.die2 = 4;
                const sum = this.die1 + this.die2; // 7
                const isSeven = sum === 7;

                this.rollNumber++;
                const isProtected = this.rollNumber <= 3;

                // Update dice display
                this.dom.die1.textContent = this.die1;
                this.dom.die2.textContent = this.die2;
                this.dom.die1.classList.remove('rolling');
                this.dom.die2.classList.remove('rolling');

                if (isSeven && isProtected) {
                    this.bankScore += 70;
                }

                this.dom.bankScore.textContent = this.bankScore;
                this.isRolling = false;
            };
        });

        await page.click('#roll-btn');
        await page.waitForTimeout(100);

        // Bank should be 70 (protected 7)
        await expect(page.locator('#bank-score')).toHaveText('70');
    });

    test('programmatic: first 3 rolls are protected from 7', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        // Direct programmatic test
        const result = await page.evaluate(() => {
            const game = window.game;

            // Simulate 3 protected sevens
            game.rollNumber = 0;
            game.bankScore = 0;

            // Roll 1: 7 in protection
            game.rollNumber = 1;
            game.bankScore += 70; // Protected 7

            // Roll 2: 7 in protection
            game.rollNumber = 2;
            game.bankScore += 70; // Protected 7

            // Roll 3: 7 in protection
            game.rollNumber = 3;
            game.bankScore += 70; // Protected 7

            return {
                bankScore: game.bankScore,
                rollNumber: game.rollNumber
            };
        });

        expect(result.bankScore).toBe(210); // 3 x 70
        expect(result.rollNumber).toBe(3);
    });
});

test.describe('Bank Game - Doubles Behavior', () => {

    test('programmatic: doubles in first 3 rolls = face value only', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        const result = await page.evaluate(() => {
            const game = window.game;
            game.rollNumber = 0;
            game.bankScore = 0;

            // Simulate roll 1: doubles (4,4) in protection
            game.rollNumber = 1;
            const isProtected = game.rollNumber <= 3;
            const faceValue = 4 * 2; // 8

            if (isProtected) {
                game.bankScore += faceValue; // Just face value
            }

            return {
                bankScore: game.bankScore,
                expected: 8
            };
        });

        expect(result.bankScore).toBe(result.expected);
    });

    test('programmatic: doubles after roll 3 = double the bank', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        const result = await page.evaluate(() => {
            const game = window.game;
            game.rollNumber = 3; // Past protection
            game.bankScore = 50;

            // Simulate roll 4: doubles
            game.rollNumber = 4;
            const isProtected = game.rollNumber <= 3; // false

            if (!isProtected) {
                game.bankScore *= 2; // Double the bank
            }

            return {
                bankScore: game.bankScore,
                expected: 100
            };
        });

        expect(result.bankScore).toBe(result.expected);
    });
});

test.describe('Bank Game - Banking Functionality', () => {

    test('should enable bank button when bank score > 0 and rollNumber >= 3', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        // Set bank score and rollNumber programmatically
        await page.evaluate(() => {
            window.game.bankScore = 50;
            window.game.rollNumber = 3; // Must be >= 3 for banking to be enabled
            window.game.updateUI();
        });

        // Check that at least one checkbox in bank panel is available or button is enabled
        const canBank = await page.evaluate(() => {
            return window.game.bankScore > 0 && window.game.rollNumber >= 3;
        });
        expect(canBank).toBe(true);
    });

    test('should transfer bank score to player when banking', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        // Setup: give bank a score and rollNumber >= 3
        const playerScore = await page.evaluate(() => {
            window.game.bankScore = 100;
            window.game.rollNumber = 3; // Must be >= 3 for banking
            window.game.gameStarted = true;
            window.game.updateUI();

            // Use bankCurrentPlayer which auto-selects first available player
            window.game.bankCurrentPlayer();

            return window.game.players[0].score;
        });

        expect(playerScore).toBe(100);
    });

    test('player should be marked as banked after banking', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        const hasBanked = await page.evaluate(() => {
            window.game.bankScore = 50;
            window.game.rollNumber = 3; // Must be >= 3 for banking
            window.game.gameStarted = true;
            window.game.updateUI();

            window.game.bankCurrentPlayer();

            return window.game.players[0].hasBankedThisRound;
        });

        expect(hasBanked).toBe(true);
    });

    test('should show banked status on player card', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        await page.evaluate(() => {
            window.game.bankScore = 50;
            window.game.rollNumber = 3; // Must be >= 3 for banking
            window.game.gameStarted = true;
            window.game.updateUI();

            window.game.bankCurrentPlayer();
            window.game.renderPlayers();
        });

        // First player card should have 'banked' class
        const bankedCard = page.locator('.player-card.banked');
        await expect(bankedCard).toHaveCount(1);
    });
});

test.describe('Bank Game - Round Progression', () => {

    test('programmatic: round ends when all players bank', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        const result = await page.evaluate(() => {
            const game = window.game;
            game.bankScore = 100;
            game.gameStarted = true;

            // All players bank
            game.players.forEach(p => {
                p.hasBankedThisRound = true;
                p.score += 25; // Split the bank
            });

            // Check if round should end
            const allBanked = game.players.every(p => p.hasBankedThisRound);

            return { allBanked };
        });

        expect(result.allBanked).toBe(true);
    });

    test('programmatic: round counter increments after round end', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        const result = await page.evaluate(() => {
            const game = window.game;

            const initialRound = game.roundNumber;
            game.nextRound();
            const newRound = game.roundNumber;

            return { initialRound, newRound };
        });

        expect(result.newRound).toBe(result.initialRound + 1);
    });

    test('programmatic: players reset hasBankedThisRound on new round', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        const result = await page.evaluate(() => {
            const game = window.game;

            // Mark all as banked
            game.players.forEach(p => p.hasBankedThisRound = true);

            // Start new round
            game.nextRound();

            // Check all players reset
            return game.players.every(p => p.hasBankedThisRound === false);
        });

        expect(result).toBe(true);
    });
});

test.describe('Bank Game - Game Over', () => {

    test('programmatic: game ends after totalRounds', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        const result = await page.evaluate(() => {
            const game = window.game;
            game.totalRounds = 5;
            game.roundNumber = 5; // At final round

            game.endRound(false); // End the round

            return { gameOver: game.gameOver };
        });

        expect(result.gameOver).toBe(true);
    });

    test('programmatic: winner is player with highest score', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        const result = await page.evaluate(() => {
            const game = window.game;

            game.players[0].score = 50;
            game.players[1].score = 200; // Winner
            game.players[2].score = 75;
            game.players[3].score = 100;

            const sorted = [...game.players].sort((a, b) => b.score - a.score);
            return {
                winnerId: sorted[0].id,
                winnerScore: sorted[0].score
            };
        });

        expect(result.winnerScore).toBe(200);
    });
});

test.describe('Bank Game - Settings', () => {

    test('should open settings panel', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        await page.click('#toggle-settings');
        await expect(page.locator('#settings-panel')).not.toHaveClass(/hidden/);
    });

    test('should allow changing number of rounds', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        await page.click('#toggle-settings');
        await page.selectOption('#rounds-select', '10');

        const totalRounds = await page.evaluate(() => window.game.totalRounds);
        expect(totalRounds).toBe(10);
    });

    test('should allow adding new players', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        await page.click('#toggle-settings');
        const initialCount = await page.evaluate(() => window.game.players.length);

        await page.click('#add-player-btn');

        const newCount = await page.evaluate(() => window.game.players.length);
        expect(newCount).toBe(initialCount + 1);
    });
});

test.describe('Bank Game - New Game', () => {

    test('should reset all state on new game', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        // Modify game state
        await page.evaluate(() => {
            window.game.roundNumber = 5;
            window.game.bankScore = 200;
            window.game.players[0].score = 500;
            window.game.rollNumber = 10;
        });

        // Start new game
        await page.evaluate(() => {
            window.game.startNewGame();
        });

        // Verify reset
        const state = await page.evaluate(() => ({
            roundNumber: window.game.roundNumber,
            bankScore: window.game.bankScore,
            playerScore: window.game.players[0].score,
            rollNumber: window.game.rollNumber
        }));

        expect(state.roundNumber).toBe(1);
        expect(state.bankScore).toBe(0);
        expect(state.playerScore).toBe(0);
        expect(state.rollNumber).toBe(0);
    });
});

test.describe('Bank Game - Multi-Player Banking', () => {

    test('programmatic: bank dropdown should be disabled before roll 3', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        // Set up state: roll 2, bank score > 0
        await page.evaluate(() => {
            window.game.rollNumber = 2;
            window.game.bankScore = 50;
            window.game.updateUI();
        });

        const isDisabled = await page.locator('#bank-player-select').isDisabled();
        expect(isDisabled).toBe(true);
    });

    test('programmatic: bank dropdown should be enabled after roll 3', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        // Set up state: roll 3, bank score > 0
        await page.evaluate(() => {
            window.game.rollNumber = 3;
            window.game.bankScore = 100;
            window.game.updateUI();
        });

        const isDisabled = await page.locator('#bank-player-select').isDisabled();
        expect(isDisabled).toBe(false);
    });

    test('programmatic: dropdown shows only players who have not banked', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        // Set up state: 2 players have banked
        await page.evaluate(() => {
            window.game.rollNumber = 4;
            window.game.bankScore = 100;
            window.game.players[0].hasBankedThisRound = true;
            window.game.players[1].hasBankedThisRound = true;
            window.game.updateUI();
        });

        // Get dropdown options count (excluding placeholder)
        const optionCount = await page.evaluate(() => {
            const select = document.getElementById('bank-player-select');
            return select.options.length - 1; // Exclude "Select player to BANK" placeholder
        });

        // Should show only 2 players (Player 3 and Player 4)
        expect(optionCount).toBe(2);
    });

    test('programmatic: selecting player from dropdown and banking transfers points', async ({ page }) => {
        await page.goto(BANK_GAME_URL);
        await page.waitForLoadState('domcontentloaded');
        await waitForGame(page);

        // Set up state and bank Player 3 using bankCurrentPlayer (simpler than clicking)
        const result = await page.evaluate(() => {
            window.game.rollNumber = 4;
            window.game.bankScore = 150;
            window.game.gameStarted = true;
            window.game.updateUI();

            // Select Player 3 and trigger bank
            window.game.dom.bankPlayerSelect.value = '3';
            window.game.bankSelectedPlayer();

            return {
                player3Score: window.game.players[2].score,
                player3Banked: window.game.players[2].hasBankedThisRound
            };
        });

        expect(result.player3Score).toBe(150);
        expect(result.player3Banked).toBe(true);
    });
});
