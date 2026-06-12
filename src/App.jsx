import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StorePage from './pages/StorePage.jsx'
import BeatPage from './pages/BeatPage.jsx'
import OrderConfirmPage from './pages/OrderConfirmPage.jsx'
import DownloadPage from './pages/DownloadPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import Layout from './components/Layout.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<StorePage />} />
          <Route path="/beat/:id" element={<BeatPage />} />
          <Route path="/order/confirm" element={<OrderConfirmPage />} />
          <Route path="/download/:token" element={<DownloadPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
