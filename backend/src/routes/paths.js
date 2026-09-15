import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/paths — all skill paths
router.get('/', async (req, res) => {
  try {
    const pathsResult = await query(`
      SELECT id, title as name, description, icon, color, tag, modules_json
      FROM skill_paths 
      ORDER BY order_index ASC
    `)
    const paths = pathsResult.rows

    const lessonsResult = await query(`
      SELECT id, path_id, title, duration, part_name as part, mek_label as "mekLabel", order_index 
      FROM lessons 
      ORDER BY path_id, order_index ASC
    `)

    // Group lessons by path_id
    const lessonsByPath = {}
    for (const row of lessonsResult.rows) {
      if (!lessonsByPath[row.path_id]) lessonsByPath[row.path_id] = []
      lessonsByPath[row.path_id].push(row)
    }

    // Format to match frontend expectations
    const formattedPaths = paths.map(p => ({
      id: p.id,
      icon: p.icon,
      name: p.name,
      description: p.description,
      color: p.color,
      tag: p.tag,
      lessons_data: lessonsByPath[p.id] || [],
      modules: p.modules_json || [],
    }))

    res.json({ paths: formattedPaths })
  } catch (error) {
    console.error('Error fetching paths:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/paths/:id — single path with lesson list
router.get('/:id', async (req, res) => {
  try {
    const pathResult = await query(`
      SELECT id, title as name, description, icon, color, tag, modules_json
      FROM skill_paths 
      WHERE id = $1
    `, [req.params.id])

    if (pathResult.rows.length === 0) {
      return res.status(404).json({ error: 'Path not found' })
    }

    const pathData = pathResult.rows[0]

    const lessonsResult = await query(`
      SELECT id, path_id, title, duration, part_name as part, mek_label as "mekLabel", order_index 
      FROM lessons 
      WHERE path_id = $1
      ORDER BY order_index ASC
    `, [req.params.id])

    res.json({
      path: {
        ...pathData,
        lessons_data: lessonsResult.rows,
        modules: pathData.modules_json || [],
      }
    })
  } catch (error) {
    console.error('Error fetching path:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/paths - Create a new skill path (teacher/admin only)
router.post('/', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const { id, name, description, icon, color, tag, modules, order_index } = req.body;
  try {
    const result = await query(`
      INSERT INTO skill_paths (id, title, description, icon, color, tag, modules_json, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title as name, description, icon, color, tag, modules_json as modules
    `, [id, name, description, icon, color, tag, JSON.stringify(modules || []), order_index || 0]);
    res.status(201).json({ path: result.rows[0] });
  } catch (err) {
    console.error('Error creating path:', err);
    res.status(500).json({ error: 'Failed to create path' });
  }
});

// PUT /api/paths/:id - Update a skill path (teacher/admin only)
router.put('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const { name, description, icon, color, tag, modules, order_index } = req.body;
  try {
    const result = await query(`
      UPDATE skill_paths 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          icon = COALESCE($3, icon),
          color = COALESCE($4, color),
          tag = COALESCE($5, tag),
          modules_json = COALESCE($6, modules_json),
          order_index = COALESCE($7, order_index)
      WHERE id = $8
      RETURNING id, title as name, description, icon, color, tag, modules_json as modules
    `, [name, description, icon, color, tag, modules ? JSON.stringify(modules) : null, order_index, req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Path not found' });
    res.json({ path: result.rows[0] });
  } catch (err) {
    console.error('Error updating path:', err);
    res.status(500).json({ error: 'Failed to update path' });
  }
});

// DELETE /api/paths/:id - Delete a skill path (admin only)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await query('DELETE FROM skill_paths WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting path:', err);
    res.status(500).json({ error: 'Failed to delete path' });
  }
});

export default router
