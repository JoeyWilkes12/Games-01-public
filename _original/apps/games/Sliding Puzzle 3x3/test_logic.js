/**
 * Test Logic for Sliding Puzzle
 */

const output = document.getElementById('results');

function log(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = 'log ' + type;
    div.textContent = msg;
    output.appendChild(div);
}

function assert(condition, desc) {
    if (condition) {
        log(`[PASS] ${desc}`, 'pass');
    } else {
        log(`[FAIL] ${desc}`, 'fail');
    }
}

// === Utils ===
function factorial(n) {
    if (n === 0) return 1;
    return n * factorial(n - 1);
}

function getPermutationCount(counts) {
    // counts: object map of item -> quantity
    // Total n! / (p1! * p2! ...)
    let total = Object.values(counts).reduce((a, b) => a + b, 0);
    let denominator = Object.values(counts).reduce((a, b) => a * factorial(b), 1);
    return factorial(total) / denominator;
}

// === BFS Solver / Explorer ===
function getNeighbors(index, size) {
    const row = Math.floor(index / size);
    const col = index % size;
    const neighbors = [];
    if (row > 0) neighbors.push(index - size);
    if (row < size - 1) neighbors.push(index + size);
    if (col > 0) neighbors.push(index - 1);
    if (col < size - 1) neighbors.push(index + 1);
    return neighbors;
}

function exploreStateSpace(startState) {
    const queue = [startState];
    const visited = new Set();
    visited.add(JSON.stringify(startState));

    let count = 0;

    // Safety break for large spaces (though 22k is manageable in modern JS engine)
    const MAX_ITER = 50000;

    while (queue.length > 0) {
        const u = queue.shift();
        count++;

        if (count > MAX_ITER) {
            log('BFS hit max iterations!');
            break;
        }

        const emptyIdx = u.indexOf(0);
        const neighbors = getNeighbors(emptyIdx, 3);

        for (const nIdx of neighbors) {
            // Swap
            const v = [...u];
            [v[emptyIdx], v[nIdx]] = [v[nIdx], v[emptyIdx]];

            const vStr = JSON.stringify(v);
            if (!visited.has(vStr)) {
                visited.add(vStr);
                queue.push(v);
            }
        }
    }
    return count;
}


// === TEST 1: Unique Tiles (1-8, 0) - Theoretical Reachability ===
// For unique tiles, only N!/2 states should be reachable (Even permutations).
function testUniqueTilesReachability() {
    log('--- Test 1: Unique Tiles (0-8) Reachability ---');
    // 3x3 puzzle logic.
    // Testing a smaller 2x3 grid or similar might be faster, but let's try strict logic check?
    // Actually, full 3x3 BFS (9!/2 = 181,440) might take a few seconds in browser.
    // Let's rely on Parity Check for unique.

    // Create an unsolvable state by swapping last two tiles
    // Solvable: 1 2 3 4 5 6 7 8 0
    // Unsolvable: 1 2 3 4 5 6 8 7 0 (One swap)

    const solvable = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const unsolvable = [1, 2, 3, 4, 5, 6, 8, 7, 0];

    assert(isSolvableUnique(solvable), 'Standard state should be solvable');
    assert(!isSolvableUnique(unsolvable), 'Swapped state should be UNSOLVABLE (Parity Check)');
}

function isSolvableUnique(state) {
    // Count inversions
    let inversions = 0;
    const array = state.filter(x => x !== 0); // Flatten
    for (let i = 0; i < array.length; i++) {
        for (let j = i + 1; j < array.length; j++) {
            if (array[i] > array[j]) inversions++;
        }
    }

    // Manhattan distance of empty tile? 
    // For 3x3 (width is odd), solvability is just inversion parity % 2 == 0?
    // (Assuming target is 1..8 sorted).
    // Yes, for odd width, invariants is just inversion count evenness.
    return (inversions % 2 === 0);
}


// === TEST 2: Duplicate Tiles - Full Reachability ===
// Prove that with current game config (duplicates), ALL permutations are reachable.
// Game config: [1,1, 2,2, 3,3, 4,4, 0]
// Total permutations = 9! / (2! * 2! * 2! * 2! * 1!) = 362,880 / 16 = 22,680.
// This is small enough to BFS in < 1 second.
function testDuplicateTilesFullReachability() {
    log('--- Test 2: Duplicate Tiles Full Reachability ---');

    const startState = [1, 1, 2, 2, 3, 3, 4, 4, 0];

    // Theoretical Max
    const expected = 22680;

    log(`Starting BFS exploration for state [${startState}]...`);
    const startTime = performance.now();
    const reachableCount = exploreStateSpace(startState);
    const endTime = performance.now();

    log(`BFS explored ${reachableCount} states in ${(endTime - startTime).toFixed(0)}ms.`);

    assert(reachableCount === expected,
        `Should reach ALL ${expected} theoretical permutations. Reachable: ${reachableCount}`);

    if (reachableCount === expected) {
        log('CONCLUSION: With duplicate tiles, IMPOSSIBLE states DO NOT EXIST.', 'pass');
    }
}

// Run
setTimeout(() => {
    output.innerHTML = '';
    testUniqueTilesReachability();
    testDuplicateTilesFullReachability();
}, 100);
