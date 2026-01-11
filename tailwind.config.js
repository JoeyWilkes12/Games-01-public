/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#0f172a',
                'bg-card': 'rgba(30, 41, 59, 0.7)',
                'text-primary': '#f8fafc',
                'text-secondary': '#94a3b8',
                'accent': '#38bdf8',
                'accent-glow': 'rgba(56, 189, 248, 0.5)',
                'success': '#4ade80',
                // Game-specific colors
                'puzzle': { from: '#f59e0b', to: '#d97706' },
                '2048': { from: '#edc22e', to: '#f2b179' },
                'dice': { from: '#3b82f6', to: '#1d4ed8' },
                'bank': { from: '#059669', to: '#047857' },
                'acquire': { from: '#10b981', to: '#059669' },
                'mastermind': { from: '#ef4444', to: '#b91c1c' },
                'queens': { from: '#8b5cf6', to: '#6d28d9' },
                'wordle': { from: '#6aaa64', to: '#538d4e' },
                'risk': { from: '#dc2626', to: '#991b1b' },
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                'game': ['Fredoka', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in-down': 'fadeInDown 0.8s ease-out',
                'fade-in-up': 'fadeInUp 0.6s ease-out backwards',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'shake': 'shake 0.5s ease-in-out',
                'roll': 'roll 0.5s ease-out',
            },
            keyframes: {
                fadeInDown: {
                    from: { opacity: '0', transform: 'translateY(-30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(56, 189, 248, 0.6)' },
                },
                bounceIn: {
                    from: { transform: 'scale(0.8)', opacity: '0' },
                    to: { transform: 'scale(1)', opacity: '1' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                },
                roll: {
                    '0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
                    '100%': { transform: 'rotateX(360deg) rotateY(360deg)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
