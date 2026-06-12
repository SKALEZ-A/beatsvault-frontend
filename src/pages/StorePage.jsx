import React, { useEffect, useState } from 'react'
import { beatsApi } from '../lib/api.js'
import BeatCard from '../components/BeatCard.jsx'

export default function StorePage() {
  const [beats, setBeats] = useState([])
  const [genres, setGenres] = useState(['All'])
  const [activeGenre, setActiveGenre] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    beatsApi.genres().then(setGenres).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (activeGenre !== 'All') params.genre = activeGenre
    if (search.trim()) params.search = search.trim()

    beatsApi.list(params)
      .then(setBeats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeGenre, search])

  return (
    <div>
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-14 text-center px-4">
        <h1 className="text-4xl font-medium tracking-tight mb-2">Premium Beats</h1>
        <p className="text-gray-400 text-base">
          Afrobeats · R&B · Drill · Gospel — Preview free, download after purchase
        </p>

        {/* Search */}
        <div className="relative max-w-sm mx-auto mt-6">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
          <input
            type="search"
            placeholder="Search beats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
      </div>

      {/* Genre tabs */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto pb-0 py-3 scrollbar-hide">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                activeGenre === g
                  ? 'bg-brand text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Beat grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : beats.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No beats found</p>
            <p className="text-sm">Try a different genre or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {beats.map(beat => (
              <BeatCard key={beat.id} beat={beat} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
