/**
 * Sliding Puzzle 3x3 - Logic & Solver
 */

const GRID_SIZE = 3;

// --- Config / Constants ---
const COLORS_KIDS = ['color-red', 'color-blue', 'color-green', 'color-yellow', 'color-orange'];
const COLORS_ADVANCED = [
    'color-red', 'color-blue', 'color-green', 'color-yellow',
    'color-orange', 'color-purple', 'color-cyan', 'color-pink'
];

// --- DOM Elements ---
const gameGrid = document.getElementById('game-grid');
const targetGrid = document.getElementById('target-grid');
const newGameBtn = document.getElementById('new-game-btn');
const advancedBtn = document.getElementById('advanced-btn'); // New Button
const hintBtn = document.getElementById('hint-btn');
const solveBtn = document.getElementById('solve-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const winOverlay = document.getElementById('win-overlay');

// Settings DOM
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
// const modeToggle = document.getElementById('mode-toggle'); // REMOVED
const themePicker = document.getElementById('theme-picker');
const statsToggle = document.getElementById('stats-toggle');
const speedRange = document.getElementById('speed-range');

const statsPanel = document.getElementById('stats-panel');
const moveCountEl = document.getElementById('move-count');
const optimalCountEl = document.getElementById('optimal-count');

// --- State ---
let isAdvancedMode = false;
let currentState = [];
let targetState = [];
let movesTaken = 0;
let isSolving = false;
let isAutoSolving = false;
let autoSolveInterval = null;
let autoSolveSpeed = 500; // ms

// --- Initialization ---
function init() {
    newGameBtn.addEventListener('click', startNewGame);

    // Advanced Button Handler
    if (advancedBtn) {
        advancedBtn.addEventListener('click', () => {
            isAdvancedMode = !isAdvancedMode;

            // UI Toggle
            if (isAdvancedMode) {
                advancedBtn.classList.add('active');
                advancedBtn.innerHTML = '<span class="emoji">🎓</span> Advanced: ON';
            } else {
                advancedBtn.classList.remove('active');
                advancedBtn.innerHTML = '<span class="emoji">🎓</span> Advanced';
            }
            document.body.classList.toggle('mode-advanced', isAdvancedMode);

            startNewGame();
        });
    }

    playAgainBtn.addEventListener('click', () => {
        hideWinOverlay();
        startNewGame();
    });

    hintBtn.addEventListener('click', showHint);
    solveBtn.addEventListener('click', toggleAutoSolve);

    // Settings Logic
    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

    // Close modal on outside click
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });

    // Removed modeToggle listener

    themePicker.addEventListener('change', (e) => {
        document.body.setAttribute('data-theme', e.target.value);
    });

    statsToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            statsPanel.classList.remove('hidden');
        } else {
            statsPanel.classList.add('hidden');
        }
    });

    speedRange.addEventListener('input', (e) => {
        autoSolveSpeed = 1100 - parseInt(e.target.value);
    });

    // Default Start
    startNewGame();
}

function startNewGame() {
    stopAutoSolve(); // Ensure stopped
    movesTaken = 0;
    updateStatsUI(0);
    clearHint();

    if (isAdvancedMode) {
        setupAdvancedGame();
    } else {
        setupKidsGame();
    }
}

// --- Game Setup ---

function setupKidsGame() {
    let canonical = [1, 1, 2, 2, 3, 3, 4, 4, 0];
    targetState = [...canonical];
    randomWalk(targetState, 50);
    currentState = [...targetState];
    randomWalk(currentState, 30);

    render(targetGrid, targetState, false);
    render(gameGrid, currentState, true);
    updateOptimalMoveCount();
}

function setupAdvancedGame() {
    let canonical = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    targetState = [...canonical];
    randomWalk(targetState, 50);
    currentState = [...targetState];
    randomWalk(currentState, 40);

    render(targetGrid, targetState, false);
    render(gameGrid, currentState, true);
    updateOptimalMoveCount();
}

function randomWalk(stateArr, moves) {
    let emptyIdx = stateArr.indexOf(0);
    let lastEmptyIdx = -1;

    for (let i = 0; i < moves; i++) {
        const neighbors = getNeighbors(emptyIdx);
        const validNeighbors = neighbors.filter(n => n !== lastEmptyIdx);
        const nextIdx = validNeighbors.length > 0
            ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)]
            : neighbors[Math.floor(Math.random() * neighbors.length)];

        [stateArr[emptyIdx], stateArr[nextIdx]] = [stateArr[nextIdx], stateArr[emptyIdx]];
        lastEmptyIdx = emptyIdx;
        emptyIdx = nextIdx;
    }
}

function getNeighbors(index) {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const neighbors = [];
    if (row > 0) neighbors.push(index - GRID_SIZE);
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
    if (col > 0) neighbors.push(index - 1);
    if (col < GRID_SIZE - 1) neighbors.push(index + 1);
    return neighbors;
}

// --- Gameplay ---

function handleTileClick(index) {
    // Interruption Logic
    if (isAutoSolving) stopAutoSolve();

    performMove(index);
}

function performMove(index) {
    clearHint();
    const emptyPos = currentState.indexOf(0);
    const neighbors = getNeighbors(emptyPos);

    if (neighbors.includes(index)) {
        [currentState[emptyPos], currentState[index]] = [currentState[index], currentState[emptyPos]];
        movesTaken++;

        render(gameGrid, currentState, true);
        checkWin();
        updateStatsUI(movesTaken);

        // Async update
        setTimeout(updateOptimalMoveCount, 0);
    }
}

function checkWin() {
    if (JSON.stringify(currentState) === JSON.stringify(targetState)) {
        stopAutoSolve();
        showWinOverlay();
    }
}

// --- Rendering ---

function render(container, state, interactive) {
    container.innerHTML = '';
    state.forEach((val, index) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.setAttribute('data-index', index);

        if (val === 0) {
            tile.classList.add('empty');
        } else {
            if (isAdvancedMode) {
                let colorClass = COLORS_ADVANCED[(val - 1) % COLORS_ADVANCED.length];
                tile.classList.add(colorClass);
                tile.textContent = val;
            } else {
                tile.classList.add(COLORS_KIDS[val - 1]);
            }
        }

        if (interactive) {
            tile.addEventListener('click', () => handleTileClick(index));
        }

        container.appendChild(tile);
    });
}

function updateStatsUI(moves) {
    moveCountEl.textContent = moves;
}

function showWinOverlay() {
    winOverlay.classList.remove('hidden');
}

function hideWinOverlay() {
    winOverlay.classList.add('hidden');
}

// --- Solver Logic (A*) ---

class Solver {
    constructor(start, target, isAdvanced) {
        this.start = start;
        this.target = target;
        this.isAdvanced = isAdvanced;
    }

    solve() {
        let openSet = [];
        let closedSet = new Set();

        const startH = this.heuristic(this.start);
        openSet.push({
            state: this.start,
            path: [],
            g: 0,
            h: startH,
            f: startH
        });

        let iterations = 0;
        const TAKING_TOO_LONG = 5000;

        while (openSet.length > 0) {
            iterations++;
            if (iterations > TAKING_TOO_LONG) return null;

            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            const currentStr = JSON.stringify(current.state);
            if (currentStr === JSON.stringify(this.target)) {
                return current.path;
            }

            closedSet.add(currentStr);

            const emptyIdx = current.state.indexOf(0);
            const neighbors = getNeighbors(emptyIdx);

            for (const nIdx of neighbors) {
                const nextState = [...current.state];
                [nextState[emptyIdx], nextState[nIdx]] = [nextState[nIdx], nextState[emptyIdx]];

                const nextStr = JSON.stringify(nextState);
                if (closedSet.has(nextStr)) continue;

                const gScore = current.g + 1;
                const hScore = this.heuristic(nextState);
                const fScore = gScore + hScore;

                const existing = openSet.find(n => JSON.stringify(n.state) === nextStr);
                if (existing) {
                    if (gScore < existing.g) {
                        existing.g = gScore;
                        existing.f = fScore;
                        existing.path = [...current.path, nIdx];
                    }
                } else {
                    openSet.push({
                        state: nextState,
                        path: [...current.path, nIdx],
                        g: gScore,
                        h: hScore,
                        f: fScore
                    });
                }
            }
        }
        return null; // Should not happen for solvable
    }

    heuristic(state) {
        let total = 0;
        if (this.isAdvanced) {
            for (let i = 0; i < state.length; i++) {
                const val = state[i];
                if (val === 0) continue;
                const targetIdx = this.target.indexOf(val);
                total += this.manhattan(i, targetIdx);
            }
        } else {
            const currentPos = {};
            const targetPos = {};
            state.forEach((v, i) => { if (v !== 0) (currentPos[v] ||= []).push(i) });
            this.target.forEach((v, i) => { if (v !== 0) (targetPos[v] ||= []).push(i) });

            for (const val in currentPos) {
                const sources = currentPos[val];
                const dests = targetPos[val];
                sources.forEach(sIdx => {
                    let minD = Infinity;
                    dests.forEach(dIdx => {
                        const d = this.manhattan(sIdx, dIdx);
                        if (d < minD) minD = d;
                    });
                    total += minD;
                });
            }
        }
        return total;
    }

    manhattan(idx1, idx2) {
        const r1 = Math.floor(idx1 / GRID_SIZE);
        const c1 = idx1 % GRID_SIZE;
        const r2 = Math.floor(idx2 / GRID_SIZE);
        const c2 = idx2 % GRID_SIZE;
        return Math.abs(r1 - r2) + Math.abs(c1 - c2);
    }
}

// --- Features ---

function showHint() {
    if (isSolving || isAutoSolving) return;
    isSolving = true;

    setTimeout(() => {
        const solver = new Solver(currentState, targetState, isAdvancedMode);
        const path = solver.solve();
        isSolving = false;

        if (path && path.length > 0) {
            const nextMoveIndex = path[0];
            highlightTile(nextMoveIndex);
        }
    }, 10);
}

function updateOptimalMoveCount() {
    // If auto-solving, don't spam solver (or do? performance check?)
    // Basic A* is fast enough for <50ms update on 3x3
    const solver = new Solver(currentState, targetState, isAdvancedMode);
    const path = solver.solve();
    if (path) {
        optimalCountEl.textContent = path.length;
    } else {
        optimalCountEl.textContent = "?";
    }
}

function highlightTile(index) {
    clearHint();
    // FIX: Scope search to gameGrid only
    const tile = gameGrid.querySelector(`.tile[data-index="${index}"]`);
    if (tile) {
        tile.classList.add('hint-suggested');
    }
}

function clearHint() {
    const tiles = gameGrid.querySelectorAll('.tile');
    tiles.forEach(t => t.classList.remove('hint-suggested'));
}

// --- Auto-Solve Logic ---

function toggleAutoSolve() {
    if (isAutoSolving) {
        stopAutoSolve();
    } else {
        startAutoSolve();
    }
}

function startAutoSolve() {
    if (JSON.stringify(currentState) === JSON.stringify(targetState)) return;

    isAutoSolving = true;
    solveBtn.textContent = "⏹ Stop";
    solveBtn.classList.remove('btn-highlight');
    solveBtn.classList.add('btn-primary'); // Indicate active/toggle

    executeNextAutoMove();
}

function stopAutoSolve() {
    isAutoSolving = false;
    clearTimeout(autoSolveInterval);
    solveBtn.textContent = "🤖 Play for Me";
    solveBtn.classList.remove('btn-primary');
    solveBtn.classList.add('btn-highlight');
}

function executeNextAutoMove() {
    if (!isAutoSolving) return;

    // 1. Calculate optimal path
    const solver = new Solver(currentState, targetState, isAdvancedMode);
    const path = solver.solve();

    if (path && path.length > 0) {
        const nextMoveIndex = path[0];

        // 2. Perform Move
        performMove(nextMoveIndex);

        // 3. Schedule next move
        autoSolveInterval = setTimeout(executeNextAutoMove, autoSolveSpeed);
    } else {
        // Done or stuck?
        stopAutoSolve();
    }
}

// ==================== Exit Confirmation ====================

// Check if game has been modified (moves made)
window.confirmGameExit = function () {
    // If no moves made, allow immediate navigation
    if (movesTaken === 0) {
        return true;
    }

    // Show confirmation modal
    const modal = document.getElementById('confirm-exit-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    return false;
};

// Set up modal button handlers on load
document.addEventListener('DOMContentLoaded', function () {
    const stayBtn = document.getElementById('confirm-stay-btn');
    const leaveBtn = document.getElementById('confirm-leave-btn');
    const modal = document.getElementById('confirm-exit-modal');
    const homeBtn = document.getElementById('home-btn');

    if (stayBtn) {
        stayBtn.addEventListener('click', function () {
            modal.classList.add('hidden');
        });
    }

    if (leaveBtn && homeBtn) {
        leaveBtn.addEventListener('click', function () {
            window.location.href = homeBtn.href;
        });
    }
});

// Start
init();
