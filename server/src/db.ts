import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { Pool, PoolConfig } from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const poolConfig: PoolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'mahi',
      password: process.env.PGPASSWORD || '1234',
      database: process.env.PGDATABASE || 'basic_inventory',
    }

export const pool = new Pool(poolConfig)

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err)
})

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params)
}

