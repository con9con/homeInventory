import { useState, useRef } from 'react'

export default function ImageSearchModal({ getToken, onSelect, onCancel }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [fetching, setFetching] = useState(null) // index of image being fetched
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setError('')
    setResults([])
    try {
      const token = await getToken()
      const res = await fetch(`/api/search-images?q=${encodeURIComponent(query)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setResults(data.items)
      if (data.items.length === 0) setError('No images found — try a different search.')
    } catch (e) {
      setError(e.message)
    } finally {
      setSearching(false)
    }
  }

  async function handlePick(item, index) {
    setFetching(index)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch('/api/fetch-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ imageUrl: item.url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch image')
      onSelect(data.url)
    } catch (e) {
      setError(`Could not load that image — try another. (${e.message})`)
      setFetching(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/80 p-4">
      <div className="bg-white rounded-2xl shadow-xl flex flex-col w-full max-w-2xl mx-auto max-h-full overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Search web for image</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='e.g. "Sony WH-1000XM5 headphones"'
              autoFocus
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {searching ? 'Searching…' : 'Search'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <p className="text-sm text-red-500 text-center py-4">{error}</p>
          )}
          {!error && results.length === 0 && !searching && (
            <p className="text-sm text-gray-400 text-center py-8">
              Search for an image to add to this item.
            </p>
          )}
          {searching && (
            <p className="text-sm text-gray-400 text-center py-8">Searching…</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((item, i) => (
              <button
                key={i}
                onClick={() => handlePick(item, i)}
                disabled={fetching !== null}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-400 transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                title={item.title}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.opacity = '0.3' }}
                />
                {fetching === i && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-white text-xs">Loading…</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
