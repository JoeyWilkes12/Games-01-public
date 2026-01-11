import { useState, useEffect } from 'react'

export default function Toast({ message, duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (message) {
            setIsVisible(true)
            const timer = setTimeout(() => {
                setIsVisible(false)
                setTimeout(() => onClose?.(), 400) // Wait for animation
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [message, duration, onClose])

    if (!message) return null

    return (
        <div
            className={`toast ${isVisible ? 'show' : ''}`}
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    )
}
