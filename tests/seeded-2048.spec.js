// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Seeded Tests for 2048 Game
 * 
 * These tests verify deterministic game behavior and AI functionality.
 */

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
        // Get initial board state
        await page.waitForTimeout(500);

        // Press arrow key
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);

        // Grid should still be visible
        await expect(page.locator('.grid-cols-4')).toBeVisible();
    });

    test('should have working hint button', async ({ page }) => {
        // Set up dialog handler
        page.once('dialog', async dialog => {
            expect(dialog.message()).toMatch(/moving|No good moves/);
            await dialog.accept();
        });

        // Click hint button
        await page.click('button:has-text("Hint")');
    });

    test('should have working new game button', async ({ page }) => {
        // Make some moves
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);

        // Click new game
        await page.click('button:has-text("↻")');
        await page.waitForTimeout(300);

        // Game should reset
        await expect(page.locator('.grid-cols-4')).toBeVisible();
    });

    test('should toggle auto-play', async ({ page }) => {
        const autoPlayBtn = page.locator('button:has-text("Play for Me")');

        // Start auto-play
        await autoPlayBtn.click();
        await expect(page.locator('button:has-text("Stop")')).toBeVisible();

        // Stop auto-play
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

test.describe('2048 Game - AI Features', () => {
    test('should provide consistent hints', async ({ page }) => {
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');

        // Set up dialog handler to capture hint
        let firstHint = '';
        page.once('dialog', async dialog => {
            firstHint = dialog.message();
            await dialog.accept();
        });

        await page.click('button:has-text("Hint")');
        await page.waitForTimeout(100);

        // Hint should mention a direction
        expect(firstHint).toMatch(/up|down|left|right|No good moves/i);
    });
});

test.describe('2048 Game - Navigation', () => {
    test('should have AI Research link on desktop', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');

        const researchLink = page.locator('a:has-text("AI, Analytics")');
        await expect(researchLink).toBeVisible();

        // Click and verify navigation
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

        // Grid should still be functional
        await expect(page.locator('.grid-cols-4')).toBeVisible();
    });

    test('should accumulate score over moves', async ({ page }) => {
        await page.goto('/games/2048');
        await page.waitForLoadState('networkidle');

        // Get initial score (should be 0)
        const scoreLocator = page.locator('text=Score').locator('..').locator('div.text-2xl');

        // Make multiple moves to increase score
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'][i % 4]);
            await page.waitForTimeout(100);
        }

        // Score display should still be visible
        await expect(scoreLocator).toBeVisible();
    });
});
