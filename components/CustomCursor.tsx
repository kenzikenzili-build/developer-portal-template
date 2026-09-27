'use client'

import { useEffect, useRef, useState } from 'react'

const INTERACTIVE =
  'a, button, [role="button"], input, select, textarea, label, summary, .cursor-pointer'

type CursorMode = 'default' | 'hover' | 'holding'

/**
 * Returns the shortest signed angular distance (in degrees) needed to rotate
 * from `current` to `target`, so interpolation never snaps across the 0/360 seam.
 */
function shortestAngleDelta(current: number, target: number) {
  return (((target - current) % 360) + 540) % 360 - 180
}

/**
 * Apple-like magnetic fluid cursor with a drag-to-glide Geometric Origami
 * Glider Easter egg while holding the mouse button down.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<CursorMode>('default')

  const target = useRef({ x: 0, y: 0 })
  const dot = useRef({ x: 0, y: 0 })
  const halo = useRef({ x: 0, y: 0 })
  const glider = useRef({ x: 0, y: 0 })
  const prevPointer = useRef({ x: 0, y: 0 })
  const angleTarget = useRef(0)
  const angleSmooth = useRef(0)
  const gliderScale = useRef(1)
  const dotEl = useRef<HTMLDivElement>(null)
  const haloEl = useRef<HTMLDivElement>(null)
  const gliderWrapEl = useRef<HTMLDivElement>(null)
  const gliderSvgEl = useRef<SVGSVGElement>(null)
  const raf = useRef<number | null>(null)
  const modeRef = useRef<CursorMode>('default')
  const holdingRef = useRef(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncEnabled = () => {
      const next = fine.matches && !reduce.matches
      setEnabled(next)
      document.documentElement.classList.toggle('custom-cursor-active', next)
    }

    syncEnabled()
    fine.addEventListener('change', syncEnabled)
    reduce.addEventListener('change', syncEnabled)
    return () => {
      fine.removeEventListener('change', syncEnabled)
      reduce.removeEventListener('change', syncEnabled)
      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const setModeSafe = (next: CursorMode) => {
      modeRef.current = next
      setMode(next)
    }

    const isInteractive = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return false
      return Boolean(el.closest(INTERACTIVE))
    }

    const releaseHold = (event?: PointerEvent | MouseEvent) => {
      holdingRef.current = false
      const targetEl = event?.target ?? null
      setModeSafe(isInteractive(targetEl) ? 'hover' : 'default')
    }

    const onMove = (event: PointerEvent) => {
      const dx = event.clientX - prevPointer.current.x
      const dy = event.clientY - prevPointer.current.y
      if (dx !== 0 || dy !== 0) {
        angleTarget.current = Math.atan2(dy, dx) * (180 / Math.PI) + 90
      }
      prevPointer.current.x = event.clientX
      prevPointer.current.y = event.clientY

      target.current.x = event.clientX
      target.current.y = event.clientY
      setVisible(true)
      if (!holdingRef.current) {
        setModeSafe(isInteractive(event.target) ? 'hover' : 'default')
      }
    }

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      holdingRef.current = true
      setModeSafe('holding')
      target.current.x = event.clientX
      target.current.y = event.clientY
      prevPointer.current.x = event.clientX
      prevPointer.current.y = event.clientY

      // Kick the scale above 1 for a subtle pop; the tick loop eases it back
      // down to rest as it morphs from the halo cursor into the glider.
      gliderScale.current = 1.16
    }

    const onUp = (event: PointerEvent) => {
      if (event.button !== 0 && event.type === 'pointerup') return
      releaseHold(event)
    }

    const onLeave = () => {
      setVisible(false)
      releaseHold()
    }
    const onEnter = () => setVisible(true)
    const onBlur = () => releaseHold()
    const onDragStart = (event: Event) => {
      event.preventDefault()
    }

    const tick = () => {
      const holding = modeRef.current === 'holding'
      const dotEase = holding ? 0.55 : modeRef.current === 'hover' ? 0.32 : 0.28
      const haloEase = holding ? 0.4 : modeRef.current === 'hover' ? 0.14 : 0.1
      const gliderEase = 0.5

      dot.current.x += (target.current.x - dot.current.x) * dotEase
      dot.current.y += (target.current.y - dot.current.y) * dotEase
      halo.current.x += (target.current.x - halo.current.x) * haloEase
      halo.current.y += (target.current.y - halo.current.y) * haloEase
      glider.current.x += (target.current.x - glider.current.x) * gliderEase
      glider.current.y += (target.current.y - glider.current.y) * gliderEase

      // Smoothly interpolate rotation along the shortest arc so the glider
      // never snaps when the drag direction crosses the 0/360 seam.
      angleSmooth.current += shortestAngleDelta(angleSmooth.current, angleTarget.current) * 0.22
      // Ease the momentary grab "pop" back down to its resting scale.
      gliderScale.current += (1 - gliderScale.current) * 0.18

      if (dotEl.current) {
        dotEl.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0) translate(-50%, -50%)`
      }
      if (haloEl.current) {
        haloEl.current.style.transform = `translate3d(${halo.current.x}px, ${halo.current.y}px, 0) translate(-50%, -50%)`
      }
      if (gliderWrapEl.current) {
        gliderWrapEl.current.style.transform = `translate3d(${glider.current.x}px, ${glider.current.y}px, 0)`
      }
      if (gliderSvgEl.current) {
        gliderSvgEl.current.style.transform = `translate(-50%, -50%) scale(${gliderScale.current}) rotate(${angleSmooth.current}deg)`
      }

      raf.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('blur', onBlur)
    window.addEventListener('dragstart', onDragStart)
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    raf.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('dragstart', onDragStart)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      if (raf.current !== null) window.cancelAnimationFrame(raf.current)
    }
  }, [enabled])

  if (!enabled) return null

  const isHolding = mode === 'holding'
  const haloSize = mode === 'hover' ? 56 : 28
  const haloGlow =
    mode === 'hover'
      ? 'bg-white/25 border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
      : 'bg-white/20 border-white/40 dark:bg-white/30'

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] select-none transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden
    >
      <div
        ref={haloEl}
        className={`pointer-events-none absolute top-0 left-0 rounded-full border backdrop-blur-sm transition-[width,height,box-shadow,background-color,border-color,opacity] duration-200 ease-out ${haloGlow} ${
          isHolding ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ width: haloSize, height: haloSize, willChange: 'transform' }}
      />
      <div
        ref={dotEl}
        className={`pointer-events-none absolute top-0 left-0 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.55)] transition-opacity duration-150 dark:bg-white ${
          isHolding ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ width: 8, height: 8, willChange: 'transform' }}
      />

      <div
        ref={gliderWrapEl}
        className={`pointer-events-none absolute top-0 left-0 transition-opacity duration-150 ease-out ${
          isHolding ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      >
        <OrigamiGlider ref={gliderSvgEl} />
      </div>
    </div>
  )
}

function OrigamiGlider({ ref }: { ref: React.Ref<SVGSVGElement> }) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 32 32"
      className="w-7 h-7 pointer-events-none drop-shadow-md transition-transform duration-75 ease-out"
      style={{ transform: 'translate(-50%, -50%) rotate(0deg)' }}
    >
      {/* Left Wing / Fold */}
      <polygon points="16,2 4,28 16,22" className="fill-slate-800 dark:fill-slate-100" />
      {/* Right Wing / Fold (Subtle light contrast shading) */}
      <polygon points="16,2 28,28 16,22" className="fill-slate-600 dark:fill-slate-300" />
      {/* Center Crease Keel */}
      <polygon points="16,2 16,22 14,24 16,26" className="fill-slate-950 dark:fill-slate-400 opacity-60" />
      {/* Outer Sleek Stroke Outline */}
      <polygon
        points="16,2 4,28 16,22 28,28"
        className="stroke-slate-900/40 dark:stroke-white/40"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  )
}
