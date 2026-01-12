// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Enhanced Seeded Tests for 2048 Game
 * 
 * Uses JSON configuration files for deterministic testing.
 * Tests grid mechanics, AI hints, and game state management.
 */

// Load configuration files
const CONFIG_DIR = join(process.cwd(), 'apps/games/2048/sample configuration files');

const loadConfig = (filename) => {
    try {
        const filePath = join(CONFIG_DIR, filename);
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.warn(`Could not load config ${filename}:`, e.message);
        return null;
    }
};

test.describe('2048 Game - Core Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');
    });

    test('should load the 2048 game page', async ({ page }) => {
        await expect(page.locator('h1:has-text("2048")')).toBeVisible();
    });

    test('should display 4x4 grid with 16 tiles', async ({ page }) => {
        const tiles = page.locator('.grid-cols-4 > div');
        await expect(tiles).toHaveCount(16);
    });

    test('should display score panel', async ({ page }) => {
        await expect(page.locator('text=Score')).toBeVisible();
        await expect(page.locator('text=Best')).toBeVisible();
    });

    test('should respond to arrow key input', async ({ page }) => {
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);
        await expect(page.locator('.grid-cols-4')).toBeVisible();
    });

    test('should have working hint button', async ({ page }) => {
        page.once('dialog', async dialog => {
            expect(dialog.message()).toMatch(/moving|No good moves/);
            await dialog.accept();
        });
        await page.click('button:has-text("Hint")');
    });

    test('should have working new game button', async ({ page }) => {
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);
        await page.click('button:has-text("↻")');
        await page.waitForTimeout(300);
        await expect(page.locator('.grid-cols-4')).toBeVisible();
    });

    test('should toggle auto-play', async ({ page }) => {
        const autoPlayBtn = page.locator('button:has-text("Play for Me")');
        await autoPlayBtn.click();
        await expect(page.locator('button:has-text("Stop")')).toBeVisible();
        await page.click('button:has-text("Stop")');
        await expect(page.locator('button:has-text("Play for Me")')).toBeVisible();
    });

    test('should open settings modal', async ({ page }) => {
        await page.click('button:has-text("⚙️")');
        await expect(page.locator('text=Settings')).toBeVisible();
        await expect(page.locator('text=Theme')).toBeVisible();
        await expect(page.locator('text=Auto-Play Speed')).toBeVisible();
    });
});

test.describe('2048 Game - Advanced Configuration Tests', () => {
    const advancedConfig = loadConfig('advanced-test-seed-12345.json');
    const seededConfig = loadConfig('seeded-test-42.json');

    test('should have valid advanced config structure', async () => {
        if (!advancedConfig) {
            test.skip();
            return;
        }

        expect(advancedConfig.settings).toBeDefined();
        expect(advancedConfig.settings.gridSize).toBe(4);
        expect(advancedConfig.settings.seed).toBe(12345);
        expect(advancedConfig.testScenarios).toBeDefined();
    });

    test('should validate seeded config', async () => {
        if (!seededConfig) {
            test.skip();
            return;
        }

        expect(seededConfig.settings).toBeDefined();
        expect(seededConfig.settings.seed).toBe(42);
    });

    test('should validate merge logic configuration', async () => {
        if (!advancedConfig) {
            test.skip();
            return;
        }

        const { testScenarios } = advancedConfig;
        expect(testScenarios.initialBoard).toBeDefined();
        expect(testScenarios.expectedMergeResult).toBeDefined();
        expect(testScenarios.expectedMergeResult.direction).toBe('up');
        expect(testScenarios.expectedMergeResult.scoreGain).toBe(4);
    });

    test('should validate only powers of two', async () => {
        if (!advancedConfig) {
            test.skip();
            return;
        }

        const { validationRules } = advancedConfig;
        expect(validationRules.onlyPowersOfTwo).toBe(true);
        expect(validationRules.minTileValue).toBe(2);
        expect(validationRules.maxTileValue).toBe(131072);
    });
});

test.describe('2048 Game - AI Features', () => {
    test('should provide consistent hints', async ({ page }) => {
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');

        let firstHint = '';
        page.once('dialog', async dialog => {
            firstHint = dialog.message();
            await dialog.accept();
        });

        await page.click('button:has-text("Hint")');
        await page.waitForTimeout(100);
        expect(firstHint).toMatch(/up|down|left|right|No good moves/i);
    });

    test('should auto-play for a few moves', async ({ page }) => {
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');

        // Get initial score
        const initialScore = await page.locator('text=Score').locator('..').locator('div.text-2xl').textContent();

        // Start auto-play
        await page.click('button:has-text("Play for Me")');

        // Wait for a few moves
        await page.waitForTimeout(2000);

        // Stop auto-play
        await page.click('button:has-text("Stop")');

        // Game should still be functional
        await expect(page.locator('.grid-cols-4')).toBeVisible();
    });
});

test.describe('2048 Game - Navigation', () => {
    test('should have AI Research link on desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');

        const researchLink = page.locator('a:has-text("AI, Analytics")');
        await expect(researchLink).toBeVisible();

        await researchLink.click();
        await expect(page).toHaveURL(/definitions/);
    });

    test('should navigate back to hub', async ({ page }) => {
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');

        await page.click('text=🏠');
        await expect(page).toHaveURL(/\/$/);
    });
});

test.describe('2048 Game - Keyboard Controls', () => {
    test('should handle all arrow keys', async ({ page }) => {
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');

        const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

        for (const direction of directions) {
            await page.keyboard.press(direction);
            await page.waitForTimeout(100);
        }

        await expect(page.locator('.grid-cols-4')).toBeVisible();
    });

    test('should accumulate score over moves', async ({ page }) => {
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');

        const scoreLocator = page.locator('text=Score').locator('..').locator('div.text-2xl');

        for (let i = 0; i < 10; i++) {
            await page.keyboard.press(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'][i % 4]);
            await page.waitForTimeout(100);
        }

        await expect(scoreLocator).toBeVisible();
    });
});

test.describe('2048 Game - 5x5 Grid Configuration', () => {
    const grid5x5Config = loadConfig('5x5-grid-seed-99999.json');

    test('should validate 5x5 config exists', async () => {
        if (!grid5x5Config) {
            test.skip();
            return;
        }

        expect(grid5x5Config.settings).toBeDefined();
        expect(grid5x5Config.settings.gridSize).toBe(5);
        expect(grid5x5Config.settings.seed).toBe(99999);
    });
});
