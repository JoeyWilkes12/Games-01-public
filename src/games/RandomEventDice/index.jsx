import { useState } from 'react'
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

// Leaderboard
function Leaderboard({ players, currentPlayerIndex }) {
    return (
        <div className="bg-bg-card rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3">🏆 Leaderboard</h3>
            <div className="space-y-2">
                {players.map((player, idx) => (
                    <div
                        key={player.id}
                        className={`flex justify-between items-center p-2 rounded-lg ${idx === currentPlayerIndex ? 'bg-accent/20' : 'bg-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-6">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                            </span>
                            <span>{player.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="font-bold">{player.rolls} rolls</div>
                            <div className="text-xs text-text-secondary">{player.turns} turns</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Heatmap
function Heatmap({ data, diceCount, diceSides }) {
    const minSum = diceCount
    const maxSum = diceCount * diceSides
    const maxCount = Math.max(...Object.values(data), 1)

    return (
        <div className="bg-bg-card rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3">📊 Roll Distribution</h3>
            <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: maxSum - minSum + 1 }, (_, i) => {
                    const sum = minSum + i
                    const count = data[sum] || 0
                    const intensity = count / maxCount
                    return (
                        <div
                            key={sum}
                            className="w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs"
                            style={{
                                backgroundColor: `rgba(56, 189, 248, ${intensity})`,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <div className="font-bold">{sum}</div>
                            <div>{count}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Stats panel
function StatsPanel({ rollCount, currentPlayer }) {
    return (
        <div className="flex gap-4 justify-center">
            <div className="bg-bg-card rounded-xl px-6 py-3 text-center">
                <div className="text-xs uppercase text-text-secondary">Total Rolls</div>
                <div className="text-2xl font-bold text-accent">{rollCount}</div>
            </div>
            <div className="bg-bg-card rounded-xl px-6 py-3 text-center">
                <div className="text-xs uppercase text-text-secondary">Current</div>
                <div className="text-lg font-bold">{currentPlayer?.name}</div>
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
                        <label className="block text-sm mb-2">Roll Interval (ms)</label>
                        <input
                            type="number"
                            value={rollInterval}
                            onChange={e => onIntervalChange(parseInt(e.target.value) || 500)}
                            min={100}
                            max={5000}
                            step={100}
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

// Dashboard (collapsible)
function Dashboard({ isOpen, onToggle, game }) {
    return (
        <div className={`
      fixed right-0 top-0 h-full w-80 bg-bg-card border-l border-white/10
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
                    <Leaderboard
                        players={game.leaderboard}
                        currentPlayerIndex={game.currentPlayerIndex}
                    />
                    <Heatmap
                        data={game.heatmap}
                        diceCount={game.diceCount}
                        diceSides={game.diceSides}
                    />
                </div>
            </div>
        </div>
    )
}

// Main component
export default function RandomEventDice() {
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [dashboardOpen, setDashboardOpen] = useState(false)

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
                        rollCount={game.rollCount}
                        currentPlayer={game.currentPlayer}
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
                    <span className="text-6xl font-bold text-accent">{game.currentSum}</span>
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
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => setDashboardOpen(true)}
                        className="btn-secondary"
                    >
                        📊 Dashboard
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
        </div>
    )
}
