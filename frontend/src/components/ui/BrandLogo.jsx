import React from 'react'

export default function BrandLogo({ size = 28, showText = true, text = 'VibeSkool', className = '', skoolColor }) {
  const renderBrandText = () => {
    if (text === 'VibeSkool') {
      return (
        <>
          <span style={{ color: 'var(--accent, #1A73E8)' }}>Vibe</span>
          <span style={{ color: skoolColor || 'var(--text-primary, #0F172A)' }}>Skool</span>
        </>
      )
    }
    return text
  }

  return (
    <div 
      className={className} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}
    >
      {/* Precision 3-bar tilted logo mark */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        fill="none" 
        style={{ flexShrink: 0, display: 'block' }}
        aria-hidden="true"
      >
        <g transform="rotate(-13 16 16)">
          <rect x="7.2" y="8.5" width="4.3" height="15" rx="2.15" fill="#EA4335"/>
          <rect x="13.85" y="4.2" width="4.3" height="23.6" rx="2.15" fill="#1A73E8"/>
          <rect x="20.5" y="10" width="4.3" height="12" rx="2.15" fill="#34A853"/>
        </g>
      </svg>

      {showText && (
        <span 
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: `${Math.round(size * 0.72)}px`,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            display: 'inline-block'
          }}
        >
          {renderBrandText()}
        </span>
      )}
    </div>
  )
}
