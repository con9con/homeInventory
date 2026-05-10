import { neon } from '@neondatabase/serverless';

function getDb() {
  return neon(process.env.DATABASE_URL);
}

export default async function handler(req, res) {
  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, brand, model, category,
             price::float, date_added AS "dateAdded", photos
      FROM items
      ORDER BY created_at DESC
    `;
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { brand, model, category, price, dateAdded, photos } = req.body;
    const [item] = await sql`
      INSERT INTO items (brand, model, category, price, date_added, photos)
      VALUES (${brand}, ${model}, ${category || null}, ${price}, ${dateAdded}, ${JSON.stringify(photos)})
      RETURNING id, brand, model, category, price::float, date_added AS "dateAdded", photos
    `;
    return res.status(201).json(item);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
