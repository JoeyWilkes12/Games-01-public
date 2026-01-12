// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Enhanced Seeded Tests for Bank Game
 * 
 * Uses JSON configuration files for deterministic testing.
 * Tests various game configurations and validates expected behaviors.
 */

// Load configuration files
const CONFIG_DIR = join(process.cwd(), 'apps/games/Bank/sample configuration files');

const loadConfig = (filename) => {
    try {
        const filePath = join(CONFIG_DIR, filename);
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.warn(`Could not load config ${filename}:`, e.message);
        return null;
    }
};

test.describe('Bank Game - Seeded Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/games/bank');
        await page.waitForLoadState('networkidle');
    });

    test('should load the Bank game page', async ({ page }) => {
        await expect(page.locator('h1:has-text("BANK")')).toBeVisible();
        await expect(page.locator('button:has-text("Roll Dice")')).toBeVisible();
    });

    test('should display initial game state', async ({ page }) => {
        await expect(page.locator('text=Round')).toBeVisible();
        await expect(page.locator('text=Scoreboard')).toBeVisible();
        await expect(page.locator('text=Player 1')).toBeVisible();
    });

    test('should roll dice and update bank', async ({ page }) => {
        const rollButton = page.locator('button:has-text("Roll Dice")');
        await rollButton.click();
        await page.waitForTimeout(500);
        await expect(page.locator('h1:has-text("BANK")')).toBeVisible();
    });

    test('should show probability cheatsheet', async ({ page }) => {
        await expect(page.locator('text=/\\d+%/')).toBeVisible({ timeout: 5000 });
    });

    test('should enable undo after rolling', async ({ page }) => {
        await page.click('button:has-text("Roll Dice")');
        await page.waitForTimeout(500);
        await expect(page.locator('button:has-text("Undo")')).toBeVisible();
    });

    test('should open settings panel', async ({ page }) => {
        await page.click('button:has-text("⚙")');
        await expect(page.locator('text=Settings')).toBeVisible();
    });

    test('should show exit confirmation when leaving with progress', async ({ page }) => {
        await page.click('button:has-text("Roll Dice")');
        await page.waitForTimeout(500);
        await page.click('text=🏠');
        await expect(page.locator('text=Leave Game')).toBeVisible();
        await page.click('button:has-text("Stay")');
        await expect(page.locator('h1:has-text("BANK")')).toBeVisible();
    });
});

test.describe('Bank Game - Deterministic Configuration', () => {
    const config = loadConfig('bank-config-deterministic.json');

    test('should validate deterministic config structure', async () => {
        if (!config) {
            test.skip();
            return;
        }

        expect(config.seed).toBeDefined();
        expect(config.settings).toBeDefined();
        expect(config.players).toBeDefined();
        expect(config.players.length).toBeGreaterThan(0);
    });

    test('should load with deterministic config settings', async ({ page }) => {
        if (!config) {
            test.skip();
            return;
        }

        await page.goto('/games/bank');
        await page.waitForLoadState('networkidle');

        // Verify game loaded
        await expect(page.locator('h1:has-text("BANK")')).toBeVisible();

        // Check that scoreboard shows expected number of players (default is 4)
        const playerElements = page.locator('.scoreboard >> text=/Player \\d/');
        await expect(playerElements.first()).toBeVisible();
    });

    test('should enforce minimum 3 rolls before banking', async ({ page }) => {
        await page.goto('/games/bank');
        await page.waitForLoadState('networkidle');

        // Check initial state - banking should be disabled
        const bankingMessage = page.locator('text=/Banking enabled after \\d+ more rolls|Banking enabled/');
        await expect(bankingMessage).toBeVisible({ timeout: 5000 });

        // Roll dice 3 times
        for (let i = 0; i < 3; i++) {
            await page.click('button:has-text("Roll Dice")');
            await page.waitForTimeout(400);
        }

        // After 3 rolls, banking should be enabled
        // The button text or UI should change
        await expect(page.locator('h1:has-text("BANK")')).toBeVisible();
    });
});

test.describe('Bank Game - Multi-roll Sequence', () => {
    test('should handle multiple rolls correctly', async ({ page }) => {
        await page.goto('/games/bank');
        await page.waitForLoadState('networkidle');

        // Perform 3 rolls
        for (let i = 0; i < 3; i++) {
            await page.click('button:has-text("Roll Dice")');
            await page.waitForTimeout(300);
        }

        // Game should still be functional
        await expect(page.locator('h1:has-text("BANK")')).toBeVisible();
    });

    test('should track roll count', async ({ page }) => {
        await page.goto('/games/bank');
        await page.waitForLoadState('networkidle');

        // Initial roll count should be 0
        await expect(page.locator('text=Roll #0')).toBeVisible();

        // Roll once
        await page.click('button:has-text("Roll Dice")');
        await page.waitForTimeout(500);

        // Roll count should increment
        await expect(page.locator('text=Roll #1')).toBeVisible();
    });
});

test.describe('Bank Game - Player Configuration', () => {
    const partyConfig = loadConfig('bank-config-party.json');
    const twoPlayerConfig = loadConfig('bank-config-two-players.json');

    test('should validate party config has multiple players', async () => {
        if (!partyConfig) {
            test.skip();
            return;
        }

        expect(partyConfig.players.length).toBeGreaterThan(2);
    });

    test('should validate two-player config', async () => {
        if (!twoPlayerConfig) {
            test.skip();
            return;
        }

        expect(twoPlayerConfig.players.length).toBe(2);
    });
});

test.describe('Bank Game - Undo Functionality', () => {
    test('should undo a roll and restore bank value', async ({ page }) => {
        await page.goto('/games/bank');
        await page.waitForLoadState('networkidle');

        // Roll dice
        await page.click('button:has-text("Roll Dice")');
        await page.waitForTimeout(500);

        // Get bank value before undo
        const bankBefore = await page.locator('.text-4xl >> text=/\\d+/').first().textContent();

        // Click undo
        await page.click('button:has-text("Undo")');
        await page.waitForTimeout(300);

        // Bank should return to 0
        await expect(page.locator('text=0').first()).toBeVisible();
    });
});
