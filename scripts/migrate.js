import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand       TEXT NOT NULL,
    model       TEXT NOT NULL,
    category    TEXT,
    price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    date_added  DATE NOT NULL,
    photos      JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

console.log('Migration complete ✓');
