import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { beatsApi } from '../lib/api.js'
import { usePlayerStore, useCartStore } from '../lib/store.js'
import CheckoutModal from '../components/CheckoutModal.jsx'

const fmt = n => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })
const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

const LICENSES = [
  { key: 'MP3', label: 'MP3', desc: 'MP3 lease — standard quality' },
  { key: 'WAV', label: 'WAV', desc: 'WAV lease — studio quality' },
  { key: 'STEMS', label: 'Beat Files', desc: 'Trackout stems ZIP — full production' },
]

export default function BeatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [beat, setBeat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [license, setLicense] = useState('MP3')
  const [showCheckout, setShowCheckout] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const { playingId, progress, currentTime, duration, toggle, seek } = usePlayerStore()
  const { addItem } = useCartStore()
  const isPlaying = beat && playingId === beat.id

  useEffect(() => {
    setLoading(true)
    beatsApi.get(id)
      .then(setBeat)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-48 mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-gray-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-2/3" />
            <div className="h-6 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!beat) return null

  const priceMap = { MP3: beat.priceMP3, WAV: beat.priceWAV, STEMS: beat.priceStems }
  const currentPrice = priceMap[license]

  function handleProgressClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    seek(pct)
  }

  function handleAddToCart() {
    const added = addItem(beat, license)
    if (added) {
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <button onClick={() => navigate(`/?genre=${beat.genre}`)} className="hover:text-gray-700 transition-colors">
          {beat.genre}
        </button>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-700">{beat.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Left: Artwork */}
        <div className="relative rounded-2xl overflow-hidden aspect-square bg-gray-900">
          <img
            src={beat.artworkUrl}
            alt={beat.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-5 left-0 right-0 text-center">
            <p className="text-white text-2xl font-medium tracking-wide drop-shadow">
              {beat.title.toLowerCase()}
            </p>
            <p className="text-white/40 text-xs tracking-[3px] uppercase mt-1">
              {import.meta.env.VITE_STORE_NAME || 'BeatVault'}
            </p>
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-5">
          {/* Title + tags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">{beat.genre}</span>
              {beat.tag && (
                <span className="text-xs bg-brand text-white px-2.5 py-0.5 rounded-full">{beat.tag}</span>
              )}
            </div>
            <h1 className="text-3xl font-medium tracking-tight">{beat.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span>🎵 {beat.bpm} BPM</span>
              <span>🎹 {beat.key}</span>
              <span>⏱ {beat.duration}</span>
            </div>
          </div>

          {/* Price */}
          <p className="text-3xl font-medium">{fmt(currentPrice)}</p>

          {/* Audio player */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => toggle(beat.id, beat.previewUrl)}
              className="w-9 h-9 rounded-full bg-brand flex items-center justify-center hover:bg-brand-dark transition-colors flex-shrink-0"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="5" width="4" height="14" rx="1"/>
                  <rect x="14" y="5" width="4" height="14" rx="1"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5.14v14l11-7-11-7z"/>
                </svg>
              )}
            </button>

            <span className="text-xs text-gray-400 tabular-nums w-10 text-center">
              {isPlaying ? fmtTime(currentTime) : '0:00'}
            </span>

            <div
              className="progress-track flex-1"
              onClick={handleProgressClick}
            >
              <div
                className="progress-fill"
                style={{ width: isPlaying ? `${progress}%` : '0%' }}
              />
            </div>

            <span className="text-xs text-gray-400 tabular-nums w-10 text-center">
              {beat.duration}
            </span>

            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>

          <p className="text-xs text-gray-400 -mt-2">
            🔒 Preview only — full download unlocked after purchase
          </p>

          {/* License selector */}
          <div>
            <label className="label">License: {LICENSES.find(l => l.key === license)?.label}</label>
            <div className="flex gap-2">
              {LICENSES.map(lic => {
                const licPrice = priceMap[lic.key]
                if (!licPrice && lic.key !== 'MP3') return null
                return (
                  <button
                    key={lic.key}
                    onClick={() => setLicense(lic.key)}
                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                      license === lic.key
                        ? 'border-brand text-brand bg-blue-50'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {lic.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {LICENSES.find(l => l.key === license)?.desc}
            </p>
          </div>

          {/* Payment logos */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Pay with</p>
            <div className="flex flex-wrap gap-2">
              {['💳 Paystack', 'OPay', 'Verve', 'Mastercard', 'Visa', 'Apple Pay'].map(p => (
                <span key={p} className="text-xs border border-gray-200 rounded px-2.5 py-1 text-gray-500">{p}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              ✅ Safe & easy payment — get your beats instantly
            </p>
          </div>

          {/* CTA buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleAddToCart}
              className="btn-secondary w-full"
            >
              {addedToCart ? '✓ Added to cart' : 'Add to cart'}
            </button>
            <button
              onClick={() => setShowCheckout(true)}
              className="btn-primary w-full"
            >
              Buy it now — {fmt(currentPrice)}
            </button>
          </div>

          {/* About */}
          {beat.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">About this beat</p>
              <p className="text-sm text-gray-600 leading-relaxed">{beat.description}</p>
              {beat.moods?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {beat.moods.map(m => (
                    <span key={m} className="text-xs bg-white border border-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">{m}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          beat={beat}
          license={license}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  )
}
