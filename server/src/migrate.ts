import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigrations() {
  const client = await pool.connect()
  try {
    console.log('Running database migrations...')

    // Create migrations tracker table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    const migrationsDir = path.resolve(__dirname, '../migrations')
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort()

    for (const file of files) {
      const alreadyRun = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [file]
      )

      if (alreadyRun.rows.length === 0) {
        console.log(`Applying migration: ${file}`)
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')

        await client.query('BEGIN')
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`Applied: ${file}`)
      } else {
        console.log(`Skipping already applied migration: ${file}`)
      }
    }

    console.log('All migrations executed successfully.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()
