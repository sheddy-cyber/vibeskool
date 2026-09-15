import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();
router.use(requireAuth);

// GET /api/challenges/daily
router.get('/daily', async (req, res) => {
  try {
    // Deterministic selection based on date string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already completed today's challenge
    // We can track this by checking exercise_submissions for today
    
    const exercisesResult = await query("SELECT id, title, instructions, starter_code, language FROM exercises WHERE type = 'coding'");
    
    if (exercisesResult.rows.length === 0) {
      return res.status(404).json({ error: 'No challenges available' });
    }
    
    // Create a hash of the date string to pick an index
    const hash = crypto.createHash('md5').update(today).digest('hex');
    const num = parseInt(hash.substring(0, 8), 16);
    const selectedIndex = num % exercisesResult.rows.length;
    
    const challenge = exercisesResult.rows[selectedIndex];
    
    // Check completion
    const completionResult = await query(`
      SELECT 1 FROM exercise_submissions 
      WHERE exercise_id = $1 AND student_id = $2 AND passed = true AND DATE(created_at) = $3
    `, [challenge.id, req.user.id, today]);
    
    res.json({
      challenge: {
        ...challenge,
        completedToday: completionResult.rows.length > 0
      }
    });
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/challenges/daily/submit is just the exercise submission but handled on frontend
// We can just hit /api/exercises/:id/submit, but since we want 2x XP for Daily Challenge...
// We'll wrap it here
router.post('/daily/submit', async (req, res) => {
  try {
    const { id, code } = req.body;
    
    // We can just proxy to piston or do the same logic as exercises.js.
    // For brevity, we assume the frontend hits the normal /api/exercises/:id/submit,
    // and if they pass, we hit an extra endpoint or just award XP here.
    // Let's implement full check here so it's secure.
    
    const exResult = await query('SELECT * FROM exercises WHERE id = $1', [id]);
    if (exResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const exercise = exResult.rows[0];
    
    const language = exercise.language || 'javascript';
    const version = language === 'python' ? '3.10.0' : '18.15.0';
    const testCases = exercise.test_cases || [];
    
    let passed = false;
    let feedback = '';
    let score = 0;
    
    if (testCases.length === 0) {
      passed = true; score = 100;
    } else {
      let testsPassed = 0;
      let testResults = [];
      for (const tc of testCases) {
        let fullCode = code;
        if (language === 'javascript') {
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
        
        const result = await response.json();
        const output = (result.run && result.run.stdout) ? result.run.stdout.trim() : '';
        const isPass = output === String(tc.expected_output).trim();
        if (isPass) testsPassed++;
        
        testResults.push({
          input: tc.input,
          expected: tc.expected_output,
          actual: output,
          passed: isPass
        });
      }
      
      score = Math.round((testsPassed / testCases.length) * 100);
      passed = score === 100;
      feedback = JSON.stringify(testResults);
    }
    
    // Record submission
    await query(`
      INSERT INTO exercise_submissions (exercise_id, student_id, code, score, passed, feedback)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [exercise.id, req.user.id, code, score, passed, feedback]);
    
    let xpAwarded = 0;
    const today = new Date().toISOString().split('T')[0];
    
    if (passed) {
      // Check if already awarded today to prevent farming
      const prior = await query(`
        SELECT count(*) FROM exercise_submissions 
        WHERE exercise_id = $1 AND student_id = $2 AND passed = true AND DATE(created_at) = $3
      `, [exercise.id, req.user.id, today]);
      
      // The count includes the one we just inserted, so if it's 1, it's the first time today
      if (parseInt(prior.rows[0].count) <= 1) {
        xpAwarded = 40; // 2x standard
        await query('UPDATE users SET xp = xp + 40 WHERE id = $1', [req.user.id]);
      }
    }
    
    res.json({ passed, score, feedback, xpAwarded });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
