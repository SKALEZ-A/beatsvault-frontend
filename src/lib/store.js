// src/lib/store.js — Global state with Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Cart store (persisted to localStorage) ───────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ beatId, title, artworkUrl, license, price }]

      addItem: (beat, license) => {
        const price = {
          MP3: beat.priceMP3,
          WAV: beat.priceWAV,
          STEMS: beat.priceStems,
        }[license]

        const exists = get().items.find(
          i => i.beatId === beat.id && i.license === license
        )
        if (exists) return false // already in cart

        set(state => ({
          items: [
            ...state.items,
            {
              beatId: beat.id,
              title: beat.title,
              artworkUrl: beat.artworkUrl,
              license,
              price,
            },
          ],
        }))
        return true
      },

      removeItem: (beatId, license) =>
        set(state => ({
          items: state.items.filter(
            i => !(i.beatId === beatId && i.license === license)
          ),
        })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    { name: 'beatvault-cart' }
  )
)

// ── Audio player store (not persisted) ───────────────────
export const usePlayerStore = create(set => ({
  playingId: null,    // beat id currently playing
  progress: 0,        // 0-100
  currentTime: 0,     // seconds
  duration: 0,        // seconds
  audioEl: null,

  play: (beatId, previewUrl) => {
    // Stop existing
    const current = usePlayerStore.getState()
    if (current.audioEl) {
      current.audioEl.pause()
      current.audioEl.src = ''
    }

    const audio = new Audio(previewUrl)
    audio.preload = 'auto'

    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0
      set({ progress: pct, currentTime: audio.currentTime, duration: audio.duration })
    })

    audio.addEventListener('ended', () => {
      set({ playingId: null, progress: 0, currentTime: 0, audioEl: null })
    })

    audio.play().catch(e => console.warn('Autoplay blocked:', e))
    set({ playingId: beatId, audioEl: audio, progress: 0 })
  },

  pause: () => {
    const { audioEl } = usePlayerStore.getState()
    if (audioEl) audioEl.pause()
    set({ playingId: null })
  },

  toggle: (beatId, previewUrl) => {
    const { playingId, audioEl } = usePlayerStore.getState()
    if (playingId === beatId) {
      if (audioEl) audioEl.pause()
      set({ playingId: null })
    } else {
      usePlayerStore.getState().play(beatId, previewUrl)
    }
  },

  seek: (pct) => {
    const { audioEl } = usePlayerStore.getState()
    if (audioEl && audioEl.duration) {
      audioEl.currentTime = (pct / 100) * audioEl.duration
    }
  },
}))
