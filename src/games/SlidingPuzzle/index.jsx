import { useState } from 'react'
import { HomeButton } from '../../components'
import useSlidingPuzzle from './hooks/useSlidingPuzzle'

// Tile colors
const COLORS_KIDS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500']
const COLORS_ADVANCED = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-orange-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500'
]

function Tile({ value, index, isAdvanced, isHint, onClick, interactive = true }) {
    if (value === 0) {
        return (
            <div className="aspect-square rounded-lg bg-slate-800/50" />
        )
    }

    const colors = isAdvanced ? COLORS_ADVANCED : COLORS_KIDS
    const colorClass = colors[(value - 1) % colors.length]

    return (
        <button
            onClick={() => interactive && onClick?.(index)}
            disabled={!interactive}
            className={`
        aspect-square rounded-lg flex items-center justify-center font-bold text-2xl
        ${colorClass} text-white
        transition-all duration-150 ease-out
        ${interactive ? 'hover:scale-105 active:scale-95 cursor-pointer' : ''}
        ${isHint ? 'ring-4 ring-white animate-pulse' : ''}
        shadow-lg
      `}
        >
            {isAdvanced ? value : ''}
        </button>
    )
}

function PuzzleGrid({ state, isAdvanced, hintIndex, onClick, interactive = true }) {
    return (
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {state.map((value, idx) => (
                <Tile
                    key={idx}
                    value={value}
                    index={idx}
                    isAdvanced={isAdvanced}
                    isHint={hintIndex === idx}
                    onClick={onClick}
                    interactive={interactive}
                />
            ))}
        </div>
    )
}

function StatsPanel({ movesTaken, optimalMoves, isVisible }) {
    if (!isVisible) return null

    return (
        <div className="flex gap-4 justify-center text-sm">
            <div className="bg-bg-card rounded-lg px-4 py-2">
                <span className="text-text-secondary">Moves: </span>
                <span className="font-bold text-accent">{movesTaken}</span>
            </div>
            <div className="bg-bg-card rounded-lg px-4 py-2">
                <span className="text-text-secondary">Optimal: </span>
                <span className="font-bold text-success">{optimalMoves}</span>
            </div>
        </div>
    )
}

function WinOverlay({ isVisible, onPlayAgain }) {
    if (!isVisible) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-bg-card rounded-2xl p-8 text-center max-w-sm mx-4 animate-bounce-in">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-4">You Win!</h2>
                <button onClick={onPlayAgain} className="btn-primary">
                    Play Again
                </button>
            </div>
        </div>
    )
}

function SettingsModal({
    isOpen,
    onClose,
    showStats,
    onShowStatsChange,
    autoSpeed,
    onSpeedChange
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-bg-card rounded-2xl border border-white/10 p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button onClick={onClose} className="text-2xl hover:text-accent">&times;</button>
                </div>

                <div className="space-y-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showStats}
                            onChange={e => onShowStatsChange(e.target.checked)}
                            className="w-5 h-5 accent-accent"
                        />
                        <span>Show Statistics</span>
                    </label>

                    <div>
                        <label className="block text-sm mb-2">Solve Speed</label>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-text-secondary">Slow</span>
                            <input
                                type="range"
                                min="100"
                                max="1000"
                                step="100"
                                value={1100 - autoSpeed}
                                onChange={e => onSpeedChange(1100 - parseInt(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-xs text-text-secondary">Fast</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SlidingPuzzle() {
    const [settingsOpen, setSettingsOpen] = useState(false)
    const game = useSlidingPuzzle()

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
            <HomeButton hasUnsavedProgress={game.hasModified} />

            <div className="w-full max-w-lg">
                {/* Header */}
                <header className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">
                        🧩 Sliding Puzzle
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Match the pattern on the right!
                    </p>
                </header>

                {/* Mode Toggle */}
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={game.toggleAdvancedMode}
                        className={`btn-secondary ${game.isAdvancedMode ? 'bg-accent/30 border-accent' : ''}`}
                    >
                        🎓 Advanced: {game.isAdvancedMode ? 'ON' : 'OFF'}
                    </button>
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="btn-icon text-xl"
                    >
                        ⚙️
                    </button>
                </div>

                {/* Stats */}
                <div className="mb-6">
                    <StatsPanel
                        movesTaken={game.movesTaken}
                        optimalMoves={game.optimalMoves}
                        isVisible={game.showStats}
                    />
                </div>

                {/* Puzzle Grids */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Current State (Interactive) */}
                    <div>
                        <h3 className="text-center text-sm text-text-secondary mb-2">Your Puzzle</h3>
                        <PuzzleGrid
                            state={game.currentState}
                            isAdvanced={game.isAdvancedMode}
                            hintIndex={game.hintIndex}
                            onClick={game.handleTileClick}
                        />
                    </div>

                    {/* Target State */}
                    <div>
                        <h3 className="text-center text-sm text-text-secondary mb-2">Target</h3>
                        <PuzzleGrid
                            state={game.targetState}
                            isAdvanced={game.isAdvancedMode}
                            hintIndex={null}
                            interactive={false}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3 justify-center flex-wrap">
                    <button onClick={game.startNewGame} className="btn-icon text-3xl" title="New Game">
                        ↻
                    </button>
                    <button onClick={game.showHint} className="btn-secondary">
                        💡 Hint
                    </button>
                    <button
                        onClick={game.toggleAutoSolve}
                        className={`btn-primary ${game.isAutoSolving ? 'bg-red-500 hover:bg-red-600' : ''}`}
                    >
                        {game.isAutoSolving ? '⏹ Stop' : '🤖 Play for Me'}
                    </button>
                </div>
            </div>

            {/* Win Overlay */}
            <WinOverlay
                isVisible={game.hasWon}
                onPlayAgain={() => { game.setHasWon(false); game.startNewGame(); }}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                showStats={game.showStats}
                onShowStatsChange={game.setShowStats}
                autoSpeed={game.autoSpeed}
                onSpeedChange={game.setAutoSpeed}
            />
        </div>
    )
}
