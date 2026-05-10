import { requireAuth } from '../src/lib/auth.js'

export default requireAuth(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end()

  const { q } = req.query
  if (!q?.trim()) return res.status(400).json({ error: 'Query required' })

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const cx = process.env.GOOGLE_SEARCH_CX

  if (!apiKey || !cx) {
    return res.status(503).json({ error: 'Image search not configured' })
  }

  const url =
    `https://www.googleapis.com/customsearch/v1` +
    `?key=${apiKey}&cx=${cx}&searchType=image&num=10` +
    `&q=${encodeURIComponent(q)}`

  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    return res.status(response.status).json({ error: data.error?.message ?? 'Search failed' })
  }

  const items = (data.items ?? []).map(item => ({
    url: item.link,
    thumbnail: item.image.thumbnailLink,
    title: item.title,
    width: item.image.width,
    height: item.image.height,
  }))

  res.json({ items })
})
