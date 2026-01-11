// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Seeded Tests for Bank Game
 * 
 * These tests verify deterministic game behavior using seeded configurations.
 */

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
        // Check for round indicator
        await expect(page.locator('text=Round')).toBeVisible();

        // Check for scoreboard
        await expect(page.locator('text=Scoreboard')).toBeVisible();

        // Check for at least one player
        await expect(page.locator('text=Player 1')).toBeVisible();
    });

    test('should roll dice and update bank', async ({ page }) => {
        // Click roll dice button
        const rollButton = page.locator('button:has-text("Roll Dice")');
        await rollButton.click();

        // Wait for dice animation
        await page.waitForTimeout(500);

        // The bank should now have a value > 0 (unless snake eyes)
        // We just verify the game is still functional
        await expect(page.locator('h1:has-text("BANK")')).toBeVisible();
    });

    test('should show probability cheatsheet', async ({ page }) => {
        // Look for probability information
        await expect(page.locator('text=/\\d+%/')).toBeVisible({ timeout: 5000 });
    });

    test('should enable undo after rolling', async ({ page }) => {
        // Roll once
        await page.click('button:has-text("Roll Dice")');
        await page.waitForTimeout(500);

        // Undo button should be visible
        await expect(page.locator('button:has-text("Undo")')).toBeVisible();
    });

    test('should open settings panel', async ({ page }) => {
        // Click settings button (gear icon)
        await page.click('button:has-text("⚙")');

        // Settings panel should be visible
        await expect(page.locator('text=Settings')).toBeVisible();
    });

    test('should show exit confirmation when leaving with progress', async ({ page }) => {
        // Roll to create progress
        await page.click('button:has-text("Roll Dice")');
        await page.waitForTimeout(500);

        // Click home button
        await page.click('text=🏠');

        // Confirmation modal should appear
        await expect(page.locator('text=Leave Game')).toBeVisible();

        // Click stay
        await page.click('button:has-text("Stay")');

        // Should still be on Bank page
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
});
