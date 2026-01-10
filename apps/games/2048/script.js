/**
 * 2048 Game Logic with Expectimax Solver
 * Brain Gym Style
 */

const GRID_SIZE = 4;

// --- Seeded Random Number Generator ---
class SeededRandom {
    constructor(seed = Date.now()) {
        this.seed = seed;
        this.current = seed;
    }

    // Linear Congruential Generator (LCG)
    next() {
        this.current = (this.current * 1664525 + 1013904223) % 4294967296;
        return this.current / 4294967296;
    }

    reset() {
        this.current = this.seed;
    }
}

let rng = new SeededRandom();

// --- Game2048 Namespace for Testing ---
const Game2048 = {
    // Set seed for reproducible games
    setSeed: function (seed) {
        rng = new SeededRandom(seed);
    },

    // Get current board state
    getGrid: function () {
        return board.map(row => [...row]);
    },

    // Set board state (for testing)
    setGrid: function (newGrid) {
        board = newGrid.map(row => [...row]);
    },

    // Get current score
    getScore: function () {
        return score;
    },

    // Initialize for testing (without UI)
    init: function (uiRefs) {
        if (uiRefs === null) {
            // Test mode - no UI
            board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
            score = 0;
            gameOver = false;
            gameWon = false;
        }
    },

    // Slide row (exposed for testing)
    slideRow: function (row) {
        let filtered = row.filter(val => val !== 0);
        while (filtered.length < row.length) filtered.push(0);
        return filtered;
    },

    // Combine row (exposed for testing)
    combineRow: function (row) {
        let combined = [...row];
        for (let i = 0; i < combined.length - 1; i++) {
            if (combined[i] !== 0 && combined[i] === combined[i + 1]) {
                combined[i] *= 2;
                combined[i + 1] = 0;
            }
        }
        return combined;
    },

    // Move functions for testing
    moveLeft: function () { return move(3); },
    moveRight: function () { return move(1); },
    moveUp: function () { return move(0); },
    moveDown: function () { return move(2); },

    // Check win condition
    checkWin: function () {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (board[r][c] >= CONF.winScore) return true;
            }
        }
        return false;
    },

    // Check lose condition
    checkLose: function () {
        return checkGameOver();
    },

    // Validate board state (for anti-cheat testing)
    validateBoardState: function () {
        const errors = [];
        const validTiles = [0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072];

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const val = board[r][c];
                if (!validTiles.includes(val)) {
                    errors.push(`Invalid tile value ${val} at position (${r}, ${c})`);
                }
            }
        }
        return errors;
    },

    // Load configuration
    loadConfig: function (config) {
        if (config.settings) {
            if (config.settings.seed !== undefined) {
                this.setSeed(config.settings.seed);
            }
            if (config.settings.prob4 !== undefined) {
                CONF.prob4 = config.settings.prob4;
            }
            if (config.settings.winScore !== undefined) {
                CONF.winScore = config.settings.winScore;
            }
        }
        return true;
    },

    // Run seeded game simulation
    runSeededSimulation: function (seed, moves) {
        this.setSeed(seed);
        this.init(null);
        addRandomTile();
        addRandomTile();

        const results = [];
        for (const dir of moves) {
            const moved = move(dir);
            if (moved) {
                addRandomTile();
            }
            results.push({
                board: this.getGrid(),
                score: score,
                moved: moved
            });
        }
        return results;
    }
};

// --- Config ---
const CONF = {
    prob4: 0.1,    // Probability of spawning a 4 (vs 2)
    winScore: 2048
};

// --- DOM Elements ---
const gridContainer = document.getElementById('grid-container');
const scoreEl = document.getElementById('score-value');
const bestEl = document.getElementById('best-value');
const gameMsg = document.getElementById('game-message');
const newGameBtn = document.getElementById('new-game-btn');
const hintBtn = document.getElementById('hint-btn');
const solveBtn = document.getElementById('solve-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const themePicker = document.getElementById('theme-picker');
const algoPicker = document.getElementById('algo-picker');
const speedRange = document.getElementById('speed-range');

// --- State ---
let board = [];
let score = 0;
let bestScore = localStorage.getItem('2048-best') || 0;
let gameOver = false;
let gameWon = false;
let autoPlayInterval = null;
let isAutoPlaying = false;
let autoSpeed = 200; // ms

// --- Initialization ---

function init() {
    bestEl.textContent = bestScore;
    setupInputs();
    setupSettings();
    startNewGame();
}

function startNewGame() {
    stopAutoPlay();
    board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    gameOver = false;
    gameWon = false;
    updateScore(0);
    gameMsg.classList.add('hidden');

    // Add two starting tiles
    addRandomTile();
    addRandomTile();

    render();
}

function setupInputs() {
    // Keyboard
    document.addEventListener('keydown', handleInput);

    // Buttons
    newGameBtn.addEventListener('click', startNewGame);
    hintBtn.addEventListener('click', showHint);
    solveBtn.addEventListener('click', toggleAutoPlay);

    // Touch (Swipe)
    let touchStartX = 0;
    let touchStartY = 0;

    gridContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        e.preventDefault(); // Prevent scroll
    }, { passive: false });

    gridContainer.addEventListener('touchend', (e) => {
        let touchEndX = e.changedTouches[0].screenX;
        let touchEndY = e.changedTouches[0].screenY;
        handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    }, { passive: false });
}

function setupSettings() {
    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });

    themePicker.addEventListener('change', (e) => {
        document.body.setAttribute('data-theme', e.target.value);
    });

    speedRange.addEventListener('input', (e) => {
        // Range 50 (Slow) to 500 (Fast) -> Invert logic for delay?
        // Let's make Slider Right = Faster (Lower Delay)
        // Value 500 = 50ms delay. Value 50 = 500ms delay.
        autoSpeed = 550 - parseInt(e.target.value);
    });

    // Algorithm selection
    if (algoPicker) {
        algoPicker.addEventListener('change', (e) => {
            ALGORITHM_CONFIG.current = e.target.value;
            console.log('Algorithm switched to:', e.target.value);
        });
    }
}

// --- Game Logic ---

function handleInput(e) {
    if (gameOver) return;

    // 0: Up, 1: Right, 2: Down, 3: Left
    let moved = false;

    switch (e.key) {
        case 'ArrowUp': moved = move(0); break;
        case 'ArrowRight': moved = move(1); break;
        case 'ArrowDown': moved = move(2); break;
        case 'ArrowLeft': moved = move(3); break;
        default: return;
    }

    if (moved) {
        stopAutoPlay(); // Stop if user interrupts
        afterMove();
    }
}

function handleSwipe(x1, y1, x2, y2) {
    if (gameOver) return;
    let dx = x2 - x1;
    let dy = y2 - y1;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; // Tap?

    let moved = false;
    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal
        if (dx > 0) moved = move(1); // Right
        else moved = move(3); // Left
    } else {
        // Vertical
        if (dy > 0) moved = move(2); // Down
        else moved = move(0); // Up
    }

    if (moved) {
        stopAutoPlay();
        afterMove();
    }
}

function afterMove() {
    addRandomTile();
    render();

    if (checkGameOver()) {
        gameOver = true;
        alert("Game Over!");
        stopAutoPlay();
    }
}

// --- Core Mechanics ---

// Direction: 0:Up, 1:Right, 2:Down, 3:Left
function move(direction) {
    // Clone board to check logic
    let rotated = rotateBoard(board, direction);
    let result = slideLeft(rotated);
    let newBoard = rotateBoard(result.board, (4 - direction) % 4); // Rotate back

    if (JSON.stringify(board) !== JSON.stringify(newBoard)) {
        board = newBoard;
        updateScore(score + result.score);
        return true; // Moved
    }
    return false;
}

// Helper: Slide row left
function slideLeft(grid) {
    let gainedScore = 0;
    let newGrid = grid.map(row => {
        // Filter non-zeros
        let filtered = row.filter(val => val !== 0);
        let merged = [];
        for (let i = 0; i < filtered.length; i++) {
            if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                merged.push(filtered[i] * 2);
                gainedScore += filtered[i] * 2;
                i++; // Skip next
            } else {
                merged.push(filtered[i]);
            }
        }
        // Pad with zeros
        while (merged.length < GRID_SIZE) merged.push(0);
        return merged;
    });
    return { board: newGrid, score: gainedScore };
}

// Helper: Rotate board (to standardize everything to "Slide Left")
function rotateBoard(grid, rotations) {
    let newGrid = copyGrid(grid);
    for (let r = 0; r < rotations; r++) {
        // Transpose + Reverse Row = 90deg Clockwise ??
        // Actually simpler: 
        // 0 (Up) -> Need to rotate so Up becomes Left (270 deg / -1)
        // Wait, standard strategy:
        // Move Left: No rotate
        // Move Right: Rotate 180? No.

        // Let's implement standardized rotation to simplify sliding:
        // Input is Direction. We want to align that direction to "Left".
        // Up (0) -> Rotate 270 (or -90)
        // Right (1) -> Rotate 180
        // Down (2) -> Rotate 90
        // Left (3) -> 0

        // This helper just rotates 90 deg clockwise N times.
        // We handle the N in the caller.
        newGrid = newGrid[0].map((val, index) => newGrid.map(row => row[index]).reverse());
    }
    return newGrid;
}
// Correction: To use `slideLeft` logic for all directions:
// Left (3): Rotate 0
// Down (2): Rotate 1 (90 deg) -> Now Down is pointing Left? No.
// If we rotate 90 deg clockwise: Top row becomes Right col. Left col becomes Top row.
// Sliding Left on rotated board = Sliding Up on original.
// So:
// Up (0): Rotate 3 times (270) -> Top becomes Left.
// Right (1): Rotate 2 times (180).
// Down (2): Rotate 1 time (90).
// Left (3): Rotate 0.
// BUT my move function uses `rotateBoard(board, direction)`. 
// If direction is 0 (Up), I pass 0? No.
// Let's fix loop in `rotateBoard`: it rotates 90deg CW `rotations` times.
// UP (0): We want to slide UP. If we rotate 270 (3 times), top becomes left. Slide left. Rotate 90 (1 time) to restore.
// RIGHT (1): Rotate 180 (2 times). Slide Left. Rotate 180 (2).
// DOWN (2): Rotate 90 (1 time). Slide Left. Rotate 270 (3).
// LEFT (3): Rotate 0. 

// My previous switch was standard Up/Right/Down/Left.
// Let's map those 0,1,2,3 to needed rotations.
// Direction Enum: 0=Up, 1=Right, 2=Down, 3=Left.
// Rotations needed to make "Direction" point "Left":
// Up(0) -> Needs 3 (270). 
// Right(1) -> Needs 2 (180).
// Down(2) -> Needs 1 (90).
// Left(3) -> Needs 0.
// So: rotations = (4 - direction + 3) % 4 ??
// Let's simpler:
// if dir=0 (Up), rot=3.
// if dir=1 (Right), rot=2.
// if dir=2 (Down), rot=1.
// if dir=3 (Left), rot=0.
// Formula: (3 - direction + 4) % 4 ?
// 3-0 = 3. 3-1=2. 3-2=1. 3-3=0. Yes.
// Let's update `move` logic slightly to be safe.

function move(direction) {
    // 0:Up, 1:Right, 2:Down, 3:Left
    // Map to rotations needed for "Slide Left"
    // Up needs 3 (270), Right needs 2, Down needs 1, Left needs 0.
    // However, JS array mapping is tricky. Let's stick to standard loop logic if unsafe, 
    // OR verify rotation.
    // Rotate 90 CW: (x,y) -> (y, 3-x).

    // Let's use specific rotation counts based on direction ID
    let rots = 0;
    if (direction === 0) rots = 3;
    if (direction === 1) rots = 2;
    if (direction === 2) rots = 1;
    if (direction === 3) rots = 0;

    let rotated = rotateBoard(board, rots);
    let result = slideLeft(rotated);
    let newBoard = rotateBoard(result.board, (4 - rots) % 4); // Rotate back

    if (JSON.stringify(board) !== JSON.stringify(newBoard)) {
        board = newBoard;
        updateScore(score + result.score);
        return true;
    }
    return false;
}

function addRandomTile() {
    let empty = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === 0) empty.push({ r, c });
        }
    }
    if (empty.length > 0) {
        // Use seeded RNG for reproducible testing
        let spot = empty[Math.floor(rng.next() * empty.length)];
        board[spot.r][spot.c] = rng.next() < CONF.prob4 ? 4 : 2;
    }
}

function checkGameOver() {
    // 1. Check empty
    for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) if (board[r][c] === 0) return false;

    // 2. Check merges
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            let val = board[r][c];
            if (c + 1 < GRID_SIZE && board[r][c + 1] === val) return false;
            if (r + 1 < GRID_SIZE && board[r + 1][c] === val) return false;
        }
    }
    return true;
}

function updateScore(newScore) {
    score = newScore;
    // Only update DOM elements if they exist (allows testing without UI)
    if (scoreEl) scoreEl.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        if (bestEl) bestEl.textContent = bestScore;
        try {
            localStorage.setItem('2048-best', bestScore);
        } catch (e) { } // Handle localStorage errors gracefully
    }
}

// --- Render ---
function render() {
    gridContainer.innerHTML = '';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            let val = board[r][c];
            let tile = document.createElement('div');
            tile.className = 'tile';
            if (val > 0) {
                tile.textContent = val;
                tile.setAttribute('data-val', val);
            }
            gridContainer.appendChild(tile);
        }
    }

    // Update active hint if any
    gridContainer.classList.remove('hint-active');
}

function copyGrid(grid) {
    return grid.map(row => [...row]);
}


// --- AI Solver (Expectimax) ---

function showHint() {
    // Simple: Best next move
    let bestMove = getBestMove(board, 3); // Depth 3
    if (bestMove !== -1) {
        alert("Try moving " + getDirName(bestMove));
    } else {
        alert("No moves?");
    }
}

function toggleAutoPlay() {
    if (isAutoPlaying) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

function startAutoPlay() {
    if (isAutoPlaying || gameOver) return;
    isAutoPlaying = true;
    solveBtn.textContent = "⏹ Stop";
    solveBtn.classList.remove('btn-highlight');
    solveBtn.classList.add('btn-secondary');

    playNextMove();
}

function stopAutoPlay() {
    isAutoPlaying = false;
    clearTimeout(autoPlayInterval);
    solveBtn.textContent = "🤖 Play for Me";
    solveBtn.classList.remove('btn-secondary');
    solveBtn.classList.add('btn-highlight');
}

function playNextMove() {
    if (!isAutoPlaying || gameOver) return;

    let bestMove = getBestMoveUnified(board); // Uses selected algorithm
    if (bestMove !== -1) {
        move(bestMove);
        afterMove(); // This handles addRandomTile and render
        autoPlayInterval = setTimeout(playNextMove, autoSpeed);
    } else {
        stopAutoPlay(); // Stuck
    }
}

function getDirName(dir) {
    return ['UP', 'RIGHT', 'DOWN', 'LEFT'][dir];
}

// --- Expectimax Logic ---
// We need to simulate moves.
// Max Node: Player moves (Up, Right, Down, Left). Maximize Score.
// Chance Node: Computer adds random tile (2 or 4) at random spot. Average Score.

function getBestMove(grid, depth) {
    let bestScore = -Infinity;
    let bestMove = -1;

    // Try all 4 moves
    for (let dir = 0; dir < 4; dir++) {
        let sim = simulateMove(grid, dir);
        if (sim.moved) {
            let score = expectimax(sim.board, depth - 1, false); // Next is Chance
            if (score > bestScore) {
                bestScore = score;
                bestMove = dir;
            }
        }
    }
    return bestMove;
}

function expectimax(grid, depth, isPlayer) {
    if (depth === 0) return evaluateGrid(grid);

    if (isPlayer) {
        let bestScore = -Infinity;
        let anyMove = false;
        for (let dir = 0; dir < 4; dir++) {
            let sim = simulateMove(grid, dir);
            if (sim.moved) {
                anyMove = true;
                let score = expectimax(sim.board, depth - 1, false);
                if (score > bestScore) bestScore = score;
            }
        }
        return anyMove ? bestScore : -999999; // Loss
    } else {
        // Chance Node
        let empty = getEmptySpots(grid);
        if (empty.length === 0) return evaluateGrid(grid);

        let avgScore = 0;
        let totalWeight = 0;

        // Optimization: Don't check ALL empty spots if too many. Sample?
        // For accurate 2048 AI,checking all is better but slow.
        // Let's check all (Standard logic).
        empty.forEach(spot => {
            // Spawn 2 (0.9 prob)
            let grid2 = copyGrid(grid);
            grid2[spot.r][spot.c] = 2;
            let score2 = expectimax(grid2, depth - 1, true);
            avgScore += score2 * 0.9;

            // Spawn 4 (0.1 prob)
            let grid4 = copyGrid(grid);
            grid4[spot.r][spot.c] = 4;
            let score4 = expectimax(grid4, depth - 1, true);
            avgScore += score4 * 0.1;

            totalWeight += 1;
        });

        return avgScore / totalWeight;
    }
}

function simulateMove(grid, direction) {
    let rots = 0;
    if (direction === 0) rots = 3;
    if (direction === 1) rots = 2;
    if (direction === 2) rots = 1;
    if (direction === 3) rots = 0;

    let rotated = rotateBoard(grid, rots);
    let result = slideLeft(rotated);
    let newBoard = rotateBoard(result.board, (4 - rots) % 4);

    // Check if changed
    let changed = JSON.stringify(grid) !== JSON.stringify(newBoard);
    return { board: newBoard, moved: changed, score: result.score };
}

function getEmptySpots(grid) {
    let spots = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
            if (grid[r][c] === 0) spots.push({ r, c });
        }
    }
    return spots;
}

// ===================================
// Algorithm Configuration
// ===================================
const ALGORITHM_CONFIG = {
    current: 'expectimax', // 'expectimax', 'mcts', 'greedy'
    expectimax: {
        baseDepth: 3,
        adaptiveDepth: true
    },
    mcts: {
        simulations: 100,
        maxDepth: 50
    },
    // Heuristic weights for Expectimax
    weights: {
        position: 1.0,      // Snake pattern weight
        monotonicity: 1.5,  // Monotonicity bonus
        smoothness: 0.5,    // Smoothness bonus
        emptyCells: 2.7     // Empty cell bonus
    }
};

// Expose algorithm config for testing
if (typeof Game2048 !== 'undefined') {
    Game2048.getAlgorithmConfig = function () { return ALGORITHM_CONFIG; };
    Game2048.setAlgorithm = function (algo) { ALGORITHM_CONFIG.current = algo; };
}

// ===================================
// Heuristics
// ===================================

// Snake pattern weight matrix (corner strategy)
const WEIGHT_MATRIX = [
    [65536, 32768, 16384, 8192],
    [512, 1024, 2048, 4096],
    [256, 128, 64, 32],
    [2, 4, 8, 16]
];

// Position-based score (snake pattern)
function positionScore(grid) {
    let score = 0;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            score += grid[r][c] * WEIGHT_MATRIX[r][c];
        }
    }
    return score;
}

// Monotonicity: Reward boards where tiles are ordered
// Higher score = more monotonic (tiles increasing/decreasing consistently)
function monotonicity(grid) {
    let totals = [0, 0, 0, 0]; // up, down, left, right

    // Check rows (left-right monotonicity)
    for (let r = 0; r < 4; r++) {
        let current = 0;
        let next = current + 1;
        while (next < 4) {
            while (next < 4 && grid[r][next] === 0) next++;
            if (next >= 4) break;

            let currentValue = grid[r][current] !== 0 ? Math.log2(grid[r][current]) : 0;
            let nextValue = grid[r][next] !== 0 ? Math.log2(grid[r][next]) : 0;

            if (currentValue > nextValue) {
                totals[0] += nextValue - currentValue; // Left monotonicity
            } else if (nextValue > currentValue) {
                totals[1] += currentValue - nextValue; // Right monotonicity
            }
            current = next;
            next++;
        }
    }

    // Check columns (up-down monotonicity)
    for (let c = 0; c < 4; c++) {
        let current = 0;
        let next = current + 1;
        while (next < 4) {
            while (next < 4 && grid[next][c] === 0) next++;
            if (next >= 4) break;

            let currentValue = grid[current][c] !== 0 ? Math.log2(grid[current][c]) : 0;
            let nextValue = grid[next][c] !== 0 ? Math.log2(grid[next][c]) : 0;

            if (currentValue > nextValue) {
                totals[2] += nextValue - currentValue; // Up monotonicity
            } else if (nextValue > currentValue) {
                totals[3] += currentValue - nextValue; // Down monotonicity
            }
            current = next;
            next++;
        }
    }

    return Math.max(totals[0], totals[1]) + Math.max(totals[2], totals[3]);
}

// Smoothness: Penalize large differences between adjacent tiles
// Lower penalty = smoother board = easier merges
function smoothness(grid) {
    let smoothness = 0;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] !== 0) {
                let value = Math.log2(grid[r][c]);
                // Check right neighbor
                for (let c2 = c + 1; c2 < 4; c2++) {
                    if (grid[r][c2] !== 0) {
                        smoothness -= Math.abs(value - Math.log2(grid[r][c2]));
                        break;
                    }
                }
                // Check down neighbor
                for (let r2 = r + 1; r2 < 4; r2++) {
                    if (grid[r2][c] !== 0) {
                        smoothness -= Math.abs(value - Math.log2(grid[r2][c]));
                        break;
                    }
                }
            }
        }
    }
    return smoothness;
}

// Empty cells bonus: More space = more options
function emptyCellsScore(grid) {
    let count = 0;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) count++;
        }
    }
    return count;
}

// Max tile value (for tiebreaking)
function maxTileValue(grid) {
    let max = 0;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] > max) max = grid[r][c];
        }
    }
    return max;
}

// Combined evaluation function
function evaluateGrid(grid) {
    const w = ALGORITHM_CONFIG.weights;

    let score = 0;
    score += positionScore(grid) * w.position;
    score += monotonicity(grid) * w.monotonicity * 10000;
    score += smoothness(grid) * w.smoothness * 1000;
    score += emptyCellsScore(grid) * w.emptyCells * 10000;

    return score;
}

// Adaptive depth based on board state
function getAdaptiveDepth(grid) {
    if (!ALGORITHM_CONFIG.expectimax.adaptiveDepth) {
        return ALGORITHM_CONFIG.expectimax.baseDepth;
    }

    const empty = getEmptySpots(grid).length;
    const maxTile = maxTileValue(grid);

    // Increase depth in critical situations
    if (empty <= 2) return 5;
    if (empty <= 4 && maxTile >= 512) return 4;
    return ALGORITHM_CONFIG.expectimax.baseDepth;
}

// ===================================
// Monte Carlo Tree Search (MCTS)
// ===================================

// Simulate a random game from the current state
function simulateRandomGame(grid, firstMove) {
    let simGrid = copyGrid(grid);
    let simScore = 0;

    // Apply first move
    let result = simulateMove(simGrid, firstMove);
    if (!result.moved) return -1; // Invalid first move

    simGrid = result.board;
    simScore += result.score;

    // Add random tile
    let empty = getEmptySpots(simGrid);
    if (empty.length > 0) {
        let spot = empty[Math.floor(Math.random() * empty.length)];
        simGrid[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
    }

    // Play random moves until game over or max depth
    for (let i = 0; i < ALGORITHM_CONFIG.mcts.maxDepth; i++) {
        // Try random moves
        let moves = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
        let moved = false;

        for (let move of moves) {
            result = simulateMove(simGrid, move);
            if (result.moved) {
                simGrid = result.board;
                simScore += result.score;
                moved = true;

                // Add random tile
                empty = getEmptySpots(simGrid);
                if (empty.length > 0) {
                    let spot = empty[Math.floor(Math.random() * empty.length)];
                    simGrid[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
                }
                break;
            }
        }

        if (!moved) break; // Game over
    }

    return simScore + evaluateGrid(simGrid) * 0.001;
}

// Get best move using MCTS
function getMCTSMove(grid) {
    const moves = [0, 1, 2, 3];
    const scores = [0, 0, 0, 0];
    const counts = [0, 0, 0, 0];

    const simulations = ALGORITHM_CONFIG.mcts.simulations;

    for (let i = 0; i < simulations; i++) {
        const move = i % 4; // Distribute simulations evenly
        const score = simulateRandomGame(grid, move);

        if (score >= 0) {
            scores[move] += score;
            counts[move]++;
        }
    }

    // Find best average score
    let bestMove = -1;
    let bestAvg = -Infinity;

    for (let m = 0; m < 4; m++) {
        if (counts[m] > 0) {
            const avg = scores[m] / counts[m];
            if (avg > bestAvg) {
                bestAvg = avg;
                bestMove = m;
            }
        }
    }

    return bestMove;
}

// Get best move using Greedy (immediate score only)
function getGreedyMove(grid) {
    let bestMove = -1;
    let bestScore = -Infinity;

    for (let dir = 0; dir < 4; dir++) {
        let sim = simulateMove(grid, dir);
        if (sim.moved) {
            let score = sim.score + evaluateGrid(sim.board);
            if (score > bestScore) {
                bestScore = score;
                bestMove = dir;
            }
        }
    }

    return bestMove;
}

// Unified move selection based on current algorithm
function getBestMoveUnified(grid) {
    switch (ALGORITHM_CONFIG.current) {
        case 'mcts':
            return getMCTSMove(grid);
        case 'greedy':
            return getGreedyMove(grid);
        case 'expectimax':
        default:
            const depth = getAdaptiveDepth(grid);
            return getBestMove(grid, depth);
    }
}

// ===================================
// Algorithm Runtime Dashboard
// ===================================

const DashboardStats = {
    totalMoves: 0,
    totalTimeMs: 0,
    lastTimeMs: 0,
    lastScores: { up: 0, right: 0, down: 0, left: 0 },
    lastHeuristics: { position: 0, monotonicity: 0, smoothness: 0, emptyCells: 0 },
    lastDepth: 3,
    lastDecision: -1,
    confidence: 0
};

// DOM Elements for Dashboard
const dashboardPanel = document.getElementById('algo-dashboard');
const dashboardToggle = document.getElementById('dashboard-toggle');
const closeDashboard = document.getElementById('close-dashboard');

// Initialize Dashboard
function initDashboard() {
    if (!dashboardToggle || !dashboardPanel) return;

    dashboardToggle.addEventListener('click', toggleDashboard);
    closeDashboard.addEventListener('click', () => {
        dashboardPanel.classList.add('hidden');
        dashboardToggle.classList.remove('active');
    });
}

function toggleDashboard() {
    if (!dashboardPanel) return;

    dashboardPanel.classList.toggle('hidden');
    dashboardToggle.classList.toggle('active');

    // Update display when opened
    if (!dashboardPanel.classList.contains('hidden')) {
        updateDashboardAlgorithm();
        updateDashboardStats();
    }
}

function updateDashboardAlgorithm() {
    const algoIndicator = document.getElementById('algo-indicator');
    if (!algoIndicator) return;

    const icons = { expectimax: '🧠', mcts: '🎲', greedy: '⚡' };
    const names = { expectimax: 'Expectimax', mcts: 'Monte Carlo', greedy: 'Greedy' };

    const icon = algoIndicator.querySelector('.algo-icon');
    const name = algoIndicator.querySelector('.algo-name');

    if (icon) icon.textContent = icons[ALGORITHM_CONFIG.current] || '🧠';
    if (name) name.textContent = names[ALGORITHM_CONFIG.current] || 'Expectimax';

    // Show/hide algorithm-specific sections
    document.querySelectorAll('.algo-specific').forEach(el => el.classList.add('hidden'));

    if (ALGORITHM_CONFIG.current === 'expectimax') {
        const expSection = document.querySelector('.expectimax-section');
        if (expSection) expSection.classList.remove('hidden');
    } else if (ALGORITHM_CONFIG.current === 'mcts') {
        const mctsSection = document.querySelector('.mcts-section');
        if (mctsSection) mctsSection.classList.remove('hidden');
    } else if (ALGORITHM_CONFIG.current === 'greedy') {
        const greedySection = document.querySelector('.greedy-section');
        if (greedySection) greedySection.classList.remove('hidden');
    }
}

function updateDashboardStats() {
    // Quick stats
    const movesEl = document.getElementById('dash-moves');
    const avgTimeEl = document.getElementById('dash-avg-time');
    const lastTimeEl = document.getElementById('dash-last-time');

    if (movesEl) movesEl.textContent = DashboardStats.totalMoves;
    if (avgTimeEl) {
        const avg = DashboardStats.totalMoves > 0
            ? Math.round(DashboardStats.totalTimeMs / DashboardStats.totalMoves)
            : 0;
        avgTimeEl.textContent = avg + 'ms';
    }
    if (lastTimeEl) lastTimeEl.textContent = DashboardStats.lastTimeMs + 'ms';
}

function updateMoveScores(scores, bestDir) {
    const dirs = ['up', 'right', 'down', 'left'];
    const dirNames = { 0: 'up', 1: 'right', 2: 'down', 3: 'left' };

    // Find max score for normalization
    const maxScore = Math.max(...Object.values(scores).filter(s => s !== null && s !== undefined), 1);

    dirs.forEach((dir, idx) => {
        const row = document.getElementById('move-' + dir);
        if (!row) return;

        const bar = row.querySelector('.move-bar');
        const scoreEl = row.querySelector('.move-score');
        const score = scores[dir] || 0;

        // Update bar width
        if (bar) {
            const pct = score > 0 ? Math.round((score / maxScore) * 100) : 0;
            bar.style.width = pct + '%';
        }

        // Update score text
        if (scoreEl) {
            if (score <= 0) {
                scoreEl.textContent = '-';
            } else if (score > 1000000) {
                scoreEl.textContent = (score / 1000000).toFixed(1) + 'M';
            } else if (score > 1000) {
                scoreEl.textContent = (score / 1000).toFixed(1) + 'K';
            } else {
                scoreEl.textContent = Math.round(score);
            }
        }

        // Highlight best move
        if (idx === bestDir) {
            row.classList.add('best-move');
        } else {
            row.classList.remove('best-move');
        }
    });
}

function updateHeuristics(grid) {
    const pos = positionScore(grid);
    const mono = monotonicity(grid);
    const smooth = smoothness(grid);
    const empty = emptyCellsScore(grid);

    const posEl = document.getElementById('heur-position');
    const monoEl = document.getElementById('heur-mono');
    const smoothEl = document.getElementById('heur-smooth');
    const emptyEl = document.getElementById('heur-empty');

    if (posEl) posEl.textContent = formatNumber(pos);
    if (monoEl) {
        monoEl.textContent = formatNumber(mono);
        monoEl.classList.toggle('negative', mono < 0);
    }
    if (smoothEl) {
        smoothEl.textContent = formatNumber(smooth);
        smoothEl.classList.toggle('negative', smooth < 0);
    }
    if (emptyEl) emptyEl.textContent = empty;
}

function updateDepthDisplay(depth, isAdaptive) {
    const depthEl = document.getElementById('search-depth');
    const adaptiveEl = document.getElementById('depth-adaptive');

    if (depthEl) depthEl.textContent = depth;
    if (adaptiveEl) {
        if (isAdaptive && depth > ALGORITHM_CONFIG.expectimax.baseDepth) {
            adaptiveEl.classList.remove('hidden');
        } else {
            adaptiveEl.classList.add('hidden');
        }
    }
}

function updateDecision(dir, confidence) {
    const dirNames = ['⬆️ UP', '➡️ RIGHT', '⬇️ DOWN', '⬅️ LEFT'];
    const moveEl = document.getElementById('decision-move');
    const confEl = document.getElementById('decision-confidence');

    if (moveEl) moveEl.textContent = dir >= 0 ? dirNames[dir] : '-';
    if (confEl) {
        if (confidence > 0) {
            confEl.textContent = Math.round(confidence * 100) + '%';
        } else {
            confEl.textContent = '-';
        }
    }
}

function formatNumber(num) {
    if (num === undefined || num === null) return '-';
    if (Math.abs(num) > 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (Math.abs(num) > 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
}

// Enhanced getBestMoveWithStats for dashboard
function getBestMoveWithStats(grid) {
    const startTime = performance.now();
    let bestDir = -1;
    let scores = { up: 0, right: 0, down: 0, left: 0 };
    let confidence = 0;
    let depth = ALGORITHM_CONFIG.expectimax.baseDepth;

    if (ALGORITHM_CONFIG.current === 'expectimax') {
        depth = getAdaptiveDepth(grid);

        // Calculate scores for all directions
        const dirScores = [];
        for (let dir = 0; dir < 4; dir++) {
            let sim = simulateMove(grid, dir);
            if (sim.moved) {
                let score = expectimax(sim.board, depth - 1, false);
                dirScores.push({ dir, score });
                scores[['up', 'right', 'down', 'left'][dir]] = score;
            } else {
                dirScores.push({ dir, score: -Infinity });
            }
        }

        // Find best
        dirScores.sort((a, b) => b.score - a.score);
        bestDir = dirScores[0].score > -Infinity ? dirScores[0].dir : -1;

        // Calculate confidence (how much better than second best)
        if (dirScores[0].score > -Infinity && dirScores[1].score > -Infinity) {
            const ratio = dirScores[0].score / Math.max(1, dirScores[1].score);
            confidence = Math.min(1, (ratio - 1) * 0.5 + 0.5);
        } else {
            confidence = 1;
        }

    } else if (ALGORITHM_CONFIG.current === 'mcts') {
        // MCTS with score tracking
        const moves = [0, 1, 2, 3];
        const simScores = [0, 0, 0, 0];
        const counts = [0, 0, 0, 0];
        const simulations = ALGORITHM_CONFIG.mcts.simulations;

        for (let i = 0; i < simulations; i++) {
            const move = i % 4;
            const score = simulateRandomGame(grid, move);

            if (score >= 0) {
                simScores[move] += score;
                counts[move]++;
            }
        }

        let bestAvg = -Infinity;
        for (let m = 0; m < 4; m++) {
            if (counts[m] > 0) {
                const avg = simScores[m] / counts[m];
                scores[['up', 'right', 'down', 'left'][m]] = avg;
                if (avg > bestAvg) {
                    bestAvg = avg;
                    bestDir = m;
                }
            }
        }

        // Calculate confidence from win rates
        const totalCounts = counts.reduce((a, b) => a + b, 0);
        if (totalCounts > 0 && bestDir >= 0) {
            confidence = counts[bestDir] / (simulations / 4);
        }

    } else if (ALGORITHM_CONFIG.current === 'greedy') {
        for (let dir = 0; dir < 4; dir++) {
            let sim = simulateMove(grid, dir);
            if (sim.moved) {
                let score = sim.score + evaluateGrid(sim.board);
                scores[['up', 'right', 'down', 'left'][dir]] = score;
                if (bestDir === -1 || score > scores[['up', 'right', 'down', 'left'][bestDir]]) {
                    bestDir = dir;
                }
            }
        }
        confidence = 1; // Greedy is always certain
    }

    const endTime = performance.now();
    const elapsedMs = Math.round(endTime - startTime);

    // Update stats
    DashboardStats.totalMoves++;
    DashboardStats.totalTimeMs += elapsedMs;
    DashboardStats.lastTimeMs = elapsedMs;
    DashboardStats.lastScores = scores;
    DashboardStats.lastDepth = depth;
    DashboardStats.lastDecision = bestDir;
    DashboardStats.confidence = confidence;

    // Update dashboard if visible
    if (dashboardPanel && !dashboardPanel.classList.contains('hidden')) {
        updateDashboardStats();
        updateMoveScores(scores, bestDir);
        updateHeuristics(grid);
        updateDepthDisplay(depth, depth > ALGORITHM_CONFIG.expectimax.baseDepth);
        updateDecision(bestDir, confidence);
    }

    return {
        direction: bestDir,
        stats: {
            scores,
            depth,
            confidence,
            timeMs: elapsedMs
        }
    };
}

// Override playNextMove to use stats version
function playNextMoveWithDashboard() {
    if (!isAutoPlaying || gameOver) return;

    const result = getBestMoveWithStats(board);
    if (result.direction !== -1) {
        move(result.direction);
        afterMove();
        autoPlayInterval = setTimeout(playNextMoveWithDashboard, autoSpeed);
    } else {
        stopAutoPlay();
    }
}

// Update startAutoPlay to use dashboard version
const originalStartAutoPlay = startAutoPlay;
startAutoPlay = function () {
    if (isAutoPlaying || gameOver) return;
    isAutoPlaying = true;
    solveBtn.textContent = "⏹ Stop";
    solveBtn.classList.remove('btn-highlight');
    solveBtn.classList.add('btn-secondary');

    // Update dashboard algorithm display when starting
    updateDashboardAlgorithm();

    playNextMoveWithDashboard();
};

// Start
initDashboard();
init();
