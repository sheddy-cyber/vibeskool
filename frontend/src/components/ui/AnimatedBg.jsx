import React, { useEffect, useRef } from 'react'

/**
 * AnimatedBg — canvas-based warm particle field with electric network surges.
 * Nodes drift and form connections; periodically a charge races along an edge,
 * lighting it up with a bright travelling spark and leaving a fading afterglow.
 */
export default function AnimatedBg({ style }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const COLORS = [
      'rgba(201, 122, 58,',   // terracotta accent
      'rgba(138, 158, 138,',  // dusty sage
      'rgba(196, 184, 168,',  // warm stone
      'rgba(240, 235, 227,',  // chalk
    ]

    let W, H, particles, sparks, animId

    function resize() {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    // ── Particle ──────────────────────────────────────────────
    class Particle {
      constructor() { this.reset(true) }
      reset(init = false) {
        this.x  = Math.random() * W
        this.y  = init ? Math.random() * H : H + 20
        this.vx = (Math.random() - 0.5) * 0.25
        this.vy = -(Math.random() * 0.35 + 0.08)
        this.r  = Math.random() * 3 + 1.5
        this.alpha = Math.random() * 0.18 + 0.04
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
        this.wobble      = Math.random() * Math.PI * 2
        this.wobbleSpeed = (Math.random() - 0.5) * 0.008
      }
      update() {
        this.wobble += this.wobbleSpeed
        this.x += this.vx + Math.sin(this.wobble) * 0.18
        this.y += this.vy
        if (this.y < -20) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = `${this.color}${this.alpha})`
        ctx.fill()
      }
    }

    // ── Spark — travels along an edge from node A to node B ───
    class Spark {
      constructor(a, b) {
        this.a     = a         // start particle
        this.b     = b         // end particle
        this.t     = 0         // progress 0 → 1
        this.speed = 0.018 + Math.random() * 0.022
        this.dead  = false
        // afterglow: edge stays lit after spark passes
        this.glow  = 1.0
        // slight jitter offset so sparks on the same edge look different
        this.jitterAmp = (Math.random() - 0.5) * 6
      }

      update() {
        this.t += this.speed
        if (this.t >= 1) {
          this.t    = 1
          this.dead = true   // spark body gone; glow will fade in draw
        }
        this.glow -= 0.009  // afterglow decay
      }

      draw() {
        const ax = this.a.x, ay = this.a.y
        const bx = this.b.x, by = this.b.y

        // Perpendicular jitter (makes arc look like plasma)
        const mx = (ax + bx) / 2 + (by - ay) * 0.1 * this.jitterAmp / 6
        const my = (ay + by) / 2 - (bx - ax) * 0.1 * this.jitterAmp / 6

        // — Edge glow (the lit-up line behind the spark) —
        const edgeAlpha = Math.max(0, this.glow * 0.22)
        if (edgeAlpha > 0.005) {
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.quadraticCurveTo(mx, my, bx, by)
          ctx.strokeStyle = `rgba(255, 200, 100, ${edgeAlpha})`
          ctx.lineWidth   = 1.2
          ctx.stroke()
        }

        // — Travelling spark head —
        if (!this.dead) {
          const sx = ax + (bx - ax) * this.t + Math.sin(this.t * Math.PI) * this.jitterAmp
          const sy = ay + (by - ay) * this.t + Math.cos(this.t * Math.PI) * this.jitterAmp * 0.5

          // Outer halo
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 7)
          halo.addColorStop(0,   'rgba(255, 220, 140, 0.55)')
          halo.addColorStop(0.4, 'rgba(255, 180, 80,  0.18)')
          halo.addColorStop(1,   'rgba(255, 160, 60,  0)')
          ctx.beginPath()
          ctx.arc(sx, sy, 7, 0, Math.PI * 2)
          ctx.fillStyle = halo
          ctx.fill()

          // Bright core
          ctx.beginPath()
          ctx.arc(sx, sy, 1.8, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 245, 200, 0.95)'
          ctx.fill()
        }
      }

      get alive() { return this.glow > 0 }
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
      resize()
      particles = Array.from({ length: 90 }, () => new Particle())
      sparks    = []
    }

    const CONNECTION_DIST    = 120
    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST

    // Spark spawning: stagger so they don't all fire at once
    let sparkTimer   = 0
    const SPARK_INTERVAL = 28   // frames between spawn attempts

    function maybeLaunchSpark() {
      sparkTimer++
      if (sparkTimer < SPARK_INTERVAL) return
      sparkTimer = 0

      // Collect all edges that exist right now
      const edges = []
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          if (dx * dx + dy * dy < CONNECTION_DIST_SQ) {
            edges.push([particles[i], particles[j]])
          }
        }
      }
      if (edges.length === 0) return

      // Pick 1-3 random edges to spark simultaneously (rare multi-surge)
      const count = Math.random() < 0.15 ? 2 : 1
      for (let k = 0; k < count; k++) {
        const [a, b] = edges[Math.floor(Math.random() * edges.length)]
        // Randomly reverse direction for variety
        sparks.push(Math.random() < 0.5 ? new Spark(a, b) : new Spark(b, a))
      }
    }

    // ── Main loop ─────────────────────────────────────────────
    function draw() {
      ctx.clearRect(0, 0, W, H)

      // Base connections (faint, always-on)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dSq = dx * dx + dy * dy
          if (dSq < CONNECTION_DIST_SQ) {
            const t = 1 - dSq / CONNECTION_DIST_SQ
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(201, 122, 58, ${t * 0.06})`
            ctx.lineWidth = t * 0.8
            ctx.stroke()
          }
        }
      }

      // Sparks (drawn before nodes so nodes sit on top)
      maybeLaunchSpark()
      sparks = sparks.filter(s => s.alive)
      sparks.forEach(s => { s.update(); s.draw() })

      // Nodes
      particles.forEach(p => { p.update(); p.draw() })

      // Large drifting glow orbs (very subtle)
      const time = Date.now() * 0.0003
      const orbs = [
        { x: W * 0.15 + Math.sin(time * 0.7) * 60, y: H * 0.3 + Math.cos(time * 0.5) * 40, r: 200, c: 'rgba(201,122,58,' },
        { x: W * 0.8  + Math.cos(time * 0.6) * 50, y: H * 0.6 + Math.sin(time * 0.8) * 60, r: 260, c: 'rgba(138,158,138,' },
        { x: W * 0.5  + Math.sin(time * 0.4) * 80, y: H * 0.85 + Math.cos(time * 0.3) * 30, r: 180, c: 'rgba(201,122,58,' },
      ]
      orbs.forEach(o => {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
        g.addColorStop(0,   `${o.c}0.045)`)
        g.addColorStop(0.5, `${o.c}0.018)`)
        g.addColorStop(1,   `${o.c}0)`)
        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    init()
    draw()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  )
}
