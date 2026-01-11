import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { HomeButton } from '../../components'
import useGame2048 from './hooks/useGame2048'

// Tile color palette based on value
const TILE_COLORS = {
    0: 'bg-slate-700/50',
    2: 'bg-amber-100 text-slate-800',
    4: 'bg-amber-200 text-slate-800',
    8: 'bg-orange-300 text-white',
    16: 'bg-orange-400 text-white',
    32: 'bg-orange-500 text-white',
    64: 'bg-red-500 text-white',
    128: 'bg-yellow-400 text-white',
    256: 'bg-yellow-500 text-white',
    512: 'bg-yellow-600 text-white',
    1024: 'bg-yellow-700 text-white',
    2048: 'bg-yellow-800 text-white',
}

function Tile({ value }) {
    const colorClass = TILE_COLORS[value] || 'bg-purple-600 text-white'
    const sizeClass = value >= 1000 ? 'text-2xl' : value >= 100 ? 'text-3xl' : 'text-4xl'

    return (
        <div className={`
      aspect-square rounded-lg flex items-center justify-center font-bold
      ${colorClass} ${sizeClass}
      transition-all duration-100 ease-out
      ${value > 0 ? 'animate-bounce-in' : ''}
    `}>
            {value > 0 ? value : ''}
        </div>
    )
}

function GameGrid({ board }) {
    return (
        <div className="bg-slate-800 rounded-xl p-3 md:p-4 shadow-2xl max-w-sm md:max-w-md lg:max-w-lg mx-auto">
            <div className="grid grid-cols-4 gap-2 md:gap-3">
                {board.flat().map((value, idx) => (
                    <Tile key={idx} value={value} />
                ))}
            </div>
        </div>
    )
}

function ScorePanel({ score, bestScore }) {
    return (
        <div className="flex gap-4 justify-center">
            <div className="bg-bg-card rounded-xl px-6 py-3 text-center min-w-[100px]">
                <div className="text-xs uppercase text-text-secondary">Score</div>
                <div className="text-2xl font-bold text-accent">{score}</div>
            </div>
            <div className="bg-bg-card rounded-xl px-6 py-3 text-center min-w-[100px]">
                <div className="text-xs uppercase text-text-secondary">Best</div>
                <div className="text-2xl font-bold text-yellow-400">{bestScore}</div>
            </div>
        </div>
    )
}

function ControlPanel({ onNewGame, onHint, onAutoPlay, isAutoPlaying }) {
    return (
        <div className="flex gap-3 justify-center flex-wrap">
            <button
                onClick={onNewGame}
                className="btn-icon bg-bg-card text-3xl"
                title="New Game"
            >
                ↻
            </button>
            <button
                onClick={onHint}
                className="btn-secondary"
            >
                💡 Hint
            </button>
            <button
                onClick={onAutoPlay}
                className={`btn-primary ${isAutoPlaying ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
                {isAutoPlaying ? '⏹ Stop' : '🤖 Play for Me'}
            </button>
        </div>
    )
}

function SettingsModal({ isOpen, onClose, theme, onThemeChange, autoSpeed, onSpeedChange }) {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-bg-card rounded-2xl border border-white/10 p-6 max-w-sm w-full"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button onClick={onClose} className="text-2xl hover:text-accent">&times;</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm mb-2">Theme</label>
                        <select
                            value={theme}
                            onChange={e => onThemeChange(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/10 border border-white/10"
                        >
                            <option value="classic">Classic Toy</option>
                            <option value="dark">Dark Mode</option>
                            <option value="pastel">Pastel Dream</option>
                            <option value="neon">Neon Arcade</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Auto-Play Speed</label>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-text-secondary">Slow</span>
                            <input
                                type="range"
                                min="50"
                                max="500"
                                step="50"
                                value={550 - autoSpeed}
                                onChange={e => onSpeedChange(550 - parseInt(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-xs text-text-secondary">Fast</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-text-secondary">
                        Use Arrow Keys or Swipe to play!
                    </p>
                </div>
            </div>
        </div>
    )
}

function GameMessage({ gameOver, gameWon, onContinue, onNewGame }) {
    if (!gameOver && !gameWon) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-bg-card rounded-2xl p-8 text-center max-w-sm mx-4 animate-bounce-in">
                <h2 className="text-3xl font-bold mb-4">
                    {gameWon ? '🎉 You Win!' : '💀 Game Over!'}
                </h2>
                <div className="flex gap-3 justify-center">
                    {gameWon && (
                        <button onClick={onContinue} className="btn-primary">
                            Keep Playing
                        </button>
                    )}
                    <button onClick={onNewGame} className="btn-secondary">
                        New Game
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Game2048() {
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [showWinMessage, setShowWinMessage] = useState(true)
    const touchRef = useRef({ startX: 0, startY: 0 })

    const game = useGame2048()

    // Keyboard controls
    useEffect(() => {
        const handler = (e) => {
            if (e.key.startsWith('Arrow')) {
                game.handleKeyDown(e)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [game.handleKeyDown])

    const handleHint = () => {
        const hint = game.getHint()
        if (hint) {
            alert(`Try moving ${hint}`)
        } else {
            alert('No good moves available!')
        }
    }

    const handleTouchStart = (e) => {
        touchRef.current = {
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY
        }
    }

    const handleTouchEnd = (e) => {
        const endX = e.changedTouches[0].clientX
        const endY = e.changedTouches[0].clientY
        game.handleSwipe(touchRef.current.startX, touchRef.current.startY, endX, endY)
    }

    const handleContinue = () => {
        setShowWinMessage(false)
    }

    return (
        <div
            className="min-h-screen p-4 md:p-8 flex flex-col items-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <HomeButton hasUnsavedProgress={game.hasModified} />

            <div className="w-full max-w-lg">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gradient font-game">
                            2048!
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            to="/definitions"
                            className="text-xs text-text-secondary hover:text-accent hidden md:block"
                        >
                            AI, Analytics & Research →
                        </Link>
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="btn-icon text-2xl"
                            aria-label="Settings"
                        >
                            ⚙️
                        </button>
                    </div>
                </header>

                {/* Score */}
                <div className="mb-6">
                    <ScorePanel score={game.score} bestScore={game.bestScore} />
                </div>

                {/* Game Grid */}
                <div className="mb-6">
                    <GameGrid board={game.board} />
                </div>

                {/* Controls */}
                <ControlPanel
                    onNewGame={game.startNewGame}
                    onHint={handleHint}
                    onAutoPlay={game.toggleAutoPlay}
                    isAutoPlaying={game.isAutoPlaying}
                />
            </div>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                theme={game.theme}
                onThemeChange={game.setTheme}
                autoSpeed={game.autoSpeed}
                onSpeedChange={game.setAutoSpeed}
            />

            {/* Game Over / Win Message */}
            {(game.gameOver || (game.gameWon && showWinMessage)) && (
                <GameMessage
                    gameOver={game.gameOver}
                    gameWon={game.gameWon && showWinMessage}
                    onContinue={handleContinue}
                    onNewGame={game.startNewGame}
                />
            )}
        </div>
    )
}
