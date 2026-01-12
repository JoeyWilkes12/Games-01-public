import { useState } from 'react'
import { HomeButton } from '../../components'
import useBankGame from './hooks/useBankGame'

// Sub-components
function DiceArea({ die1, die2, isRolling, lastRollMessage, lastRollType, byodEnabled, onByodInput }) {
    const getDieClass = (value, isSeven, isDoubles) => {
        let cls = 'w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center text-4xl md:text-5xl font-bold shadow-lg transition-all duration-300'
        cls += ' bg-white text-bg-primary'
        if (isRolling) cls += ' animate-roll'
        if (isSeven) cls += ' !bg-red-500 !text-white'
        if (isDoubles && !isSeven) cls += ' !bg-yellow-400 ring-4 ring-yellow-300'
        return cls
    }

    const sum = die1 + die2
    const isSeven = sum === 7
    const isDoubles = die1 === die2 && die1 > 0

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
                <div className={getDieClass(die1, isSeven, isDoubles)}>
                    {die1 || '?'}
                </div>
                <div className={getDieClass(die2, isSeven, isDoubles)}>
                    {die2 || '?'}
                </div>
            </div>

            {/* Last Roll Info */}
            {lastRollMessage && (
                <div className={`text-center text-lg font-medium px-4 py-2 rounded-lg ${lastRollType === 'special' ? 'bg-yellow-500/20 text-yellow-300' :
                    lastRollType === 'seven' ? 'bg-red-500/20 text-red-300' :
                        'text-text-secondary'
                    }`}>
                    {lastRollMessage}
                </div>
            )}

            {/* BYOD Input */}
            {byodEnabled && (
                <details className="w-full mt-4" open>
                    <summary className="cursor-pointer text-accent font-medium text-center">
                        Enter Dice Sum
                    </summary>
                    <div className="grid grid-cols-6 gap-2 mt-3 max-w-md mx-auto">
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                            <button
                                key={num}
                                onClick={() => onByodInput(num, false)}
                                className={`py-3 rounded-lg font-bold transition-all ${num === 7
                                    ? 'bg-red-500/30 text-red-300 hover:bg-red-500/50 col-span-2'
                                    : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => onByodInput(null, true)}
                            className="col-span-3 py-3 rounded-lg font-bold bg-yellow-500/30 text-yellow-300 hover:bg-yellow-500/50"
                        >
                            ⚀⚀ Doubles
                        </button>
                    </div>
                </details>
            )}
        </div>
    )
}

function BankDisplay({ bankScore }) {
    return (
        <div className="text-center bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 shadow-xl">
            <div className="text-sm uppercase tracking-wider text-emerald-200 mb-1">BANK</div>
            <div className="text-5xl md:text-6xl font-extrabold text-white">{bankScore}</div>
            <div className="text-xs text-emerald-200 mt-1">Points available to claim</div>
        </div>
    )
}

function ActionButtons({
    onRoll,
    onUndo,
    canRoll,
    canUndo,
    byodEnabled
}) {
    return (
        <div className="flex gap-3 justify-center">
            {!byodEnabled && (
                <button
                    onClick={onRoll}
                    disabled={!canRoll}
                    className="btn-primary text-xl px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    🎲 Roll Dice
                </button>
            )}
            <button
                onClick={onUndo}
                disabled={!canUndo}
                className="btn-secondary px-4 py-4 disabled:opacity-50"
                title="Undo (Ctrl+Z)"
            >
                ↶ Undo
            </button>
        </div>
    )
}

function BankingPanel({
    canBank,
    availablePlayers,
    bankScore,
    onBank,
    rollNumber
}) {
    const [selectedIds, setSelectedIds] = useState([])

    const togglePlayer = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const selectAll = () => setSelectedIds(availablePlayers.map(p => p.id))
    const clearAll = () => setSelectedIds([])

    const handleBank = () => {
        if (selectedIds.length > 0) {
            onBank(selectedIds)
            setSelectedIds([])
        }
    }

    if (!canBank) {
        return (
            <div className="text-center text-text-secondary py-4">
                {rollNumber < 3 ? `Banking enabled after ${3 - rollNumber} more roll${3 - rollNumber > 1 ? 's' : ''}` : ''}
            </div>
        )
    }

    return (
        <details className="bg-bg-card rounded-xl border border-white/10 p-4" open>
            <summary className="cursor-pointer font-medium flex justify-between items-center">
                <span>Select players to BANK</span>
                <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs px-2 py-1 bg-white/10 rounded">All</button>
                    <button onClick={clearAll} className="text-xs px-2 py-1 bg-white/10 rounded">Clear</button>
                </div>
            </summary>
            <div className="mt-4 grid grid-cols-2 gap-2">
                {availablePlayers.map(player => (
                    <label
                        key={player.id}
                        className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${selectedIds.includes(player.id)
                            ? 'bg-accent/30 border-accent'
                            : 'bg-white/5 hover:bg-white/10'
                            } border border-transparent`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(player.id)}
                            onChange={() => togglePlayer(player.id)}
                            className="w-5 h-5 accent-accent"
                        />
                        <span>{player.name}</span>
                    </label>
                ))}
            </div>
            <button
                onClick={handleBank}
                disabled={selectedIds.length === 0}
                className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
                🏦 BANK Selected ({selectedIds.length})
            </button>
        </details>
    )
}

function Scoreboard({
    currentPlayer,
    players,
    sortedPlayers,
    rankInfo
}) {
    return (
        <aside className="bg-bg-card rounded-xl border border-white/10 p-4">
            <h2 className="font-bold text-lg mb-4">🎯 Scoreboard</h2>

            {/* Compact Current Player View */}
            {currentPlayer && (
                <div className="mb-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{currentPlayer.name}</span>
                        <span className="text-sm text-text-secondary">
                            {rankInfo.rank}{rankInfo.rank === 1 ? 'st' : rankInfo.rank === 2 ? 'nd' : rankInfo.rank === 3 ? 'rd' : 'th'} of {rankInfo.total}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-accent">{currentPlayer.score}</div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div>
                            <div className="text-text-secondary">To tie next</div>
                            <div className="font-medium">{rankInfo.tieNext}</div>
                        </div>
                        <div>
                            <div className="text-text-secondary">To tie leader</div>
                            <div className="font-medium">{rankInfo.tieLeader}</div>
                        </div>
                        <div>
                            <div className="text-text-secondary">Ahead by</div>
                            <div className="font-medium">{rankInfo.aheadBy}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Scoreboard */}
            <details className="mt-4">
                <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary">
                    📋 Full Scoreboard
                </summary>
                <div className="mt-3 space-y-2">
                    {sortedPlayers.map((player, idx) => (
                        <div
                            key={player.id}
                            className={`flex justify-between items-center p-2 rounded-lg ${player.id === currentPlayer?.id ? 'bg-accent/20' : 'bg-white/5'
                                } ${player.hasBankedThisRound ? 'opacity-60' : ''}`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-6">
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}
                                </span>
                                <span>{player.name}</span>
                                {player.hasBankedThisRound && <span className="text-xs text-success">✓ Banked</span>}
                            </div>
                            <span className="font-bold">{player.score}</span>
                        </div>
                    ))}
                </div>
            </details>
        </aside>
    )
}

function ProbabilityCheatsheet({ survivalProbability }) {
    return (
        <details className="fixed bottom-4 left-4 bg-bg-card rounded-xl border border-white/10 p-3 max-w-xs z-30">
            <summary className="cursor-pointer text-2xl">📊</summary>
            <h4 className="font-bold mt-2 mb-3">Dice Probabilities (2d6)</h4>
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-text-secondary">Survival (no 7)</div>
                <div className="text-2xl font-bold text-success">
                    {(survivalProbability * 100).toFixed(1)}%
                </div>
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-text-secondary">
                        <th className="text-left">Sum</th>
                        <th>Prob</th>
                        <th>Ways</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        { sum: 2, prob: '2.78%', ways: 1 },
                        { sum: 3, prob: '5.56%', ways: 2 },
                        { sum: 4, prob: '8.33%', ways: 3 },
                        { sum: 5, prob: '11.11%', ways: 4 },
                        { sum: 6, prob: '13.89%', ways: 5 },
                        { sum: 7, prob: '16.67%', ways: 6 },
                        { sum: 8, prob: '13.89%', ways: 5 },
                        { sum: 9, prob: '11.11%', ways: 4 },
                        { sum: 10, prob: '8.33%', ways: 3 },
                        { sum: 11, prob: '5.56%', ways: 2 },
                        { sum: 12, prob: '2.78%', ways: 1 },
                    ].map(row => (
                        <tr key={row.sum} className={row.sum === 7 ? 'bg-red-500/20 text-red-300' : ''}>
                            <td className="py-1">{row.sum}</td>
                            <td className="text-center">{row.prob}</td>
                            <td className="text-center">{row.ways}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </details>
    )
}

function SettingsPanel({
    isOpen,
    onClose,
    totalRounds,
    onTotalRoundsChange,
    players,
    onAddPlayer,
    onRemovePlayer,
    onRenamePlayer,
    undoMode,
    onUndoModeChange,
    byodEnabled,
    onByodChange,
    onNewGame,
    onImport,
    onExport
}) {
    const handleFileImport = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target.result)
                onImport(config)
            } catch (err) {
                alert('Invalid JSON file')
            }
        }
        reader.readAsText(file)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bg-card rounded-2xl border border-white/10 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">⚙️ Game Settings</h3>
                    <button onClick={onClose} className="text-2xl hover:text-accent">✖</button>
                </div>

                <div className="space-y-6">
                    {/* Rounds */}
                    <div>
                        <label className="block text-sm mb-2">Number of Rounds</label>
                        <select
                            value={totalRounds}
                            onChange={(e) => onTotalRoundsChange(parseInt(e.target.value))}
                            className="w-full p-3 rounded-lg bg-white/10 border border-white/10"
                        >
                            <option value={1}>1 Round (Testing)</option>
                            <option value={5}>5 Rounds</option>
                            <option value={10}>10 Rounds</option>
                            <option value={15}>15 Rounds</option>
                            <option value={20}>20 Rounds</option>
                        </select>
                    </div>

                    {/* Players */}
                    <div>
                        <label className="block text-sm mb-2">Players</label>
                        <div className="space-y-2">
                            {players.map(player => (
                                <div key={player.id} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={player.name}
                                        onChange={(e) => onRenamePlayer(player.id, e.target.value)}
                                        className="flex-1 p-2 rounded-lg bg-white/10 border border-white/10"
                                    />
                                    {players.length > 2 && (
                                        <button
                                            onClick={() => onRemovePlayer(player.id)}
                                            className="px-3 text-red-400 hover:text-red-300"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={onAddPlayer}
                            className="mt-2 w-full py-2 bg-white/10 rounded-lg hover:bg-white/20"
                        >
                            + Add Player
                        </button>
                    </div>

                    {/* Undo Mode */}
                    <div>
                        <label className="block text-sm mb-2">Undo Mode</label>
                        <select
                            value={undoMode}
                            onChange={(e) => onUndoModeChange(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/10 border border-white/10"
                        >
                            <option value="resample">Re-sample (new random)</option>
                            <option value="preserve">Preserve (same rolls)</option>
                        </select>
                    </div>

                    {/* BYOD */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={byodEnabled}
                            onChange={(e) => onByodChange(e.target.checked)}
                            className="w-5 h-5 accent-accent"
                        />
                        <div>
                            <div>Bring Your Own Dice</div>
                            <div className="text-xs text-text-secondary">Use physical dice and enter sum manually</div>
                        </div>
                    </label>

                    {/* Import/Export */}
                    <div className="flex gap-2">
                        <label className="flex-1">
                            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                            <div className="w-full py-2 text-center bg-white/10 rounded-lg hover:bg-white/20 cursor-pointer">
                                📤 Import
                            </div>
                        </label>
                        <button
                            onClick={onExport}
                            className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                        >
                            📥 Export
                        </button>
                    </div>

                    {/* New Game */}
                    <button
                        onClick={() => { onNewGame(); onClose() }}
                        className="w-full btn-primary"
                    >
                        🎮 New Game
                    </button>
                </div>
            </div>
        </div>
    )
}

function GameOverModal({ isOpen, sortedPlayers, onPlayAgain, onUndo, canUndo }) {
    if (!isOpen) return null

    const winner = sortedPlayers[0]

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bg-card rounded-2xl border border-white/10 p-8 max-w-md w-full text-center">
                <h2 className="text-3xl font-bold mb-6">🏆 Game Over!</h2>

                <div className="mb-6">
                    <div className="text-2xl font-bold text-accent">{winner?.name}</div>
                    <div className="text-text-secondary">with {winner?.score} points!</div>
                </div>

                <div className="space-y-2 mb-6">
                    {sortedPlayers.map((player, idx) => (
                        <div key={player.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                            <span>
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''} {player.name}
                            </span>
                            <span className="font-bold">{player.score}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button onClick={onPlayAgain} className="flex-1 btn-primary">
                        🎮 Play Again
                    </button>
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="btn-secondary disabled:opacity-50"
                    >
                        ↶ Undo
                    </button>
                </div>
            </div>
        </div>
    )
}

function AlertMessage({ message, onDismiss }) {
    if (!message) return null

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-red-500/90 backdrop-blur-sm px-6 py-4 rounded-full shadow-2xl animate-bounce-in">
            <span className="mr-2">⚠️</span>
            <span className="font-bold">{message}</span>
        </div>
    )
}

// Main Bank Component
export default function Bank() {
    const [settingsOpen, setSettingsOpen] = useState(false)
    const game = useBankGame()

    const handleExport = () => {
        const config = game.exportConfig()
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bank-config-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
        if (e.code === 'Space' && !game.roundOver && !game.gameOver) {
            e.preventDefault()
            game.roll()
        }
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && game.canUndo) {
            e.preventDefault()
            game.undo()
        }
    }

    return (
        <div
            className="min-h-screen p-4 md:p-8"
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <HomeButton hasUnsavedProgress={game.gameStarted && !game.gameOver} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">🏦 BANK</h1>
                    <p className="text-text-secondary">Roll the dice. Bank your points. Don't get busted!</p>
                </header>

                {/* Round Info */}
                <div className="flex justify-center gap-4 mb-6 text-sm">
                    <span className="px-4 py-2 bg-bg-card rounded-full">
                        Round <span className="font-bold text-accent">{game.roundNumber}</span> / {game.totalRounds}
                    </span>
                    <span className="px-4 py-2 bg-bg-card rounded-full">
                        Roll <span className="font-bold">#{game.rollNumber}</span>
                    </span>
                </div>

                {/* Main Game Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left: Scoreboard (on desktop) */}
                    <div className="hidden md:block">
                        <Scoreboard
                            currentPlayer={game.currentPlayer}
                            players={game.players}
                            sortedPlayers={game.sortedPlayers}
                            rankInfo={game.getCurrentPlayerRankInfo()}
                        />
                    </div>

                    {/* Center: Game Area */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Bank Score */}
                        <BankDisplay bankScore={game.bankScore} />

                        {/* Dice */}
                        <DiceArea
                            die1={game.die1}
                            die2={game.die2}
                            isRolling={game.isRolling}
                            lastRollMessage={game.lastRollMessage}
                            lastRollType={game.lastRollType}
                            byodEnabled={game.byodEnabled}
                            onByodInput={game.handleByodInput}
                        />

                        {/* Current Roller */}
                        <div className="text-center">
                            <span className="text-text-secondary">Current Roller: </span>
                            <span className="font-bold text-accent">{game.currentPlayer?.name}</span>
                        </div>

                        {/* Action Buttons */}
                        <ActionButtons
                            onRoll={game.roll}
                            onUndo={game.undo}
                            canRoll={!game.roundOver && !game.gameOver && !game.byodEnabled}
                            canUndo={game.canUndo}
                            byodEnabled={game.byodEnabled}
                        />

                        {/* Banking Panel */}
                        <BankingPanel
                            canBank={game.canBank}
                            availablePlayers={game.availablePlayers}
                            bankScore={game.bankScore}
                            onBank={game.bankPlayers}
                            rollNumber={game.rollNumber}
                        />
                    </div>
                </div>

                {/* Mobile Scoreboard */}
                <div className="md:hidden mt-6">
                    <Scoreboard
                        currentPlayer={game.currentPlayer}
                        players={game.players}
                        sortedPlayers={game.sortedPlayers}
                        rankInfo={game.getCurrentPlayerRankInfo()}
                    />
                </div>

                {/* Settings Button */}
                <button
                    onClick={() => setSettingsOpen(true)}
                    className="fixed top-4 right-4 z-40 w-12 h-12 rounded-full bg-bg-card/80 backdrop-blur-lg border border-white/10 flex items-center justify-center text-2xl hover:bg-white/20 transition-all"
                >
                    ⚙️
                </button>
            </div>

            {/* Settings Panel */}
            <SettingsPanel
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                totalRounds={game.totalRounds}
                onTotalRoundsChange={game.setTotalRounds}
                players={game.players}
                onAddPlayer={game.addPlayer}
                onRemovePlayer={game.removePlayer}
                onRenamePlayer={game.renamePlayer}
                undoMode={game.undoMode}
                onUndoModeChange={game.setUndoMode}
                byodEnabled={game.byodEnabled}
                onByodChange={game.setByodEnabled}
                onNewGame={game.newGame}
                onImport={game.importConfig}
                onExport={handleExport}
            />

            {/* Probability Cheatsheet */}
            <ProbabilityCheatsheet survivalProbability={game.survivalProbability} />

            {/* Game Over Modal */}
            <GameOverModal
                isOpen={game.gameOver}
                sortedPlayers={game.sortedPlayers}
                onPlayAgain={game.newGame}
                onUndo={game.undo}
                canUndo={game.canUndo}
            />

            {/* Alert Message */}
            <AlertMessage
                message={game.alertMessage}
                onDismiss={game.dismissAlert}
            />
        </div>
    )
}
