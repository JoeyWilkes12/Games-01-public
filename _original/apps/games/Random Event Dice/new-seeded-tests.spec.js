const { test, expect } = require('@playwright/test');
const path = require('path');

const GAME_DIR = path.join(__dirname);
const getBaseUrl = () => `file://${path.join(GAME_DIR, 'index.html')}`;

test.describe('Random Event Dice - UI Enhancements', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(getBaseUrl());
        await page.waitForLoadState('domcontentloaded');
    });

    test('Hide/Show Timer toggle works', async ({ page }) => {
        const timerDisplay = page.locator('#timer-display');
        const toggleBtn = page.locator('#toggle-timer-visibility');

        // Initially visible
        await expect(timerDisplay).toBeVisible();
        await expect(timerDisplay).not.toHaveClass(/hidden-text/);

        // Click to hide
        await toggleBtn.click();
        await expect(timerDisplay).toHaveClass(/hidden-text/);

        // CSS visibility check (since it might just be transparent/hidden via class)
        // The class 'hidden-text' sets visibility: hidden (based on style.css update)
        // Playwright's toBeVisible() might return false for visibility:hidden, let's verify.
        // If hidden-text is applied, the user can't see it.

        // Click to show
        await toggleBtn.click();
        await expect(timerDisplay).not.toHaveClass(/hidden-text/);
        await expect(timerDisplay).toBeVisible();
    });

    test('Footer v2.0.0 is NOT present (Landing page only)', async ({ page }) => {
        const footer = page.locator('.app-footer');
        await expect(footer).not.toBeVisible();
    });

    test('Landing Page Home Button works', async ({ page }) => {
        const homeBtn = page.locator('.home-btn');
        await expect(homeBtn).toBeVisible();
        /* 
           Note: clicking it navigates away. We test presence here.
           Navigation is covered in the main demo test.
        */
    });
});
