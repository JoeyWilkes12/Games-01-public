import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Seeded Random Number Generator (Linear Congruential Generator)
 * Used for deterministic testing with specific seeds
 * Matches original implementation exactly
 */
class SeededRNG {
    constructor(seed) {
        this.seed = seed
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280
        return this.seed / 233280
    }
    roll(sides) {
        return Math.floor(this.next() * sides) + 1
    }
}

/**
 * Sample Pool for pre-generating dice roll samples
 * Generates samples ahead of time for better performance and deterministic testing
 */
class SamplePool {
    constructor(diceCount, diceSides, seed = null) {
        this.diceCount = diceCount
        this.diceSides = diceSides
        this.seed = seed
        this.samples = []
        this.currentIndex = 0
        this.rng = seed !== null ? new SeededRNG(seed) : null
    }

    static calculateRequiredSamples(durationMin, intervalMs, resetDurationMs) {
        const totalSeconds = durationMin * 60
        const cycleTime = (intervalMs + resetDurationMs) / 1000
        return Math.ceil(totalSeconds / cycleTime) + 100
    }

    generate(count) {
        const samplesToGenerate = Math.max(0, count - this.samples.length)
        if (samplesToGenerate === 0) return

        for (let i = 0; i < samplesToGenerate; i++) {
            const roll = []
            for (let d = 0; d < this.diceCount; d++) {
                const value = this.rng
                    ? this.rng.roll(this.diceSides)
                    : Math.floor(Math.random() * this.diceSides) + 1
                roll.push(value)
            }
            this.samples.push(roll)
        }
    }

    getNext() {
        if (this.currentIndex >= this.samples.length) {
            this.generate(this.samples.length + 100)
        }
        return this.samples[this.currentIndex++]
    }

    reset() {
        this.currentIndex = 0
    }

    regenerate(seed) {
        this.seed = seed
        this.rng = seed !== null ? new SeededRNG(seed) : null
        this.samples = []
        this.currentIndex = 0
        const count = SamplePool.calculateRequiredSamples(60, 1000, 1000)
        this.generate(count)
    }

    updateConfig(diceCount, diceSides) {
        if (this.diceCount !== diceCount || this.diceSides !== diceSides) {
            this.diceCount = diceCount
            this.diceSides = diceSides
            this.samples = []
            this.currentIndex = 0
        }
    }
}

/**
 * Analytics Tracker for player statistics
 * Tracks turns, rolls per turn, time per turn, and dice heatmap
 */
class AnalyticsTracker {
    constructor(players, diceCount, diceSides) {
        this.players = players
        this.playerCount = players.length
        this.diceCount = diceCount
        this.diceSides = diceSides

        this.currentPlayerIndex = 0
        this.currentTurnRolls = 0
        this.currentTurnStartTime = null
        this.turnNumber = 0

        this.playerStats = {}
        for (let i = 0; i < this.playerCount; i++) {
            this.playerStats[i] = { totalRolls: 0, totalTime: 0, turnCount: 0 }
        }

        this.timeline = []

        // Heatmap: 6x6 grid for two dice
        this.heatmap = []
        if (diceCount === 2 && diceSides === 6) {
            for (let i = 0; i < 6; i++) {
                this.heatmap[i] = new Array(6).fill(0)
            }
        }
        this.totalRolls = 0
    }

    startTurn() {
        this.currentTurnStartTime = Date.now()
        this.currentTurnRolls = 0
    }

    recordRoll(diceValues) {
        this.currentTurnRolls++
        this.totalRolls++

        // Update 6x6 heatmap for 2d6
        if (this.heatmap.length > 0 && diceValues.length === 2) {
            const d1 = diceValues[0] - 1
            const d2 = diceValues[1] - 1
            if (d1 >= 0 && d1 < 6 && d2 >= 0 && d2 < 6) {
                this.heatmap[d1][d2]++
            }
        }
    }

    endTurn() {
        const elapsed = this.currentTurnStartTime
            ? (Date.now() - this.currentTurnStartTime) / 1000
            : 0

        const stats = this.playerStats[this.currentPlayerIndex]
        stats.totalRolls += this.currentTurnRolls
        stats.totalTime += elapsed
        stats.turnCount++

        this.turnNumber++

        this.timeline.unshift({
            turnNumber: this.turnNumber,
            playerIndex: this.currentPlayerIndex,
            playerName: this.players[this.currentPlayerIndex]?.name || `Player ${this.currentPlayerIndex + 1}`,
            rolls: this.currentTurnRolls,
            time: elapsed
        })

        if (this.timeline.length > 10) {
            this.timeline.pop()
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerCount
        this.startTurn()
    }

    getCurrentPlayerName() {
        return this.players[this.currentPlayerIndex]?.name || `Player ${this.currentPlayerIndex + 1}`
    }

    getCurrentTurnTime() {
        if (!this.currentTurnStartTime) return 0
        return (Date.now() - this.currentTurnStartTime) / 1000
    }

    getLeaderboard() {
        const leaderboard = []
        for (const [id, stats] of Object.entries(this.playerStats)) {
            const idx = parseInt(id)
            leaderboard.push({
                playerIndex: idx,
                playerName: this.players[idx]?.name || `Player ${idx + 1}`,
                totalRolls: stats.totalRolls,
                totalTime: stats.totalTime,
                turnCount: stats.turnCount,
                isCurrent: idx === this.currentPlayerIndex
            })
        }
        return leaderboard.sort((a, b) => b.totalRolls - a.totalRolls)
    }

    getHeatmapData() {
        if (this.heatmap.length === 0) return null

        const data = []
        const expected = 1 / 36

        for (let i = 0; i < 6; i++) {
            const row = []
            for (let j = 0; j < 6; j++) {
                const count = this.heatmap[i][j]
                const proportion = this.totalRolls > 0 ? count / this.totalRolls : 0
                let heatLevel = 3
                if (this.totalRolls > 0) {
                    const deviation = proportion - expected
                    if (deviation < -expected * 0.5) heatLevel = 0
                    else if (deviation < -expected * 0.25) heatLevel = 1
                    else if (deviation < 0) heatLevel = 2
                    else if (deviation < expected * 0.25) heatLevel = 3
                    else if (deviation < expected * 0.5) heatLevel = 4
                    else if (deviation < expected) heatLevel = 5
                    else heatLevel = 6
                }
                row.push({ count, proportion, heatLevel })
            }
            data.push(row)
        }
        return data
    }

    simulateToEnd(samplePool, eventDefinitions, checkConditionFn, intervalSeconds) {
        const results = { events: 0, totalRolls: 0 }
        const rollTime = intervalSeconds

        while (samplePool.currentIndex < samplePool.samples.length) {
            const roll = samplePool.getNext()
            this.currentTurnRolls++
            this.totalRolls++

            if (this.heatmap.length > 0 && roll.length === 2) {
                const d1 = roll[0] - 1
                const d2 = roll[1] - 1
                if (d1 >= 0 && d1 < 6 && d2 >= 0 && d2 < 6) this.heatmap[d1][d2]++
            }

            results.totalRolls++

            if (checkConditionFn(roll, eventDefinitions)) {
                const stats = this.playerStats[this.currentPlayerIndex]
                stats.totalRolls += this.currentTurnRolls
                stats.totalTime += (this.currentTurnRolls * rollTime)
                stats.turnCount++
                this.turnNumber++

                this.timeline.unshift({
                    turnNumber: this.turnNumber,
                    playerIndex: this.currentPlayerIndex,
                    playerName: this.players[this.currentPlayerIndex]?.name || `Player ${this.currentPlayerIndex + 1}`,
                    rolls: this.currentTurnRolls,
                    time: (this.currentTurnRolls * rollTime)
                })
                if (this.timeline.length > 10) this.timeline.pop()

                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerCount
                this.currentTurnRolls = 0
                results.events++
            }
        }

        // Commit pending rolls
        if (this.currentTurnRolls > 0) {
            const stats = this.playerStats[this.currentPlayerIndex]
            stats.totalRolls += this.currentTurnRolls
            stats.totalTime += (this.currentTurnRolls * rollTime)
            stats.turnCount++
            this.turnNumber++
        }

        return results
    }

    reset() {
        this.currentPlayerIndex = 0
        this.currentTurnRolls = 0
        this.currentTurnStartTime = null
        this.turnNumber = 0

        for (let i = 0; i < this.playerCount; i++) {
            this.playerStats[i] = { totalRolls: 0, totalTime: 0, turnCount: 0 }
        }

        this.timeline = []

        if (this.heatmap.length > 0) {
            for (let i = 0; i < 6; i++) {
                this.heatmap[i] = new Array(6).fill(0)
            }
        }
        this.totalRolls = 0
    }

    updateConfig(players, diceCount, diceSides) {
        this.players = players
        this.playerCount = players.length
        this.diceCount = diceCount
        this.diceSides = diceSides

        this.playerStats = {}
        for (let i = 0; i < this.playerCount; i++) {
            this.playerStats[i] = { totalRolls: 0, totalTime: 0, turnCount: 0 }
        }

        this.heatmap = []
        if (diceCount === 2 && diceSides === 6) {
            for (let i = 0; i < 6; i++) {
                this.heatmap[i] = new Array(6).fill(0)
            }
        }
    }
}

// Default event definitions: Doubles for 2d6 (matches original)
function getDefaultEventDefinitions() {
    const definitions = []
    for (let i = 1; i <= 6; i++) {
        definitions.push({
            id: Date.now() + i,
            name: `Double ${i}s`,
            rules: [
                { dieIndex: 0, operator: '==', value: i },
                { dieIndex: 1, operator: '==', value: i }
            ]
        })
    }
    return definitions
}

// Default players (matches original - 15 players)
const DEFAULT_PLAYERS = [
    { id: 1, name: 'Joey' },
    { id: 2, name: 'Brinlee' },
    { id: 3, name: 'Braxton' },
    { id: 4, name: 'Gavin' },
    { id: 5, name: 'Hinckley' },
    { id: 6, name: 'London' },
    { id: 7, name: 'Bode' },
    { id: 8, name: 'Macey' },
    { id: 9, name: 'Ryder' },
    { id: 10, name: 'Lily' },
    { id: 11, name: 'Jack' },
    { id: 12, name: 'Cole' },
    { id: 13, name: 'Gracen' },
    { id: 14, name: 'Connor' },
    { id: 15, name: 'Friend' },
]

// Check if roll matches any event definition
function checkEventCondition(roll, eventDefinitions) {
    for (const def of eventDefinitions) {
        const met = def.rules.every(rule => {
            const val = roll[rule.dieIndex]
            if (val === undefined) return false
            switch (rule.operator) {
                case '==': return val == rule.value
                case '!=': return val != rule.value
                case '>': return val > rule.value
                case '<': return val < rule.value
                case '>=': return val >= rule.value
                case '<=': return val <= rule.value
                default: return false
            }
        })
        if (met) return def
    }
    return null
}

export default function useRandomEventDice(config = {}) {
    // Settings (rollInterval is in SECONDS to match original UI)
    const [diceCount, setDiceCount] = useState(config.diceCount || 2)
    const [diceSides, setDiceSides] = useState(config.diceSides || 6)
    const [rollInterval, setRollInterval] = useState(config.rollInterval || 1) // seconds
    const [gameDuration, setGameDuration] = useState(config.gameDuration || 5)
    const [resetDuration, setResetDuration] = useState(config.resetDuration || 3)
    const [seed, setSeed] = useState(config.seed || null)

    // Players and event definitions
    const [players, setPlayers] = useState(config.players || DEFAULT_PLAYERS)
    const [eventDefinitions, setEventDefinitions] = useState(
        config.eventDefinitions || getDefaultEventDefinitions()
    )

    // Game state
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [isResetting, setIsResetting] = useState(false)

    // Dice state
    const [diceValues, setDiceValues] = useState(Array(diceCount).fill(1))
    const [currentEvent, setCurrentEvent] = useState(null)

    // Timer and stats
    const [timeRemaining, setTimeRemaining] = useState(gameDuration * 60)
    const [rollCount, setRollCount] = useState(0)
    const [rollsSinceLastEvent, setRollsSinceLastEvent] = useState(0)

    // Refs
    const samplePoolRef = useRef(new SamplePool(diceCount, diceSides, seed))
    const analyticsRef = useRef(new AnalyticsTracker(players, diceCount, diceSides))
    const rollIntervalRef = useRef(null)
    const timerRef = useRef(null)
    const resetTimeoutRef = useRef(null)
    const analyticsUpdateRef = useRef(null)

    // Analytics state (for React re-renders)
    const [leaderboard, setLeaderboard] = useState([])
    const [heatmapData, setHeatmapData] = useState(null)
    const [timeline, setTimeline] = useState([])
    const [currentPlayerName, setCurrentPlayerName] = useState('')
    const [currentTurnRolls, setCurrentTurnRolls] = useState(0)
    const [totalRolls, setTotalRolls] = useState(0)

    // Update analytics UI state
    const updateAnalyticsState = useCallback(() => {
        const analytics = analyticsRef.current
        setLeaderboard(analytics.getLeaderboard())
        setHeatmapData(analytics.getHeatmapData())
        setTimeline([...analytics.timeline])
        setCurrentPlayerName(analytics.getCurrentPlayerName())
        setCurrentTurnRolls(analytics.currentTurnRolls)
        setTotalRolls(analytics.totalRolls)
    }, [])

    // Roll dice
    const rollDice = useCallback(() => {
        const values = samplePoolRef.current.getNext()
        setDiceValues(values)
        setRollCount(prev => prev + 1)
        setRollsSinceLastEvent(prev => prev + 1)

        // Record in analytics
        analyticsRef.current.recordRoll(values)

        // Check for event
        const matchedEvent = checkEventCondition(values, eventDefinitions)
        if (matchedEvent) {
            setCurrentEvent(matchedEvent)
            triggerEvent(matchedEvent)
        }

        return values
    }, [eventDefinitions])

    // Trigger event
    const triggerEvent = useCallback((event) => {
        analyticsRef.current.endTurn()
        setRollsSinceLastEvent(0)

        // Stop rolling during reset
        setIsResetting(true)
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)

        // Reset after duration
        resetTimeoutRef.current = setTimeout(() => {
            setIsResetting(false)
            setCurrentEvent(null)
            analyticsRef.current.startTurn()

            if (isPlaying && !isPaused) {
                startRolling()
            }
        }, resetDuration * 1000)
    }, [resetDuration, isPlaying, isPaused])

    // Start rolling interval (rollInterval is in seconds, convert to ms)
    const startRolling = useCallback(() => {
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
        rollIntervalRef.current = setInterval(rollDice, rollInterval * 1000)
    }, [rollDice, rollInterval])

    // Start game
    const start = useCallback(() => {
        // Pre-generate samples (rollInterval is in seconds, convert to ms)
        const requiredSamples = SamplePool.calculateRequiredSamples(
            gameDuration, rollInterval * 1000, resetDuration * 1000
        )
        samplePoolRef.current.generate(requiredSamples)
        samplePoolRef.current.reset()

        setIsPlaying(true)
        setIsPaused(false)
        analyticsRef.current.startTurn()
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

        // Start analytics update interval
        if (analyticsUpdateRef.current) clearInterval(analyticsUpdateRef.current)
        analyticsUpdateRef.current = setInterval(updateAnalyticsState, 500)
    }, [gameDuration, rollInterval, resetDuration, startRolling, updateAnalyticsState])

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
        if (analyticsUpdateRef.current) clearInterval(analyticsUpdateRef.current)
        updateAnalyticsState()
    }, [updateAnalyticsState])

    // Reset game
    const reset = useCallback(() => {
        stop()
        setTimeRemaining(gameDuration * 60)
        setRollCount(0)
        setRollsSinceLastEvent(0)
        setCurrentEvent(null)
        setIsResetting(false)
        setDiceValues(Array(diceCount).fill(1))

        samplePoolRef.current.reset()
        analyticsRef.current.reset()
        updateAnalyticsState()
    }, [gameDuration, diceCount, stop, updateAnalyticsState])

    // Skip to end (simulates remaining game)
    const skipToEnd = useCallback(() => {
        if (!isPlaying) return

        // Stop normal loops
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
        if (timerRef.current) clearInterval(timerRef.current)
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
        if (analyticsUpdateRef.current) clearInterval(analyticsUpdateRef.current)

        // Simulate remaining (rollInterval is already in seconds)
        const results = analyticsRef.current.simulateToEnd(
            samplePoolRef.current,
            eventDefinitions,
            checkEventCondition,
            rollInterval
        )

        console.debug(`[Analytics] Skip to end: ${results.totalRolls} rolls, ${results.events} events`)

        setTimeRemaining(0)
        setIsPlaying(false)
        setIsPaused(false)
        setRollCount(prev => prev + results.totalRolls)
        updateAnalyticsState()
    }, [isPlaying, eventDefinitions, rollInterval, updateAnalyticsState])

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Update player name
    const updatePlayerName = useCallback((index, name) => {
        setPlayers(prev => prev.map((p, i) => i === index ? { ...p, name } : p))
    }, [])

    // Add event definition
    const addEventDefinition = useCallback((definition) => {
        setEventDefinitions(prev => [...prev, { ...definition, id: Date.now() }])
    }, [])

    // Remove event definition
    const removeEventDefinition = useCallback((id) => {
        setEventDefinitions(prev => prev.filter(e => e.id !== id))
    }, [])

    // Update config
    useEffect(() => {
        samplePoolRef.current.updateConfig(diceCount, diceSides)
        analyticsRef.current.updateConfig(players, diceCount, diceSides)
    }, [diceCount, diceSides, players])

    // Update sample pool on seed change
    useEffect(() => {
        if (seed !== null) {
            samplePoolRef.current.regenerate(seed)
        }
    }, [seed])

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (rollIntervalRef.current) clearInterval(rollIntervalRef.current)
            if (timerRef.current) clearInterval(timerRef.current)
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
            if (analyticsUpdateRef.current) clearInterval(analyticsUpdateRef.current)
        }
    }, [])

    return {
        // State
        isPlaying,
        isPaused,
        isResetting,
        diceValues,
        diceCount,
        diceSides,
        rollInterval,
        gameDuration,
        resetDuration,
        timeRemaining,
        rollCount,
        rollsSinceLastEvent,
        players,
        eventDefinitions,
        currentEvent,
        seed,

        // Analytics
        leaderboard,
        heatmapData,
        timeline,
        currentPlayerName,
        currentTurnRolls,
        totalRolls,

        // Computed
        formattedTime: formatTime(timeRemaining),
        currentPlayerIndex: analyticsRef.current.currentPlayerIndex,

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
        setSeed,
        setPlayers,
        updatePlayerName,
        setEventDefinitions,
        addEventDefinition,
        removeEventDefinition,

        hasModified: rollCount > 0,
    }
}
