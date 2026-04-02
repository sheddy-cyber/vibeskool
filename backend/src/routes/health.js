// ── health.js ────────────────────────────────────────────────────────────────
import { Router } from 'express'
const health = Router()
health.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'vibeskool-api', ts: new Date().toISOString() })
})
export default health
