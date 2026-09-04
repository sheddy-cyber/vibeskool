import React from 'react'

export default function BrandLogo({ size = 28, showText = true, className = '' }) {
  const barWidth = Math.max(3, Math.round(size * 0.16))
  const gap = Math.max(2, Math.round(size * 0.09))

  return (
    <div 
      className={className} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}
    >
      {/* Former iconic 3-bar tilted mark */}
      <span 
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${gap}px`,
          transform: 'rotate(-13deg)',
          flexShrink: 0
        }}
        aria-hidden="true"
      >
        <i style={{ width: `${barWidth}px`, height: `${Math.round(size * 0.52)}px`, background: '#EA4335', borderRadius: '2px', display: 'block' }} />
        <i style={{ width: `${barWidth}px`, height: `${Math.round(size * 0.85)}px`, background: '#1A73E8', borderRadius: '2px', display: 'block' }} />
        <i style={{ width: `${barWidth}px`, height: `${Math.round(size * 0.42)}px`, background: '#34A853', borderRadius: '2px', display: 'block' }} />
      </span>

      {showText && (
        <span 
          style={{
            fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
            fontWeight: 700,
            fontSize: `${Math.round(size * 0.65)}px`,
            letterSpacing: '-0.04em',
            color: 'inherit',
            lineHeight: 1
          }}
        >
          vibeskool
        </span>
      )}
    </div>
  )
}
