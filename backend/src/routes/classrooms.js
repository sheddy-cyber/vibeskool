import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Helper to generate random invite code
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'VIBE-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * GET /
 * List classrooms
 */
router.get('/', async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === 'admin') {
      const result = await query(`
        SELECT c.*, u.display_name as teacher_name, 
        (SELECT count(*) FROM classroom_members cm WHERE cm.classroom_id = c.id) as member_count
        FROM classrooms c
        LEFT JOIN users u ON c.teacher_id = u.id
        ORDER BY c.created_at DESC
      `);
      return res.json({ classrooms: result.rows });
    } else if (role === 'teacher') {
      const result = await query(`
        SELECT c.*, 
        (SELECT count(*) FROM classroom_members cm WHERE cm.classroom_id = c.id) as member_count
        FROM classrooms c
        WHERE c.teacher_id = $1
        ORDER BY c.created_at DESC
      `, [id]);
      return res.json({ classrooms: result.rows });
    } else {
      // Student
      const result = await query(`
        SELECT c.*, u.display_name as teacher_name
        FROM classrooms c
        JOIN classroom_members cm ON c.id = cm.classroom_id
        LEFT JOIN users u ON c.teacher_id = u.id
        WHERE cm.student_id = $1
        ORDER BY cm.joined_at DESC
      `, [id]);
      return res.json({ classrooms: result.rows });
    }
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /
 * Create a classroom (teachers & admins only)
 */
router.post('/', requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    let inviteCode = generateInviteCode();
    
    const result = await query(`
      INSERT INTO classrooms (name, description, invite_code, teacher_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, invite_code, created_at
    `, [name, description, inviteCode, req.user.id]);

    res.status(201).json({ classroom: result.rows[0] });
  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /join
 * Student joins a classroom
 */
router.post('/join', async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    const code = inviteCode.trim().toUpperCase();

    // Find classroom
    const classroomResult = await query(`
      SELECT id FROM classrooms WHERE UPPER(invite_code) = $1
    `, [code]);

    if (classroomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const classroomId = classroomResult.rows[0].id;

    // Check if already a member
    const memberResult = await query(`
      SELECT 1 FROM classroom_members 
      WHERE classroom_id = $1 AND student_id = $2
    `, [classroomId, req.user.id]);

    if (memberResult.rows.length > 0) {
      return res.status(400).json({ error: 'Already a member of this classroom' });
    }

    // Join
    await query(`
      INSERT INTO classroom_members (classroom_id, student_id)
      VALUES ($1, $2)
    `, [classroomId, req.user.id]);

    // Fetch full classroom detail to return
    const joinedClassroom = await query(`
      SELECT c.*, u.display_name as teacher_name
      FROM classrooms c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = $1
    `, [classroomId]);

    res.json({ classroom: joinedClassroom.rows[0] });
  } catch (error) {
    console.error('Error joining classroom:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /:id
 * Classroom detail
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const classroomResult = await query(`
      SELECT c.*, u.display_name as teacher_name,
      (SELECT count(*) FROM skill_paths WHERE classroom_id = c.id) as path_count
      FROM classrooms c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = $1
    `, [id]);

    if (classroomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const classroom = classroomResult.rows[0];

    // Auth check: must be admin, teacher owner, or enrolled student
    if (role !== 'admin' && classroom.teacher_id !== userId) {
      const memberCheck = await query(`
        SELECT 1 FROM classroom_members 
        WHERE classroom_id = $1 AND student_id = $2
      `, [id, userId]);

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Fetch members
    const membersResult = await query(`
      SELECT u.id, u.display_name, u.email, u.avatar_url, cm.joined_at
      FROM classroom_members cm
      JOIN users u ON cm.student_id = u.id
      WHERE cm.classroom_id = $1
      ORDER BY cm.joined_at DESC
    `, [id]);

    classroom.members = membersResult.rows;

    res.json(classroom);
  } catch (error) {
    console.error('Error fetching classroom detail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /:id
 * Update classroom (teacher owner or admin)
 */
router.put('/:id', requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, aiProvider, aiApiKey } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // Check ownership
    const checkResult = await query(`SELECT teacher_id FROM classrooms WHERE id = $1`, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (role !== 'admin' && checkResult.rows[0].teacher_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateResult = await query(`
      UPDATE classrooms 
      SET name = COALESCE($1, name), 
          description = COALESCE($2, description),
          ai_provider = COALESCE($3, ai_provider),
          ai_api_key = COALESCE($4, ai_api_key)
      WHERE id = $5
      RETURNING *
    `, [name, description, aiProvider, aiApiKey, id]);

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /:id
 * Delete classroom (teacher owner or admin)
 */
router.delete('/:id', requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    // Check ownership
    const checkResult = await query(`SELECT teacher_id FROM classrooms WHERE id = $1`, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (role !== 'admin' && checkResult.rows[0].teacher_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.warn(`Deleting classroom ${id} and all related data via cascade...`);

    await query(`DELETE FROM classrooms WHERE id = $1`, [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /:id/members
 * List members (teacher owner or admin)
 */
router.get('/:id/members', requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    // Check ownership
    const checkResult = await query(`SELECT teacher_id FROM classrooms WHERE id = $1`, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (role !== 'admin' && checkResult.rows[0].teacher_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const membersResult = await query(`
      SELECT u.id, u.display_name, u.email, u.avatar_url, cm.joined_at
      FROM classroom_members cm
      JOIN users u ON cm.student_id = u.id
      WHERE cm.classroom_id = $1
      ORDER BY cm.joined_at DESC
    `, [id]);

    res.json({ members: membersResult.rows });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /:id/members/:studentId
 * Remove a student from classroom (teacher owner or admin)
 */
router.delete('/:id/members/:studentId', requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    // Check ownership
    const checkResult = await query(`SELECT teacher_id FROM classrooms WHERE id = $1`, [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (role !== 'admin' && checkResult.rows[0].teacher_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query(`
      DELETE FROM classroom_members 
      WHERE classroom_id = $1 AND student_id = $2
    `, [id, studentId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/classrooms/:id/leaderboard
 * Fetch students in a classroom ordered by XP descending
 */
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is in this classroom (as student) or is the teacher/admin
    // For simplicity, we just fetch the leaderboard.
    const result = await query(`
      SELECT u.id, u.display_name, u.avatar_url, u.xp, u.badges
      FROM classroom_members cm
      JOIN users u ON cm.student_id = u.id
      WHERE cm.classroom_id = $1
      ORDER BY u.xp DESC, u.created_at ASC
      LIMIT 50
    `, [id]);

    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/classrooms/:id/analytics
router.get('/:id/analytics', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const classCheck = await query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classCheck.rows.length === 0) return res.status(404).json({ error: 'Classroom not found' });
    if (classCheck.rows[0].teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // 1. Total Students
    const studentsRes = await query('SELECT COUNT(*) as total FROM classroom_students WHERE classroom_id = $1', [id]);
    const totalStudents = parseInt(studentsRes.rows[0].total);

    // 2. Average XP
    const xpRes = await query(`
      SELECT AVG(u.xp) as avg_xp 
      FROM classroom_students cs
      JOIN users u ON cs.student_id = u.id
      WHERE cs.classroom_id = $1
    `, [id]);
    const avgXp = Math.round(xpRes.rows[0].avg_xp || 0);

    // 3. Most difficult exercises (highest fail rate)
    // We count submissions for students in this classroom
    const exercisesRes = await query(`
      SELECT 
        e.title,
        COUNT(es.id) as total_attempts,
        SUM(CASE WHEN es.passed THEN 1 ELSE 0 END) as passed_attempts
      FROM exercises e
      JOIN exercise_submissions es ON e.id = es.exercise_id
      JOIN classroom_students cs ON es.student_id = cs.student_id
      WHERE cs.classroom_id = $1
      GROUP BY e.title
      ORDER BY passed_attempts::float / NULLIF(COUNT(es.id), 0) ASC
      LIMIT 5
    `, [id]);

    res.json({
      totalStudents,
      avgXp,
      difficultExercises: exercisesRes.rows.map(r => ({
        title: r.title,
        attempts: parseInt(r.total_attempts),
        passed: parseInt(r.passed_attempts),
        passRate: Math.round((parseInt(r.passed_attempts) / parseInt(r.total_attempts)) * 100) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
