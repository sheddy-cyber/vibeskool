import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function enableRLS() {
  console.log('Enabling Row Level Security (RLS) on all public tables...');
  try {
    const sqlPath = path.join(__dirname, 'migrations', 'enable_rls.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    // Verify RLS status
    const result = await pool.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);

    console.log('Current Row Level Security status:');
    console.table(result.rows);
    console.log('RLS migration completed successfully!');
  } catch (err) {
    console.error('Failed to enable RLS:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

enableRLS();
