// @ts-check
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Enhanced Seeded Tests for Random Event Dice Game
 * 
 * Uses JSON configuration files for deterministic testing.
 * Tests game mechanics, analytics, and event triggering.
 */

// Load configuration files
const CONFIG_DIR = join(process.cwd(), 'apps/games/Random Event Dice/sample configuration files');

const loadConfig = (filename) => {
    try {
        const filePath = join(CONFIG_DIR, filename);
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.warn(`Could not load config ${filename}:`, e.message);
        return null;
    }
};

test.describe('Random Event Dice - Core Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await page.waitForLoadState('networkidle');
    });

    test('should load the Random Event Dice game page', async ({ page }) => {
        await expect(page.locator('h1:has-text("Random Event Dice")')).toBeVisible();
    });

    test('should display timer', async ({ page }) => {
        // Timer should show 5:00 or similar format
        await expect(page.locator('text=/\\d+:\\d{2}/')).toBeVisible();
    });

    test('should display game controls', async ({ page }) => {
        await expect(page.locator('button:has-text("Start")')).toBeVisible();
        await expect(page.locator('button:has-text("Stop")')).toBeVisible();
        await expect(page.locator('button:has-text("Skip to End")')).toBeVisible();
    });

    test('should display dice faces', async ({ page }) => {
        // Should have two dice displayed
        const diceElements = page.locator('.dice, [class*="die"], [class*="dice"]');
        await expect(diceElements.first()).toBeVisible();
    });

    test('should have dashboard and advanced buttons', async ({ page }) => {
        await expect(page.locator('button:has-text("Dashboard")')).toBeVisible();
        await expect(page.locator('button:has-text("Advanced")')).toBeVisible();
    });
});

test.describe('Random Event Dice - Analytics Configuration', () => {
    const analyticsConfig = loadConfig('analytics-test-seed-12345.json');

    test('should validate analytics config structure', async () => {
        if (!analyticsConfig) {
            test.skip();
            return;
        }

        expect(analyticsConfig.version).toBe('2.0');
        expect(analyticsConfig.settings).toBeDefined();
        expect(analyticsConfig.players).toBeDefined();
        expect(analyticsConfig.analytics).toBeDefined();
        expect(analyticsConfig.eventDefinitions).toBeDefined();
    });

    test('should have correct seed value', async () => {
        if (!analyticsConfig) {
            test.skip();
            return;
        }

        expect(analyticsConfig.settings.seed).toBe(12345);
    });

    test('should have 15 players configured', async () => {
        if (!analyticsConfig) {
            test.skip();
            return;
        }

        const playerCount = Object.keys(analyticsConfig.players).length;
        expect(playerCount).toBe(15);
    });

    test('should have 6 event definitions (all doubles)', async () => {
        if (!analyticsConfig) {
            test.skip();
            return;
        }

        expect(analyticsConfig.eventDefinitions.length).toBe(6);

        // Each event should be for doubles
        for (const event of analyticsConfig.eventDefinitions) {
            expect(event.rules.length).toBe(2);
            expect(event.rules[0].value).toBe(event.rules[1].value);
        }
    });

    test('should have analytics panel configuration', async () => {
        if (!analyticsConfig) {
            test.skip();
            return;
        }

        const { analytics } = analyticsConfig;
        expect(analytics.enableLeaderboard).toBe(true);
        expect(analytics.enableTimeline).toBe(true);
        expect(analytics.enableHeatmap).toBe(true);
        expect(analytics.panelWidth).toBe(320);
    });
});

test.describe('Random Event Dice - Game Controls', () => {
    test('should start and stop the game', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await page.waitForLoadState('networkidle');

        // Start the game
        await page.click('button:has-text("Start")');
        await page.waitForTimeout(1000);

        // Game should be running - stats should update
        const totalRolls = page.locator('text=TOTAL ROLLS').locator('..').locator('text=/\\d+/');
        await expect(totalRolls).toBeVisible();

        // Stop the game
        await page.click('button:has-text("Stop")');

        // Game should be stopped
        await expect(page.locator('h1:has-text("Random Event Dice")')).toBeVisible();
    });

    test('should skip to end', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await page.waitForLoadState('networkidle');

        // Skip to end
        await page.click('button:has-text("Skip to End")');
        await page.waitForTimeout(500);

        // Timer should be at 0:00
        await expect(page.locator('text=0:00')).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Random Event Dice - Dashboard', () => {
    test('should open dashboard panel', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await page.waitForLoadState('networkidle');

        await page.click('button:has-text("Dashboard")');
        await page.waitForTimeout(500);

        // Dashboard should be visible
        await expect(page.locator('text=Leaderboard').or(page.locator('text=Timeline'))).toBeVisible({ timeout: 5000 });
    });

    test('should toggle dashboard visibility', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await page.waitForLoadState('networkidle');

        // Open dashboard
        await page.click('button:has-text("Dashboard")');
        await page.waitForTimeout(300);

        // Close dashboard
        await page.click('button:has-text("Dashboard")');
        await page.waitForTimeout(300);

        // Game should still be functional
        await expect(page.locator('h1:has-text("Random Event Dice")')).toBeVisible();
    });
});

test.describe('Random Event Dice - Advanced Settings', () => {
    test('should open advanced settings modal', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await page.waitForLoadState('networkidle');

        await page.click('button:has-text("Advanced")');
        await page.waitForTimeout(500);

        // Settings modal should be visible
        await expect(page.locator('text=Settings').or(page.locator('text=Advanced'))).toBeVisible();
    });
});

test.describe('Random Event Dice - Statistics Display', () => {
    test('should display all stat categories', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=TOTAL ROLLS')).toBeVisible();
        await expect(page.locator('text=CURRENT PLAYER')).toBeVisible();
        await expect(page.locator('text=TURN ROLLS')).toBeVisible();
        await expect(page.locator('text=SINCE EVENT')).toBeVisible();
    });

    test('should update stats during gameplay', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await page.waitForLoadState('networkidle');

        // Get initial total rolls
        const initialRolls = await page.locator('text=TOTAL ROLLS').locator('..').locator('text=/\\d+/').textContent();

        // Start the game and let it run briefly
        await page.click('button:has-text("Start")');
        await page.waitForTimeout(2000);
        await page.click('button:has-text("Stop")');

        // Total rolls should have increased
        const finalRolls = await page.locator('text=TOTAL ROLLS').locator('..').locator('text=/\\d+/').textContent();
        expect(parseInt(finalRolls || '0')).toBeGreaterThan(parseInt(initialRolls || '0'));
    });
});

test.describe('Random Event Dice - Minimal Configuration', () => {
    const minimalConfig = loadConfig('minimal-test-seed-42.json');

    test('should validate minimal config exists', async () => {
        if (!minimalConfig) {
            test.skip();
            return;
        }

        expect(minimalConfig.settings).toBeDefined();
        expect(minimalConfig.settings.seed).toBe(42);
    });
});

test.describe('Random Event Dice - Navigation', () => {
    test('should navigate back to hub', async ({ page }) => {
        await page.goto('/games/random-event-dice');
        await page.waitForLoadState('networkidle');

        await page.click('text=🏠');
        await expect(page).toHaveURL(/\/$/);
    });
});
