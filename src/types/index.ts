export interface WeatherData {
  id: string
  utcDatetime: string
  localDatetime: string
  temperature: number
  humidity: number
  weatherDesc: string
  weatherDescEn: string
  windSpeed: number
  windDirection: string
  cloudCover: number
  visibility: string
  analysisDate: string
}

export interface Region {
  id: string
  code: string
  name: string
  province: string
  regency: string
  district: string
  village: string
  latitude?: number
  longitude?: number
}

export interface CurrentWeather {
  temperature: number
  humidity: number
  weatherDesc: string
  weatherDescEn: string
  windSpeed: number
  windDirection: string
  cloudCover: number
  visibility: string
  datetime: string
  localDatetime: string
}

export interface ForecastWeather extends CurrentWeather {
  // Additional forecast-specific fields can be added here if needed
  forecastTime?: string
}

export interface WeatherResponse {
  current?: CurrentWeather
  forecast?: ForecastWeather[]
  region: Region
}

export interface WeatherAlert {
  id: string
  title: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  region?: string
  startTime: string
  endTime?: string
  isActive: boolean
  createdAt: string
}

export interface UserFavorite {
  id: string
  regionId: string
  region: Region
  order: number
  createdAt: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: string
}

export interface SearchRegionResponse {
  regions: Region[]
  total: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

// Chart data types
export interface ChartDataPoint {
  time: string
  temperature: number
  humidity: number
  windSpeed: number
}

// Weather conditions - using const object instead of enum for better Vite compatibility
export const WeatherCondition = {
  SUNNY: 'cerah',
  CLOUDY: 'mendung',
  PARTLY_CLOUDY: 'berawan',
  RAINY: 'hujan',
  STORMY: 'petir',
  FOGGY: 'kabut',
  MIST: 'gerimis'
} as const

export type WeatherConditionType = typeof WeatherCondition[keyof typeof WeatherCondition]

// Theme types
export interface ThemeConfig {
  isDark: boolean
  primaryColor: string
  accentColor: string
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  error?: string | null
}