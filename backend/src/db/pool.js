import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database successfully.');
});

export const query = (text, params) => pool.query(text, params);
export default pool;
