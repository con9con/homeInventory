import { neon } from '@neondatabase/serverless'
import { requireAuth } from '../../src/lib/auth.js'

const DEFAULTS = [
  'Electronics', 'Furniture', 'Appliances', 'Kitchen',
  'Clothing', 'Tools', 'Sports & Outdoors', 'Office', 'Garage', 'Other',
]

export default requireAuth(async (req, res, userId) => {
  const sql = neon(process.env.DATABASE_URL)

  if (req.method === 'GET') {
    let rows = await sql`
      SELECT id, name FROM categories WHERE user_id = ${userId} ORDER BY name
    `
    // Seed defaults on first load
    if (rows.length === 0) {
      await sql`
        INSERT INTO categories (user_id, name)
        SELECT ${userId}, unnest(${DEFAULTS}::text[])
        ON CONFLICT (user_id, name) DO NOTHING
      `
      rows = await sql`
        SELECT id, name FROM categories WHERE user_id = ${userId} ORDER BY name
      `
    }
    return res.json(rows)
  }

  if (req.method === 'POST') {
    const { name } = req.body ?? {}
    if (!name?.trim()) return res.status(400).json({ error: 'Name required' })
    try {
      const [row] = await sql`
        INSERT INTO categories (user_id, name)
        VALUES (${userId}, ${name.trim()})
        RETURNING id, name
      `
      return res.json(row)
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ error: 'Category already exists' })
      throw e
    }
  }

  res.status(405).end()
})
