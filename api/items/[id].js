import { neon } from '@neondatabase/serverless'
import { requireAuth } from '../../src/lib/auth.js'

function getDb() {
  return neon(process.env.DATABASE_URL)
}

export default requireAuth(async (req, res, userId) => {
  const { id } = req.query
  const sql = getDb()

  if (req.method === 'PUT') {
    const { brand, model, category, price, dateAdded, photos } = req.body
    const [item] = await sql`
      UPDATE items
      SET brand      = ${brand},
          model      = ${model},
          category   = ${category || null},
          price      = ${price},
          date_added = ${dateAdded},
          photos     = ${JSON.stringify(photos)}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, brand, model, category, price::float, date_added AS "dateAdded", photos
    `
    if (!item) return res.status(404).json({ error: 'Not found' })
    return res.json(item)
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM items WHERE id = ${id} AND user_id = ${userId}`
    return res.status(204).end()
  }

  res.status(405).json({ error: 'Method not allowed' })
})
