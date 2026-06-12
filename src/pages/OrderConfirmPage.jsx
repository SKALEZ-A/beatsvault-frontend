import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ordersApi } from '../lib/api.js'
import { useCartStore } from '../lib/store.js'

const fmt = n => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })

export default function OrderConfirmPage() {
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')
  const [status, setStatus] = useState('verifying') // verifying | success | failed
  const [order, setOrder] = useState(null)
  const [downloadToken, setDownloadToken] = useState(null)
  const { clearCart } = useCartStore()

  useEffect(() => {
    if (!ref) { setStatus('failed'); return }

    ordersApi.verify(ref)
      .then(data => {
        if (data.status === 'success') {
          setOrder(data.order)
          setDownloadToken(data.downloadToken)
          setStatus('success')
          clearCart()
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [ref])

  if (status === 'verifying') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
        <svg className="animate-spin w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-sm">Verifying your payment...</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-medium">Payment could not be verified</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          If you were charged, please contact us with your reference: <strong>{ref}</strong>
        </p>
        <Link to="/" className="btn-primary mt-2">Back to store</Link>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-md p-8 text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-medium mb-1">Payment confirmed!</h1>
        <p className="text-gray-400 text-sm mb-6">
          Your beat files are on their way to <strong>{order?.email}</strong>
        </p>

        {/* Order items */}
        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
          {order?.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.title}
                <span className="ml-1.5 text-xs bg-gray-200 text-gray-500 rounded px-1.5 py-0.5">{item.license}</span>
              </span>
              <span className="font-medium">{fmt(item.price)}</span>
            </div>
          ))}
          <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-1">
            <span>Total paid</span>
            <span>{fmt(order?.amountPaid)}</span>
          </div>
        </div>

        {/* Download button */}
        {downloadToken && (
          <Link
            to={`/download/${downloadToken}`}
            className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download your beats
          </Link>
        )}

        <p className="text-xs text-gray-400 mb-5">
          Download link also sent to your email · expires in 48 hours
        </p>

        <Link to="/" className="text-sm text-brand hover:underline">
          ← Back to store
        </Link>
      </div>
    </div>
  )
}
