/**
 * Motion — stoic pass-through wrappers.
 * All animation primitives render children immediately with no animation.
 * API surface preserved so imports don't break.
 */
import React, { useState } from 'react'

// ─── FadeUp — pass-through ────────────────────────────────────────────────────
export function FadeUp({ children, delay, duration, y, style, className, as = 'div' }) {
  const Tag = as
  return <Tag style={{ width: '100%', ...style }} className={className}>{children}</Tag>
}

// ─── FadeIn — pass-through ────────────────────────────────────────────────────
export function FadeIn({ children, delay, duration, style, className, as = 'div' }) {
  const Tag = as
  return <Tag style={{ width: '100%', ...style }} className={className}>{children}</Tag>
}

// ─── SlideIn — pass-through ───────────────────────────────────────────────────
export function SlideIn({ children, delay, duration, x, style, className, as = 'div' }) {
  const Tag = as
  return <Tag style={{ width: '100%', ...style }} className={className}>{children}</Tag>
}

// ─── ScaleIn — pass-through ───────────────────────────────────────────────────
export function ScaleIn({ children, delay, duration, style, className, as = 'div' }) {
  const Tag = as
  return <Tag style={{ width: '100%', ...style }} className={className}>{children}</Tag>
}

// ─── RevealOnScroll — pass-through ────────────────────────────────────────────
export function RevealOnScroll({ children, delay, y, duration, threshold, style, className, as = 'div' }) {
  const Tag = as
  return <Tag style={{ width: '100%', ...style }} className={className}>{children}</Tag>
}

// ─── StaggerGroup — pass-through container ────────────────────────────────────
export function StaggerGroup({ children, stagger, baseDelay, y, threshold, style, className }) {
  return <div style={style} className={className}>{children}</div>
}

// ─── PageTransition — pass-through ────────────────────────────────────────────
export function PageTransition({ children, style, className }) {
  return <div style={{ width: '100%', ...style }} className={className}>{children}</div>
}

// ─── AnimatedNumber — render final value immediately ──────────────────────────
export function AnimatedNumber({ value, suffix = '', inView, duration }) {
  const num = parseInt(value) || 0
  return <>{num}{suffix}</>
}
