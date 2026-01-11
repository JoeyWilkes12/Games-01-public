import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmExitModal from './ConfirmExitModal'

export default function HomeButton({ hasUnsavedProgress = false }) {
    const [showConfirm, setShowConfirm] = useState(false)
    const navigate = useNavigate()

    const handleClick = (e) => {
        if (hasUnsavedProgress) {
            e.preventDefault()
            setShowConfirm(true)
        } else {
            navigate('/')
        }
    }

    const handleConfirmLeave = () => {
        setShowConfirm(false)
        navigate('/')
    }

    return (
        <>
            <button
                onClick={handleClick}
                className="fixed top-4 left-4 z-40 w-12 h-12 rounded-full 
                   bg-bg-card/80 backdrop-blur-lg border border-white/10
                   flex items-center justify-center text-2xl
                   hover:bg-white/20 hover:border-white/20 transition-all duration-200
                   shadow-lg hover:shadow-xl touch-target"
                aria-label="Back to Game Hub"
                title="Back to Game Hub"
            >
                🏠
            </button>

            <ConfirmExitModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmLeave}
            />
        </>
    )
}
