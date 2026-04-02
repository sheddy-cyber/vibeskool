import { Router } from 'express'

const router = Router()

// In-memory store for now (swap with PostgreSQL later)
const progressStore = {}

// GET /api/progress/:userId
router.get('/:userId', (req, res) => {
  const data = progressStore[req.params.userId] || {}
  res.json({ progress: data })
})

// POST /api/progress/:userId/complete
router.post('/:userId/complete', (req, res) => {
  const { userId } = req.params
  const { pathId, lessonId } = req.body

  if (!pathId || !lessonId) {
    return res.status(400).json({ error: 'pathId and lessonId are required' })
  }

  if (!progressStore[userId]) progressStore[userId] = {}
  if (!progressStore[userId][pathId]) progressStore[userId][pathId] = []

  const already = progressStore[userId][pathId].includes(lessonId)
  if (!already) progressStore[userId][pathId].push(lessonId)

  res.json({
    success: true,
    progress: progressStore[userId],
    lessonsComplete: progressStore[userId][pathId].length,
  })
})

// DELETE /api/progress/:userId — reset (dev only)
router.delete('/:userId', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' })
  }
  delete progressStore[req.params.userId]
  res.json({ success: true })
})

export default router
