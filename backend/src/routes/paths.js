import { Router } from 'express'
import { PATHS } from '../data/content.js'

const router = Router()

// GET /api/paths — all skill paths
router.get('/', (req, res) => {
  res.json({ paths: PATHS })
})

// GET /api/paths/:id — single path with lesson list
router.get('/:id', (req, res) => {
  const path = PATHS.find(p => p.id === req.params.id)
  if (!path) return res.status(404).json({ error: 'Path not found' })
  res.json({ path })
})

export default router
