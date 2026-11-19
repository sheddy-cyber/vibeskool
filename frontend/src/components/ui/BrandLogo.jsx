import React from 'react'

/* VibeSkool mark: three rounded bars, centre-aligned like a waveform
   (the "vibe"), tilted slightly forward. Drawn on a 32-unit grid. */
export const BRAND_COLORS = {
  coral: '#F2553D',
  blue: '#1A73E8',
  green: '#1FA463',
}

export function BrandMark({ size = 28, mono, className, style }) {
  const c = mono
    ? { coral: mono, blue: mono, green: mono }
    : BRAND_COLORS
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      style={{ flexShrink: 0, display: 'block', ...style }}
      aria-hidden="true"
    >
      <g transform="rotate(-12 16 16)">
        <rect x="5.95" y="9.5" width="5.2" height="13" rx="2.6" fill={c.coral} />
        <rect x="13.4" y="4" width="5.2" height="24" rx="2.6" fill={c.blue} />
        <rect x="20.85" y="7.5" width="5.2" height="17" rx="2.6" fill={c.green} />
      </g>
    </svg>
  )
}

export default function BrandLogo({
  size = 28,
  showText = true,
  text = 'VibeSkool',
  className = '',
  color,
  skoolColor, // legacy prop: treated as the wordmark colour
  mono,
}) {
  const ink = color || skoolColor || 'var(--text-primary, #14171F)'

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.32), userSelect: 'none' }}
    >
      <BrandMark size={size} mono={mono} />
      {showText && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: Math.round(size * 0.74),
            lineHeight: 1,
            letterSpacing: '-0.01em',
            color: ink,
            whiteSpace: 'nowrap',
          }}
        >
          {text === 'VibeSkool' ? (
            <>
              <span style={{ fontWeight: 700 }}>Vibe</span>
              <span style={{ fontWeight: 500 }}>Skool</span>
            </>
          ) : (
            <span style={{ fontWeight: 700 }}>{text}</span>
          )}
        </span>
      )}
    </span>
  )
}
