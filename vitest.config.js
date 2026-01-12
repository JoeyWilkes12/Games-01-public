import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vitest Configuration for Game Hub
 * 
 * Supports three testing modes:
 * 1. Unit tests (Node.js) - Fast, pure logic testing
 * 2. Component tests (Browser via Playwright) - React components in real browser
 * 3. Watch mode - Interactive development with browser preview
 * 
 * Usage:
 *   npm run test:unit      - Run unit tests in Node.js
 *   npm run test:component - Run component tests in headless Chromium
 *   npm run test:watch     - Interactive watch mode with browser
 */
export default defineConfig({
  plugins: [react()],
  
  test: {
    // Test file patterns
    include: [
      'tests/unit/**/*.spec.{js,jsx}',
      'tests/component/**/*.spec.{js,jsx}',
      'tests/component/**/*.browser.spec.{js,jsx}'
    ],
    
    // Exclude Playwright E2E tests (handled separately)
    exclude: [
      'node_modules',
      'tests/*.spec.js',  // Playwright E2E tests
      'demo-recording.spec.js',
      '_original/**'
    ],
    
    // Global test timeout
    testTimeout: 30000,
    
    // Browser mode configuration (uses Playwright as provider)
    browser: {
      enabled: false,  // Enabled via CLI flag
      name: 'chromium',
      provider: 'playwright',
      headless: true,
      
      // Viewport configuration matching Playwright setup
      viewport: {
        width: 1280,
        height: 720
      },
      
      // Screenshot configuration
      screenshotFailures: true,
    },
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules',
        '_original',
        'tests',
        '*.config.js'
      ]
    },
    
    // Environment setup
    globals: true,
    environment: 'jsdom',
    
    // Setup files for React Testing Library
    setupFiles: ['./tests/setup.js'],
  },
  
  // Resolve aliases matching Vite config
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@games': resolve(__dirname, './src/games'),
      '@components': resolve(__dirname, './src/components')
    }
  }
});
