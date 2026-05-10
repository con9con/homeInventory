import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL DEFAULT 'legacy',
    brand       TEXT NOT NULL,
    model       TEXT NOT NULL,
    category    TEXT,
    price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    date_added  DATE NOT NULL,
    photos      JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`

await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS user_id TEXT`
await sql`UPDATE items SET user_id = 'legacy' WHERE user_id IS NULL`
await sql`ALTER TABLE items ALTER COLUMN user_id SET NOT NULL`
await sql`CREATE INDEX IF NOT EXISTS items_user_id_idx ON items (user_id)`

await sql`
  CREATE TABLE IF NOT EXISTS categories (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    TEXT NOT NULL,
    name       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
  )
`

console.log('Migration complete ✓')
