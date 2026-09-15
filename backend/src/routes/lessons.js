import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/lessons/:id — full lesson content
router.get('/:id', async (req, res) => {
  try {
    const lessonResult = await query(`
      SELECT id, path_id as "pathId", title, duration, part_name as part, mek_label as "mekLabel", content_json as sections, ai_prompt as "aiPrompt", terminal_mission as "terminalMission"
      FROM lessons
      WHERE id = $1
    `, [req.params.id])

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' })
    }

    res.json({ lesson: lessonResult.rows[0] })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/lessons — list all lessons (lightweight)
router.get('/', async (req, res) => {
  try {
    const lessonsResult = await query(`
      SELECT l.id, l.path_id as "pathId", p.title as "pathName", l.title, l.duration, l.part_name as part, l.mek_label as "mekLabel"
      FROM lessons l
      JOIN skill_paths p ON l.path_id = p.id
      ORDER BY p.order_index ASC, l.order_index ASC
    `)

    res.json({ lessons: lessonsResult.rows })
  } catch (error) {
    console.error('Error fetching all lessons:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/lessons - Create a new lesson
router.post('/', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const { id, pathId, title, duration, part, mekLabel, sections, aiPrompt, terminalMission, order_index } = req.body;
  try {
    const result = await query(`
      INSERT INTO lessons (id, path_id, title, duration, part_name, mek_label, content_json, ai_prompt, terminal_mission, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, path_id as "pathId", title, duration, part_name as part, mek_label as "mekLabel"
    `, [id, pathId, title, duration, part, mekLabel, JSON.stringify(sections || []), aiPrompt, terminalMission ? JSON.stringify(terminalMission) : null, order_index || 0]);
    res.status(201).json({ lesson: result.rows[0] });
  } catch (err) {
    console.error('Error creating lesson:', err);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// PUT /api/lessons/:id - Update a lesson
router.put('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const { pathId, title, duration, part, mekLabel, sections, aiPrompt, terminalMission, order_index } = req.body;
  try {
    const result = await query(`
      UPDATE lessons 
      SET path_id = COALESCE($1, path_id),
          title = COALESCE($2, title),
          duration = COALESCE($3, duration),
          part_name = COALESCE($4, part_name),
          mek_label = COALESCE($5, mek_label),
          content_json = COALESCE($6, content_json),
          ai_prompt = COALESCE($7, ai_prompt),
          terminal_mission = COALESCE($8, terminal_mission),
          order_index = COALESCE($9, order_index)
      WHERE id = $10
      RETURNING id, path_id as "pathId", title, duration, part_name as part, mek_label as "mekLabel"
    `, [pathId, title, duration, part, mekLabel, sections ? JSON.stringify(sections) : null, aiPrompt, terminalMission ? JSON.stringify(terminalMission) : null, order_index, req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ lesson: result.rows[0] });
  } catch (err) {
    console.error('Error updating lesson:', err);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// DELETE /api/lessons/:id - Delete a lesson
router.delete('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    await query('DELETE FROM lessons WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting lesson:', err);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

export default router
