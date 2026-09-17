import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Sparkles, 
  Zap, 
  RefreshCw, 
  Activity, 
  Sliders, 
  Play, 
  Radio, 
  SlidersHorizontal,
  ChevronRight,
  MousePointer,
  Cpu
} from 'lucide-react'
import styles from './VibeLaboratory.module.css'

const PRESETS = {
  harmonics: {
    id: 'harmonics',
    name: 'Harmonic Waves',
    fnName: 'synthesizeWaveMesh',
    lang: 'javascript',
    defaultSpeed: 1.2,
    defaultDensity: 80,
    defaultResonance: 3.2,
    description: 'Multi-order sine interference with dynamic phase velocity',
    mentorTip: 'Notice how modulating the frequency parameter alters the constructive wave crests in real time.',
  },
  orbit: {
    id: 'orbit',
    name: 'Kinetic Orbit',
    fnName: 'simulateGravityField',
    lang: 'javascript',
    defaultSpeed: 1.5,
    defaultDensity: 90,
    defaultResonance: 2.4,
    description: 'N-body gravitational attraction with cursor-reactive sling physics',
    mentorTip: 'Move your cursor into the canvas—your pointer acts as a dynamic gravitational mass.',
  },
  swarm: {
    id: 'swarm',
    name: 'Neural Swarm',
    fnName: 'computeConstellation',
    lang: 'javascript',
    defaultSpeed: 1.1,
    defaultDensity: 110,
    defaultResonance: 4.0,
    description: 'Proximity-linked autonomous agents with organic flocking',
    mentorTip: 'Click the canvas or hit Shockwave to scatter the nodes and watch them re-converge.',
  },
}

export default function VibeLaboratory() {
  const [activePreset, setActivePreset] = useState('harmonics')
  const [speed, setSpeed] = useState(PRESETS.harmonics.defaultSpeed)
  const [density, setDensity] = useState(PRESETS.harmonics.defaultDensity)
  const [resonance, setResonance] = useState(PRESETS.harmonics.defaultResonance)
  const [shockwaveTrigger, setShockwaveTrigger] = useState(0)
  const [fps, setFps] = useState(60)
  const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0, inside: false })

  const canvasRef = useRef(null)
  const animFrameId = useRef(null)
  const particlesRef = useRef([])
  const shockwavesRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const frameTimesRef = useRef([])

  // Switch preset
  const handleSelectPreset = (key) => {
    setActivePreset(key)
    const p = PRESETS[key]
    setSpeed(p.defaultSpeed)
    setDensity(p.defaultDensity)
    setResonance(p.defaultResonance)
    triggerShockwave()
  }

  // Shockwave pulse
  const triggerShockwave = useCallback((cx, cy) => {
    setShockwaveTrigger(t => t + 1)
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    shockwavesRef.current.push({
      x: cx ?? (rect.width / 2),
      y: cy ?? (rect.height / 2),
      radius: 4,
      maxRadius: Math.max(rect.width, rect.height) * 0.8,
      alpha: 1,
      speed: 8 * speed,
    })
  }, [speed])

  // Mutate / Randomize
  const handleMutate = () => {
    setSpeed(parseFloat((0.6 + Math.random() * 1.8).toFixed(1)))
    setResonance(parseFloat((1.5 + Math.random() * 3.5).toFixed(1)))
    triggerShockwave()
  }

  // Cycle speed stepper
  const cycleSpeed = () => {
    const steps = [0.8, 1.2, 1.8, 2.4]
    const next = steps[(steps.indexOf(speed) + 1) % steps.length] || 1.2
    setSpeed(next)
  }

  // Cycle density stepper
  const cycleDensity = () => {
    const steps = [50, 80, 120, 160]
    const next = steps[(steps.indexOf(density) + 1) % steps.length] || 80
    setDensity(next)
  }

  // Cycle resonance stepper
  const cycleResonance = () => {
    const steps = [1.8, 2.6, 3.4, 4.6]
    const next = steps[(steps.indexOf(resonance) + 1) % steps.length] || 3.2
    setResonance(next)
  }

  // Init canvas particles
  const initParticles = useCallback((width, height, count, mode) => {
    const particles = []
    for (let i = 0; i < count; i++) {
      if (mode === 'harmonics') {
        particles.push({
          x: (i / count) * width,
          y: height / 2,
          baseX: (i / count) * width,
          baseY: height / 2,
          phase: (i / count) * Math.PI * 4,
          amp: 30 + Math.random() * 50,
          colorIdx: i % 4,
          size: 2.2 + Math.random() * 2,
          speedOffset: 0.8 + Math.random() * 0.4,
        })
      } else if (mode === 'orbit') {
        const angle = Math.random() * Math.PI * 2
        const dist = 30 + Math.random() * Math.min(width, height) * 0.4
        particles.push({
          angle,
          dist,
          x: width / 2 + Math.cos(angle) * dist,
          y: height / 2 + Math.sin(angle) * dist,
          trail: [],
          angularSpeed: (0.01 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1),
          radialSpeed: (Math.random() - 0.5) * 0.4,
          size: 1.8 + Math.random() * 2.2,
          colorIdx: i % 4,
        })
      } else {
        // swarm
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 2.0 + Math.random() * 2.0,
          colorIdx: i % 4,
        })
      }
    }
    return particles
  }, [])

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particlesRef.current = initParticles(width, height, density, activePreset)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const PALETTE = [
      '#1A73E8', // Blue
      '#34A853', // Green
      '#F9AB00', // Amber
      '#EA4335', // Red
    ]

    let time = 0
    let lastTime = performance.now()

    const render = (now) => {
      const delta = (now - lastTime) / 1000
      lastTime = now

      // FPS tracking
      frameTimesRef.current.push(now)
      if (frameTimesRef.current.length > 30) {
        const oldest = frameTimesRef.current.shift()
        const computedFps = Math.round(1000 / ((now - oldest) / 30))
        setFps(Math.min(computedFps, 60))
      }

      time += delta * speed

      // Background with subtle radial glow
      ctx.fillStyle = '#080C15'
      ctx.fillRect(0, 0, width, height)

      // Ambient geometric grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'
      ctx.lineWidth = 1
      const gridSize = 40
      ctx.beginPath()
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      const mouse = mouseRef.current
      const particles = particlesRef.current

      // ── MODE 1: HARMONICS (Wave Interference) ─────────────────────
      if (activePreset === 'harmonics') {
        const count = particles.length
        const centerY = height / 2

        // Draw multiple harmonic wave ribbons
        for (let waveIdx = 0; waveIdx < 3; waveIdx++) {
          ctx.beginPath()
          const wavePhase = time * (1.5 + waveIdx * 0.4)
          const waveFreq = (resonance * 0.008) * (1 + waveIdx * 0.5)
          const waveAmp = (height * 0.18) * (1 - waveIdx * 0.2)

          ctx.moveTo(0, centerY)
          for (let x = 0; x <= width; x += 6) {
            let y = centerY + Math.sin(x * waveFreq + wavePhase) * waveAmp
            y += Math.cos(x * waveFreq * 0.5 - wavePhase * 0.6) * (waveAmp * 0.35)

            // Deflect near mouse
            if (mouse.active) {
              const dx = x - mouse.x
              const dy = y - mouse.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 120) {
                const force = (1 - dist / 120) * 45
                y += (dy > 0 ? force : -force)
              }
            }
            ctx.lineTo(x, y)
          }

          const grad = ctx.createLinearGradient(0, 0, width, 0)
          grad.addColorStop(0, waveIdx === 0 ? 'rgba(26, 115, 232, 0.8)' : 'rgba(52, 168, 83, 0.6)')
          grad.addColorStop(0.5, waveIdx === 0 ? 'rgba(249, 171, 0, 0.8)' : 'rgba(234, 67, 53, 0.6)')
          grad.addColorStop(1, waveIdx === 0 ? 'rgba(26, 115, 232, 0.8)' : 'rgba(52, 168, 83, 0.6)')

          ctx.strokeStyle = grad
          ctx.lineWidth = waveIdx === 0 ? 2.5 : 1.5
          ctx.stroke()
        }

        // Animated node points along primary wave
        for (let i = 0; i < count; i++) {
          const p = particles[i]
          const x = (i / count) * width
          let y = centerY + Math.sin(x * resonance * 0.008 + time * 1.5) * (height * 0.18)
          y += Math.cos(x * resonance * 0.004 - time * 0.9) * (height * 0.06)

          if (mouse.active) {
            const dx = x - mouse.x
            const dy = y - mouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 120) {
              const force = (1 - dist / 120) * 45
              y += (dy > 0 ? force : -force)
            }
          }

          // Vertical connector line
          ctx.beginPath()
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + (i % 3) * 0.04})`
          ctx.lineWidth = 1
          ctx.moveTo(x, centerY - 40)
          ctx.lineTo(x, y)
          ctx.stroke()

          // Node head
          ctx.beginPath()
          ctx.arc(x, y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = PALETTE[p.colorIdx]
          ctx.shadowColor = PALETTE[p.colorIdx]
          ctx.shadowBlur = 8
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // ── MODE 2: KINETIC ORBIT (Gravitational Attractors) ─────────
      else if (activePreset === 'orbit') {
        const centerX = width / 2
        const centerY = height / 2

        // Draw center attractor sun
        ctx.beginPath()
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
        ctx.fillStyle = '#F9AB00'
        ctx.shadowColor = '#F9AB00'
        ctx.shadowBlur = 20
        ctx.fill()
        ctx.shadowBlur = 0

        // Secondary attractor if mouse active
        if (mouse.active) {
          ctx.beginPath()
          ctx.arc(mouse.x, mouse.y, 6, 0, Math.PI * 2)
          ctx.fillStyle = '#1A73E8'
          ctx.shadowColor = '#1A73E8'
          ctx.shadowBlur = 16
          ctx.fill()
          ctx.shadowBlur = 0

          // Connecting gravitational beam
          ctx.beginPath()
          ctx.strokeStyle = 'rgba(26, 115, 232, 0.25)'
          ctx.setLineDash([4, 4])
          ctx.moveTo(centerX, centerY)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
          ctx.setLineDash([])
        }

        // Orbiting particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          p.angle += p.angularSpeed * speed

          let targetX = centerX + Math.cos(p.angle) * p.dist
          let targetY = centerY + Math.sin(p.angle) * (p.dist * 0.6)

          // Gravitational pull toward mouse
          if (mouse.active) {
            const dx = mouse.x - targetX
            const dy = mouse.y - targetY
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist > 10 && dist < 220) {
              const pull = (1 - dist / 220) * 0.35
              targetX += dx * pull
              targetY += dy * pull
            }
          }

          p.x += (targetX - p.x) * 0.2
          p.y += (targetY - p.y) * 0.2

          // Trail history
          p.trail.push({ x: p.x, y: p.y })
          if (p.trail.length > 8) p.trail.shift()

          // Draw trail
          if (p.trail.length > 1) {
            ctx.beginPath()
            ctx.moveTo(p.trail[0].x, p.trail[0].y)
            for (let t = 1; t < p.trail.length; t++) {
              ctx.lineTo(p.trail[t].x, p.trail[t].y)
            }
            ctx.strokeStyle = PALETTE[p.colorIdx]
            ctx.globalAlpha = 0.25
            ctx.lineWidth = p.size * 0.8
            ctx.stroke()
            ctx.globalAlpha = 1.0
          }

          // Draw particle head
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = PALETTE[p.colorIdx]
          ctx.shadowColor = PALETTE[p.colorIdx]
          ctx.shadowBlur = 6
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // ── MODE 3: NEURAL SWARM (Flocking Constellation) ────────────
      else if (activePreset === 'swarm') {
        const threshold = 65

        // Update positions
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          p.x += p.vx * speed
          p.y += p.vy * speed

          // Bounce off walls
          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1

          // Gentle mouse avoidance / attraction
          if (mouse.active) {
            const dx = mouse.x - p.x
            const dy = mouse.y - p.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 100) {
              const force = (1 - dist / 100) * 1.5
              p.x -= (dx / dist) * force
              p.y -= (dy / dist) * force
            }
          }
        }

        // Draw connections
        ctx.lineWidth = 0.8
        for (let i = 0; i < particles.length; i++) {
          const pi = particles[i]
          for (let j = i + 1; j < particles.length; j++) {
            const pj = particles[j]
            const dx = pi.x - pj.x
            const dy = pi.y - pj.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < threshold) {
              const alpha = (1 - dist / threshold) * 0.35
              ctx.strokeStyle = `rgba(52, 168, 83, ${alpha})`
              ctx.beginPath()
              ctx.moveTo(pi.x, pi.y)
              ctx.lineTo(pj.x, pj.y)
              ctx.stroke()
            }
          }
        }

        // Draw nodes
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = PALETTE[p.colorIdx]
          ctx.shadowColor = PALETTE[p.colorIdx]
          ctx.shadowBlur = 6
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // ── SHOCKWAVES ───────────────────────────────────────────────
      for (let sIdx = shockwavesRef.current.length - 1; sIdx >= 0; sIdx--) {
        const sw = shockwavesRef.current[sIdx]
        sw.radius += sw.speed
        sw.alpha = 1 - (sw.radius / sw.maxRadius)

        if (sw.alpha <= 0) {
          shockwavesRef.current.splice(sIdx, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(26, 115, 232, ${sw.alpha * 0.7})`
        ctx.lineWidth = 2.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 8), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(249, 171, 0, ${sw.alpha * 0.4})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      animFrameId.current = requestAnimationFrame(render)
    }

    animFrameId.current = requestAnimationFrame(render)

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
      ro.disconnect()
    }
  }, [activePreset, speed, density, resonance, initParticles])

  // Mouse event listeners on canvas
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mouseRef.current = { x, y, active: true }
    setMouseCoord({ x: Math.round(x), y: Math.round(y), inside: true })
  }

  const handleMouseLeave = () => {
    mouseRef.current = { ...mouseRef.current, active: false }
    setMouseCoord(c => ({ ...c, inside: false }))
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    triggerShockwave(cx, cy)
  }

  // Touch event listeners for mobile devices
  const handleTouchStart = (e) => {
    const canvas = canvasRef.current
    if (!canvas || !e.touches || e.touches.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    mouseRef.current = { x, y, active: true }
    setMouseCoord({ x: Math.round(x), y: Math.round(y), inside: true })
    triggerShockwave(x, y)
  }

  const handleTouchMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas || !e.touches || e.touches.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    mouseRef.current = { x, y, active: true }
    setMouseCoord({ x: Math.round(x), y: Math.round(y), inside: true })
  }

  const handleTouchEnd = () => {
    mouseRef.current = { ...mouseRef.current, active: false }
    setMouseCoord(c => ({ ...c, inside: false }))
  }

  const currentPreset = PRESETS[activePreset]

  return (
    <div className={styles.labContainer}>
      {/* ── Industrial Laboratory Header ───────────────────────── */}
      <div className={styles.labHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.brandBadge}>
            <span className={styles.pulseDot} />
            <span className={styles.brandTitle}>VIBE BENCH //</span>
            <span className={styles.subTitle}>REACTIVE ENGINE</span>
          </div>

          <div className={styles.presetSelector}>
            {Object.values(PRESETS).map(p => (
              <button
                key={p.id}
                type="button"
                className={`${styles.presetBtn} ${activePreset === p.id ? styles.presetBtnActive : ''}`}
                onClick={() => handleSelectPreset(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.vmStatusPill}>
            <Cpu size={12} className={styles.vmIcon} />
            <span className={styles.vmTextFull}>WebContainer VM: Connected</span>
            <span className={styles.vmTextShort}>VM Active</span>
          </div>

          <button
            type="button"
            className={styles.pulseBtn}
            onClick={() => triggerShockwave()}
            title="Inject Shockwave"
          >
            <Zap size={13} />
            <span>Pulse</span>
          </button>

          <button
            type="button"
            className={styles.mutateBtn}
            onClick={handleMutate}
            title="Mutate Parameters"
          >
            <RefreshCw size={13} />
            <span>Mutate</span>
          </button>
        </div>
      </div>

      {/* ── Dual Split Stage: Reactive Code Lens + Interactive 60fps Canvas ── */}
      <div className={styles.labBody}>
        {/* Left Pane: Reactive Code Lens */}
        <div className={styles.codeLensPane}>
          <div className={styles.codeLensHeader}>
            <div className={styles.fileTab}>
              <span className={styles.fileLangDot} />
              <span>{currentPreset.fnName}.js</span>
            </div>
            <span className={styles.reactiveTag}>Interactive Variables</span>
          </div>

          <div className={styles.codeScrollArea}>
            <div className={styles.gutter}>
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
              <span>11</span><span>12</span>
            </div>

            <pre className={styles.codeContent}>
              <code>
                <span className={styles.tokenKw}>export default function </span>
                <span className={styles.tokenFn}>{currentPreset.fnName}</span>(
                <span className={styles.tokenParam}>stage</span>) &#123;{'\n'}
                {'  '}<span className={styles.tokenComment}>// Click any parameter badge to tweak live</span>{'\n'}
                {'  '}<span className={styles.tokenKw}>const </span>velocity ={' '}
                <button type="button" onClick={cycleSpeed} className={styles.interactiveBadge}>
                  {speed.toFixed(1)}x
                </button>;{'\n'}
                {'  '}<span className={styles.tokenKw}>const </span>nodes ={' '}
                <button type="button" onClick={cycleDensity} className={styles.interactiveBadge}>
                  {density}
                </button>;{'\n'}
                {'  '}<span className={styles.tokenKw}>const </span>resonance ={' '}
                <button type="button" onClick={cycleResonance} className={styles.interactiveBadge}>
                  {resonance.toFixed(1)} rad
                </button>;{'\n\n'}
                {'  '}<span className={styles.tokenKw}>return </span>stage.
                <span className={styles.tokenFn}>integrate</span>(&#123;{'\n'}
                {'    '}mode: <span className={styles.tokenStr}>&apos;{currentPreset.id}&apos;</span>,{'\n'}
                {'    '}fps: <span className={styles.tokenNum}>60</span>,{'\n'}
                {'    '}collaborative: <span className={styles.tokenBool}>true</span>{'\n'}
                {'  '}&#125;);{'\n'}
                &#125;
              </code>
            </pre>

            {/* Live Collaborative Mentor Callout */}
            <div className={styles.mentorAnnotation}>
              <div className={styles.mentorTag}>
                <div className={styles.mentorAvatar}>SK</div>
                <div className={styles.mentorMeta}>
                  <span className={styles.mentorName}>Sarah K.</span>
                  <span className={styles.mentorBadge}>Live Mentor</span>
                </div>
                <div className={styles.liveIndicator}>
                  <span className={styles.indicatorPulse} />
                  <span>Pairing</span>
                </div>
              </div>
              <p className={styles.mentorText}>
                {currentPreset.mentorTip}
              </p>
            </div>
          </div>

          {/* Code Controls Footer */}
          <div className={styles.codeLensFooter}>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderLabel}>Speed:</span>
              <input 
                type="range" 
                min="0.5" 
                max="2.5" 
                step="0.1" 
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className={styles.rangeInput}
              />
              <span className={styles.sliderVal}>{speed.toFixed(1)}x</span>
            </div>

            <div className={styles.sliderGroup}>
              <span className={styles.sliderLabel}>Harmonics:</span>
              <input 
                type="range" 
                min="1.0" 
                max="5.0" 
                step="0.2" 
                value={resonance}
                onChange={(e) => setResonance(parseFloat(e.target.value))}
                className={styles.rangeInput}
              />
              <span className={styles.sliderVal}>{resonance.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Interactive 60fps Kinetic Stage */}
        <div className={styles.canvasPane}>
          <div className={styles.canvasOverlayTop}>
            <div className={styles.modePill}>
              <span className={styles.modeLed} />
              <span>STAGE: {currentPreset.name.toUpperCase()}</span>
            </div>
            <div className={styles.coordReadout}>
              {mouseCoord.inside ? (
                <span>X: {mouseCoord.x} · Y: {mouseCoord.y}</span>
              ) : (
                <span>Hover or click canvas</span>
              )}
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className={styles.kineticCanvas}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleCanvasClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Floating Mentor Cursor Simulation in Canvas */}
          <div className={styles.canvasMentorCursor}>
            <MousePointer size={14} className={styles.mentorCursorIcon} />
            <div className={styles.mentorCursorPill}>
              Sarah K. (Mentor)
            </div>
          </div>

          <div className={styles.canvasOverlayBottom}>
            <span className={styles.canvasHint}>
              Tap / click to pulse · Drag to influence physics
            </span>
          </div>
        </div>
      </div>

      {/* ── State Telemetry Strip ──────────────────────────────── */}
      <div className={styles.labTelemetry}>
        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>ENGINE:</span>
          <span className={styles.telemetryValGreen}>WebContainer VM</span>
        </div>

        <div className={styles.telemetryDivider} />

        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>REFRESH:</span>
          <span className={styles.telemetryVal}>{fps} FPS</span>
        </div>

        <div className={styles.telemetryDivider} />

        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>ACTIVE NODES:</span>
          <span className={styles.telemetryVal}>{density}</span>
        </div>

        <div className={styles.telemetryDivider} />

        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>SYNC LATENCY:</span>
          <span className={styles.telemetryVal}>14ms</span>
        </div>

        <div className={styles.telemetryDivider} />

        <div className={styles.telemetryItem}>
          <span className={styles.telemetryLabel}>STATUS:</span>
          <span className={styles.telemetryValGreen}>Nominal · 0 dropouts</span>
        </div>
      </div>
    </div>
  )
}
