import { Link } from 'react-router-dom'
import { HomeButton } from '../components'

const references = [
    {
        title: 'End-to-End One-Shot Path-Planning Algorithm',
        citation: 'Bian, T., Xing, Y., & Zolotas, A. (2022). End-to-End One-Shot Path-Planning Algorithm for an Autonomous Vehicle Based on a Convolutional Neural Network Considering Traversability Cost. Sensors, 22(24), 9682.',
        link: 'https://doi.org/10.3390/s22249682',
    },
    {
        title: 'Mastering 2048 with Delayed Temporal Coherence Learning',
        citation: 'Jaśkowski, W. (2016). Mastering 2048 with Delayed Temporal Coherence Learning, Multi-Stage Weight Promotion, Redundant Encoding and Carousel Shaping. arXiv.',
        link: 'https://doi.org/10.48550/arxiv.1604.05085',
    },
    {
        title: 'Dynamic Simulation Monte-Carlo Tree Search',
        citation: 'Lan, L.-C., Tsai, M.-Y., Wu, T.-R., Wu, I.-C., & Hsieh, C.-J. (2020). Learning to Stop: Dynamic Simulation Monte-Carlo Tree Search. arXiv.',
        link: 'https://doi.org/10.48550/arxiv.2012.07910',
    },
    {
        title: 'BSNN: Bistable Neurons',
        citation: 'Li, Y., Zeng, Y., & Zhao, D. (2021). BSNN: Towards Faster and Better Conversion of Artificial Neural Networks to Spiking Neural Networks with Bistable Neurons. arXiv.',
        link: 'https://doi.org/10.48550/arxiv.2105.12917',
    },
    {
        title: 'Minimax and Expectimax Algorithm',
        citation: 'Munir, R. (n.d.). Minimax and Expectimax Algorithm to Solve 2048. Informatika - Institut Teknologi Bandung.',
        link: 'https://informatika.stei.itb.ac.id/~rinaldi.munir/Stmik/2013-2014-genap/Makalah2014/MakalahIF2211-2014-037.pdf',
    },
    {
        title: 'Investigation into 2048 AI Strategies',
        citation: 'Rodgers, P., & Levine, J. (2014). An Investigation into 2048 AI Strategies. IEEE Conference on Computational Intelligence and Games.',
        link: null,
    },
    {
        title: 'DeepSearch via Monte Carlo Tree Search',
        citation: 'Wu, F., Xuan, W., Qi, H., Lu, X., Tu, A., Li, L. E., & Choi, Y. (2025). DeepSearch: Overcome the Bottleneck of Reinforcement Learning with Verifiable Rewards via Monte Carlo Tree Search. arXiv.',
        link: 'https://doi.org/10.48550/arxiv.2509.25454',
    },
]

export default function Research() {
    return (
        <div className="min-h-screen p-4 md:p-8">
            <HomeButton />

            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gradient mb-2">
                        2048 Research
                    </h1>
                    <p className="text-text-secondary">
                        Academic references and algorithm details
                    </p>

                    {/* Navigation tabs */}
                    <div className="flex gap-4 justify-center mt-6">
                        <Link to="/definitions" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            Definitions
                        </Link>
                        <Link to="/dashboard" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                            Dashboard
                        </Link>
                        <Link to="/research" className="px-4 py-2 bg-accent/30 rounded-lg font-medium">
                            Research
                        </Link>
                    </div>
                </header>

                {/* References Section */}
                <section>
                    <h2 className="text-xl font-bold mb-6">Algorithm Research & References</h2>

                    <div className="space-y-4">
                        {references.map((ref, idx) => (
                            <div
                                key={idx}
                                className="bg-bg-card rounded-xl p-6 border border-white/10 hover:border-accent/30 transition-colors"
                            >
                                <h3 className="font-bold text-lg mb-2">{ref.title}</h3>
                                <p className="text-text-secondary text-sm mb-4 italic">{ref.citation}</p>
                                {ref.link && (
                                    <a
                                        href={ref.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
                                    >
                                        View Paper
                                        <span className="text-xs">↗</span>
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Back to Hub */}
                <div className="mt-8 text-center">
                    <Link to="/" className="btn-primary">
                        ← Back to Game Hub
                    </Link>
                </div>
            </div>
        </div>
    )
}
