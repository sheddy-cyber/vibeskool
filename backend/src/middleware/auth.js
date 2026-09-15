import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

// Generate a JWT token for a user
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Middleware: require valid JWT
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await query(
      'SELECT id, email, display_name, avatar_url, role, settings, xp, badges, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware factory: require specific role(s)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

// Optional auth: attaches user if token present, continues either way
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await query(
      'SELECT id, email, display_name, avatar_url, role, settings, xp, badges, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (rows.length > 0) {
      req.user = rows[0];
    }
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }
  next();
}
