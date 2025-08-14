import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  setToken: (token) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },
}

export const studentsAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
}

export const sessionsAPI = {
  getAll: () => api.get('/sessions'),
  getByStudentId: (studentId) => api.get(`/sessions/students/${studentId}`),
  create: (data) => api.post('/sessions', data),
}

export const metricsAPI = {
  getDashboard: () => api.get('/metrics/dashboard'),
}

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
}

export default api
