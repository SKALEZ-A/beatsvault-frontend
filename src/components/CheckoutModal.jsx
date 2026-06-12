import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersApi } from '../lib/api.js'
import { useCartStore } from '../lib/store.js'

const fmt = n => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })

export default function CheckoutModal({ beat, license, onClose }) {
  const navigate = useNavigate()
  const { items: cartItems, total: cartTotal, clearCart } = useCartStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Determine if this is a single beat or cart checkout
  const isSingleBeat = !!beat
  const orderItems = isSingleBeat
    ? [{ beatId: beat.id, license }]
    : cartItems.map(i => ({ beatId: i.beatId, license: i.license }))

  const displayItems = isSingleBeat
    ? [{ title: beat.title, license, price: { MP3: beat.priceMP3, WAV: beat.priceWAV, STEMS: beat.priceStems }[license] }]
    : cartItems.map(i => ({ title: i.title, license: i.license, price: i.price }))

  const orderTotal = displayItems.reduce((s, i) => s + i.price, 0)

  async function handlePay() {
    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and email.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const { authorizationUrl, reference, accessCode } = await ordersApi.initialize({
        email: email.trim(),
        name: name.trim(),
        items: orderItems,
      })

      // Use Paystack inline popup
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
      if (paystackKey && window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: email.trim(),
          amount: orderTotal * 100, // kobo
          ref: reference,
          access_code: accessCode,
          currency: 'NGN',
          onClose: () => setLoading(false),
          callback: (response) => {
            if (isSingleBeat) onClose()
            else clearCart()
            navigate(`/order/confirm?ref=${response.reference}`)
          },
        })
        handler.openIframe()
      } else {
        // Fallback: redirect to Paystack page
        window.location.href = authorizationUrl
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-medium text-lg">Complete your order</h2>
            <p className="text-sm text-gray-400">Beat files sent to your email instantly</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Order summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            {displayItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-500">
                <span>{item.title} <span className="text-xs bg-gray-200 text-gray-500 rounded px-1.5 py-0.5 ml-1">{item.license}</span></span>
                <span>{fmt(item.price)}</span>
              </div>
            ))}
            <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>{fmt(orderTotal)}</span>
            </div>
          </div>

          {/* Form */}
          <div>
            <label className="label">Full name</label>
            <input
              type="text"
              className="input"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email — files delivered here</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Pay {fmt(orderTotal)} securely
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Powered by Paystack · SSL encrypted · Instant delivery
          </p>
        </div>
      </div>
    </div>
  )
}
