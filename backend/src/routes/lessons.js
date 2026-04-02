import { Router } from 'express'
import { LESSONS, PATHS } from '../data/content.js'

const router = Router()

// GET /api/lessons/:id — full lesson content
router.get('/:id', (req, res) => {
  const lesson = LESSONS[req.params.id]
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' })
  res.json({ lesson })
})

// GET /api/lessons — list all lessons (lightweight)
router.get('/', (req, res) => {
  const list = PATHS.flatMap(p =>
    p.lessons.map(l => ({ ...l, pathId: p.id, pathName: p.name }))
  )
  res.json({ lessons: list })
})

export default router
