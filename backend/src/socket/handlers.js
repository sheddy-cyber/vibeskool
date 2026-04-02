// ─── Socket.IO Event Handlers ─────────────────────────────────────────────────
// Handles real-time features:
//   - Terminal session management
//   - Live lesson collaboration (future)
//   - Presence / online indicators (future)

const activeSessions = new Map()

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`)

    // ── Terminal session ──────────────────────────────────────────────────────

    socket.on('terminal:start', ({ userId, mode }) => {
      activeSessions.set(socket.id, { userId, mode, startedAt: Date.now() })
      socket.emit('terminal:ready', {
        sessionId: socket.id,
        mode,
        message: mode === 'guided'
          ? '✓ Guided session started. Follow the missions.'
          : '✓ Free sandbox ready. Type help to begin.',
      })
      console.log(`[terminal] session started — user: ${userId}, mode: ${mode}`)
    })

    socket.on('terminal:command', ({ command, sessionId }) => {
      // Commands are evaluated client-side for now (terminalEval.js).
      // This handler is a hook for future server-side execution (Docker sandboxes).
      socket.emit('terminal:ack', { command, received: true })
    })

    socket.on('terminal:end', () => {
      activeSessions.delete(socket.id)
      socket.emit('terminal:closed')
    })

    // ── Lesson presence ───────────────────────────────────────────────────────

    socket.on('lesson:enter', ({ lessonId, userId }) => {
      socket.join(`lesson:${lessonId}`)
      socket.to(`lesson:${lessonId}`).emit('lesson:user-joined', { userId })
    })

    socket.on('lesson:leave', ({ lessonId, userId }) => {
      socket.leave(`lesson:${lessonId}`)
      socket.to(`lesson:${lessonId}`).emit('lesson:user-left', { userId })
    })

    // ── Disconnect ────────────────────────────────────────────────────────────

    socket.on('disconnect', (reason) => {
      activeSessions.delete(socket.id)
      console.log(`[socket] disconnected: ${socket.id} (${reason})`)
    })
  })

  // Emit active session count every 30s (useful for admin dashboard later)
  setInterval(() => {
    io.emit('stats:sessions', { active: activeSessions.size })
  }, 30_000)
}
