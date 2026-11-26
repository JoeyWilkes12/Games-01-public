import { useEffect, useLayoutEffect, useRef, useState } from 'react'

let keySeed = 0
/** Stable React key for a player row, so reordering never remounts inputs. */
export const newPlayerKey = () => `p${Date.now().toString(36)}${(keySeed++).toString(36)}`

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function GripIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
            <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
            <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
        </svg>
    )
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    )
}

/**
 * Turn-order editor. Rows reorder by dragging the grip (Pointer Events: touch, pen and
 * mouse share one path) or with ArrowUp/ArrowDown/Home/End on the focused grip.
 * `players` items need a stable `key` (see newPlayerKey).
 */
export default function TurnOrderList({ players, onChange, onRemove, onRename }) {
    const listRef = useRef(null)
    const rowRefs = useRef(new Map())
    const handleRefs = useRef(new Map())
    const prevOffsets = useRef(new Map())
    const playersRef = useRef(players)
    const dragRef = useRef(null)
    const focusAfterMove = useRef(null)
    const [dragKey, setDragKey] = useState(null)
    const [status, setStatus] = useState('')

    playersRef.current = players

    const nameAt = (p, i) => p.name.trim() || `Player ${i + 1}`

    // Keep the lifted row under the pointer after every re-render that moved it in the list.
    const positionDragged = () => {
        const drag = dragRef.current
        if (!drag) return
        const row = rowRefs.current.get(drag.key)
        if (!row) return
        // Layout position, so a still-running slide animation cannot skew the lifted row.
        const naturalTop = listRef.current.getBoundingClientRect().top + row.offsetTop
        row.style.transform = `translateY(${drag.y - drag.grabOffset - naturalTop}px)`
    }

    // FLIP: slide rows displaced by a move from their previous layout offset.
    useLayoutEffect(() => {
        const animate = !prefersReducedMotion()
        const next = new Map()
        for (const p of players) {
            const row = rowRefs.current.get(p.key)
            if (!row) continue
            next.set(p.key, row.offsetTop)
            const before = prevOffsets.current.get(p.key)
            const isDragged = dragRef.current?.key === p.key
            if (animate && !isDragged && before !== undefined && before !== row.offsetTop) {
                row.animate(
                    [{ transform: `translateY(${before - row.offsetTop}px)` }, { transform: 'translateY(0)' }],
                    { duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
                )
            }
        }
        prevOffsets.current = next
        positionDragged()
        if (focusAfterMove.current) {
            handleRefs.current.get(focusAfterMove.current)?.focus()
            focusAfterMove.current = null
        }
    }, [players])

    const moveTo = (key, to) => {
        const list = playersRef.current
        const from = list.findIndex(p => p.key === key)
        const target = Math.max(0, Math.min(list.length - 1, to))
        if (from < 0 || from === target) return false
        const next = [...list]
        const [moved] = next.splice(from, 1)
        next.splice(target, 0, moved)
        onChange(next)
        return target
    }

    const announce = (key, list = playersRef.current) => {
        const i = list.findIndex(p => p.key === key)
        if (i >= 0) setStatus(`${nameAt(list[i], i)} moved to turn ${i + 1} of ${list.length}.`)
    }

    const onHandleKeyDown = (e, key) => {
        const list = playersRef.current
        const from = list.findIndex(p => p.key === key)
        const targets = { ArrowUp: from - 1, ArrowDown: from + 1, Home: 0, End: list.length - 1 }
        if (!(e.key in targets)) return
        e.preventDefault()
        const to = moveTo(key, targets[e.key])
        if (to === false) return
        focusAfterMove.current = key
        const p = list[from]
        setStatus(`${nameAt(p, to)} moved to turn ${to + 1} of ${list.length}.`)
    }

    const onPointerDown = (e, key) => {
        if (e.button !== undefined && e.button !== 0) return
        if (playersRef.current.length < 2) return
        e.preventDefault()
        const row = rowRefs.current.get(key)
        const list = listRef.current
        row.getAnimations?.().forEach(anim => anim.cancel())
        const scroller = row.closest('[data-scroll-container]') || document.scrollingElement
        const pointerId = e.pointerId
        const startIndex = playersRef.current.findIndex(p => p.key === key)
        dragRef.current = { key, pointerId, y: e.clientY, grabOffset: e.clientY - (list.getBoundingClientRect().top + row.offsetTop) }
        setDragKey(key)
        document.body.classList.add('select-none', 'cursor-grabbing')
        handleRefs.current.get(key)?.focus({ preventScroll: true })

        const reorder = () => {
            const drag = dragRef.current
            const dragged = rowRefs.current.get(key)
            // Layout offsets ignore running FLIP transforms, so rows never oscillate mid-slide.
            const mid = drag.y - drag.grabOffset - list.getBoundingClientRect().top + dragged.offsetHeight / 2
            const others = playersRef.current.filter(p => p.key !== key)
            let index = others.length
            for (let i = 0; i < others.length; i++) {
                const el = rowRefs.current.get(others[i].key)
                if (el && mid < el.offsetTop + el.offsetHeight / 2) { index = i; break }
            }
            moveTo(key, index)
        }

        let raf = 0
        const autoScroll = () => {
            const drag = dragRef.current
            if (!drag) return
            const bounds = scroller === document.scrollingElement
                ? { top: 0, bottom: window.innerHeight }
                : scroller.getBoundingClientRect()
            const edge = 56
            let speed = 0
            if (drag.y < bounds.top + edge) speed = -Math.ceil((bounds.top + edge - drag.y) / 4)
            else if (drag.y > bounds.bottom - edge) speed = Math.ceil((drag.y - (bounds.bottom - edge)) / 4)
            if (speed) {
                scroller.scrollTop += speed
                reorder()
                positionDragged()
            }
            raf = requestAnimationFrame(autoScroll)
        }
        raf = requestAnimationFrame(autoScroll)

        // Window listeners: re-rendering the row in a new position must not end the drag.
        const onMove = (ev) => {
            if (ev.pointerId !== pointerId) return
            ev.preventDefault()
            dragRef.current.y = ev.clientY
            reorder()
            positionDragged()
        }
        const onEnd = (ev) => {
            if (ev?.pointerId !== undefined && ev.pointerId !== pointerId) return
            cancelAnimationFrame(raf)
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onEnd)
            window.removeEventListener('pointercancel', onEnd)
            window.removeEventListener('blur', onEnd)
            document.body.classList.remove('select-none', 'cursor-grabbing')
            const dragged = rowRefs.current.get(key)
            const offset = dragged?.style.transform
            if (dragged) dragged.style.transform = ''
            if (dragged && offset && !prefersReducedMotion()) {
                dragged.animate([{ transform: offset }, { transform: 'translateY(0)' }],
                    { duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
            }
            dragRef.current = null
            setDragKey(null)
            const endIndex = playersRef.current.findIndex(p => p.key === key)
            if (endIndex !== startIndex) announce(key)
        }
        window.addEventListener('pointermove', onMove, { passive: false })
        window.addEventListener('pointerup', onEnd)
        window.addEventListener('pointercancel', onEnd)
        window.addEventListener('blur', onEnd)
    }

    useEffect(() => () => document.body.classList.remove('select-none', 'cursor-grabbing'), [])

    const total = players.length

    return (
        <>
            <ol ref={listRef} className="relative flex flex-col gap-1.5" aria-labelledby="turn-order-heading" aria-describedby="turn-order-hint">
                {players.map((player, idx) => {
                    const name = nameAt(player, idx)
                    const dragging = dragKey === player.key
                    return (
                        <li
                            key={player.key}
                            ref={el => el ? rowRefs.current.set(player.key, el) : rowRefs.current.delete(player.key)}
                            data-testid="turn-order-row"
                            className={`relative grid grid-cols-[44px_2.25ch_minmax(0,1fr)_44px] items-center gap-1.5 min-h-[56px] p-1.5 rounded-lg border transition-[background-color,border-color,box-shadow] ${dragging
                                ? 'z-10 bg-slate-800 border-accent shadow-[0_12px_28px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.3)]'
                                : `bg-white/5 border-white/10 ${dragKey ? 'opacity-90' : ''}`}`}
                        >
                            <button
                                type="button"
                                ref={el => el ? handleRefs.current.set(player.key, el) : handleRefs.current.delete(player.key)}
                                onPointerDown={e => onPointerDown(e, player.key)}
                                onKeyDown={e => onHandleKeyDown(e, player.key)}
                                aria-label={`Move ${name}, turn ${idx + 1} of ${total}. Drag, or use the up and down arrow keys.`}
                                className={`flex items-center justify-center w-11 h-11 rounded-md touch-none select-none [-webkit-touch-callout:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${dragging ? 'cursor-grabbing text-accent bg-accent/10' : 'cursor-grab text-text-secondary hover:text-text-primary hover:bg-white/10'}`}
                            >
                                <GripIcon />
                            </button>
                            <span aria-hidden="true" className="text-right font-semibold tabular-nums text-accent">{idx + 1}</span>
                            <input
                                type="text"
                                value={player.name}
                                placeholder={`Player ${idx + 1}`}
                                autoComplete="off"
                                aria-label={`Name of player ${idx + 1}`}
                                onChange={e => onRename(player.key, e.target.value)}
                                className="w-full min-w-0 min-h-[44px] px-3 rounded-md bg-white/10 border border-white/10 text-base focus:border-accent focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setStatus(`${name} removed.`)
                                    onRemove(player.key)
                                }}
                                disabled={total <= 1}
                                aria-label={`Remove ${name}`}
                                className="flex items-center justify-center w-11 h-11 rounded-md text-text-secondary hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-secondary"
                            >
                                <CloseIcon />
                            </button>
                        </li>
                    )
                })}
            </ol>
            <p className="sr-only" role="status" aria-live="polite">{status}</p>
        </>
    )
}
