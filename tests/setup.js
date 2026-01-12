/**
 * Test Setup File
 * 
 * Configures the testing environment for both unit and component tests.
 * This file runs before each test file.
 */

// Extend expect with DOM matchers for component testing
// Only import if available (component tests)
try {
    await import('@testing-library/jest-dom');
} catch (e) {
    // Not available in pure unit test environment, that's okay
}

// Mock localStorage for unit tests running in Node.js (jsdom doesn't always set it up correctly)
if (typeof globalThis !== 'undefined') {
    const localStorageMock = {
        store: {},
        getItem(key) {
            return this.store[key] || null;
        },
        setItem(key, value) {
            this.store[key] = String(value);
        },
        removeItem(key) {
            delete this.store[key];
        },
        clear() {
            this.store = {};
        },
        get length() {
            return Object.keys(this.store).length;
        },
        key(index) {
            return Object.keys(this.store)[index] || null;
        }
    };

    // Set up localStorage mock if it doesn't exist or doesn't have clear method
    if (typeof globalThis.localStorage === 'undefined' ||
        typeof globalThis.localStorage.clear !== 'function') {
        globalThis.localStorage = localStorageMock;
    }

    // Also set on window if it exists
    if (typeof globalThis.window !== 'undefined') {
        if (typeof globalThis.window.localStorage === 'undefined' ||
            typeof globalThis.window.localStorage.clear !== 'function') {
            globalThis.window.localStorage = localStorageMock;
        }
    }
}
