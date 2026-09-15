import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/forums/:classroomId
router.get('/:classroomId', async (req, res) => {
  try {
    const { classroomId } = req.params;
    
    // Make sure user has access to this classroom
    const memberCheck = await query('SELECT * FROM classroom_members WHERE classroom_id = $1 AND student_id = $2', [classroomId, req.user.id]);
    const teacherCheck = await query('SELECT * FROM classrooms WHERE id = $1 AND teacher_id = $2', [classroomId, req.user.id]);
    
    if (memberCheck.rows.length === 0 && teacherCheck.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const postsResult = await query(`
      SELECT p.*, u.display_name as author_name, u.avatar_url, u.role as author_role,
      (SELECT count(*) FROM forum_replies r WHERE r.post_id = p.id) as reply_count
      FROM forum_posts p
      JOIN users u ON p.student_id = u.id
      WHERE p.classroom_id = $1
      ORDER BY p.created_at DESC
    `, [classroomId]);

    res.json({ posts: postsResult.rows });
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/forums/:classroomId
router.post('/:classroomId', async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { title, body } = req.body;
    
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });

    const insertResult = await query(`
      INSERT INTO forum_posts (classroom_id, student_id, title, body)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [classroomId, req.user.id, title, body]);

    res.status(201).json({ post: insertResult.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/forums/post/:postId
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const postResult = await query(`
      SELECT p.*, u.display_name as author_name, u.avatar_url
      FROM forum_posts p
      JOIN users u ON p.student_id = u.id
      WHERE p.id = $1
    `, [postId]);

    if (postResult.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    const repliesResult = await query(`
      SELECT r.*, u.display_name as author_name, u.avatar_url, u.role as author_role
      FROM forum_replies r
      JOIN users u ON r.student_id = u.id
      WHERE r.post_id = $1
      ORDER BY r.created_at ASC
    `, [postId]);

    res.json({ post: postResult.rows[0], replies: repliesResult.rows });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/forums/post/:postId/reply
router.post('/post/:postId/reply', async (req, res) => {
  try {
    const { postId } = req.params;
    const { body } = req.body;

    if (!body) return res.status(400).json({ error: 'Body is required' });

    const insertResult = await query(`
      INSERT INTO forum_replies (post_id, student_id, body)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [postId, req.user.id, body]);

    res.status(201).json({ reply: insertResult.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
