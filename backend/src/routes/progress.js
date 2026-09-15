import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// All progress routes require authentication
router.use(requireAuth)

// GET /api/progress — get current user's progress
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id

    // Get completed lessons grouped by path
    const lessonsResult = await query(`
      SELECT lp.lesson_id, l.path_id, lp.completed_at
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      WHERE lp.student_id = $1 AND lp.completed = true
      ORDER BY lp.completed_at ASC
    `, [userId])

    // Group by path_id for the progress map
    const progress = {}
    for (const row of lessonsResult.rows) {
      if (!progress[row.path_id]) progress[row.path_id] = []
      progress[row.path_id].push(row.lesson_id)
    }

    // Get passed modules
    const modulesResult = await query(
      'SELECT module_id, score, passed_at FROM passed_modules WHERE student_id = $1',
      [userId]
    )

    // Get streak info
    const streakResult = await query(
      'SELECT current_streak, longest_streak, last_active FROM student_streaks WHERE student_id = $1',
      [userId]
    )
    const streak = streakResult.rows[0] || { current_streak: 0, longest_streak: 0 }

    res.json({
      progress,
      lessonsCompleted: lessonsResult.rows.length,
      passedModules: modulesResult.rows.map(r => r.module_id),
      currentStreak: streak.current_streak,
      longestStreak: streak.longest_streak,
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/progress/complete — mark a lesson as complete
router.post('/complete', async (req, res) => {
  try {
    const userId = req.user.id
    const { lessonId, pathId } = req.body

    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required' })
    }

    // Upsert lesson completion
    await query(`
      INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at)
      VALUES ($1, $2, true, now())
      ON CONFLICT (student_id, lesson_id) 
      DO UPDATE SET completed = true, completed_at = now()
    `, [userId, lessonId])

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const streakResult = await query(
      'SELECT current_streak, longest_streak, last_active FROM student_streaks WHERE student_id = $1',
      [userId]
    )

    if (streakResult.rows.length === 0) {
      // First activity ever
      await query(
        'INSERT INTO student_streaks (student_id, current_streak, longest_streak, last_active) VALUES ($1, 1, 1, $2)',
        [userId, today]
      )
    } else {
      const { current_streak, longest_streak, last_active } = streakResult.rows[0]
      const lastDate = last_active ? new Date(last_active) : null
      const todayDate = new Date(today)

      if (lastDate) {
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          // Consecutive day — extend streak
          const newStreak = current_streak + 1
          await query(
            'UPDATE student_streaks SET current_streak = $1, longest_streak = GREATEST(longest_streak, $1), last_active = $2 WHERE student_id = $3',
            [newStreak, today, userId]
          )
        } else if (diffDays > 1) {
          // Streak broken — reset to 1
          await query(
            'UPDATE student_streaks SET current_streak = 1, last_active = $1 WHERE student_id = $2',
            [today, userId]
          )
        }
        // diffDays === 0: same day, no streak update needed
      }
    }

    // Add XP
    await query('UPDATE users SET xp = xp + 10 WHERE id = $1', [userId])

    // Count total completed lessons for this path
    const countResult = await query(
      'SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON lp.lesson_id = l.id WHERE lp.student_id = $1 AND l.path_id = $2 AND lp.completed = true',
      [userId, pathId]
    )

    res.json({
      success: true,
      lessonsComplete: parseInt(countResult.rows[0].count, 10),
      xpAwarded: 10,
    })
  } catch (error) {
    console.error('Error completing lesson:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/progress/pass-module — record passing a module quiz
router.post('/pass-module', async (req, res) => {
  try {
    const userId = req.user.id
    const { moduleId, score } = req.body

    if (!moduleId) {
      return res.status(400).json({ error: 'moduleId is required' })
    }

    await query(`
      INSERT INTO passed_modules (student_id, module_id, score, passed_at)
      VALUES ($1, $2, $3, now())
      ON CONFLICT (student_id, module_id)
      DO UPDATE SET score = GREATEST(passed_modules.score, EXCLUDED.score), passed_at = now()
    `, [userId, moduleId, score || 100])

    // Add XP
    await query('UPDATE users SET xp = xp + 50 WHERE id = $1', [userId])

    // Return updated list of passed modules
    const result = await query(
      'SELECT module_id FROM passed_modules WHERE student_id = $1',
      [userId]
    )

    res.json({
      success: true,
      passedModules: result.rows.map(r => r.module_id),
    })
  } catch (error) {
    console.error('Error passing module:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/progress — reset progress (dev only)
router.delete('/', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' })
  }

  try {
    const userId = req.user.id
    await query('DELETE FROM lesson_progress WHERE student_id = $1', [userId])
    await query('DELETE FROM passed_modules WHERE student_id = $1', [userId])
    await query('DELETE FROM student_streaks WHERE student_id = $1', [userId])
    res.json({ success: true })
  } catch (error) {
    console.error('Error resetting progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
