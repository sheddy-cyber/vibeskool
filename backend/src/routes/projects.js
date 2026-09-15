import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, u.display_name as author_name, u.avatar_url,
      (SELECT count(*) FROM project_likes pl WHERE pl.project_id = p.id) as likes_count,
      EXISTS(SELECT 1 FROM project_likes pl WHERE pl.project_id = p.id AND pl.student_id = $1) as liked_by_me
      FROM projects p
      JOIN users u ON p.student_id = u.id
      ORDER BY likes_count DESC, p.created_at DESC
      LIMIT 50
    `, [req.user.id]);
    
    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const { title, description, code, language } = req.body;
    if (!title || !code) return res.status(400).json({ error: 'Title and code are required' });

    const insertResult = await query(`
      INSERT INTO projects (student_id, title, description, code, language)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.id, title, description, code, language || 'javascript']);

    // Award +30 XP for publishing a project
    await query('UPDATE users SET xp = xp + 30 WHERE id = $1', [req.user.id]);

    res.status(201).json({ project: insertResult.rows[0], xpAwarded: 30 });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects/:id/like
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Toggle like
    const check = await query('SELECT 1 FROM project_likes WHERE project_id = $1 AND student_id = $2', [id, req.user.id]);
    
    if (check.rows.length > 0) {
      await query('DELETE FROM project_likes WHERE project_id = $1 AND student_id = $2', [id, req.user.id]);
      res.json({ liked: false });
    } else {
      await query('INSERT INTO project_likes (project_id, student_id) VALUES ($1, $2)', [id, req.user.id]);
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
