import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../lib/store.js'

const fmt = n => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })

export default function CartSidebar({ open, onClose }) {
  const { items, removeItem, total } = useCartStore()
  const navigate = useNavigate()

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-100 z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="font-medium">Cart ({items.length})</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <img
                src={item.artworkUrl}
                alt={item.title}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-gray-400">{item.license} License</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-medium">{fmt(item.price)}</span>
                <button
                  onClick={() => removeItem(item.beatId, item.license)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{fmt(total())}</span>
          </div>
          <button
            onClick={() => { onClose(); navigate('/beat/' + items[0].beatId + '?checkout=cart') }}
            className="btn-primary w-full text-center"
          >
            Checkout — {fmt(total())}
          </button>
        </div>
      )}
    </div>
  )
}
