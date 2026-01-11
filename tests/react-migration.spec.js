// @ts-check
import { test, expect } from '@playwright/test';

/**
 * React Game Hub - Basic Navigation and Smoke Tests
 * 
 * These tests verify the React migration works by checking basic page loads.
 */

test.describe('Game Hub Basic Tests', () => {
    test('hub page loads', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Game Hub/);
    });

    test('2048 page loads', async ({ page }) => {
        await page.goto('/games/2048');
        await expect(page.locator('text=2048')).toBeVisible();
    });

    test('bank page loads', async ({ page }) => {
        await page.goto('/games/bank');
        await expect(page.locator('text=BANK')).toBeVisible();
    });

    test('sliding puzzle page loads', async ({ page }) => {
        await page.goto('/games/sliding-puzzle');
        await expect(page.locator('text=Sliding Puzzle')).toBeVisible();
    });

    test('random event dice page loads', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await expect(page.locator('text=Random Event Dice')).toBeVisible();
    });

    test('definitions page loads', async ({ page }) => {
        await page.goto('/definitions');
        await expect(page.locator('text=Definitions')).toBeVisible();
    });

    test('dashboard page loads', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('research page loads', async ({ page }) => {
        await page.goto('/research');
        await expect(page.locator('text=Research')).toBeVisible();
    });
});

test.describe('Game Functionality Smoke Tests', () => {
    test('2048 grid is visible', async ({ page }) => {
        await page.goto('/games/2048');
        // 4x4 grid
        await expect(page.locator('.grid-cols-4')).toBeVisible();
    });

    test('bank roll button works', async ({ page }) => {
        await page.goto('/games/bank');
        const rollBtn = page.locator('button:has-text("Roll Dice")');
        await expect(rollBtn).toBeVisible();
        await rollBtn.click();
        // After clicking, the game should still be visible
        await expect(page.locator('text=BANK')).toBeVisible();
    });

    test('sliding puzzle has two grids', async ({ page }) => {
        await page.goto('/games/sliding-puzzle');
        await expect(page.locator('text=Your Puzzle')).toBeVisible();
        await expect(page.locator('text=Target')).toBeVisible();
    });

    test('random event dice has start button', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await expect(page.locator('button:has-text("Start")')).toBeVisible();
    });
});

test.describe('Navigation Tests', () => {
    test('can navigate from hub to game and back', async ({ page }) => {
        await page.goto('/');

        // Click on a game (using link)
        await page.click('a[href*="2048"]');
        await expect(page).toHaveURL(/games\/2048/);

        // Click home button
        await page.click('text=🏠');
        await expect(page).toHaveURL(/\/$/);
    });
});
