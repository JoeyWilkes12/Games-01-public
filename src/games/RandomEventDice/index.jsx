import { useState, useEffect } from 'react'
import { HomeButton } from '../../components'
import useRandomEventDice from './hooks/useRandomEventDice'

// Die face display
function DiceFace({ value, sides = 6 }) {
    const dotPatterns = {
        1: [[50, 50]],
        2: [[25, 25], [75, 75]],
        3: [[25, 25], [50, 50], [75, 75]],
        4: [[25, 25], [75, 25], [25, 75], [75, 75]],
        5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
        6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
    }

    const dots = dotPatterns[value] || []

    return (
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl shadow-lg relative">
            {sides <= 6 && dots.map(([x, y], idx) => (
                <div
                    key={idx}
                    className="absolute w-3 h-3 bg-slate-800 rounded-full"
                    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                />
            ))}
            {sides > 6 && (
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-800">
                    {value}
                </div>
            )}
        </div>
    )
}

// Dice display area
function DiceArea({ values, isResetting, currentEvent }) {
    return (
        <div className={`
      flex gap-4 justify-center items-center p-6 rounded-2xl
      ${isResetting
                ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-400'
                : 'bg-bg-card'}
      transition-all duration-300
    `}>
            {values.map((value, idx) => (
                <DiceFace key={idx} value={value} />
            ))}
            {currentEvent && (
                <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white font-bold animate-bounce-in"
                    style={{ backgroundColor: currentEvent.color }}
                >
                    {currentEvent.name}
                </div>
            )}
        </div>
    )
}

// Timer display
function TimerDisplay({ time, isPlaying, isPaused }) {
    return (
        <div className={`
      text-5xl md:text-6xl font-bold font-mono text-center
      ${!isPlaying ? 'text-text-secondary' : isPaused ? 'text-yellow-400' : 'text-accent'}
    `}>
            {time}
        </div>
    )
}

// Control buttons
function Controls({ isPlaying, isPaused, onStart, onPause, onResume, onStop, onReset, onSkip }) {
    return (
        <div className="flex gap-3 justify-center flex-wrap">
            {!isPlaying ? (
                <button onClick={onStart} className="btn-primary text-lg px-8 py-3">
                    ▶️ Start
                </button>
            ) : isPaused ? (
                <button onClick={onResume} className="btn-primary text-lg px-8 py-3">
                    ▶️ Resume
                </button>
            ) : (
                <button onClick={onPause} className="btn-secondary text-lg px-8 py-3">
                    ⏸️ Pause
                </button>
            )}
            <button onClick={onStop} className="btn-secondary" disabled={!isPlaying}>
                ⏹️ Stop
            </button>
            <button onClick={onReset} className="btn-icon text-2xl">
                ↻
            </button>
            <button onClick={onSkip} className="btn-secondary" disabled={!isPlaying || isPaused}>
                ⏭️ Skip to End
            </button>
        </div>
    )
}

// Leaderboard (uses analytics tracker data)
function Leaderboard({ leaderboard }) {
    if (!leaderboard || leaderboard.length === 0) {
        return (
            <div className="bg-bg-card rounded-xl p-4">
                <h3 className="font-bold text-lg mb-3">🏆 Leaderboard</h3>
                <div className="text-text-secondary text-sm">Start game to see stats</div>
            </div>
        )
    }

    return (
        <div className="bg-bg-card rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3">🏆 Leaderboard</h3>
            <div className="space-y-2">
                {leaderboard.map((player, idx) => (
                    <div
                        key={player.playerIndex}
                        className={`flex justify-between items-center p-2 rounded-lg ${player.isCurrent ? 'bg-accent/20' : 'bg-white/5'}`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-6">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                            </span>
                            <span>{player.playerName}</span>
                        </div>
                        <div className="text-right">
                            <div className="font-bold">{player.totalRolls} rolls</div>
                            <div className="text-xs text-text-secondary">{player.turnCount} turns | {player.totalTime.toFixed(1)}s</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 6x6 Heatmap (matches original)
function Heatmap6x6({ heatmapData, totalRolls }) {
    if (!heatmapData) {
        return (
            <div className="bg-bg-card rounded-xl p-4">
                <h3 className="font-bold text-lg mb-3">📊 Roll Distribution (2d6)</h3>
                <div className="text-text-secondary text-sm">Roll dice to see distribution</div>
            </div>
        )
    }

    const heatColors = [
        'bg-blue-900', // very cold
        'bg-blue-700', // cold
        'bg-blue-500', // slightly cold
        'bg-gray-500', // expected
        'bg-orange-500', // slightly hot
        'bg-orange-600', // hot
        'bg-red-600', // very hot
    ]

    return (
        <div className="bg-bg-card rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3">📊 Roll Distribution (2d6)</h3>
            <div className="overflow-x-auto">
                <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: 'auto repeat(6, 1fr)' }}>
                    {/* Header row */}
                    <div className="w-8 h-8"></div>
                    {[1, 2, 3, 4, 5, 6].map(j => (
                        <div key={`h-${j}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-text-secondary">{j}</div>
                    ))}
                    {/* Data rows */}
                    {heatmapData.map((row, i) => (
                        <>
                            <div key={`l-${i}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-text-secondary">{i + 1}</div>
                            {row.map((cell, j) => (
                                <div
                                    key={`${i}-${j}`}
                                    className={`w-8 h-8 flex items-center justify-center text-xs rounded ${heatColors[cell.heatLevel]}`}
                                    title={`${cell.count} (${(cell.proportion * 100).toFixed(1)}%)`}
                                >
                                    {cell.count}
                                </div>
                            ))}
                        </>
                    ))}
                </div>
            </div>
            <div className="flex justify-between text-xs mt-2 text-text-secondary">
                <span>Cold (under)</span>
                <span>Expected: 2.78%</span>
                <span>Hot (over)</span>
            </div>
            <div className="text-center text-xs mt-1">Total: {totalRolls} rolls</div>
        </div>
    )
}

// Stats panel
function StatsPanel({ totalRolls, currentPlayerName, currentTurnRolls, rollsSinceLastEvent }) {
    return (
        <div className="flex gap-4 justify-center flex-wrap">
            <div className="bg-bg-card rounded-xl px-4 py-2 text-center">
                <div className="text-xs uppercase text-text-secondary">Total Rolls</div>
                <div className="text-2xl font-bold text-accent">{totalRolls}</div>
            </div>
            <div className="bg-bg-card rounded-xl px-4 py-2 text-center">
                <div className="text-xs uppercase text-text-secondary">Current Player</div>
                <div className="text-lg font-bold">{currentPlayerName}</div>
            </div>
            <div className="bg-bg-card rounded-xl px-4 py-2 text-center">
                <div className="text-xs uppercase text-text-secondary">Turn Rolls</div>
                <div className="text-lg font-bold">{currentTurnRolls}</div>
            </div>
            <div className="bg-bg-card rounded-xl px-4 py-2 text-center">
                <div className="text-xs uppercase text-text-secondary">Since Event</div>
                <div className="text-lg font-bold">{rollsSinceLastEvent}</div>
            </div>
        </div>
    )
}

// Settings panel
function SettingsPanel({
    isOpen,
    onClose,
    gameDuration,
    onDurationChange,
    rollInterval,
    onIntervalChange,
    resetDuration,
    onResetChange
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-bg-card rounded-2xl border border-white/10 p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">⚙️ Settings</h2>
                    <button onClick={onClose} className="text-2xl hover:text-accent">&times;</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm mb-2">Game Duration (minutes)</label>
                        <input
                            type="number"
                            value={gameDuration}
                            onChange={e => onDurationChange(parseInt(e.target.value) || 1)}
                            min={1}
                            max={60}
                            className="w-full p-3 rounded-lg bg-white/10 border border-white/10"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Roll Interval (seconds)</label>
                        <input
                            type="number"
                            value={rollInterval}
                            onChange={e => onIntervalChange(parseFloat(e.target.value) || 1)}
                            min={0.1}
                            max={10}
                            step={0.1}
                            className="w-full p-3 rounded-lg bg-white/10 border border-white/10"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Reset Duration (seconds)</label>
                        <input
                            type="number"
                            value={resetDuration}
                            onChange={e => onResetChange(parseInt(e.target.value) || 1)}
                            min={1}
                            max={30}
                            className="w-full p-3 rounded-lg bg-white/10 border border-white/10"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Advanced Settings Modal - Player config, event rules, JSON export
function AdvancedSettingsModal({
    isOpen,
    onClose,
    players,
    onPlayersChange,
    eventDefinitions,
    onEventDefinitionsChange,
    diceCount,
    diceSides,
    settings,
    onExportConfig
}) {
    const [localPlayers, setLocalPlayers] = useState(players)
    const [localEvents, setLocalEvents] = useState(eventDefinitions)

    // Sync local state when props change
    useEffect(() => {
        setLocalPlayers(players)
        setLocalEvents(eventDefinitions)
    }, [players, eventDefinitions])

    if (!isOpen) return null

    const addPlayer = () => {
        const newId = localPlayers.length + 1
        setLocalPlayers([...localPlayers, { id: newId, name: `Player ${newId}` }])
    }

    const removePlayer = (index) => {
        if (localPlayers.length <= 1) return
        setLocalPlayers(localPlayers.filter((_, i) => i !== index))
    }

    const updatePlayerName = (index, name) => {
        setLocalPlayers(localPlayers.map((p, i) => i === index ? { ...p, name } : p))
    }

    const addEventDefinition = () => {
        setLocalEvents([...localEvents, {
            id: Date.now(),
            name: 'New Event',
            rules: [{ dieIndex: 0, operator: '==', value: 1 }]
        }])
    }

    const removeEventDefinition = (index) => {
        setLocalEvents(localEvents.filter((_, i) => i !== index))
    }

    const addRule = (eventIndex) => {
        setLocalEvents(localEvents.map((e, i) => {
            if (i !== eventIndex) return e
            return {
                ...e,
                rules: [...e.rules, { dieIndex: 0, operator: '==', value: 1 }]
            }
        }))
    }

    const updateRule = (eventIndex, ruleIndex, field, value) => {
        setLocalEvents(localEvents.map((e, i) => {
            if (i !== eventIndex) return e
            return {
                ...e,
                rules: e.rules.map((r, j) => j === ruleIndex ? { ...r, [field]: value } : r)
            }
        }))
    }

    const removeRule = (eventIndex, ruleIndex) => {
        setLocalEvents(localEvents.map((e, i) => {
            if (i !== eventIndex) return e
            return { ...e, rules: e.rules.filter((_, j) => j !== ruleIndex) }
        }))
    }

    const handleSave = () => {
        onPlayersChange(localPlayers)
        onEventDefinitionsChange(localEvents)
        onClose()
    }

    const handleExport = () => {
        const config = {
            version: '2.1',
            settings: {
                interval: settings.rollInterval, // already in seconds
                resetDuration: settings.resetDuration,
                diceCount: settings.diceCount,
                diceSides: settings.diceSides,
                duration: settings.gameDuration,
            },
            players: localPlayers.reduce((acc, p, i) => ({ ...acc, [i + 1]: p.name }), {}),
            eventDefinitions: localEvents.map(def => ({
                id: def.id,
                name: def.name,
                rules: def.rules
            }))
        }

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'random-event-dice-config.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-bg-card rounded-2xl border border-white/10 p-6 max-w-2xl w-full my-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">⚡ Advanced Settings</h2>
                    <button onClick={onClose} className="text-2xl hover:text-accent">&times;</button>
                </div>

                {/* Player Configuration */}
                <div className="mb-6">
                    <h3 className="font-bold mb-3">👥 Players ({localPlayers.length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-white/5 rounded-lg p-3">
                        {localPlayers.map((player, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-text-secondary w-6">{idx + 1}.</span>
                                <input
                                    type="text"
                                    value={player.name}
                                    onChange={e => updatePlayerName(idx, e.target.value)}
                                    className="flex-1 p-2 rounded bg-white/10 border border-white/10"
                                />
                                <button
                                    onClick={() => removePlayer(idx)}
                                    className="text-red-400 hover:text-red-300 px-2"
                                    disabled={localPlayers.length <= 1}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addPlayer} className="mt-2 text-accent hover:text-accent/80 text-sm">
                        + Add Player
                    </button>
                </div>

                {/* Event Definitions */}
                <div className="mb-6">
                    <h3 className="font-bold mb-3">🎯 Event Definitions ({localEvents.length})</h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                        {localEvents.map((event, eventIdx) => (
                            <div key={event.id} className="bg-white/5 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <input
                                        type="text"
                                        value={event.name || `Event ${eventIdx + 1}`}
                                        onChange={e => setLocalEvents(localEvents.map((ev, i) =>
                                            i === eventIdx ? { ...ev, name: e.target.value } : ev
                                        ))}
                                        className="font-bold bg-transparent border-b border-white/20 focus:border-accent outline-none"
                                    />
                                    <button
                                        onClick={() => removeEventDefinition(eventIdx)}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="text-xs text-text-secondary mb-2">Rules (AND logic):</div>
                                <div className="space-y-1">
                                    {event.rules.map((rule, ruleIdx) => (
                                        <div key={ruleIdx} className="flex items-center gap-2 text-sm">
                                            <span>Die</span>
                                            <select
                                                value={rule.dieIndex}
                                                onChange={e => updateRule(eventIdx, ruleIdx, 'dieIndex', parseInt(e.target.value))}
                                                className="p-1 rounded bg-white/10 border border-white/10"
                                            >
                                                {Array.from({ length: diceCount }, (_, i) => (
                                                    <option key={i} value={i}>{i + 1}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={rule.operator}
                                                onChange={e => updateRule(eventIdx, ruleIdx, 'operator', e.target.value)}
                                                className="p-1 rounded bg-white/10 border border-white/10"
                                            >
                                                <option value="==">==</option>
                                                <option value="!=">!=</option>
                                                <option value=">">&gt;</option>
                                                <option value="<">&lt;</option>
                                                <option value=">=">&gt;=</option>
                                                <option value="<=">&lt;=</option>
                                            </select>
                                            <input
                                                type="number"
                                                value={rule.value}
                                                onChange={e => updateRule(eventIdx, ruleIdx, 'value', parseInt(e.target.value) || 1)}
                                                min={1}
                                                max={diceSides}
                                                className="w-16 p-1 rounded bg-white/10 border border-white/10"
                                            />
                                            {event.rules.length > 1 && (
                                                <button
                                                    onClick={() => removeRule(eventIdx, ruleIdx)}
                                                    className="text-red-400 text-xs"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => addRule(eventIdx)}
                                    className="text-accent hover:text-accent/80 text-xs mt-2"
                                >
                                    + Add Rule
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addEventDefinition} className="mt-2 text-accent hover:text-accent/80 text-sm">
                        + Add Event Definition
                    </button>
                </div>

                {/* Actions */}
                <div className="space-y-4 border-t border-white/10 pt-4">
                    {/* Import */}
                    <div className="flex items-center gap-3">
                        <label className="btn-secondary text-sm cursor-pointer">
                            📤 Import Config
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    const reader = new FileReader()
                                    reader.onload = (event) => {
                                        try {
                                            const config = JSON.parse(event.target.result)
                                            // Apply players
                                            if (config.players) {
                                                const imported = Object.entries(config.players).map(([id, name]) => ({
                                                    id: parseInt(id),
                                                    name
                                                }))
                                                setLocalPlayers(imported)
                                            }
                                            // Apply events
                                            if (config.eventDefinitions) {
                                                setLocalEvents(config.eventDefinitions.map(def => ({
                                                    ...def,
                                                    id: def.id || Date.now() + Math.random()
                                                })))
                                            }
                                            alert('Config imported successfully!')
                                        } catch (err) {
                                            alert('Failed to import config: ' + err.message)
                                        }
                                    }
                                    reader.readAsText(file)
                                    e.target.value = ''
                                }}
                            />
                        </label>
                        <span className="text-xs text-text-secondary">Import player names and event definitions from JSON</span>
                    </div>

                    {/* Save buttons */}
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => { handleSave(); handleExport() }} className="btn-secondary">
                            💾 Save & Export
                        </button>
                        <button onClick={handleSave} className="btn-primary">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Dashboard (collapsible)
function Dashboard({ isOpen, onToggle, game }) {
    return (
        <div className={`
      fixed right-0 top-0 h-full w-80 md:w-96 bg-bg-card border-l border-white/10
      transform transition-transform duration-300 z-30
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      overflow-y-auto
    `}>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">📊 Dashboard</h2>
                    <button onClick={onToggle} className="text-xl hover:text-accent">&times;</button>
                </div>

                <div className="space-y-6">
                    <Leaderboard leaderboard={game.leaderboard} />

                    {/* 6x6 Heatmap for 2d6 */}
                    {game.diceCount === 2 && game.diceSides === 6 && (
                        <Heatmap6x6 heatmapData={game.heatmapData} totalRolls={game.totalRolls} />
                    )}

                    {/* Timeline */}
                    {game.timeline.length > 0 && (
                        <div className="bg-bg-card rounded-xl p-4">
                            <h3 className="font-bold text-lg mb-3">⏱️ Recent Turns</h3>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                {game.timeline.map((turn, idx) => (
                                    <div key={idx} className="flex justify-between text-sm p-1 bg-white/5 rounded">
                                        <span>#{turn.turnNumber} {turn.playerName}</span>
                                        <span>{turn.rolls} rolls | {turn.time.toFixed(1)}s</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Main component
export default function RandomEventDice() {
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [dashboardOpen, setDashboardOpen] = useState(false)
    const [advancedOpen, setAdvancedOpen] = useState(false)

    const game = useRandomEventDice()

    return (
        <div className="min-h-screen p-4 md:p-8">
            <HomeButton hasUnsavedProgress={game.hasModified} />

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <header className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">
                        🎲 Random Event Dice
                    </h1>
                    <p className="text-text-secondary">Roll the dice and trigger events!</p>
                </header>

                {/* Timer */}
                <div className="mb-6">
                    <TimerDisplay
                        time={game.formattedTime}
                        isPlaying={game.isPlaying}
                        isPaused={game.isPaused}
                    />
                </div>

                {/* Stats */}
                <div className="mb-6">
                    <StatsPanel
                        totalRolls={game.totalRolls}
                        currentPlayerName={game.currentPlayerName}
                        currentTurnRolls={game.currentTurnRolls}
                        rollsSinceLastEvent={game.rollsSinceLastEvent}
                    />
                </div>

                {/* Dice */}
                <div className="mb-6 relative">
                    <DiceArea
                        values={game.diceValues}
                        isResetting={game.isResetting}
                        currentEvent={game.currentEvent}
                    />
                </div>

                {/* Current Sum */}
                <div className="text-center mb-6">
                    <span className="text-6xl font-bold text-accent">
                        {game.diceValues.reduce((a, b) => a + b, 0)}
                    </span>
                </div>

                {/* Controls */}
                <div className="mb-6">
                    <Controls
                        isPlaying={game.isPlaying}
                        isPaused={game.isPaused}
                        onStart={game.start}
                        onPause={game.pause}
                        onResume={game.resume}
                        onStop={game.stop}
                        onReset={game.reset}
                        onSkip={game.skipToEnd}
                    />
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3 justify-center flex-wrap">
                    <button
                        onClick={() => setDashboardOpen(true)}
                        className="btn-secondary"
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setAdvancedOpen(true)}
                        className="btn-secondary"
                    >
                        ⚡ Advanced
                    </button>
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="btn-icon text-xl"
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            {/* Dashboard */}
            <Dashboard
                isOpen={dashboardOpen}
                onToggle={() => setDashboardOpen(false)}
                game={game}
            />

            {/* Dashboard Toggle Button (when closed) */}
            {!dashboardOpen && (
                <button
                    onClick={() => setDashboardOpen(true)}
                    className="fixed right-4 top-1/2 -translate-y-1/2 z-20 bg-bg-card p-3 rounded-l-xl border border-r-0 border-white/10"
                >
                    📊
                </button>
            )}

            {/* Settings */}
            <SettingsPanel
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                gameDuration={game.gameDuration}
                onDurationChange={(v) => { game.setGameDuration(v); game.reset(); }}
                rollInterval={game.rollInterval}
                onIntervalChange={game.setRollInterval}
                resetDuration={game.resetDuration}
                onResetChange={game.setResetDuration}
            />

            {/* Advanced Settings */}
            <AdvancedSettingsModal
                isOpen={advancedOpen}
                onClose={() => setAdvancedOpen(false)}
                players={game.players}
                onPlayersChange={game.setPlayers}
                eventDefinitions={game.eventDefinitions}
                onEventDefinitionsChange={game.setEventDefinitions}
                diceCount={game.diceCount}
                diceSides={game.diceSides}
                settings={{
                    rollInterval: game.rollInterval,
                    resetDuration: game.resetDuration,
                    diceCount: game.diceCount,
                    diceSides: game.diceSides,
                    gameDuration: game.gameDuration
                }}
            />
        </div>
    )
}
