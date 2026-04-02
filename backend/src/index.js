import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server as SocketIO } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

import pathsRouter    from './routes/paths.js'
import lessonsRouter  from './routes/lessons.js'
import progressRouter from './routes/progress.js'
import healthRouter   from './routes/health.js'
import { registerSocketHandlers } from './socket/handlers.js'

const PORT = process.env.PORT || 4000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// ─── Express ────────────────────────────────────────────────────────────────
const app = express()
const httpServer = createServer(app)

// Middleware
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(morgan('dev'))
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — slow down a bit.' },
})
app.use('/api', limiter)

// Routes
app.use('/api/health',   healthRouter)
app.use('/api/paths',    pathsRouter)
app.use('/api/lessons',  lessonsRouter)
app.use('/api/progress', progressRouter)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── Socket.IO ──────────────────────────────────────────────────────────────
const io = new SocketIO(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

registerSocketHandlers(io)

// ─── Start ──────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 VibeSkool API running on http://localhost:${PORT}`)
  console.log(`   Client: ${CLIENT_URL}`)
  console.log(`   Env:    ${process.env.NODE_ENV || 'development'}\n`)
})

export { io }
