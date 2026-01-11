import { useState, useCallback, useRef, useEffect } from 'react'

// Seeded RNG
class SeededRNG {
    constructor(seed) {
        this.seed = seed
    }
    next() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
        return this.seed / 0x7fffffff
    }
    roll(sides) {
        return Math.floor(this.next() * sides) + 1
    }
}

// Default Events
const DEFAULT_EVENTS = [
    { id: 1, diceSum: 7, name: 'Lucky Seven!', color: '#22c55e' },
    { id: 2, diceSum: 2, name: 'Snake Eyes!', color: '#ef4444' },
    { id: 3, diceSum: 12, name: 'Boxcars!', color: '#8b5cf6' },
    { id: 4, diceSum: 11, name: 'Yo-leven!', color: '#f59e0b' },
]

// Default Players
const DEFAULT_PLAYERS = [
    { id: 1, name: 'Player 1' },
    { id: 2, name: 'Player 2' },
    { id: 3, name: 'Player 3' },
    { id: 4, name: 'Player 4' },
]

export default function useRandomEventDice(config = {}) {
    // Game state
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [isResetting, setIsResetting] = useState(false)

    // Dice state
    const [diceCount, setDiceCount] = useState(config.diceCount || 2)
    const [diceSides, setDiceSides] = useState(config.diceSides || 6)
    const [diceValues, setDiceValues] = useState([1, 1])
    const [currentSum, setCurrentSum] = useState(2)

    // Settings
    const [rollInterval, setRollInterval] = useState(config.rollInterval || 1000)
    const [gameDuration, setGameDuration] = useState(config.gameDuration || 5)
    const [resetDuration, setResetDuration] = useState(config.resetDuration || 3)

    // Timer
    const [timeRemaining, setTimeRemaining] = useState(gameDuration * 60)
    const [rollCount, setRollCount] = useState(0)

    // Players and events
    const [players, setPlayers] = useState(
        (config.players || DEFAULT_PLAYERS).map(p => ({
            ...p,
            rolls: 0,
            turns: 0,
            totalTime: 0,
        }))
    )
    const [events, setEvents] = useState(config.events || DEFAULT_EVENTS)
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
    const [currentEvent, setCurrentEvent] = useState(null)

    // Analytics
    const [heatmap, setHeatmap] = useState({})
    const [recentTurns, setRecentTurns] = useState([])
    const [turnStartTime, setTurnStartTime] = useState(null)
    const [turnRolls, setTurnRolls] = useState(0)

    // Refs for intervals
    const rngRef = useRef(new SeededRNG(config.seed || Date.now()))
    const rollIntervalRef = useRef(null)
    const timerRef = useRef(null)
    const resetTimeoutRef = useRef(null)

    // Roll dice
    const rollDice = useCallback(() => {
        const values = []
        for (let i = 0; i < diceCount; i++) {
            values.push(rngRef.current.roll(diceSides))
        }
        const sum = values.reduce((a, b) => a + b, 0)

        setDiceValues(values)
        setCurrentSum(sum)
        setRollCount(prev => prev + 1)
        setTurnRolls(prev => prev + 1)

        // Update heatmap
        setHeatmap(prev => ({
            ...prev,
            [sum]: (prev[sum] || 0) + 1
        }))

        // Update current player rolls
        setPlayers(prev => prev.map((p, idx) =>
            idx === currentPlayerIndex ? { ...p, rolls: p.rolls + 1 } : p
        ))

        // Check for events
        const matchedEvent = events.find(e => e.diceSum === sum)
        if (matchedEvent) {
            setCurrentEvent(matchedEvent)
            triggerEvent(matchedEvent)
        }

        return { values, sum }
    }, [diceCount, diceSides, events, currentPlayerIndex])

    // Trigger event
    const triggerEvent = useCallback((event) => {
        // End current turn
        const turnDuration = turnStartTime ? (Date.now() - turnStartTime) / 1000 : 0

        // Record turn
        setRecentTurns(prev => [...prev.slice(-19), {
            player: players[currentPlayerIndex].name,
            rolls: turnRolls,
            time: turnDuration,
            event: event.name,
        }])

        // Update player stats
        setPlayers(prev => prev.map((p, idx) =>
            idx === currentPlayerIndex
                ? { ...p, turns: p.turns + 1, totalTime: p.totalTime + turnDuration }
                : p
        ))

        // Stop rolling during reset
        setIsResetting(true)
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)

        // Start reset timer
        resetTimeoutRef.current = setTimeout(() => {
            setIsResetting(false)
            setCurrentEvent(null)
            advancePlayer()
            setTurnRolls(0)
            setTurnStartTime(Date.now())

            if (isPlaying && !isPaused) {
                startRolling()
            }
        }, resetDuration * 1000)
    }, [players, currentPlayerIndex, turnStartTime, turnRolls, resetDuration, isPlaying, isPaused])

    // Advance to next player
    const advancePlayer = useCallback(() => {
        setCurrentPlayerIndex(prev => (prev + 1) % players.length)
    }, [players.length])

    // Start rolling
    const startRolling = useCallback(() => {
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
        rollIntervalRef.current = setInterval(() => {
            rollDice()
        }, rollInterval)
    }, [rollDice, rollInterval])

    // Start game
    const start = useCallback(() => {
        setIsPlaying(true)
        setIsPaused(false)
        setTurnStartTime(Date.now())
        startRolling()

        // Start timer
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    stop()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [startRolling])

    // Pause game
    const pause = useCallback(() => {
        setIsPaused(true)
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
        if (timerRef.current) clearInterval(timerRef.current)
    }, [])

    // Resume game
    const resume = useCallback(() => {
        setIsPaused(false)
        if (!isResetting) startRolling()

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    stop()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [isResetting, startRolling])

    // Stop game
    const stop = useCallback(() => {
        setIsPlaying(false)
        setIsPaused(false)
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
        if (timerRef.current) clearInterval(timerRef.current)
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
    }, [])

    // Reset game
    const reset = useCallback(() => {
        stop()
        setTimeRemaining(gameDuration * 60)
        setRollCount(0)
        setTurnRolls(0)
        setCurrentPlayerIndex(0)
        setCurrentEvent(null)
        setIsResetting(false)
        setDiceValues(Array(diceCount).fill(1))
        setCurrentSum(diceCount)
        setHeatmap({})
        setRecentTurns([])
        setPlayers(prev => prev.map(p => ({ ...p, rolls: 0, turns: 0, totalTime: 0 })))
        rngRef.current = new SeededRNG(config.seed || Date.now())
    }, [gameDuration, diceCount, stop])

    // Skip to end
    const skipToEnd = useCallback(() => {
        // Simulate remaining rolls
        const remainingRolls = Math.floor(timeRemaining / (rollInterval / 1000))

        for (let i = 0; i < remainingRolls; i++) {
            const values = []
            for (let j = 0; j < diceCount; j++) {
                values.push(rngRef.current.roll(diceSides))
            }
            const sum = values.reduce((a, b) => a + b, 0)

            // Update heatmap
            setHeatmap(prev => ({
                ...prev,
                [sum]: (prev[sum] || 0) + 1
            }))

            // Update roll count
            setRollCount(prev => prev + 1)
        }

        setTimeRemaining(0)
        stop()
    }, [timeRemaining, rollInterval, diceCount, diceSides, stop])

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Get leaderboard
    const getLeaderboard = useCallback(() => {
        return [...players].sort((a, b) => b.rolls - a.rolls)
    }, [players])

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
            if (timerRef.current) clearInterval(timerRef.current)
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
        }
    }, [])

    return {
        // State
        isPlaying,
        isPaused,
        isResetting,
        diceValues,
        currentSum,
        diceCount,
        diceSides,
        rollInterval,
        gameDuration,
        resetDuration,
        timeRemaining,
        rollCount,
        players,
        events,
        currentPlayerIndex,
        currentEvent,
        heatmap,
        recentTurns,

        // Computed
        currentPlayer: players[currentPlayerIndex],
        formattedTime: formatTime(timeRemaining),
        leaderboard: getLeaderboard(),

        // Actions
        start,
        pause,
        resume,
        stop,
        reset,
        skipToEnd,
        rollDice,
        setDiceCount,
        setDiceSides,
        setRollInterval,
        setGameDuration,
        setResetDuration,
        setPlayers,
        setEvents,

        hasModified: rollCount > 0,
    }
}
