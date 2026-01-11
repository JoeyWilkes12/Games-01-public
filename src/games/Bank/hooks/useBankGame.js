import { useState, useCallback, useRef, useEffect } from 'react'
import { SeededRNG, calculateSurvivalProbability } from '../utils'

const DEFAULT_PLAYERS = [
    { id: 1, name: 'Player 1' },
    { id: 2, name: 'Player 2' },
    { id: 3, name: 'Player 3' },
    { id: 4, name: 'Player 4' },
]

const initialState = {
    roundNumber: 1,
    totalRounds: 20,
    rollNumber: 0,
    bankScore: 0,
    currentPlayerIndex: 0,
    gameStarted: false,
    roundOver: false,
    gameOver: false,
    die1: 0,
    die2: 0,
    lastRollMessage: '',
    lastRollType: 'normal', // 'normal', 'special', 'seven'
    isRolling: false,
    alertMessage: null,
}

export default function useBankGame(config = {}) {
    const [state, setState] = useState(initialState)
    const [players, setPlayers] = useState(
        DEFAULT_PLAYERS.map(p => ({ ...p, score: 0, hasBankedThisRound: false }))
    )
    const [undoStack, setUndoStack] = useState([])
    const [undoMode, setUndoMode] = useState('resample') // 'resample' or 'preserve'
    const [byodEnabled, setByodEnabled] = useState(false)

    const rngRef = useRef(new SeededRNG(config.seed || null))

    // Calculate derived values
    const currentPlayer = players[state.currentPlayerIndex]
    const survivalProbability = calculateSurvivalProbability(state.rollNumber)
    const canBank = state.rollNumber >= 3 && state.bankScore > 0 && !state.roundOver && !state.gameOver
    const availablePlayers = players.filter(p => !p.hasBankedThisRound)

    // Get sorted players for scoreboard
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

    // Push state for undo
    const pushState = useCallback(() => {
        setUndoStack(prev => [...prev, {
            state: { ...state },
            players: players.map(p => ({ ...p })),
            rngState: rngRef.current.current,
        }])
    }, [state, players])

    // Undo
    const undo = useCallback(() => {
        if (undoStack.length === 0) return

        const prevState = undoStack[undoStack.length - 1]
        setUndoStack(prev => prev.slice(0, -1))
        setState(prevState.state)
        setPlayers(prevState.players)

        if (undoMode === 'preserve') {
            rngRef.current.current = prevState.rngState
        }
    }, [undoStack, undoMode])

    // Roll dice
    const roll = useCallback(() => {
        if (state.roundOver || state.gameOver || state.isRolling) return

        setState(prev => ({ ...prev, isRolling: true, gameStarted: true }))

        // Animate for a short time then finish
        setTimeout(() => {
            pushState()

            const die1 = rngRef.current.nextInt(1, 6)
            const die2 = rngRef.current.nextInt(1, 6)
            const sum = die1 + die2
            const isDoubles = die1 === die2
            const isSeven = sum === 7

            const newRollNumber = state.rollNumber + 1
            const isProtected = newRollNumber <= 3

            let newBankScore = state.bankScore
            let message = ''
            let rollType = 'normal'
            let alertMessage = null
            let roundOver = false

            if (isSeven) {
                if (isProtected) {
                    newBankScore += 70
                    message = '🛡️ Protected! 7 = +70 points'
                    rollType = 'special'
                } else {
                    newBankScore = 0
                    message = '💥 SEVEN! Round over - bank lost!'
                    rollType = 'seven'
                    alertMessage = 'SEVEN! Round Over! 💥'
                    roundOver = true
                }
            } else if (isDoubles) {
                if (isProtected) {
                    const faceValue = die1 * 2
                    newBankScore += faceValue
                    message = `🛡️ Protected doubles! +${faceValue} (face value)`
                    rollType = 'special'
                } else {
                    const oldBank = newBankScore
                    newBankScore *= 2
                    message = `🎉 DOUBLES! Bank doubled: ${oldBank} → ${newBankScore}`
                    rollType = 'special'
                }
            } else {
                newBankScore += sum
                message = `+${sum}`
            }

            // Advance to next player
            let nextPlayerIndex = state.currentPlayerIndex
            if (!roundOver) {
                let attempts = 0
                do {
                    nextPlayerIndex = (nextPlayerIndex + 1) % players.length
                    attempts++
                } while (players[nextPlayerIndex].hasBankedThisRound && attempts < players.length)
            }

            setState(prev => ({
                ...prev,
                die1,
                die2,
                rollNumber: newRollNumber,
                bankScore: newBankScore,
                lastRollMessage: message,
                lastRollType: rollType,
                isRolling: false,
                alertMessage,
                roundOver,
                currentPlayerIndex: nextPlayerIndex,
            }))

            // If round is over, start next round after delay
            if (roundOver && state.roundNumber < state.totalRounds) {
                setTimeout(() => {
                    nextRound()
                }, 2000)
            } else if (roundOver && state.roundNumber >= state.totalRounds) {
                setState(prev => ({ ...prev, gameOver: true }))
            }
        }, 400)
    }, [state, players, pushState])

    // Handle BYOD input
    const handleByodInput = useCallback((sum, isDoubles = false) => {
        if (state.roundOver || state.gameOver || state.isRolling) return

        pushState()

        const newRollNumber = state.rollNumber + 1
        const isProtected = newRollNumber <= 3
        const isSeven = sum === 7

        let die1, die2
        if (isDoubles) {
            die1 = die2 = Math.floor(sum / 2) || 3
        } else if (isSeven) {
            die1 = 3
            die2 = 4
        } else {
            die1 = Math.min(6, Math.max(1, Math.floor(sum / 2)))
            die2 = sum - die1
        }

        let newBankScore = state.bankScore
        let message = ''
        let rollType = 'normal'
        let alertMessage = null
        let roundOver = false

        if (isSeven) {
            if (isProtected) {
                newBankScore += 70
                message = '🛡️ Protected! 7 = +70 points'
                rollType = 'special'
            } else {
                newBankScore = 0
                message = '💥 SEVEN! Round over - bank lost!'
                rollType = 'seven'
                alertMessage = 'SEVEN! Round Over! 💥'
                roundOver = true
            }
        } else if (isDoubles) {
            if (isProtected) {
                const faceValue = sum
                newBankScore += faceValue
                message = `🛡️ Protected doubles! +${faceValue} (face value)`
                rollType = 'special'
            } else {
                const oldBank = newBankScore
                newBankScore *= 2
                message = `🎉 DOUBLES! Bank doubled: ${oldBank} → ${newBankScore}`
                rollType = 'special'
            }
        } else {
            newBankScore += sum
            message = `+${sum}`
        }

        let nextPlayerIndex = state.currentPlayerIndex
        if (!roundOver) {
            let attempts = 0
            do {
                nextPlayerIndex = (nextPlayerIndex + 1) % players.length
                attempts++
            } while (players[nextPlayerIndex].hasBankedThisRound && attempts < players.length)
        }

        setState(prev => ({
            ...prev,
            gameStarted: true,
            die1,
            die2,
            rollNumber: newRollNumber,
            bankScore: newBankScore,
            lastRollMessage: message,
            lastRollType: rollType,
            alertMessage,
            roundOver,
            currentPlayerIndex: nextPlayerIndex,
        }))

        if (roundOver && state.roundNumber < state.totalRounds) {
            setTimeout(() => nextRound(), 2000)
        } else if (roundOver && state.roundNumber >= state.totalRounds) {
            setState(prev => ({ ...prev, gameOver: true }))
        }
    }, [state, players, pushState])

    // Bank selected players
    const bankPlayers = useCallback((playerIds) => {
        if (!canBank || playerIds.length === 0) return

        pushState()

        const scorePerPlayer = state.bankScore
        const bankedNames = []

        setPlayers(prev => prev.map(p => {
            if (playerIds.includes(p.id) && !p.hasBankedThisRound) {
                bankedNames.push(p.name)
                return { ...p, score: p.score + scorePerPlayer, hasBankedThisRound: true }
            }
            return p
        }))

        const message = bankedNames.length === 1
            ? `${bankedNames[0]} banked ${scorePerPlayer} points!`
            : `${bankedNames.join(', ')} each banked ${scorePerPlayer} points!`

        setState(prev => ({
            ...prev,
            lastRollMessage: message,
            lastRollType: 'special',
        }))

        // Check if all players banked after state update
        setTimeout(() => {
            setPlayers(currentPlayers => {
                if (currentPlayers.every(p => p.hasBankedThisRound)) {
                    if (state.roundNumber >= state.totalRounds) {
                        setState(prev => ({ ...prev, roundOver: true, gameOver: true }))
                    } else {
                        setState(prev => ({ ...prev, roundOver: true }))
                        setTimeout(() => nextRound(), 2000)
                    }
                } else {
                    // Advance player
                    let nextIdx = state.currentPlayerIndex
                    let attempts = 0
                    do {
                        nextIdx = (nextIdx + 1) % currentPlayers.length
                        attempts++
                    } while (currentPlayers[nextIdx].hasBankedThisRound && attempts < currentPlayers.length)
                    setState(prev => ({ ...prev, currentPlayerIndex: nextIdx }))
                }
                return currentPlayers
            })
        }, 0)
    }, [canBank, state, pushState])

    // Next round
    const nextRound = useCallback(() => {
        setState(prev => ({
            ...prev,
            roundNumber: prev.roundNumber + 1,
            rollNumber: 0,
            bankScore: 0,
            roundOver: false,
            currentPlayerIndex: 0,
            die1: 0,
            die2: 0,
            lastRollMessage: '',
            alertMessage: null,
        }))
        setPlayers(prev => prev.map(p => ({ ...p, hasBankedThisRound: false })))
    }, [])

    // New game
    const newGame = useCallback(() => {
        setState({ ...initialState, totalRounds: state.totalRounds })
        setPlayers(prev => prev.map(p => ({ ...p, score: 0, hasBankedThisRound: false })))
        setUndoStack([])
        rngRef.current.reset()
    }, [state.totalRounds])

    // Set total rounds
    const setTotalRounds = useCallback((rounds) => {
        setState(prev => ({ ...prev, totalRounds: rounds }))
    }, [])

    // Add player
    const addPlayer = useCallback(() => {
        const newId = Math.max(...players.map(p => p.id)) + 1
        setPlayers(prev => [...prev, {
            id: newId,
            name: `Player ${newId}`,
            score: 0,
            hasBankedThisRound: false,
        }])
    }, [players])

    // Remove player
    const removePlayer = useCallback((id) => {
        if (players.length <= 2) return
        setPlayers(prev => prev.filter(p => p.id !== id))
    }, [players])

    // Rename player
    const renamePlayer = useCallback((id, newName) => {
        setPlayers(prev => prev.map(p =>
            p.id === id ? { ...p, name: newName } : p
        ))
    }, [])

    // Import config
    const importConfig = useCallback((config) => {
        if (config.seed != null) {
            rngRef.current.setSeed(config.seed)
        }
        if (config.totalRounds) {
            setState(prev => ({ ...prev, totalRounds: config.totalRounds }))
        }
        if (config.players) {
            setPlayers(config.players.map((p, i) => ({
                id: p.id || i + 1,
                name: p.name || `Player ${i + 1}`,
                score: 0,
                hasBankedThisRound: false,
            })))
        }
        if (config.undoMode) {
            setUndoMode(config.undoMode)
        }
        if (config.byodEnabled != null) {
            setByodEnabled(config.byodEnabled)
        }
    }, [])

    // Export config
    const exportConfig = useCallback(() => {
        return {
            seed: rngRef.current.getSeed(),
            totalRounds: state.totalRounds,
            players: players.map(p => ({ id: p.id, name: p.name })),
            undoMode,
            byodEnabled,
        }
    }, [state.totalRounds, players, undoMode, byodEnabled])

    // Get current player rank info for compact scoreboard
    const getCurrentPlayerRankInfo = useCallback(() => {
        if (!currentPlayer) return { rank: 1, total: players.length, tieNext: '--', tieLeader: '--', aheadBy: 0 }

        const sorted = [...players].sort((a, b) => b.score - a.score)
        const rank = sorted.findIndex(p => p.id === currentPlayer.id) + 1

        // Find next player above and leader
        const playerAbove = sorted[rank - 2]
        const leader = sorted[0]

        return {
            rank,
            total: players.length,
            tieNext: playerAbove ? playerAbove.score - currentPlayer.score : '--',
            tieLeader: leader && leader.id !== currentPlayer.id ? leader.score - currentPlayer.score : '--',
            aheadBy: rank < players.length ? currentPlayer.score - sorted[rank].score : 0,
        }
    }, [currentPlayer, players])

    return {
        // State
        ...state,
        players,
        currentPlayer,
        sortedPlayers,
        survivalProbability,
        canBank,
        availablePlayers,
        undoStack,
        undoMode,
        byodEnabled,
        canUndo: undoStack.length > 0,

        // Actions
        roll,
        handleByodInput,
        bankPlayers,
        undo,
        newGame,
        setTotalRounds,
        setUndoMode,
        setByodEnabled,
        addPlayer,
        removePlayer,
        renamePlayer,
        importConfig,
        exportConfig,
        getCurrentPlayerRankInfo,
        dismissAlert: () => setState(prev => ({ ...prev, alertMessage: null })),
    }
}
