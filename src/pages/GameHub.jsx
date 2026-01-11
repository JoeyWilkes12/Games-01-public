import { GameCard } from '../components'

const games = [
    {
        id: 'random-event-dice',
        title: 'Random Event Dice',
        icon: '🎲',
        to: '/games/random-event-dice',
        gradient: 'dice',
        status: 'playable',
    },
    {
        id: '2048',
        title: '2048',
        icon: '🔢',
        to: '/games/2048',
        gradient: '2048',
        status: 'playable',
    },
    {
        id: 'sliding-puzzle',
        title: 'Sliding Puzzle',
        icon: '🧩',
        to: '/games/sliding-puzzle',
        gradient: 'puzzle',
        status: 'playable',
    },
    {
        id: 'bank',
        title: 'Bank',
        icon: '🏦',
        to: '/games/bank',
        gradient: 'bank',
        status: 'playable',
    },
    {
        id: 'acquire',
        title: 'Acquire',
        icon: '🏨',
        gradient: 'acquire',
        status: 'soon',
    },
    {
        id: 'mastermind',
        title: 'Mastermind',
        icon: '🔴',
        gradient: 'mastermind',
        status: 'soon',
    },
    {
        id: 'queens',
        title: 'Queens',
        icon: '👑',
        gradient: 'queens',
        status: 'soon',
    },
    {
        id: 'wordle',
        title: 'Wordle',
        icon: '📝',
        gradient: 'wordle',
        status: 'soon',
    },
    {
        id: 'risk',
        title: 'Risk',
        icon: '🌍',
        gradient: 'risk',
        status: 'soon',
    },
]

export default function GameHub() {
    return (
        <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
            {/* Header */}
            <header className="text-center mb-8 md:mb-16 animate-fade-in-down">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gradient mb-4 tracking-tight"
                    style={{ textShadow: '0 10px 30px rgba(56, 189, 248, 0.3)' }}>
                    Game Hub
                </h1>
                <p className="text-text-secondary text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                    A collection of logic puzzles, strategy games, and algorithmic challenges.
                </p>

                {/* Header Links */}
                <div className="mt-4 flex flex-wrap gap-4 md:gap-6 justify-center text-sm">
                    <a
                        href="https://www.notion.so/Random-Event-Dice-Game-Public-2e2692f524348040969cd794baa02219?source=copy_link"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 transition-colors flex items-center gap-2"
                    >
                        <span>📄</span> Website Overview
                    </a>
                    <a
                        href="https://github.com/JoeyWilkes12/Games-01-public"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 transition-colors flex items-center gap-2"
                    >
                        <span>💻</span> See code here
                    </a>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-6xl">
                {/* Games Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 p-2">
                    {games.map((game, index) => (
                        <GameCard
                            key={game.id}
                            title={game.title}
                            icon={game.icon}
                            to={game.to}
                            gradient={game.gradient}
                            status={game.status}
                            animationDelay={(index + 1) * 0.1}
                        />
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-8 mt-8 text-text-secondary text-sm border-t border-white/10 w-full max-w-6xl">
                <p>v4.0.0 — React + Tailwind Edition</p>
            </footer>
        </div>
    )
}
