import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/exercises?lessonId=...
router.get('/', async (req, res) => {
  const { lessonId } = req.query;
  try {
    let sql = 'SELECT * FROM exercises';
    const params = [];
    if (lessonId) {
      sql += ' WHERE lesson_id = $1';
      params.push(lessonId);
    }
    sql += ' ORDER BY created_at ASC';
    
    const result = await query(sql, params);
    res.json({ exercises: result.rows });
  } catch (err) {
    console.error('Error fetching exercises:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exercises/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM exercises WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ exercise: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/exercises
router.post('/', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const { lesson_id, type, title, instructions, starter_code, solution_code, test_cases, options, language } = req.body;
  try {
    const result = await query(`
      INSERT INTO exercises (lesson_id, teacher_id, type, title, instructions, starter_code, solution_code, test_cases, options, language)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [lesson_id, req.user.id, type || 'coding', title, instructions, starter_code, solution_code, test_cases ? JSON.stringify(test_cases) : null, options ? JSON.stringify(options) : null, language || 'javascript']);
    res.status(201).json({ exercise: result.rows[0] });
  } catch (err) {
    console.error('Error creating exercise:', err);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

// PUT /api/exercises/:id
router.put('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const { lesson_id, type, title, instructions, starter_code, solution_code, test_cases, options, language } = req.body;
  try {
    const result = await query(`
      UPDATE exercises
      SET lesson_id = COALESCE($1, lesson_id),
          type = COALESCE($2, type),
          title = COALESCE($3, title),
          instructions = COALESCE($4, instructions),
          starter_code = COALESCE($5, starter_code),
          solution_code = COALESCE($6, solution_code),
          test_cases = COALESCE($7, test_cases),
          options = COALESCE($8, options),
          language = COALESCE($9, language)
      WHERE id = $10
      RETURNING *
    `, [lesson_id, type, title, instructions, starter_code, solution_code, test_cases ? JSON.stringify(test_cases) : null, options ? JSON.stringify(options) : null, language, req.params.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ exercise: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// DELETE /api/exercises/:id
router.delete('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    await query('DELETE FROM exercises WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

// POST /api/exercises/:id/submit
router.post('/:id/submit', requireAuth, async (req, res) => {
  const { code } = req.body;
  try {
    const exResult = await query('SELECT * FROM exercises WHERE id = $1', [req.params.id]);
    if (exResult.rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    const exercise = exResult.rows[0];

    let passed = false;
    let feedback = '';
    let score = 0;

    if (exercise.language === 'html' || exercise.language === 'web') {
      passed = true;
      score = 100;
      feedback = JSON.stringify([{ input: 'Visual', actual: 'OK', expected: 'OK', passed: true }]);
    } else if (exercise.type === 'coding') {
      const language = exercise.language || 'javascript';
      const version = language === 'python' ? '3.10.0' : '18.15.0'; // Hardcoded fallback runtimes for Piston
      
      const testCases = exercise.test_cases || [];
      if (testCases.length === 0) {
        passed = true;
        score = 100;
        feedback = 'No test cases defined. Submission accepted.';
      } else {
        let testsPassed = 0;
        let testResults = [];
        
        for (const tc of testCases) {
          // Wrap code depending on language or just append test execution
          let fullCode = code;
          if (language === 'javascript') {
             // Basic test wrapping (assuming code defines a function and tc tests it)
             // For safety, in real app we'd use a proper test framework. For Piston we just append the test logic
             fullCode = `${code}\nconsole.log(${tc.input});`;
          }

          const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language: language,
              version: version,
              files: [{ content: fullCode }],
              compile_timeout: 10000,
              run_timeout: 3000
            })
          });
          
          if (!response.ok) {
            throw new Error('Piston API execution failed');
          }
          
          const result = await response.json();
          const output = (result.run && result.run.stdout) ? result.run.stdout.trim() : '';
          
          const isPass = output === String(tc.expected_output).trim();
          if (isPass) testsPassed++;
          
          testResults.push({
            input: tc.input,
            expected: tc.expected_output,
            actual: output,
            passed: isPass,
            stderr: result.run?.stderr || ''
          });
        }
        
        score = Math.round((testsPassed / testCases.length) * 100);
        passed = score === 100;
        feedback = JSON.stringify(testResults);
      }
    } else {
      // For multiple choice or other types
      passed = true; // simplified
      score = 100;
    }

    // Save submission
    await query(`
      INSERT INTO exercise_submissions (exercise_id, student_id, code, score, passed, feedback)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [exercise.id, req.user.id, code, score, passed, feedback]);

    let xpAwarded = 0;
    if (passed) {
      xpAwarded = 20;
      await query('UPDATE users SET xp = xp + 20 WHERE id = $1', [req.user.id]);
    }

    res.json({ passed, score, feedback, xpAwarded });

  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Failed to evaluate submission' });
  }
});

// GET /api/exercises/:id/solutions
// Fetch all successful submissions for this exercise by other students
router.get('/:id/solutions', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Only allow viewing solutions if the current user has passed the exercise themselves.
    const checkPassed = await query(
      'SELECT 1 FROM exercise_submissions WHERE exercise_id = $1 AND student_id = $2 AND passed = true',
      [id, req.user.id]
    );

    if (checkPassed.rows.length === 0 && req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You must pass the exercise before viewing community solutions.' });
    }

    const solutionsResult = await query(`
      SELECT es.id, es.code, es.created_at, u.display_name, u.avatar_url
      FROM exercise_submissions es
      JOIN users u ON es.student_id = u.id
      WHERE es.exercise_id = $1 AND es.passed = true AND es.student_id != $2
      ORDER BY es.created_at DESC
      LIMIT 20
    `, [id, req.user.id]);

    res.json({ solutions: solutionsResult.rows });
  } catch (err) {
    console.error('Error fetching solutions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
