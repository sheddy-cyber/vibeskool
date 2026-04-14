/**
 * Motion — animation primitives using Web Animations API + CSS.
 *
 * Design rules:
 * - NEVER set opacity:0 as an inline style (it persists and hides content)
 * - Mount animations use fill:'backwards' which only applies before the
 *   animation starts — opacity is normal afterwards automatically
 * - Scroll animations use a CSS class to hide, then remove it when triggered
 * - Wrapper divs are transparent to layout (display:contents) or
 *   pass className/style through so they don't break grids
 */
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// ─── FadeUp — fade + slide up on mount ────────────────────────────────────────
// Wraps children in a div. Use className to merge with layout classes.
export function FadeUp({ children, delay = 0, duration = 480, y = 18, style, className, as = 'div' }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.animate(
      [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'translateY(0)' }],
      { duration, delay, easing: EASE, fill: 'backwards' }
    )
  }, [])
  const Tag = as
  return <Tag ref={ref} style={{ width: '100%', ...style }} className={className}>{children}</Tag>
}

// ─── FadeIn — opacity only on mount ───────────────────────────────────────────
export function FadeIn({ children, delay = 0, duration = 380, style, className, as = 'div' }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration, delay, easing: 'ease-out', fill: 'backwards' }
    )
  }, [])
  const Tag = as
  return <Tag ref={ref} style={{ width: '100%', ...style }} className={className}>{children}</Tag>
}

// ─── SlideIn — slide from side on mount ───────────────────────────────────────
export function SlideIn({ children, delay = 0, duration = 480, x = -20, style, className, as = 'div' }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.animate(
      [{ opacity: 0, transform: `translateX(${x}px)` }, { opacity: 1, transform: 'translateX(0)' }],
      { duration, delay, easing: EASE, fill: 'backwards' }
    )
  }, [])
  const Tag = as
  return <Tag ref={ref} style={{ width: '100%', ...style }} className={className}>{children}</Tag>
}

// ─── ScaleIn — scale + fade on mount ──────────────────────────────────────────
export function ScaleIn({ children, delay = 0, duration = 420, style, className, as = 'div' }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.animate(
      [{ opacity: 0, transform: 'scale(0.94)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration, delay, easing: EASE, fill: 'backwards' }
    )
  }, [])
  const Tag = as
  return <Tag ref={ref} style={{ width: '100%', ...style }} className={className}>{children}</Tag>
}

// ─── RevealOnScroll — animate when entering viewport ──────────────────────────
// Uses a CSS class for the hidden state, removes it after animation.
// This avoids the inline-style-wins problem.
export function RevealOnScroll({
  children, delay = 0, y = 24, duration = 520,
  threshold = 0.1, style, className, as = 'div'
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Add a CSS class that sets opacity:0 — we'll remove it in the animation commit
    el.classList.add('reveal-hidden')

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.unobserve(el)
      const anim = el.animate(
        [
          { opacity: 0, transform: `translateY(${y}px)` },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration, delay, easing: EASE, fill: 'forwards' }
      )
      // After animation finishes, remove CSS class so element stays visible
      // even if WAAPI state is cleaned up
      anim.onfinish = () => {
        el.classList.remove('reveal-hidden')
        anim.cancel()          // release fill:forwards memory
        el.style.opacity = '1'
        el.style.transform = 'none'
      }
    }, { threshold, rootMargin: '0px 0px -40px 0px' })

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const Tag = as
  return (
    <Tag ref={ref} style={{ width: '100%', ...style }} className={className}>
      {children}
    </Tag>
  )
}

// ─── StaggerGroup ─────────────────────────────────────────────────────────────
// Does NOT clone children with opacity:0. Uses the reveal-hidden CSS class
// directly on each child after mount, then animates them in on intersection.
export function StaggerGroup({
  children, stagger = 70, baseDelay = 0, y = 16,
  threshold = 0.06, style, className
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = Array.from(container.children)

    // Hide each child via CSS class (avoids inline style fighting WAAPI)
    items.forEach(child => child.classList.add('reveal-hidden'))

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.unobserve(container)

      items.forEach((child, i) => {
        const anim = child.animate(
          [
            { opacity: 0, transform: `translateY(${y}px)` },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: 460,
            delay: baseDelay + i * stagger,
            easing: EASE,
            fill: 'forwards',
          }
        )
        anim.onfinish = () => {
          child.classList.remove('reveal-hidden')
          anim.cancel()
          child.style.opacity = '1'
          child.style.transform = 'none'
        }
      })
    }, { threshold, rootMargin: '0px 0px -24px 0px' })

    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={style} className={className}>
      {children}
    </div>
  )
}

// ─── PageTransition ───────────────────────────────────────────────────────────
// Wraps with a painted box (not display:contents) so WAAPI can animate it.
// Uses position:relative so it doesn't affect width, and min-width:0 for flex.
export function PageTransition({ children, style, className }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 320, easing: EASE, fill: 'backwards' }
    )
  }, [])
  return (
    <div ref={ref} style={{ width: '100%', ...style }} className={className}>
      {children}
    </div>
  )
}

// ─── AnimatedNumber ───────────────────────────────────────────────────────────
export function AnimatedNumber({ value, suffix = '', inView, duration = 1200 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const num = parseInt(value) || 0
    if (num === 0) { setDisplay(0); return }
    const start = performance.now()
    const tick = now => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(2, -10 * p)
      setDisplay(Math.round(eased * num))
      if (p < 1) requestAnimationFrame(tick)
      else setDisplay(num)
    }
    requestAnimationFrame(tick)
  }, [inView, value])

  return <>{display}{suffix}</>
}
