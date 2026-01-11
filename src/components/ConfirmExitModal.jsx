import { useEffect, useRef } from 'react'

export default function ConfirmExitModal({ isOpen, onClose, onConfirm }) {
    const modalRef = useRef(null)

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus()
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
        >
            <div
                ref={modalRef}
                className="bg-bg-card border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4
                   backdrop-blur-xl shadow-2xl animate-bounce-in"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >
                {/* Icon */}
                <div className="text-5xl text-center mb-4">⚠️</div>

                {/* Title */}
                <h2
                    id="exit-modal-title"
                    className="text-xl font-bold text-center text-text-primary mb-2"
                >
                    Leave Game?
                </h2>

                {/* Message */}
                <p className="text-text-secondary text-center mb-6">
                    Your current game progress will be lost. Are you sure you want to return to the Game Hub?
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold
                       bg-accent text-bg-primary hover:bg-accent/90
                       transition-all duration-200 touch-target"
                    >
                        Stay
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold
                       bg-white/10 text-text-primary hover:bg-red-500/30
                       border border-white/10 hover:border-red-500/50
                       transition-all duration-200 touch-target"
                    >
                        Leave
                    </button>
                </div>
            </div>
        </div>
    )
}
