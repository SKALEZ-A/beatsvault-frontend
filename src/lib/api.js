// src/lib/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 15000,
})

export const beatsApi = {
  list: (params = {}) => api.get('/beats', { params }).then(r => r.data),
  genres: () => api.get('/beats/genres').then(r => r.data),
  get: (id) => api.get(`/beats/${id}`).then(r => r.data),
}

export const ordersApi = {
  initialize: (data) => api.post('/orders/initialize', data).then(r => r.data),
  verify: (reference) => api.get(`/orders/verify/${reference}`).then(r => r.data),
}

export const downloadApi = {
  get: (token) => api.get(`/download/${token}`).then(r => r.data),
}

export const adminApi = {
  getBeats: (secret) =>
    api.get('/admin/beats', { headers: { 'x-admin-secret': secret } }).then(r => r.data),
  uploadBeat: (formData, secret) =>
    api.post('/admin/beats', formData, {
      headers: { 'x-admin-secret': secret, 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  updateBeat: (id, data, secret) =>
    api.patch(`/admin/beats/${id}`, data, {
      headers: { 'x-admin-secret': secret },
    }).then(r => r.data),
  deleteBeat: (id, secret) =>
    api.delete(`/admin/beats/${id}`, { headers: { 'x-admin-secret': secret } }).then(r => r.data),
  getOrders: (secret) =>
    api.get('/admin/orders', { headers: { 'x-admin-secret': secret } }).then(r => r.data),
}

export default api
