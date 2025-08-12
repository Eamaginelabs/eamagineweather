import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`
}

export function getWeatherIcon(condition: string): string {
  const icons: Record<string, string> = {
    'cerah': '☀️',
    'berawan': '⛅',
    'hujan': '🌧️',
    'petir': '⛈️',
    'kabut': '🌫️',
    'mendung': '☁️',
    'gerimis': '🌦️',
    'salju': '❄️',
    'clear': '☀️',
    'cloudy': '☁️',
    'rain': '🌧️',
    'storm': '⛈️',
    'fog': '🌫️',
    'mist': '🌫️',
    'drizzle': '🌦️',
    'snow': '❄️',
  }
  
  const lowerCondition = condition.toLowerCase()
  for (const [key, icon] of Object.entries(icons)) {
    if (lowerCondition.includes(key)) {
      return icon
    }
  }
  
  return '🌤️' // default
}

export function getWeatherGradient(condition: string): string {
  const gradients: Record<string, string> = {
    'cerah': 'bg-weather-sunny',
    'berawan': 'bg-weather-cloudy',
    'hujan': 'bg-weather-rainy',
    'petir': 'bg-weather-rainy',
    'kabut': 'bg-weather-cloudy',
    'mendung': 'bg-weather-cloudy',
    'clear': 'bg-weather-sunny',
    'cloudy': 'bg-weather-cloudy',
    'rain': 'bg-weather-rainy',
    'storm': 'bg-weather-rainy',
  }
  
  const lowerCondition = condition.toLowerCase()
  for (const [key, gradient] of Object.entries(gradients)) {
    if (lowerCondition.includes(key)) {
      return gradient
    }
  }
  
  return 'bg-weather-cloudy'
}

export function getTimeBasedGradient(): string {
  const hour = new Date().getHours()
  
  if (hour >= 6 && hour < 12) {
    return 'bg-gradient-to-br from-orange-400 via-yellow-400 to-blue-400' // Morning
  } else if (hour >= 12 && hour < 18) {
    return 'bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600' // Afternoon
  } else if (hour >= 18 && hour < 21) {
    return 'bg-gradient-to-br from-orange-600 via-red-500 to-purple-600' // Evening
  } else {
    return 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' // Night
  }
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export function getWindDirection(direction: string): string {
  const directions: Record<string, string> = {
    'N': 'Utara',
    'NE': 'Timur Laut',
    'E': 'Timur',
    'SE': 'Tenggara',
    'S': 'Selatan',
    'SW': 'Barat Daya',
    'W': 'Barat',
    'NW': 'Barat Laut'
  }
  
  return directions[direction.toUpperCase()] || direction
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}