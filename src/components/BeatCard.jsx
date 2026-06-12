import React from 'react'
import { Link } from 'react-router-dom'
import { usePlayerStore } from '../lib/store.js'

const fmt = n => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })
const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function BeatCard({ beat }) {
  const { playingId, progress, currentTime, duration, toggle } = usePlayerStore()
  const isPlaying = playingId === beat.id

  function handlePlay(e) {
    e.preventDefault()
    e.stopPropagation()
    toggle(beat.id, beat.previewUrl)
  }

  return (
    <Link to={`/beat/${beat.id}`} className="card hover:border-gray-200 transition-all hover:-translate-y-0.5 group block">
      {/* Artwork */}
      <div className="relative aspect-square bg-gray-900 overflow-hidden">
        <img
          src={beat.artworkUrl}
          alt={beat.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          loading="lazy"
        />

        {/* Badges */}
        {beat.tag && (
          <span className="absolute top-2.5 left-2.5 bg-brand text-white text-[11px] font-medium px-2 py-0.5 rounded">
            {beat.tag}
          </span>
        )}
        <span className="absolute top-2.5 right-2.5 bg-black/50 text-white text-[11px] px-2 py-0.5 rounded">
          {beat.bpm} BPM
        </span>

        {/* Play overlay */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={handlePlay}
            className="w-12 h-12 rounded-full bg-brand flex items-center justify-center hover:bg-brand-dark transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1"/>
                <rect x="14" y="5" width="4" height="14" rx="1"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-medium text-sm mb-1 truncate">{beat.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{beat.genre}</span>
          <span className="text-sm font-medium">{fmt(beat.priceMP3)}</span>
        </div>

        {/* Mini player bar */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50" onClick={e => e.preventDefault()}>
          <button
            onClick={handlePlay}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand hover:text-brand transition-colors flex-shrink-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1"/>
                <rect x="14" y="5" width="4" height="14" rx="1"/>
              </svg>
            ) : (
              <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z"/>
              </svg>
            )}
          </button>

          <div className="progress-track flex-1">
            <div
              className="progress-fill"
              style={{ width: isPlaying ? `${progress}%` : '0%' }}
            />
          </div>

          <span className="text-[11px] text-gray-400 flex-shrink-0 tabular-nums">
            {isPlaying ? fmtTime(currentTime) : beat.duration}
          </span>
        </div>
      </div>
    </Link>
  )
}
