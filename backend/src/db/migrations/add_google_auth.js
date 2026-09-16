import 'dotenv/config';
import { query } from '../pool.js';

export async function migrateGoogleAuth() {
  console.log('Running Google Auth migration...');
  try {
    await query(`
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'local';
    `);
    console.log('Google Auth migration completed successfully.');
  } catch (error) {
    console.error('Migration error:', error.message);
    throw error;
  }
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('add_google_auth.js')) {
  migrateGoogleAuth()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
