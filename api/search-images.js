import { requireAuth } from '../src/lib/auth.js'

export default requireAuth(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end()

  const { q } = req.query
  if (!q?.trim()) return res.status(400).json({ error: 'Query required' })

  const apiKey = process.env.BING_SEARCH_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'Image search not configured' })

  const url =
    `https://api.bing.microsoft.com/v7.0/images/search` +
    `?q=${encodeURIComponent(q)}&count=12&safeSearch=Moderate`

  const response = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey },
  })
  const data = await response.json()

  if (!response.ok) {
    return res.status(response.status).json({ error: data.error?.message ?? 'Search failed' })
  }

  const items = (data.value ?? []).map(item => ({
    url: item.contentUrl,
    thumbnail: item.thumbnailUrl,
    title: item.name,
    width: item.width,
    height: item.height,
  }))

  res.json({ items })
})
