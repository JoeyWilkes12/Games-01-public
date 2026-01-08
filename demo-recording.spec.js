/**
 * Game Hub - Comprehensive Demo Recording
 * 
 * This script creates a full demonstration of all playable games in the Game Hub.
 * Uses depth-first navigation approach with slow, deliberate movements for audience viewing.
 * 
 * Run with: npx playwright test demo-recording.spec.js --project=demo
 * 
 * Output: Video recording saved to ./test-results/
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

// Configuration for demo pace
const DEMO_CONFIG = {
    shortPause: 400,      // Brief pause for element visibility
    mediumPause: 800,     // Standard viewing pause
    longPause: 1500,      // Extended pause for complex features
    veryLongPause: 2500,  // Long pause for important demonstrations
    gameRunPause: 10000,  // Let game run for 10 seconds
};

// Base URL for navigation fallback
const getBaseUrl = () => `file://${path.join(__dirname, 'index.html')}`;

// Helper function for deliberate pauses
const pause = async (page, duration = DEMO_CONFIG.mediumPause) => {
    await page.waitForTimeout(duration);
};

// Helper to safely execute an action with fallback to home
const safeAction = async (page, actionFn, description) => {
    try {
        await actionFn();
        return true;
    } catch (error) {
        console.warn(`⚠️ Skipping "${description}" due to error: ${error.message}`);
        return false;
    }
};

// Helper to navigate back to home page on failure
const navigateToHome = async (page) => {
    console.log('🏠 Navigating back to Game Hub via URL...');
    await page.goto(getBaseUrl());
    await page.waitForLoadState('domcontentloaded');
    await pause(page, DEMO_CONFIG.mediumPause);
};

// Helper to slowly move to and click an element
const slowClick = async (page, selector, options = {}) => {
    const element = await page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await pause(page, DEMO_CONFIG.shortPause);
    await element.click(options);
    await pause(page, DEMO_CONFIG.shortPause);
};

// Helper to hover over element to show tooltips/effects
const slowHover = async (page, selector) => {
    const element = await page.locator(selector);
    await element.scrollIntoViewIfNeeded();
    await element.hover();
    await pause(page, DEMO_CONFIG.shortPause);
};

// Helper to hide the analytics panel (so it doesn't obscure settings)
const hideAnalyticsPanel = async (page) => {
    const analyticsPanel = page.locator('#analytics-panel');
    const isVisible = await analyticsPanel.evaluate(el => !el.classList.contains('hidden'));
    if (isVisible) {
        await slowClick(page, '#toggle-analytics');
    }
};

// Helper to show the analytics panel
const showAnalyticsPanel = async (page) => {
    const analyticsPanel = page.locator('#analytics-panel');
    const isHidden = await analyticsPanel.evaluate(el => el.classList.contains('hidden'));
    if (isHidden) {
        await slowClick(page, '#show-analytics-btn');
    }
};

// Helper to expand settings panel
const expandSettingsPanel = async (page) => {
    const settingsContent = page.locator('#settings-content');
    const isCollapsed = await settingsContent.evaluate(el => el.classList.contains('collapsed'));
    if (isCollapsed) {
        await slowClick(page, '#toggle-settings');
    }
};

test.describe('Game Hub - Full Demo Recording', () => {

    test('Complete Application Walkthrough', async ({ page }) => {
        // Set generous timeout for the full demo (15 minutes)
        test.setTimeout(900000);

        const baseUrl = getBaseUrl();

        // ============================================
        // SECTION 1: GAME HUB LANDING PAGE
        // ============================================
        console.log('📍 Starting at Game Hub Landing Page');
        await page.goto(baseUrl);
        await page.waitForLoadState('domcontentloaded');
        await pause(page, DEMO_CONFIG.longPause);

        // Hover over each game card to show interactivity
        console.log('🎮 Showcasing game cards...');
        await slowHover(page, '.game-card:nth-child(1)'); // Random Event Dice
        await slowHover(page, '.game-card:nth-child(2)'); // 2048
        await slowHover(page, '.game-card:nth-child(3)'); // Sliding Puzzle

        await pause(page, DEMO_CONFIG.mediumPause);

        // ============================================
        // SECTION 2: RANDOM EVENT DICE (Complete)
        // ============================================
        const redSuccess = await safeAction(page, async () => {
            console.log('🎲 Navigating to Random Event Dice...');
            await slowClick(page, 'a[href*="Random Event Dice"]');
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);

            // First, show the Analytics Dashboard briefly
            console.log('📊 Exploring Analytics Dashboard...');
            await showAnalyticsPanel(page);
            await pause(page, DEMO_CONFIG.mediumPause);

            // Scroll through analytics sections
            await page.locator('#leaderboard-section').scrollIntoViewIfNeeded();
            await pause(page, DEMO_CONFIG.shortPause);
            await page.locator('#timeline-section').scrollIntoViewIfNeeded();
            await pause(page, DEMO_CONFIG.shortPause);
            await page.locator('#heatmap-section').scrollIntoViewIfNeeded();
            await pause(page, DEMO_CONFIG.mediumPause);

            // IMPORTANT: Hide analytics panel so it doesn't obscure Settings
            console.log('📊 Hiding Analytics to show Settings...');
            await hideAnalyticsPanel(page);
            await pause(page, DEMO_CONFIG.shortPause);

            // Show Settings Panel
            console.log('⚙️ Exploring Settings...');
            await expandSettingsPanel(page);
            await pause(page, DEMO_CONFIG.mediumPause);

            // Configure faster settings for demo (0.1s interval, 1ms reset)
            console.log('⚡ Configuring fast roll settings...');
            await page.fill('#interval-input', '0.1');
            await pause(page, DEMO_CONFIG.shortPause);
            await page.fill('#reset-duration-input', '1');
            await pause(page, DEMO_CONFIG.shortPause);

            // Select a seed for determinism
            await page.selectOption('#seed-select', '12345');
            await pause(page, DEMO_CONFIG.shortPause);

            // Scroll to show Advanced Settings button
            await page.locator('#advanced-settings-btn').scrollIntoViewIfNeeded();
            await pause(page, DEMO_CONFIG.shortPause);

            // Open Advanced Event Settings Modal
            console.log('🛠️ Opening Advanced Event Settings...');
            await slowClick(page, '#advanced-settings-btn');
            await pause(page, DEMO_CONFIG.longPause);

            // Show event definitions in modal
            await page.locator('#event-definitions-list').scrollIntoViewIfNeeded();
            await pause(page, DEMO_CONFIG.mediumPause);

            // Show JSON controls
            await page.locator('#import-json-btn').scrollIntoViewIfNeeded();
            await pause(page, DEMO_CONFIG.shortPause);
            await page.locator('#export-json-btn').scrollIntoViewIfNeeded();
            await pause(page, DEMO_CONFIG.shortPause);

            // Close modal
            await slowClick(page, '#close-modal');
            await pause(page, DEMO_CONFIG.shortPause);

            // Start the game
            console.log('▶️ Starting game...');
            await slowClick(page, '#start-btn');

            // Let game run for 10 seconds to show rolls
            console.log('🎲 Watching dice rolls for 10 seconds...');
            await pause(page, DEMO_CONFIG.gameRunPause);

            // Demonstrate Pause
            console.log('⏸️ Demonstrating Pause...');
            await slowClick(page, '#start-btn'); // Now says "Pause Game"
            await pause(page, DEMO_CONFIG.longPause);

            // Resume
            console.log('▶️ Resuming...');
            await slowClick(page, '#start-btn'); // Now says "Resume Game"
            await pause(page, DEMO_CONFIG.longPause);

            // Show analytics while running (dashboard will have data now)
            console.log('📊 Showing Analytics with live data...');
            await showAnalyticsPanel(page);
            await pause(page, DEMO_CONFIG.longPause);

            // Skip to End
            console.log('⏩ Skip to End demonstration...');
            await page.locator('#skip-to-end-btn').scrollIntoViewIfNeeded();
            await slowClick(page, '#skip-to-end-btn');
            await pause(page, DEMO_CONFIG.longPause);

            // Show final leaderboard
            await page.locator('#leaderboard').scrollIntoViewIfNeeded();
            await pause(page, DEMO_CONFIG.longPause);

            // Hide analytics panel before returning home (to prevent overlay blocking)
            console.log('📊 Hiding Analytics panel...');
            await hideAnalyticsPanel(page);
            await pause(page, DEMO_CONFIG.shortPause);

            // Return to Game Hub
            console.log('🏠 Returning to Game Hub...');
            await slowClick(page, '.home-btn');
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);
        }, 'Random Event Dice demo');

        if (!redSuccess) {
            await navigateToHome(page);
        }

        // ============================================
        // SECTION 3: 2048 GAME (Complete)
        // ============================================
        const game2048Success = await safeAction(page, async () => {
            console.log('🔢 Navigating to 2048...');
            await slowClick(page, 'a[href*="2048"]');
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);

            // Show the game grid
            console.log('🎮 Exploring 2048 game...');
            await pause(page, DEMO_CONFIG.mediumPause);

            // Open Settings Modal
            console.log('⚙️ Opening Settings...');
            await slowClick(page, '#settings-btn');
            await pause(page, DEMO_CONFIG.mediumPause);

            // Show theme options
            await slowClick(page, '#theme-picker');
            await pause(page, DEMO_CONFIG.shortPause);
            await page.keyboard.press('Escape'); // Close dropdown

            // Show speed slider
            await slowHover(page, '#speed-range');
            await pause(page, DEMO_CONFIG.shortPause);

            // Close settings
            await slowClick(page, '#close-settings');
            await pause(page, DEMO_CONFIG.shortPause);

            // Play a few moves
            console.log('🎯 Playing some moves...');
            await page.keyboard.press('ArrowRight');
            await pause(page, DEMO_CONFIG.shortPause);
            await page.keyboard.press('ArrowDown');
            await pause(page, DEMO_CONFIG.shortPause);
            await page.keyboard.press('ArrowLeft');
            await pause(page, DEMO_CONFIG.shortPause);
            await page.keyboard.press('ArrowUp');
            await pause(page, DEMO_CONFIG.mediumPause);

            // Show Hint button
            console.log('💡 Showing Hint feature...');
            await slowClick(page, '#hint-btn');
            await pause(page, DEMO_CONFIG.longPause);

            // Demonstrate AI Play (briefly)
            console.log('🤖 Demonstrating AI Play...');
            await slowClick(page, '#solve-btn');
            await pause(page, DEMO_CONFIG.veryLongPause);

            // Stop AI after a moment
            await slowClick(page, '#solve-btn');
            await pause(page, DEMO_CONFIG.mediumPause);

            // Navigate to AI, Analytics & Research
            console.log('📊 Navigating to Analytics Dashboard...');
            await slowClick(page, '.research-btn');
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);

            // Explore dashboard pages
            console.log('📖 Exploring Definitions page...');
            await page.locator('.dropbtn').first().click();
            await pause(page, DEMO_CONFIG.shortPause);
            await page.locator('a[href="definitions.html"]').first().click();
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);

            // Scroll through definitions
            await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
            await pause(page, DEMO_CONFIG.mediumPause);
            await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
            await pause(page, DEMO_CONFIG.shortPause);

            // Navigate to Dashboard
            console.log('📈 Exploring Dashboard page...');
            await page.locator('.dropbtn').first().click();
            await pause(page, DEMO_CONFIG.shortPause);
            await page.locator('a[href="dashboard.html"]').first().click();
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);

            // Scroll through dashboard
            await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
            await pause(page, DEMO_CONFIG.mediumPause);
            await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
            await pause(page, DEMO_CONFIG.shortPause);

            // Navigate to Research
            console.log('🔬 Exploring Research page...');
            await page.locator('.dropbtn').first().click();
            await pause(page, DEMO_CONFIG.shortPause);
            await page.locator('a[href="research.html"]').first().click();
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);

            // Return to Game Hub
            console.log('🏠 Returning to Game Hub...');
            await slowClick(page, '.back-link');
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);
        }, '2048 demo');

        if (!game2048Success) {
            await navigateToHome(page);
        }

        // ============================================
        // SECTION 4: SLIDING PUZZLE (Complete)
        // ============================================
        const puzzleSuccess = await safeAction(page, async () => {
            console.log('🧩 Navigating to Sliding Puzzle...');
            await slowClick(page, 'a[href*="Sliding Puzzle"]');
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);

            // Show the puzzle
            console.log('🎮 Exploring Sliding Puzzle...');
            await pause(page, DEMO_CONFIG.mediumPause);

            // Open Settings
            console.log('⚙️ Opening Settings...');
            await slowClick(page, '#settings-btn');
            await pause(page, DEMO_CONFIG.mediumPause);

            // Show theme options
            await slowClick(page, '#theme-picker');
            await pause(page, DEMO_CONFIG.shortPause);
            await page.selectOption('#theme-picker', 'dark');
            await pause(page, DEMO_CONFIG.mediumPause);

            // Close settings
            await slowClick(page, '#close-settings');
            await pause(page, DEMO_CONFIG.shortPause);

            // Toggle Advanced Mode
            console.log('🎓 Toggling Advanced Mode...');
            await slowClick(page, '#advanced-btn');
            await pause(page, DEMO_CONFIG.mediumPause);

            // Play a few moves on the puzzle
            console.log('🧩 Making some puzzle moves...');
            const tiles = await page.locator('#game-grid .tile:not(.empty)').all();
            if (tiles.length > 0) {
                await tiles[0].click();
                await pause(page, DEMO_CONFIG.shortPause);
            }
            if (tiles.length > 1) {
                await tiles[1].click();
                await pause(page, DEMO_CONFIG.shortPause);
            }

            // Show Hint
            console.log('💡 Showing Hint...');
            await slowClick(page, '#hint-btn');
            await pause(page, DEMO_CONFIG.longPause);

            // Demonstrate AI Solve (briefly)
            console.log('🤖 Demonstrating AI Solve...');
            await slowClick(page, '#solve-btn');
            await pause(page, DEMO_CONFIG.veryLongPause);

            // New Game
            console.log('🔄 Starting New Game...');
            await slowClick(page, '#new-game-btn');
            await pause(page, DEMO_CONFIG.longPause);

            // Return to Game Hub
            console.log('🏠 Final return to Game Hub...');
            await slowClick(page, '.home-btn');
            await page.waitForLoadState('domcontentloaded');
            await pause(page, DEMO_CONFIG.longPause);
        }, 'Sliding Puzzle demo');

        if (!puzzleSuccess) {
            await navigateToHome(page);
        }

        // Final showcase of the hub
        console.log('🎉 Demo complete!');
        await pause(page, DEMO_CONFIG.veryLongPause);

        // Verify we're back at the hub
        await expect(page.locator('h1')).toContainText('Game Hub');
    });
});
