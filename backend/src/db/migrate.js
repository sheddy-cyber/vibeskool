import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...');
    await pool.query(schemaSql);
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // End the pool so the process can exit
    await pool.end();
  }
}

runMigrations();
