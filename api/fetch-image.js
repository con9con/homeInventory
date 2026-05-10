import { put } from '@vercel/blob'
import { requireAuth } from '../src/lib/auth.js'

// Downloads an external image URL server-side and re-uploads to Vercel Blob.
// Doing this server-side avoids CORS issues and ensures we own the image URL.
export default requireAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()

  const { imageUrl } = req.body
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' })

  let imageRes
  try {
    imageRes = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    })
    if (!imageRes.ok) throw new Error(`HTTP ${imageRes.status}`)
  } catch (e) {
    return res.status(422).json({ error: `Could not fetch image: ${e.message}` })
  }

  const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) {
    return res.status(422).json({ error: 'URL does not point to an image' })
  }

  const buffer = await imageRes.arrayBuffer()
  const ext = contentType.split('/')[1]?.split(';')[0]?.split('+')[0] || 'jpg'

  const blob = await put(`inventory/${Date.now()}.${ext}`, Buffer.from(buffer), {
    access: 'public',
    contentType,
  })

  res.json({ url: blob.url })
})
