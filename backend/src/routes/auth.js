import { Router } from 'express';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../db/pool.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /google — Sign in or Sign up using verified Google ID token
router.post('/google', async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google credential token is required' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ 
      error: 'Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in your environment.' 
    });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google credential token' });
    }

    const { sub: googleId, email, name: displayName, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists by google_id OR email
    const existingUserResult = await query(
      'SELECT id, email, display_name, avatar_url, role, settings, xp, badges, created_at, google_id FROM users WHERE google_id = $1 OR email = $2',
      [googleId, normalizedEmail]
    );

    let user;

    if (existingUserResult.rows.length > 0) {
      user = existingUserResult.rows[0];

      // If user exists by email but google_id wasn't linked yet, or avatar can be upgraded
      const updates = [];
      const values = [];
      let idx = 1;

      if (!user.google_id) {
        updates.push(`google_id = $${idx++}`);
        values.push(googleId);
      }
      if (!user.avatar_url && picture) {
        updates.push(`avatar_url = $${idx++}`);
        values.push(picture);
      }

      if (updates.length > 0) {
        values.push(user.id);
        const updateQuery = `
          UPDATE users 
          SET ${updates.join(', ')} 
          WHERE id = $${idx}
          RETURNING id, email, display_name, avatar_url, role, settings, xp, badges, created_at
        `;
        const updatedResult = await query(updateQuery, values);
        user = updatedResult.rows[0];
      }
    } else {
      // 2. New user registration via Google
      const assignedRole = (role === 'teacher' || role === 'student') ? role : 'student';
      
      // Fallback initials avatar if picture is unavailable
      const words = (displayName || 'User').trim().split(/\s+/);
      const initials = words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
      const resolvedAvatar = picture || initials;

      const insertResult = await query(
        `INSERT INTO users (email, display_name, avatar_url, role, google_id, auth_provider)
         VALUES ($1, $2, $3, $4, $5, 'google')
         RETURNING id, email, display_name, avatar_url, role, settings, xp, badges, created_at`,
        [normalizedEmail, displayName || 'User', resolvedAvatar, assignedRole, googleId]
      );

      user = insertResult.rows[0];
    }

    const userForToken = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      role: user.role,
      settings: user.settings,
      created_at: user.created_at
    };

    const token = generateToken(userForToken);
    res.json({ user: userForToken, token });
  } catch (error) {
    console.error('Google Auth verification error:', error);
    res.status(401).json({ error: 'Failed to verify Google token: ' + (error.message || 'Unknown error') });
  }
});

// POST /signup
router.post('/signup', async (req, res) => {
  const { email, password, displayName, role } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!displayName) {
    return res.status(400).json({ error: 'Display name is required' });
  }
  if (role !== 'student' && role !== 'teacher') {
    return res.status(400).json({ error: 'Role must be student or teacher' });
  }

  try {
    // Check if email already exists
    const emailCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create avatar from initials
    const words = displayName.trim().split(/\s+/);
    const initials = words.slice(0, 2).map(w => w[0]).join('').toUpperCase();

    const insertResult = await query(
      `INSERT INTO users (email, password_hash, display_name, avatar_url, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, display_name, avatar_url, role, settings, xp, badges, created_at`,
      [email, passwordHash, displayName, initials, role]
    );

    const user = insertResult.rows[0];
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      role: user.role,
      settings: user.settings,
      created_at: user.created_at
    };

    const token = generateToken(userWithoutPassword);

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    let extraData = {};

    if (req.user.role === 'student') {
      const lessonsResult = await query(
        'SELECT COUNT(*) FROM lesson_progress WHERE student_id = $1 AND completed = true',
        [userId]
      );
      extraData.lessonsCompleted = parseInt(lessonsResult.rows[0].count, 10);

      // MEK score: 3 points per lesson + 10 per passed module, capped at 100
      const modulesResult = await query(
        'SELECT module_id, score FROM passed_modules WHERE student_id = $1',
        [userId]
      );
      extraData.passedModules = modulesResult.rows.map(row => row.module_id);
      extraData.mekScore = Math.min(100, (extraData.lessonsCompleted * 3) + (extraData.passedModules.length * 10));

      const streaksResult = await query(
        'SELECT current_streak, longest_streak FROM student_streaks WHERE student_id = $1',
        [userId]
      );
      if (streaksResult.rows.length > 0) {
        extraData.currentStreak = streaksResult.rows[0].current_streak;
        extraData.longestStreak = streaksResult.rows[0].longest_streak;
      } else {
         extraData.currentStreak = 0;
         extraData.longestStreak = 0;
      }
    }

    res.json({ user: req.user, ...extraData });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /profile
router.put('/profile', requireAuth, async (req, res) => {
  const { displayName, avatarUrl, settings } = req.body;
  
  const updates = [];
  const values = [];
  let index = 1;

  if (displayName !== undefined) {
    updates.push(`display_name = $${index++}`);
    values.push(displayName);
  }
  if (avatarUrl !== undefined) {
    updates.push(`avatar_url = $${index++}`);
    values.push(avatarUrl);
  }
  if (settings !== undefined) {
    updates.push(`settings = $${index++}`);
    values.push(settings);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(req.user.id);
  const queryStr = `
    UPDATE users 
    SET ${updates.join(', ')} 
    WHERE id = $${index} 
    RETURNING id, email, display_name, avatar_url, role, settings, created_at
  `;

  try {
    const result = await query(queryStr, values);
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
