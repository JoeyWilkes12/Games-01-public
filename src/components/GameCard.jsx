import { Link } from 'react-router-dom'

const gradientMap = {
    dice: 'gradient-dice',
    '2048': 'gradient-2048',
    puzzle: 'gradient-puzzle',
    bank: 'gradient-bank',
    acquire: 'gradient-acquire',
    mastermind: 'gradient-mastermind',
    queens: 'gradient-queens',
    wordle: 'gradient-wordle',
    risk: 'gradient-risk',
}

export default function GameCard({
    title,
    icon,
    to,
    status = 'playable',
    gradient = 'dice',
    animationDelay = 0,
    disabled = false
}) {
    const gradientClass = gradientMap[gradient] || 'gradient-dice'
    const isComingSoon = status === 'soon' || disabled

    const CardContent = () => (
        <>
            {/* Card Image with Icon */}
            <div className={`relative h-44 ${gradientClass} flex items-center justify-center overflow-hidden`}>
                <span className="text-5xl opacity-80 z-10 transition-transform duration-400 group-hover:scale-125">
                    {icon}
                </span>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-primary/80 opacity-60 group-hover:opacity-30 transition-opacity duration-300" />
            </div>

            {/* Card Content */}
            <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                    <span className={status === 'playable' ? 'status-playable' : 'status-soon'}>
                        {status === 'playable' ? 'Playable' : 'Coming Soon'}
                    </span>
                    <h2 className="text-xl font-bold text-text-primary mt-1">
                        {title}
                    </h2>
                </div>
            </div>
        </>
    )

    const baseClasses = `
    game-card group flex flex-col h-80 cursor-pointer
    animate-fade-in-up
    ${isComingSoon ? 'opacity-50 pointer-events-none hidden' : ''}
  `

    const style = animationDelay ? { animationDelay: `${animationDelay}s` } : {}

    if (isComingSoon || !to) {
        return (
            <div className={baseClasses} style={style} aria-disabled="true">
                <CardContent />
            </div>
        )
    }

    return (
        <Link to={to} className={baseClasses} style={style}>
            <CardContent />
        </Link>
    )
}
