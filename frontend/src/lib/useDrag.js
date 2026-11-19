import { useCallback, useEffect, useRef, useState } from 'react'

/* Pointer dragging for resize handles.
   While a drag is active, `dragging` holds the cursor to show, so the caller
   can render a full-screen shield. The shield stops iframes (previews, the
   Google button) from swallowing pointer events mid-drag. */
export function useDrag() {
  const [dragging, setDragging] = useState(null)
  const cleanup = useRef(null)

  useEffect(() => () => cleanup.current?.(), [])

  const start = useCallback((e, onMove, cursor = 'col-resize') => {
    if (e.button !== undefined && e.button !== 0) return
    e.preventDefault()
    setDragging(cursor)
    document.body.style.userSelect = 'none'
    const move = (ev) => onMove(ev)
    const end = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      document.body.style.userSelect = ''
      setDragging(null)
      cleanup.current = null
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    cleanup.current = end
  }, [])

  return [dragging, start]
}

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

export function readNumber(key, fallback) {
  try {
    const v = Number(localStorage.getItem(key))
    return Number.isFinite(v) && v > 0 ? v : fallback
  } catch {
    return fallback
  }
}

export function writeNumber(key, value) {
  try { localStorage.setItem(key, String(value)) } catch { /* ignore */ }
}
