import { neon } from '@neondatabase/serverless'
import { requireAuth } from '../../src/lib/auth.js'

export default requireAuth(async (req, res, userId) => {
  if (req.method !== 'DELETE') return res.status(405).end()

  const { id } = req.query
  const sql = neon(process.env.DATABASE_URL)

  const [cat] = await sql`
    SELECT name FROM categories WHERE id = ${id} AND user_id = ${userId}
  `
  if (!cat) return res.status(404).json({ error: 'Not found' })

  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count FROM items
    WHERE user_id = ${userId} AND category = ${cat.name}
  `
  if (count > 0) {
    return res.status(409).json({
      error: `${count} item${count !== 1 ? 's use' : ' uses'} this category. Reassign or delete those items first.`,
    })
  }

  await sql`DELETE FROM categories WHERE id = ${id} AND user_id = ${userId}`
  res.json({ ok: true })
})
