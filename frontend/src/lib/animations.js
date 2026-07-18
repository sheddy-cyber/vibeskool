/**
 * VibeSkool Animation System — Stoic Edition
 * All hooks return static values. No animations.
 */

import { useRef, useState } from 'react'

// ─── useInView — always in view ──────────────────────────────────────────────
export function useInView(options = {}) {
  const ref = useRef(null)
  return [ref, true]
}

// ─── useScrollY — static ─────────────────────────────────────────────────────
export function useScrollY() {
  return 0
}

// ─── useMouse — static center ────────────────────────────────────────────────
export function useMouse() {
  return { x: 0.5, y: 0.5 }
}

// ─── useStagger — no-op ref ──────────────────────────────────────────────────
export function useStagger(inView, staggerMs = 80) {
  return useRef(null)
}

// ─── useReveal — no-op ref ───────────────────────────────────────────────────
export function useReveal(options = {}) {
  return useRef(null)
}

// ─── useCountUp — return target immediately ──────────────────────────────────
export function useCountUp(target, inView, duration = 1200) {
  return parseInt(target) || 0
}
