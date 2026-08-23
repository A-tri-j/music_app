import axios from 'axios'

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const baseURL = rawBaseURL.replace(/\/+$/, '')

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token')
    }
    return Promise.reject(error)
  }
)

export default api