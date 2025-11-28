import { getPool, query } from './config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run all migrations
 */
async function runMigrations() {
  const pool = getPool();
  
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get executed migrations
    const executedResult = await pool.query('SELECT name FROM migrations');
    const executedMigrations = new Set(executedResult.rows.map(r => r.name));

    // Run migrations in order
    const migrations = [
      {
        name: '001_create_vietnam_regions',
        sql: readFileSync(join(__dirname, 'migrations/001_create_vietnam_regions.sql'), 'utf8')
      },
      {
        name: '002_create_region_crop_stages',
        sql: readFileSync(join(__dirname, 'migrations/002_create_region_crop_stages.sql'), 'utf8')
      },
      {
        name: '003_create_content_tables',
        sql: readFileSync(join(__dirname, 'migrations/003_create_content_tables.sql'), 'utf8')
      }
    ];

    for (const migration of migrations) {
      if (executedMigrations.has(migration.name)) {
        console.log(`⏭️  Migration ${migration.name} already executed, skipping...`);
        continue;
      }

      console.log(`🔄 Running migration: ${migration.name}...`);
      
      await pool.query('BEGIN');
      try {
        await pool.query(migration.sql);
        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
        await pool.query('COMMIT');
        console.log(`✅ Migration ${migration.name} completed`);
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    }

    console.log('✅ All migrations completed');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default runMigrations;

