import { useState, useCallback, useRef, useEffect } from 'react'

const GRID_SIZE = 4
const PROB_4 = 0.1
const WIN_SCORE = 2048

// Seeded Random Number Generator
class SeededRandom {
    constructor(seed = Date.now()) {
        this.seed = seed
        this.current = seed
    }
    next() {
        this.current = (this.current * 1664525 + 1013904223) % 4294967296
        return this.current / 4294967296
    }
    reset() {
        this.current = this.seed
    }
}

// Weight matrix for AI evaluation (snake pattern)
const WEIGHT_MATRIX = [
    [65536, 32768, 16384, 8192],
    [512, 1024, 2048, 4096],
    [256, 128, 64, 32],
    [2, 4, 8, 16]
]

function copyGrid(grid) {
    return grid.map(row => [...row])
}

function rotateBoard(grid, rotations) {
    let newGrid = copyGrid(grid)
    for (let r = 0; r < rotations; r++) {
        newGrid = newGrid[0].map((_, index) => newGrid.map(row => row[index]).reverse())
    }
    return newGrid
}

function slideLeft(grid) {
    let gainedScore = 0
    const newGrid = grid.map(row => {
        const filtered = row.filter(val => val !== 0)
        const merged = []
        for (let i = 0; i < filtered.length; i++) {
            if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                merged.push(filtered[i] * 2)
                gainedScore += filtered[i] * 2
                i++
            } else {
                merged.push(filtered[i])
            }
        }
        while (merged.length < GRID_SIZE) merged.push(0)
        return merged
    })
    return { board: newGrid, score: gainedScore }
}

function simulateMove(grid, direction) {
    const rotMap = [3, 2, 1, 0]
    const rots = rotMap[direction]
    const rotated = rotateBoard(grid, rots)
    const result = slideLeft(rotated)
    const newBoard = rotateBoard(result.board, (4 - rots) % 4)
    const changed = JSON.stringify(grid) !== JSON.stringify(newBoard)
    return { board: newBoard, moved: changed, score: result.score }
}

function getEmptySpots(grid) {
    const spots = []
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
            if (grid[r][c] === 0) spots.push({ r, c })
        }
    }
    return spots
}

function evaluateGrid(grid) {
    let score = 0
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            score += grid[r][c] * WEIGHT_MATRIX[r][c]
        }
    }
    return score
}

function checkGameOver(grid) {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) return false
        }
    }
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const val = grid[r][c]
            if (c + 1 < GRID_SIZE && grid[r][c + 1] === val) return false
            if (r + 1 < GRID_SIZE && grid[r + 1][c] === val) return false
        }
    }
    return true
}

function checkWin(grid) {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] >= WIN_SCORE) return true
        }
    }
    return false
}

// Expectimax AI
function expectimax(grid, depth, isPlayer) {
    if (depth === 0) return evaluateGrid(grid)

    if (isPlayer) {
        let bestScore = -Infinity
        let anyMove = false
        for (let dir = 0; dir < 4; dir++) {
            const sim = simulateMove(grid, dir)
            if (sim.moved) {
                anyMove = true
                const score = expectimax(sim.board, depth - 1, false)
                if (score > bestScore) bestScore = score
            }
        }
        return anyMove ? bestScore : -999999
    } else {
        const empty = getEmptySpots(grid)
        if (empty.length === 0) return evaluateGrid(grid)

        let avgScore = 0
        empty.forEach(spot => {
            const grid2 = copyGrid(grid)
            grid2[spot.r][spot.c] = 2
            avgScore += expectimax(grid2, depth - 1, true) * 0.9

            const grid4 = copyGrid(grid)
            grid4[spot.r][spot.c] = 4
            avgScore += expectimax(grid4, depth - 1, true) * 0.1
        })
        return avgScore / empty.length
    }
}

function getBestMove(grid, depth = 3) {
    let bestScore = -Infinity
    let bestMove = -1

    for (let dir = 0; dir < 4; dir++) {
        const sim = simulateMove(grid, dir)
        if (sim.moved) {
            const score = expectimax(sim.board, depth - 1, false)
            if (score > bestScore) {
                bestScore = score
                bestMove = dir
            }
        }
    }
    return bestMove
}

export default function useGame2048(config = {}) {
    const [board, setBoard] = useState(() =>
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
    )
    const [score, setScore] = useState(0)
    const [bestScore, setBestScore] = useState(() => {
        try { return parseInt(localStorage.getItem('2048-best') || '0') }
        catch { return 0 }
    })
    const [gameOver, setGameOver] = useState(false)
    const [gameWon, setGameWon] = useState(false)
    const [isAutoPlaying, setIsAutoPlaying] = useState(false)
    const [theme, setTheme] = useState('classic')
    const [autoSpeed, setAutoSpeed] = useState(200)

    const rngRef = useRef(new SeededRandom(config.seed || Date.now()))
    const autoPlayRef = useRef(null)

    // Initialize game
    useEffect(() => {
        startNewGame()
    }, [])

    // Save best score
    useEffect(() => {
        try { localStorage.setItem('2048-best', bestScore.toString()) } catch { }
    }, [bestScore])

    // Add random tile
    const addRandomTile = useCallback((grid) => {
        const empty = getEmptySpots(grid)
        if (empty.length > 0) {
            const spot = empty[Math.floor(rngRef.current.next() * empty.length)]
            const newGrid = copyGrid(grid)
            newGrid[spot.r][spot.c] = rngRef.current.next() < PROB_4 ? 4 : 2
            return newGrid
        }
        return grid
    }, [])

    // Start new game
    const startNewGame = useCallback(() => {
        stopAutoPlay()
        let newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
        newBoard = addRandomTile(newBoard)
        newBoard = addRandomTile(newBoard)
        setBoard(newBoard)
        setScore(0)
        setGameOver(false)
        setGameWon(false)
    }, [addRandomTile])

    // Move
    const move = useCallback((direction) => {
        if (gameOver) return false

        const sim = simulateMove(board, direction)
        if (sim.moved) {
            const newBoard = addRandomTile(sim.board)
            setBoard(newBoard)
            setScore(prev => {
                const newScore = prev + sim.score
                if (newScore > bestScore) setBestScore(newScore)
                return newScore
            })

            if (checkWin(newBoard) && !gameWon) {
                setGameWon(true)
            }
            if (checkGameOver(newBoard)) {
                setGameOver(true)
                stopAutoPlay()
            }
            return true
        }
        return false
    }, [board, gameOver, gameWon, bestScore, addRandomTile])

    // Auto-play controls
    const stopAutoPlay = useCallback(() => {
        setIsAutoPlaying(false)
        if (autoPlayRef.current) {
            clearTimeout(autoPlayRef.current)
            autoPlayRef.current = null
        }
    }, [])

    const playNextMove = useCallback(() => {
        if (gameOver) {
            stopAutoPlay()
            return
        }

        const bestMove = getBestMove(board)
        if (bestMove !== -1) {
            const sim = simulateMove(board, bestMove)
            if (sim.moved) {
                const newBoard = addRandomTile(sim.board)
                setBoard(newBoard)
                setScore(prev => {
                    const newScore = prev + sim.score
                    if (newScore > bestScore) setBestScore(newScore)
                    return newScore
                })

                if (checkWin(newBoard)) {
                    setGameWon(true)
                }
                if (checkGameOver(newBoard)) {
                    setGameOver(true)
                    stopAutoPlay()
                    return
                }
            }
        } else {
            stopAutoPlay()
        }
    }, [board, gameOver, bestScore, addRandomTile, stopAutoPlay])

    const startAutoPlay = useCallback(() => {
        if (isAutoPlaying || gameOver) return
        setIsAutoPlaying(true)
    }, [isAutoPlaying, gameOver])

    // Auto-play loop
    useEffect(() => {
        if (isAutoPlaying && !gameOver) {
            autoPlayRef.current = setTimeout(() => {
                playNextMove()
            }, autoSpeed)
        }
        return () => {
            if (autoPlayRef.current) clearTimeout(autoPlayRef.current)
        }
    }, [isAutoPlaying, gameOver, autoSpeed, playNextMove])

    const toggleAutoPlay = useCallback(() => {
        if (isAutoPlaying) {
            stopAutoPlay()
        } else {
            startAutoPlay()
        }
    }, [isAutoPlaying, startAutoPlay, stopAutoPlay])

    // Hint
    const getHint = useCallback(() => {
        const bestMove = getBestMove(board)
        return bestMove !== -1 ? ['UP', 'RIGHT', 'DOWN', 'LEFT'][bestMove] : null
    }, [board])

    // Keyboard handler
    const handleKeyDown = useCallback((e) => {
        if (gameOver && !e.key.startsWith('Arrow')) return

        let dir = -1
        switch (e.key) {
            case 'ArrowUp': dir = 0; break
            case 'ArrowRight': dir = 1; break
            case 'ArrowDown': dir = 2; break
            case 'ArrowLeft': dir = 3; break
            default: return
        }

        e.preventDefault()
        if (dir !== -1) {
            if (isAutoPlaying) stopAutoPlay()
            move(dir)
        }
    }, [move, gameOver, isAutoPlaying, stopAutoPlay])

    // Swipe handler
    const handleSwipe = useCallback((startX, startY, endX, endY) => {
        if (gameOver) return

        const dx = endX - startX
        const dy = endY - startY

        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return

        let dir = -1
        if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? 1 : 3
        } else {
            dir = dy > 0 ? 2 : 0
        }

        if (dir !== -1) {
            if (isAutoPlaying) stopAutoPlay()
            move(dir)
        }
    }, [move, gameOver, isAutoPlaying, stopAutoPlay])

    return {
        board,
        score,
        bestScore,
        gameOver,
        gameWon,
        isAutoPlaying,
        theme,
        autoSpeed,
        move,
        startNewGame,
        toggleAutoPlay,
        getHint,
        setTheme,
        setAutoSpeed,
        handleKeyDown,
        handleSwipe,
        hasModified: score > 0,
    }
}
