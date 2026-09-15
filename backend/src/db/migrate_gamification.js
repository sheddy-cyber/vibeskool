import 'dotenv/config';
import pool from './pool.js';

async function run() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;`);
    console.log('Gamification columns added successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
