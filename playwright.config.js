// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for Game Hub
 * Configured for both testing and demo recording
 */
module.exports = defineConfig({
  testDir: './',
  
  // Global timeout for tests
  timeout: 120000,
  
  // Expect timeout
  expect: {
    timeout: 10000
  },

  // Run tests in files in parallel
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests for demo recordings
  workers: 1,
  
  // Reporter to use
  reporter: [
    ['list'],
    ['html', { outputFolder: './playwright-report', open: 'never' }]
  ],

  use: {
    // Base URL for local file access
    baseURL: `file://${__dirname}`,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Video recording settings for demos
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 }
    },
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Slow down actions for better visibility in demos
    // This can be overridden per-test
    launchOptions: {
      slowMo: 100
    }
  },

  // Configure projects
  projects: [
    {
      name: 'demo',
      testMatch: /demo-recording\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        video: {
          mode: 'on',
          size: { width: 1280, height: 720 }
        },
        launchOptions: {
          slowMo: 300 // Slower for demo recordings
        }
      },
    },
    {
      name: 'tests',
      testMatch: /.*\.spec\.js/,
      testIgnore: /demo-recording\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        video: 'off',
        launchOptions: {
          slowMo: 50
        }
      },
    },
  ],

  // Output folder for test artifacts
  outputDir: './test-results/',
});
