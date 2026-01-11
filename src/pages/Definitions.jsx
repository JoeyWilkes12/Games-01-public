import { Link } from 'react-router-dom'
import { HomeButton } from '../components'

const algorithms = [
    {
        abbrev: 'Mc',
        name: 'Monte Carlo',
        description: 'A probabilistic algorithm that uses random sampling to evaluate possible moves. It simulates many random games from the current state and chooses the move that leads to the best average outcome across all simulations.',
        traits: ['Statistical', 'Random Sampling'],
        color: 'bg-blue-500',
    },
    {
        abbrev: 'E',
        name: 'Expectimax Tree',
        description: 'A game tree search algorithm designed for games with random elements. Unlike Minimax, Expectimax considers chance nodes (random tile spawns) and computes expected values rather than worst-case scenarios.',
        traits: ['Tree Search', 'Expected Value'],
        color: 'bg-emerald-500',
    },
    {
        abbrev: 'Igs',
        name: 'IDDFS Graph Search',
        description: 'Iterative Deepening Depth-First Search with graph-based state management. Combines the space efficiency of DFS with the completeness of BFS, incrementally exploring deeper levels while avoiding revisiting duplicate states.',
        traits: ['Graph Search', 'Iterative Deepening'],
        color: 'bg-purple-500',
    },
    {
        abbrev: 'Rl',
        name: 'Reinforcement Learning',
        description: 'A machine learning approach where an agent learns optimal strategies through trial and error. The algorithm develops a policy by receiving rewards for successful moves and adjusting its behavior over many training episodes.',
        traits: ['Machine Learning', 'Adaptive'],
        color: 'bg-orange-500',
    },
]

export default function Definitions() {
    return (
        <div className="min-h-screen p-4 md:p-8">
            <HomeButton />

            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gradient mb-2">
                        2048 Definitions & Instructions
                    </h1>
                    <p className="text-text-secondary">
                        Understanding algorithms, scoring, and research context
                    </p>

                    {/* Navigation tabs */}
                    <div className="flex gap-4 justify-center mt-6">
                        <Link to="/definitions" className="px-4 py-2 bg-accent/30 rounded-lg font-medium">
                            Definitions
                        </Link>
                        <Link to="/dashboard" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            Dashboard
                        </Link>
                        <Link to="/research" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            Research
                        </Link>
                    </div>
                </header>

                {/* Score Definition Card */}
                <section className="bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-2xl p-6 mb-8 border border-accent/30">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl">📊</span>
                        <h2 className="text-xl font-bold">Understanding the Score</h2>
                    </div>
                    <p className="text-text-primary mb-4">
                        The <strong>score</strong> in 2048 is the <em>cumulative sum of all tile merges</em> throughout
                        the entire game — not just the value of the maximum tile at the end.
                    </p>
                    <p className="text-text-secondary text-sm">
                        For example: When two 2-tiles merge into a 4, you earn 4 points. When two 4-tiles merge into an 8,
                        you earn 8 points. The final score represents the total of all these merges from start to finish.
                    </p>
                </section>

                {/* Algorithm Cards */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Algorithm Explanations</h2>
                    <p className="text-text-secondary mb-6">
                        The following algorithms were tested to determine optimal strategies for playing 2048 across different grid sizes.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {algorithms.map(algo => (
                            <div key={algo.abbrev} className="bg-bg-card rounded-xl p-5 border border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`${algo.color} w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white`}>
                                        {algo.abbrev}
                                    </span>
                                    <h3 className="font-bold">{algo.name}</h3>
                                </div>
                                <p className="text-text-secondary text-sm mb-3">{algo.description}</p>
                                <div className="flex gap-2 flex-wrap">
                                    {algo.traits.map(trait => (
                                        <span key={trait} className="px-2 py-1 bg-white/10 rounded text-xs">
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Grid Sizes */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Grid Sizes Tested</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bg-card rounded-xl p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-accent/30 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-lg">4×4</span>
                            </div>
                            <p className="text-sm text-text-secondary">Standard grid (16 cells)</p>
                            <span className="text-xs text-accent">Grid Area: 16</span>
                        </div>
                        <div className="bg-bg-card rounded-xl p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-purple-500/30 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-lg">5×5</span>
                            </div>
                            <p className="text-sm text-text-secondary">Extended grid (25 cells)</p>
                            <span className="text-xs text-purple-400">Grid Area: 25</span>
                        </div>
                    </div>
                </section>

                {/* Research Context */}
                <section className="bg-bg-card rounded-xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold mb-4">Research Context</h2>
                    <p className="text-text-secondary mb-4">
                        This dashboard presents data from systematic testing of AI algorithms playing 2048.
                        Each algorithm was run multiple times on different grid configurations to evaluate:
                    </p>
                    <ul className="space-y-2 text-text-secondary">
                        <li className="flex items-center gap-2">
                            <span className="text-accent">•</span> Average score achieved per algorithm
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-accent">•</span> Consistency of performance across runs
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-accent">•</span> How grid size affects algorithm effectiveness
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-accent">•</span> Whether any algorithm dominates across all conditions
                        </li>
                    </ul>
                    <p className="text-text-secondary mt-4">
                        Explore the <Link to="/dashboard" className="text-accent hover:underline">Dashboard</Link> for interactive analysis
                        or visit <Link to="/research" className="text-accent hover:underline">Research</Link> for academic references.
                    </p>
                </section>
            </div>
        </div>
    )
}
