import { useState, useCallback, useEffect, useRef } from 'react'

const GRID_SIZE = 3

// A* Solver
class Solver {
    constructor(start, target, isAdvanced) {
        this.start = start
        this.target = target
        this.isAdvanced = isAdvanced
    }

    solve() {
        const openSet = []
        const closedSet = new Set()

        const startH = this.heuristic(this.start)
        openSet.push({
            state: this.start,
            path: [],
            g: 0,
            h: startH,
            f: startH
        })

        let iterations = 0
        const MAX_ITERATIONS = 5000

        while (openSet.length > 0) {
            iterations++
            if (iterations > MAX_ITERATIONS) return null

            openSet.sort((a, b) => a.f - b.f)
            const current = openSet.shift()

            const currentStr = JSON.stringify(current.state)
            if (currentStr === JSON.stringify(this.target)) {
                return current.path
            }

            closedSet.add(currentStr)

            const emptyIdx = current.state.indexOf(0)
            const neighbors = this.getNeighbors(emptyIdx)

            for (const nIdx of neighbors) {
                const nextState = [...current.state]
                    ;[nextState[emptyIdx], nextState[nIdx]] = [nextState[nIdx], nextState[emptyIdx]]

                const nextStr = JSON.stringify(nextState)
                if (closedSet.has(nextStr)) continue

                const gScore = current.g + 1
                const hScore = this.heuristic(nextState)
                const fScore = gScore + hScore

                const existing = openSet.find(n => JSON.stringify(n.state) === nextStr)
                if (existing) {
                    if (gScore < existing.g) {
                        existing.g = gScore
                        existing.f = fScore
                        existing.path = [...current.path, nIdx]
                    }
                } else {
                    openSet.push({
                        state: nextState,
                        path: [...current.path, nIdx],
                        g: gScore,
                        h: hScore,
                        f: fScore
                    })
                }
            }
        }
        return null
    }

    getNeighbors(index) {
        const row = Math.floor(index / GRID_SIZE)
        const col = index % GRID_SIZE
        const neighbors = []
        if (row > 0) neighbors.push(index - GRID_SIZE)
        if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE)
        if (col > 0) neighbors.push(index - 1)
        if (col < GRID_SIZE - 1) neighbors.push(index + 1)
        return neighbors
    }

    heuristic(state) {
        let total = 0
        if (this.isAdvanced) {
            for (let i = 0; i < state.length; i++) {
                const val = state[i]
                if (val === 0) continue
                const targetIdx = this.target.indexOf(val)
                total += this.manhattan(i, targetIdx)
            }
        } else {
            const currentPos = {}
            const targetPos = {}
            state.forEach((v, i) => { if (v !== 0) (currentPos[v] ||= []).push(i) })
            this.target.forEach((v, i) => { if (v !== 0) (targetPos[v] ||= []).push(i) })

            for (const val in currentPos) {
                const sources = currentPos[val]
                const dests = targetPos[val]
                sources.forEach(sIdx => {
                    let minD = Infinity
                    dests.forEach(dIdx => {
                        const d = this.manhattan(sIdx, dIdx)
                        if (d < minD) minD = d
                    })
                    total += minD
                })
            }
        }
        return total
    }

    manhattan(idx1, idx2) {
        const r1 = Math.floor(idx1 / GRID_SIZE)
        const c1 = idx1 % GRID_SIZE
        const r2 = Math.floor(idx2 / GRID_SIZE)
        const c2 = idx2 % GRID_SIZE
        return Math.abs(r1 - r2) + Math.abs(c1 - c2)
    }
}

function getNeighbors(index) {
    const row = Math.floor(index / GRID_SIZE)
    const col = index % GRID_SIZE
    const neighbors = []
    if (row > 0) neighbors.push(index - GRID_SIZE)
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE)
    if (col > 0) neighbors.push(index - 1)
    if (col < GRID_SIZE - 1) neighbors.push(index + 1)
    return neighbors
}

function randomWalk(stateArr, moves) {
    const state = [...stateArr]
    let emptyIdx = state.indexOf(0)
    let lastEmptyIdx = -1

    for (let i = 0; i < moves; i++) {
        const neighbors = getNeighbors(emptyIdx)
        const validNeighbors = neighbors.filter(n => n !== lastEmptyIdx)
        const nextIdx = validNeighbors.length > 0
            ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)]
            : neighbors[Math.floor(Math.random() * neighbors.length)]

            ;[state[emptyIdx], state[nextIdx]] = [state[nextIdx], state[emptyIdx]]
        lastEmptyIdx = emptyIdx
        emptyIdx = nextIdx
    }
    return state
}

export default function useSlidingPuzzle() {
    const [currentState, setCurrentState] = useState([])
    const [targetState, setTargetState] = useState([])
    const [isAdvancedMode, setIsAdvancedMode] = useState(false)
    const [movesTaken, setMovesTaken] = useState(0)
    const [optimalMoves, setOptimalMoves] = useState(0)
    const [isAutoSolving, setIsAutoSolving] = useState(false)
    const [autoSpeed, setAutoSpeed] = useState(500)
    const [hintIndex, setHintIndex] = useState(null)
    const [showStats, setShowStats] = useState(true)
    const [hasWon, setHasWon] = useState(false)

    const autoSolveRef = useRef(null)

    // Check win condition
    const checkWin = useCallback((state, target) => {
        return JSON.stringify(state) === JSON.stringify(target)
    }, [])

    // Update optimal move count
    const updateOptimalMoves = useCallback((state, target, advanced) => {
        const solver = new Solver(state, target, advanced)
        const path = solver.solve()
        setOptimalMoves(path ? path.length : 0)
    }, [])

    // Start new game
    const startNewGame = useCallback(() => {
        stopAutoSolve()
        setHintIndex(null)
        setMovesTaken(0)
        setHasWon(false)

        let canonical, target, current

        if (isAdvancedMode) {
            canonical = [1, 2, 3, 4, 5, 6, 7, 8, 0]
            target = randomWalk(canonical, 50)
            current = randomWalk(target, 40)
        } else {
            canonical = [1, 1, 2, 2, 3, 3, 4, 4, 0]
            target = randomWalk(canonical, 50)
            current = randomWalk(target, 30)
        }

        setTargetState(target)
        setCurrentState(current)
        updateOptimalMoves(current, target, isAdvancedMode)
    }, [isAdvancedMode, updateOptimalMoves])

    // Stop auto-solve
    const stopAutoSolve = useCallback(() => {
        setIsAutoSolving(false)
        if (autoSolveRef.current) {
            clearTimeout(autoSolveRef.current)
            autoSolveRef.current = null
        }
    }, [])

    // Perform move
    const performMove = useCallback((index) => {
        setHintIndex(null)

        setCurrentState(prev => {
            const emptyPos = prev.indexOf(0)
            const neighbors = getNeighbors(emptyPos)

            if (neighbors.includes(index)) {
                const newState = [...prev]
                    ;[newState[emptyPos], newState[index]] = [newState[index], newState[emptyPos]]

                setMovesTaken(m => m + 1)

                if (checkWin(newState, targetState)) {
                    setHasWon(true)
                    stopAutoSolve()
                }

                setTimeout(() => updateOptimalMoves(newState, targetState, isAdvancedMode), 0)

                return newState
            }
            return prev
        })
    }, [targetState, isAdvancedMode, checkWin, stopAutoSolve, updateOptimalMoves])

    // Handle tile click
    const handleTileClick = useCallback((index) => {
        if (isAutoSolving) stopAutoSolve()
        performMove(index)
    }, [isAutoSolving, stopAutoSolve, performMove])

    // Show hint
    const showHint = useCallback(() => {
        if (isAutoSolving) return

        const solver = new Solver(currentState, targetState, isAdvancedMode)
        const path = solver.solve()

        if (path && path.length > 0) {
            setHintIndex(path[0])
        }
    }, [currentState, targetState, isAdvancedMode, isAutoSolving])

    // Auto-solve step
    const executeNextAutoMove = useCallback(() => {
        const solver = new Solver(currentState, targetState, isAdvancedMode)
        const path = solver.solve()

        if (path && path.length > 0) {
            performMove(path[0])
        } else {
            stopAutoSolve()
        }
    }, [currentState, targetState, isAdvancedMode, performMove, stopAutoSolve])

    // Auto-solve loop
    useEffect(() => {
        if (isAutoSolving && !hasWon) {
            autoSolveRef.current = setTimeout(() => {
                executeNextAutoMove()
            }, autoSpeed)
        }
        return () => {
            if (autoSolveRef.current) clearTimeout(autoSolveRef.current)
        }
    }, [isAutoSolving, hasWon, autoSpeed, executeNextAutoMove])

    // Toggle auto-solve
    const toggleAutoSolve = useCallback(() => {
        if (isAutoSolving) {
            stopAutoSolve()
        } else if (!hasWon) {
            setIsAutoSolving(true)
        }
    }, [isAutoSolving, hasWon, stopAutoSolve])

    // Toggle advanced mode
    const toggleAdvancedMode = useCallback(() => {
        setIsAdvancedMode(prev => !prev)
    }, [])

    // Initialize on mount and when mode changes
    useEffect(() => {
        startNewGame()
    }, [isAdvancedMode])

    return {
        currentState,
        targetState,
        isAdvancedMode,
        movesTaken,
        optimalMoves,
        isAutoSolving,
        autoSpeed,
        hintIndex,
        showStats,
        hasWon,

        handleTileClick,
        showHint,
        startNewGame,
        toggleAutoSolve,
        toggleAdvancedMode,
        setAutoSpeed,
        setShowStats,
        setHasWon,
        hasModified: movesTaken > 0,
    }
}
