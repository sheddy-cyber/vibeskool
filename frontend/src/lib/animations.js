/**
 * VibeSkool Animation System
 * Pure Web Animations API + Intersection Observer
 * No dependencies. Buttery smooth. GPU-accelerated.
 */

import { useEffect, useRef, useState, useCallback } from 'react'

// ─── useInView — fires once when element enters viewport ─────────────────────
export function useInView(options = {}) {
  const ref  = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        obs.unobserve(el) // fire once
      }
    }, { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? '0px 0px -40px 0px' })

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, inView]
}

// ─── useScrollY — raw scroll position ────────────────────────────────────────
export function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const fn = () => setY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return y
}

// ─── useMouse — mouse position as 0–1 fractions ──────────────────────────────
export function useMouse() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  useEffect(() => {
    const fn = e => setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    window.addEventListener('mousemove', fn, { passive: true })
    return () => window.removeEventListener('mousemove', fn)
  }, [])
  return pos
}

// ─── useStagger — apply staggered fadeUp to children via WAAPI ───────────────
export function useStagger(inView, staggerMs = 80) {
  const ref = useRef(null)
  useEffect(() => {
    if (!inView || !ref.current) return
    const children = Array.from(ref.current.children)
    children.forEach((child, i) => {
      child.animate(
        [
          { opacity: 0, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 480,
          delay: i * staggerMs,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        }
      )
    })
  }, [inView, staggerMs])
  return ref
}

// ─── useReveal — single element fade+slide reveal ────────────────────────────
export function useReveal(options = {}) {
  const [ref, inView] = useInView(options)
  useEffect(() => {
    if (!inView || !ref.current) return
    ref.current.animate(
      [
        { opacity: 0, transform: `translateY(${options.y ?? 24}px)` },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      {
        duration: options.duration ?? 560,
        delay: options.delay ?? 0,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      }
    )
  }, [inView])
  return ref
}

// ─── useCountUp — number counter animation ────────────────────────────────────
export function useCountUp(target, inView, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const num = parseInt(target) || 0
    if (num === 0) { setVal(0); return }
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setVal(Math.round(eased * num))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])
  return val
}
