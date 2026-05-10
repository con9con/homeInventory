import { put } from '@vercel/blob'
import { requireAuth } from '../src/lib/auth.js'

export default requireAuth(async (req, res, userId) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, type, data } = req.body
  const buffer = Buffer.from(data, 'base64')

  const blob = await put(`inventory/${userId}/${Date.now()}-${name}`, buffer, {
    access: 'public',
    contentType: type,
  })

  res.json({ url: blob.url })
})
