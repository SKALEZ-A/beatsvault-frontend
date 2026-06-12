import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { downloadApi } from '../lib/api.js'

export default function DownloadPage() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState({})

  useEffect(() => {
    downloadApi.get(token)
      .then(setData)
      .catch(err => {
        setError(err.response?.data?.error || 'Invalid or expired download link.')
      })
      .finally(() => setLoading(false))
  }, [token])

  async function handleDownload(file) {
    setDownloading(d => ({ ...d, [file.filename]: true }))
    try {
      // Fetch the signed URL content and trigger browser download
      const response = await fetch(file.url)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed. Please try again or contact support.')
    } finally {
      setDownloading(d => ({ ...d, [file.filename]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
        <svg className="animate-spin w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-sm">Loading your files...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-center">Download unavailable</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">{error}</p>
        <a href="mailto:your@email.com" className="btn-primary mt-2">Contact Support</a>
      </div>
    )
  }

  const expiresAt = data?.expiresAt ? new Date(data.expiresAt) : null
  const timeLeft = expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / (1000 * 60 * 60))) : null

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <h1 className="text-2xl font-medium mb-1">Your downloads</h1>
          <p className="text-gray-400 text-sm">
            {data?.email && <>Purchased by <strong>{data.email}</strong></>}
            {timeLeft !== null && (
              <span className="ml-2 text-xs bg-yellow-50 text-yellow-600 border border-yellow-100 rounded px-2 py-0.5">
                Expires in ~{timeLeft}h
              </span>
            )}
          </p>
        </div>

        {/* File list */}
        <div className="space-y-3 mb-8">
          {data?.files?.map((file, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">
                  {file.license === 'STEMS' ? '🗂️' : file.license === 'WAV' ? '🎚️' : '🎵'}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.title}</p>
                <p className="text-xs text-gray-400">
                  {file.license} · {file.filename?.split('.').pop()?.toUpperCase()}
                  {file.error && <span className="text-red-400 ml-1">{file.error}</span>}
                </p>
              </div>

              {/* Download button */}
              {!file.error && (
                <button
                  onClick={() => handleDownload(file)}
                  disabled={downloading[file.filename]}
                  className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2 flex-shrink-0"
                >
                  {downloading[file.filename] ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Downloading
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 mb-6">
          <p className="font-medium mb-1">📌 Important</p>
          <ul className="text-xs space-y-1 text-blue-600 list-disc list-inside">
            <li>Download links expire 48 hours after purchase</li>
            <li>Check your email — the same link was sent there</li>
            <li>Save files to your computer/cloud backup immediately</li>
            <li>Contact support if any file fails to download</li>
          </ul>
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm text-brand hover:underline">
            ← Browse more beats
          </Link>
        </div>
      </div>
    </div>
  )
}
