/**
 * Integration Test Runner for Sliding Puzzle 3x3
 */

const outputLogs = [];

function logTest(msg, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${msg}`);
    const resDiv = document.getElementById('test-results');
    if (resDiv) {
        const div = document.createElement('div');
        div.className = `log ${type}`;
        div.textContent = msg;
        resDiv.appendChild(div);
    }
}

function assert(condition, desc) {
    if (condition) {
        logTest(`PASS: ${desc}`, 'pass');
    } else {
        logTest(`FAIL: ${desc}`, 'fail');
    }
}

async function runIntegrationTests() {
    logTest('Starting UI Integration Tests...');

    // 1. Check Initialization
    const tiles = document.querySelectorAll('#game-grid .tile');
    assert(tiles.length === 9, 'Grid should have 9 tiles on init');
    assert(!document.body.classList.contains('mode-advanced'), 'Should start in Kids mode (not advanced)');

    // 2. Test Advanced Toggle
    const advBtn = document.getElementById('advanced-btn');
    if (advBtn) {
        logTest('Clicking Advanced Button...');
        advBtn.click();
        await new Promise(r => setTimeout(r, 100)); // Wait for render

        assert(document.body.classList.contains('mode-advanced'), 'Body should have mode-advanced class');
        assert(advBtn.classList.contains('active'), 'Button should accept active class');

        // Check tiles (should be numbers in advanced mode?)
        // In current script, Advanced mode adds specific color classes and textContent.
        const firstTile = document.querySelector('#game-grid .tile:not(.empty)');
        if (firstTile) {
            assert(firstTile.textContent !== '', 'Tiles should have numbers in advanced mode');
        }

        // Toggle back
        logTest('Clicking Advanced Button again (Reset)...');
        advBtn.click();
        await new Promise(r => setTimeout(r, 100));
        assert(!document.body.classList.contains('mode-advanced'), 'Should return to Kids mode');
    } else {
        logTest('Advanced Button NOT FOUND', 'fail');
    }

    // 3. Test New Game
    const scoreEl = document.getElementById('move-count');
    // Simulate a move? Hard programmatically without known state.
    // We can just check if clicking New Game resets the board (different state)
    // But board is random.
    logTest('Testing New Game Reset...');
    const state1 = getBoardState();
    document.getElementById('new-game-btn').click();
    await new Promise(r => setTimeout(r, 100));
    const state2 = getBoardState();
    // It's possible random walk returns same state, but unlikely.
    logTest(`State1: ${state1.substring(0, 20)}... State2: ${state2.substring(0, 20)}...`);
    assert(state1 !== state2, 'Board should change after New Game');

    // 4. Settings
    logTest('Testing Settings Stats Toggle...');
    const statsToggle = document.getElementById('stats-toggle');
    const statsPanel = document.getElementById('stats-panel');

    // Open settings first (to ensure elements are reachable if hidden?) 
    // Actually they are in DOM always.
    if (statsToggle && statsPanel) {
        statsToggle.click(); // Toggle ON
        assert(!statsPanel.classList.contains('hidden'), 'Stats panel should be visible');
        statsToggle.click(); // Toggle OFF
        assert(statsPanel.classList.contains('hidden'), 'Stats panel should be hidden');
    } else {
        logTest('Stats Toggle or Panel NOT FOUND', 'fail');
    }

    logTest('Integration Tests Complete.');
}

function getBoardState() {
    return Array.from(document.querySelectorAll('#game-grid .tile'))
        .map(t => t.className + t.textContent).join('|');
}

// Auto-run if loaded
window.addEventListener('load', () => setTimeout(runIntegrationTests, 1000));
