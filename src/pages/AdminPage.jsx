import React, { useState, useEffect } from 'react'
import { adminApi } from '../lib/api.js'

const fmt = n => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState('beats') // beats | upload | orders
  const [beats, setBeats] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  // Upload form state
  const [form, setForm] = useState({
    title: '', genre: '', bpm: '', key: '', duration: '',
    description: '', moods: '', priceMP3: '', priceWAV: '', priceStems: '',
    tag: '', published: 'true', featured: 'false',
  })
  const [files, setFiles] = useState({
    artwork: null, preview: null, fullMP3: null, fullWAV: null, stems: null,
  })
  const [uploading, setUploading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    try {
      await adminApi.getBeats(secret)
      setAuthed(true)
      loadBeats()
    } catch {
      setMsg({ type: 'error', text: 'Invalid admin secret.' })
    }
  }

  async function loadBeats() {
    setLoading(true)
    try {
      const data = await adminApi.getBeats(secret)
      setBeats(data)
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to load beats.' })
    } finally {
      setLoading(false)
    }
  }

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await adminApi.getOrders(secret)
      setOrders(data)
    } catch {
      setMsg({ type: 'error', text: 'Failed to load orders.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authed) return
    if (tab === 'beats') loadBeats()
    if (tab === 'orders') loadOrders()
  }, [tab, authed])

  async function handleUpload(e) {
    e.preventDefault()
    if (!files.preview || !files.fullMP3) {
      setMsg({ type: 'error', text: 'Preview MP3 and Full MP3 are required.' })
      return
    }
    setUploading(true)
    setMsg({ type: '', text: '' })
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
      Object.entries(files).forEach(([k, v]) => v && fd.append(k, v))
      await adminApi.uploadBeat(fd, secret)
      setMsg({ type: 'success', text: 'Beat uploaded successfully!' })
      setForm({
        title: '', genre: '', bpm: '', key: '', duration: '',
        description: '', moods: '', priceMP3: '', priceWAV: '', priceStems: '',
        tag: '', published: 'true', featured: 'false',
      })
      setFiles({ artwork: null, preview: null, fullMP3: null, fullWAV: null, stems: null })
      setTab('beats')
      loadBeats()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  async function togglePublish(beat) {
    try {
      await adminApi.updateBeat(beat.id, { published: !beat.published }, secret)
      loadBeats()
    } catch {
      setMsg({ type: 'error', text: 'Failed to update beat.' })
    }
  }

  async function deleteBeat(id) {
    if (!confirm('Unpublish this beat?')) return
    try {
      await adminApi.deleteBeat(id, secret)
      loadBeats()
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete beat.' })
    }
  }

  // ── Login screen ──────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-sm p-8">
          <h1 className="text-xl font-medium mb-1">Admin panel</h1>
          <p className="text-sm text-gray-400 mb-6">Enter your admin secret to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Admin secret</label>
              <input
                type="password"
                className="input"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
              />
            </div>
            {msg.text && <p className="text-sm text-red-500">{msg.text}</p>}
            <button type="submit" className="btn-primary w-full">Sign in</button>
          </form>
        </div>
      </div>
    )
  }

  // ── Admin dashboard ───────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium">Admin panel</h1>
        <button onClick={() => setAuthed(false)} className="text-sm text-gray-400 hover:text-gray-700">
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {['beats', 'upload', 'orders'].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setMsg({ type: '', text: '' }) }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Toast */}
      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
          msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
        }`}>
          {msg.text}
        </div>
      )}

      {/* ── BEATS TAB ────────────────────────── */}
      {tab === 'beats' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-gray-700">All beats ({beats.length})</h2>
            <button onClick={() => setTab('upload')} className="btn-primary text-sm px-4 py-2">
              + Upload beat
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {beats.map(beat => (
                <div key={beat.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                  <img src={beat.artworkUrl} alt={beat.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{beat.title}</p>
                    <p className="text-xs text-gray-400">{beat.genre} · {beat.bpm} BPM · {fmt(beat.priceMP3)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    beat.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {beat.published ? 'Live' : 'Draft'}
                  </span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => togglePublish(beat)}
                      className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      {beat.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => deleteBeat(beat.id)}
                      className="text-xs border border-red-100 text-red-400 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── UPLOAD TAB ───────────────────────── */}
      {tab === 'upload' && (
        <form onSubmit={handleUpload} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="font-medium text-gray-700 mb-2">Upload new beat</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="My Love" required />
            </div>
            <div>
              <label className="label">Genre *</label>
              <input className="input" value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} placeholder="Afrobeats" list="genre-list" required />
              <datalist id="genre-list">
                {['Afrobeats', 'Afropop', 'R&B', 'Drill', 'Trap', 'Gospel', 'Amapiano'].map(g => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label">BPM *</label>
              <input className="input" type="number" value={form.bpm} onChange={e => setForm(f => ({ ...f, bpm: e.target.value }))} placeholder="98" required />
            </div>
            <div>
              <label className="label">Key *</label>
              <input className="input" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} placeholder="C# min" required />
            </div>
            <div>
              <label className="label">Duration</label>
              <input className="input" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="2:47" />
            </div>
            <div>
              <label className="label">Tag</label>
              <input className="input" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="New, Hot (optional)" />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the vibe..." />
          </div>

          <div>
            <label className="label">Moods (comma-separated)</label>
            <input className="input" value={form.moods} onChange={e => setForm(f => ({ ...f, moods: e.target.value }))} placeholder="Romantic, Chill, Late Night" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Price MP3 (₦) *</label>
              <input className="input" type="number" value={form.priceMP3} onChange={e => setForm(f => ({ ...f, priceMP3: e.target.value }))} placeholder="34500" required />
            </div>
            <div>
              <label className="label">Price WAV (₦)</label>
              <input className="input" type="number" value={form.priceWAV} onChange={e => setForm(f => ({ ...f, priceWAV: e.target.value }))} placeholder="39500" />
            </div>
            <div>
              <label className="label">Price Stems (₦)</label>
              <input className="input" type="number" value={form.priceStems} onChange={e => setForm(f => ({ ...f, priceStems: e.target.value }))} placeholder="49500" />
            </div>
          </div>

          {/* File uploads */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-600 mb-3">Files</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'artwork', label: 'Artwork (JPG/PNG)', accept: 'image/*', required: false },
                { key: 'preview', label: 'Preview MP3 (60s watermarked) *', accept: '.mp3,audio/mpeg', required: true },
                { key: 'fullMP3', label: 'Full MP3 *', accept: '.mp3,audio/mpeg', required: true },
                { key: 'fullWAV', label: 'Full WAV', accept: '.wav,audio/wav', required: false },
                { key: 'stems', label: 'Stems ZIP', accept: '.zip,application/zip', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input
                    type="file"
                    accept={f.accept}
                    required={f.required}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    onChange={e => setFiles(prev => ({ ...prev, [f.key]: e.target.files[0] || null }))}
                  />
                  {files[f.key] && (
                    <p className="text-xs text-green-600 mt-1">✓ {files[f.key].name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={form.published === 'true'}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked ? 'true' : 'false' }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="published" className="text-sm text-gray-600">Publish immediately</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured === 'true'}
                onChange={e => setForm(f => ({ ...f, featured: e.target.checked ? 'true' : 'false' }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="featured" className="text-sm text-gray-600">Featured beat</label>
            </div>
          </div>

          <button type="submit" disabled={uploading} className="btn-primary w-full flex items-center justify-center gap-2">
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Uploading to Supabase...
              </>
            ) : 'Upload beat'}
          </button>
        </form>
      )}

      {/* ── ORDERS TAB ───────────────────────── */}
      {tab === 'orders' && (
        <div>
          <h2 className="font-medium text-gray-700 mb-4">Recent orders ({orders.length})</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{order.name}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{fmt(order.amountPaid)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.paystackStatus === 'success'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {order.paystackStatus}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {order.items?.map(i => `${i.beat?.title} (${i.license})`).join(', ')}
                    {' · '}
                    {new Date(order.createdAt).toLocaleString('en-NG')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
