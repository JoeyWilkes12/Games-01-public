import { Link } from 'react-router-dom'
import { HomeButton } from '../components'

// Sample data for the dashboard (in a real app, this would come from an API or file)
const sampleData = {
    totalRuns: 248,
    highestScore: 156892,
    avgMaxTile: 2048,
    algorithms: [
        {
            name: 'Expectimax', avgScore: 45230, runs: 62

            , color: '#22c55e'
        },
        { name: 'Monte Carlo', avgScore: 38450, runs: 62, color: '#3b82f6' },
        { name: 'IDDFS', avgScore: 32180, runs: 62, color: '#8b5cf6' },
        { name: 'RL Agent', avgScore: 41920, runs: 62, color: '#f59e0b' },
    ],
    gridWinners: [
        { grid: '4×4', winner: 'Expectimax', avgScore: 45230 },
        { grid: '5×5', winner: 'RL Agent', avgScore: 89450 },
    ],
}

function StatCard({ title, value }) {
    return (
        <div className="bg-bg-card rounded-xl p-6 text-center">
            <h3 className="text-sm text-text-secondary uppercase mb-2">{title}</h3>
            <p className="text-3xl font-bold text-accent">{value.toLocaleString()}</p>
        </div>
    )
}

function BarChart({ data }) {
    const maxScore = Math.max(...data.map(d => d.avgScore))

    return (
        <div className="space-y-4">
            {data.map(item => (
                <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                        <span>{item.name}</span>
                        <span className="text-text-secondary">{item.avgScore.toLocaleString()}</span>
                    </div>
                    <div className="h-8 bg-white/10 rounded-lg overflow-hidden">
                        <div
                            className="h-full rounded-lg transition-all duration-500"
                            style={{
                                width: `${(item.avgScore / maxScore) * 100}%`,
                                backgroundColor: item.color,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function Dashboard() {
    return (
        <div className="min-h-screen p-4 md:p-8">
            <HomeButton />

            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gradient mb-2">
                        2048 Analysis Dashboard
                    </h1>
                    <p className="text-text-secondary">
                        Deep dive into algorithm performance and research
                    </p>

                    {/* Navigation tabs */}
                    <div className="flex gap-4 justify-center mt-6">
                        <Link to="/definitions" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            Definitions
                        </Link>
                        <Link to="/dashboard" className="px-4 py-2 bg-accent/30 rounded-lg font-medium">
                            Dashboard
                        </Link>
                        <Link to="/research" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            Research
                        </Link>
                    </div>
                </header>

                {/* Summary Stats */}
                <section className="grid grid-cols-3 gap-4 mb-8">
                    <StatCard title="Total Runs" value={sampleData.totalRuns} />
                    <StatCard title="Highest Score" value={sampleData.highestScore} />
                    <StatCard title="Avg Max Tile" value={sampleData.avgMaxTile} />
                </section>

                {/* Best Algorithm Chart */}
                <section className="bg-bg-card rounded-xl p-6 mb-8 border border-white/10">
                    <h2 className="text-lg font-bold mb-4">🏆 Best Performing Algorithm (Average Score)</h2>
                    <BarChart data={sampleData.algorithms} />
                </section>

                {/* Grid Size Winners */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-4">📐 Best Algorithm by Grid Size</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {sampleData.gridWinners.map(gw => (
                            <div key={gw.grid} className="bg-bg-card rounded-xl p-6 border border-white/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-2xl font-bold">{gw.grid}</span>
                                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Winner</span>
                                </div>
                                <h3 className="font-bold text-accent">{gw.winner}</h3>
                                <p className="text-text-secondary text-sm">
                                    Avg Score: {gw.avgScore.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Data Explorer */}
                <section className="bg-bg-card rounded-xl p-6 mb-8 border border-white/10">
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">Data Explorer</h2>
                        <div className="flex gap-4 flex-wrap">
                            <label className="flex items-center gap-2">
                                <span className="text-sm text-text-secondary">Group By:</span>
                                <select className="bg-white/10 rounded-lg px-3 py-2 text-sm">
                                    <option>Algorithm</option>
                                    <option>Grid Area</option>
                                    <option>Max Tile</option>
                                </select>
                            </label>
                            <label className="flex items-center gap-2">
                                <span className="text-sm text-text-secondary">Metric:</span>
                                <select className="bg-white/10 rounded-lg px-3 py-2 text-sm">
                                    <option>Average Score</option>
                                    <option>Average Moves</option>
                                    <option>Count of Runs</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    <BarChart data={sampleData.algorithms} />
                </section>

                {/* Run Log Table */}
                <section className="bg-bg-card rounded-xl p-6 border border-white/10">
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                        <h2 className="text-lg font-bold">Detailed Run Log</h2>
                        <div className="flex gap-2">
                            <select className="bg-white/10 rounded-lg px-3 py-2 text-sm">
                                <option>5 rows</option>
                                <option>10 rows</option>
                                <option>25 rows</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Search runs..."
                                className="bg-white/10 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-text-secondary border-b border-white/10">
                                    <th className="text-left py-3">Run ID</th>
                                    <th className="text-left py-3">Algorithm</th>
                                    <th className="text-left py-3">Grid Size</th>
                                    <th className="text-left py-3">Score</th>
                                    <th className="text-left py-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: 1, algo: 'Expectimax', grid: '4×4', score: 48230, notes: 'Reached 4096' },
                                    { id: 2, algo: 'Monte Carlo', grid: '4×4', score: 39120, notes: 'Standard run' },
                                    { id: 3, algo: 'RL Agent', grid: '5×5', score: 92450, notes: 'New high score' },
                                    { id: 4, algo: 'IDDFS', grid: '4×4', score: 31980, notes: '' },
                                    { id: 5, algo: 'Expectimax', grid: '5×5', score: 87340, notes: 'Consistent' },
                                ].map(run => (
                                    <tr key={run.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3">{run.id}</td>
                                        <td className="py-3">{run.algo}</td>
                                        <td className="py-3">{run.grid}</td>
                                        <td className="py-3 font-mono">{run.score.toLocaleString()}</td>
                                        <td className="py-3 text-text-secondary">{run.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                        <button className="btn-secondary text-sm">← Previous</button>
                        <span className="text-sm text-text-secondary">Page 1 of 50</span>
                        <button className="btn-secondary text-sm">Next →</button>
                    </div>
                </section>
            </div>
        </div>
    )
}
