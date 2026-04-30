import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (userId) =>
  api.post('/login', { userId })

export const searchOffers = (from, to, limit = 10, q) =>
  api.get('/offers', { params: { from, to, limit, ...(q ? { q } : {}) } })

export const getOffer = (id) =>
  api.get(`/offers/${id}`)

export const getReco = (city, k = 3) =>
  api.get('/reco', { params: { city, k } })

export const getTopDestinations = () =>
  api.get('/stats/top-destinations')
