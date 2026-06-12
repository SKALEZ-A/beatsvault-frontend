import React, { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../lib/store.js'
import CartSidebar from './CartSidebar.jsx'

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false)
  const items = useCartStore(s => s.items)
  const storeName = import.meta.env.VITE_STORE_NAME || 'BeatVault'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-medium tracking-tight">
            🎵 {storeName}
          </Link>

          <div className="hidden md:flex gap-8 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors">Beats</Link>
            <a href="mailto:your@email.com" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            aria-label="Open cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Page content */}
      <Outlet />

      {/* Cart sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setCartOpen(false)}
        />
      )}
    </div>
  )
}
