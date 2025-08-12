import axios from 'axios'
import type { WeatherResponse, Region, SearchRegionResponse, UserFavorite } from '@/types'

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      // Redirect to login if needed
    }
    return Promise.reject(error)
  }
)

// Weather API functions
export const weatherAPI = {
  // Get current weather for a region
  getCurrentWeather: async (regionCode: string): Promise<WeatherResponse> => {
    const response = await api.get(`/weather/current/${regionCode}`)
    return response.data.data
  },

  // Get weather forecast for a region
  getWeatherForecast: async (regionCode: string): Promise<WeatherResponse> => {
    const response = await api.get(`/weather/forecast/${regionCode}`)
    return response.data.data
  },

  // Search regions
  searchRegions: async (query: string): Promise<SearchRegionResponse> => {
    const response = await api.get(`/weather/search`, {
      params: { q: query }
    })
    return response.data.data
  },

  // Sync weather data (trigger manual update)
  syncWeatherData: async (regionCode: string): Promise<void> => {
    await api.post(`/weather/sync/${regionCode}`)
  }
}

// Region API functions
export const regionAPI = {
  // Get all regions with pagination
  getRegions: async (page = 1, limit = 20): Promise<{ regions: Region[]; total: number }> => {
    const response = await api.get(`/regions`, {
      params: { page, limit }
    })
    return response.data.data
  },

  // Get region by code
  getRegionByCode: async (code: string): Promise<Region> => {
    const response = await api.get(`/regions/${code}`)
    return response.data.data
  },

  // Get popular regions
  getPopularRegions: async (): Promise<Region[]> => {
    const response = await api.get(`/regions/popular`)
    return response.data.data
  }
}

// User API functions (requires authentication)
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get(`/users/profile`)
    return response.data.data
  },

  // Update user profile
  updateProfile: async (data: { name?: string; avatar?: string }) => {
    const response = await api.put(`/users/profile`, data)
    return response.data.data
  },

  // Get user favorites
  getFavorites: async (): Promise<UserFavorite[]> => {
    const response = await api.get(`/users/favorites`)
    return response.data.data
  },

  // Add favorite region
  addFavorite: async (regionId: string): Promise<UserFavorite> => {
    const response = await api.post(`/users/favorites`, { regionId })
    return response.data.data
  },

  // Remove favorite region
  removeFavorite: async (regionId: string): Promise<void> => {
    await api.delete(`/users/favorites/${regionId}`)
  }
}

// Utility function for handling API errors
export const handleAPIError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    // Server responded with error status
    return axiosError.response?.data?.message || 'Terjadi kesalahan pada server'
  } else if (error && typeof error === 'object' && 'request' in error) {
    // Request was made but no response received
    return 'Tidak dapat terhubung ke server'
  } else {
    // Something else happened
    const message = error && typeof error === 'object' && 'message' in error 
      ? (error as { message: string }).message 
      : 'Terjadi kesalahan yang tidak diketahui'
    return message
  }
}

export default api