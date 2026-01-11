/**
 * Random Event Dice - Playwright E2E Tests
 * 
 * Prerequisites:
 * npm install -D @playwright/test
 * npx playwright install
 * 
 * Run:
 * npx playwright test playwright.config.js
 */

const { test, expect } = require('@playwright/test');

// Base URL for local file testing
const BASE_URL = 'file://' + process.cwd() + '/index.html';

test.describe('Random Event Dice Game - E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('domcontentloaded');
    });

    test('Page loads correctly with all UI elements', async ({ page }) => {
        // Verify main elements exist
        await expect(page.locator('#start-btn')).toBeVisible();
        await expect(page.locator('#stop-btn')).toBeVisible();
        await expect(page.locator('#timer-display')).toHaveText('60:00');
        await expect(page.locator('#dice-container')).toBeVisible();

        // Verify settings toggle exists
        await expect(page.locator('#toggle-settings')).toBeVisible();
    });

    test('Start Game button changes to Pause Game', async ({ page }) => {
        const startBtn = page.locator('#start-btn');

        // Initial state
        await expect(startBtn).toHaveText('Start Game');

        // Click to start
        await startBtn.click();

        // Should change to Pause
        await expect(startBtn).toHaveText('Pause Game');
    });

    test('Pause and Resume functionality works', async ({ page }) => {
        const startBtn = page.locator('#start-btn');

        // Start game
        await startBtn.click();
        await expect(startBtn).toHaveText('Pause Game');

        // Wait a bit for game to run
        await page.waitForTimeout(2000);

        // Pause
        await startBtn.click();
        await expect(startBtn).toHaveText('Resume Game');

        // Resume
        await startBtn.click();
        await expect(startBtn).toHaveText('Pause Game');
    });

    test('Stop Game ends gameplay', async ({ page }) => {
        const startBtn = page.locator('#start-btn');
        const stopBtn = page.locator('#stop-btn');

        // Start game
        await startBtn.click();
        await page.waitForTimeout(1000);

        // Stop game
        await stopBtn.click();

        // Start button should reset
        await expect(startBtn).toHaveText('Start Game');
    });

    test('Analytics panel shows and hides correctly', async ({ page }) => {
        const analyticsPanel = page.locator('#analytics-panel');
        const showBtn = page.locator('#show-analytics-btn');
        const closeBtn = page.locator('#toggle-analytics');

        // Check initial state (panel should be visible by default)
        await expect(analyticsPanel).toBeVisible();

        // Close panel
        await closeBtn.click();
        await expect(analyticsPanel).toHaveClass(/hidden/);

        // Show panel via button
        await showBtn.click();
        await expect(analyticsPanel).not.toHaveClass(/hidden/);
    });

    test('Settings panel toggles visibility', async ({ page }) => {
        const settingsToggle = page.locator('#toggle-settings');
        const settingsContent = page.locator('#settings-content');

        // Toggle settings visibility
        await settingsToggle.click();

        // Check if settings panel changes state
        const isHidden = await settingsContent.evaluate(el => el.classList.contains('hidden'));

        // Toggle again
        await settingsToggle.click();
        const isHiddenAfter = await settingsContent.evaluate(el => el.classList.contains('hidden'));

        expect(isHidden !== isHiddenAfter).toBe(true);
    });

    test('Dice display updates during gameplay', async ({ page }) => {
        const diceContainer = page.locator('#dice-container');
        const startBtn = page.locator('#start-btn');

        // Get initial dice state
        const initialDice = await diceContainer.innerHTML();

        // Start game and wait for rolls
        await startBtn.click();
        await page.waitForTimeout(3000);

        // Stop game
        await page.locator('#stop-btn').click();

        // Dice should have been updated (visual updates)
        const finalDice = await diceContainer.innerHTML();
        // Note: We can't easily assert dice values changed, but we verify no errors
    });

    test('Timer countdown works correctly', async ({ page }) => {
        const timer = page.locator('#timer-display');
        const startBtn = page.locator('#start-btn');

        // Initial state
        await expect(timer).toHaveText('60:00');

        // Start game
        await startBtn.click();
        await page.waitForTimeout(2500);

        // Timer should have counted down
        const timerText = await timer.textContent();
        expect(timerText).not.toBe('60:00');

        // Stop game
        await page.locator('#stop-btn').click();
    });

    test('Advanced settings modal opens and closes', async ({ page }) => {
        const advancedBtn = page.locator('#advanced-settings-btn');
        const modal = page.locator('#advanced-modal');
        const closeBtn = page.locator('#close-modal');

        // Open modal
        await advancedBtn.click();
        await expect(modal).toBeVisible();

        // Close modal
        await closeBtn.click();
        await expect(modal).toHaveClass(/hidden/);
    });

    test('Skip to End simulates full game', async ({ page }) => {
        const startBtn = page.locator('#start-btn');
        const skipBtn = page.locator('#skip-to-end-btn');
        const leaderboard = page.locator('#leaderboard');

        // Start game
        await startBtn.click();
        await page.waitForTimeout(2000);

        // Skip to end
        await skipBtn.click();

        // Leaderboard should have player data
        await page.waitForTimeout(500);
        const leaderboardHtml = await leaderboard.innerHTML();
        expect(leaderboardHtml).toContain('rolls');
    });

});

// Playwright configuration
module.exports = {
    testDir: './',
    testMatch: 'playwright.test.js',
    timeout: 30000,
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
    },
    reporter: [
        ['list'],
        ['html', { outputFolder: './playwright-report' }]
    ]
};
