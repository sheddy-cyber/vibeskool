import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    // Initialize Lenis for luxurious inertia/momentum gliding scroll
    const lenis = new Lenis({
      duration: 1.25, // gliding duration in seconds
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple/Linear exponential deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.8,
      infinite: false,
      autoResize: true,
    })

    lenisRef.current = lenis
    window.__lenis = lenis

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      window.__lenis = null
      lenisRef.current = null
    }
  }, [])

  // Instantly reset scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
  }, [location.pathname])

  return children
}
