import type { Region, CurrentWeather, ForecastWeather } from '@/types'

// BMKG API Response Interface
interface BMKGWeatherData {
  utc_datetime: string
  local_datetime: string
  t: number // temperature
  hu: number // humidity
  weather_desc: string
  weather_desc_en: string
  ws: number // wind speed
  wd: string // wind direction
  tcc: number // cloud cover
  vs_text: string // visibility
  analysis_date: string
}

interface BMKGApiResponse {
  data: BMKGWeatherData[]
}

class BMKGApiService {
  private readonly baseUrl = 'https://api.bmkg.go.id/publik'
  private readonly cache = new Map<string, { data: BMKGApiResponse; timestamp: number }>()
  private readonly cacheExpiry = 30 * 60 * 1000 // 30 minutes

  // CORS proxy for development - you might need to set up your own proxy or backend
  private proxyUrl = 'https://cors-anywhere.herokuapp.com/'

  async fetchWeatherData(regionCode: string): Promise<BMKGApiResponse | null> {
    // Check cache first
    const cached = this.cache.get(regionCode)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }

    try {
      const url = `${this.proxyUrl}${this.baseUrl}/prakiraan-cuaca?adm4=${regionCode}`
      
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!response.ok) {
        console.warn(`BMKG API error for region ${regionCode}: ${response.status}`)
        return null
      }

      const data: BMKGApiResponse = await response.json()
      
      // Cache the response
      this.cache.set(regionCode, {
        data,
        timestamp: Date.now()
      })

      return data
    } catch (error) {
      console.error('Error fetching BMKG data:', error)
      return null
    }
  }

  async getCurrentWeather(region: Region): Promise<CurrentWeather | null> {
    const data = await this.fetchWeatherData(region.code)
    
    if (!data || !data.data || data.data.length === 0) {
      return null
    }

    // Get the most recent data point (first in array)
    const current = data.data[0]
    
    return {
      temperature: current.t,
      humidity: current.hu,
      weatherDesc: current.weather_desc,
      weatherDescEn: current.weather_desc_en,
      windSpeed: current.ws,
      windDirection: current.wd,
      cloudCover: current.tcc,
      visibility: current.vs_text,
      datetime: current.utc_datetime,
      localDatetime: current.local_datetime
    }
  }

  async getWeatherForecast(region: Region): Promise<ForecastWeather[]> {
    const data = await this.fetchWeatherData(region.code)
    
    if (!data || !data.data || data.data.length === 0) {
      return []
    }

    return data.data.map(item => ({
      temperature: item.t,
      humidity: item.hu,
      weatherDesc: item.weather_desc,
      weatherDescEn: item.weather_desc_en,
      windSpeed: item.ws,
      windDirection: item.wd,
      cloudCover: item.tcc,
      visibility: item.vs_text,
      datetime: item.utc_datetime,
      localDatetime: item.local_datetime
    }))
  }

  // Fallback to mock data if API fails
  generateFallbackWeather(region: Region): CurrentWeather {
    const conditions = ['cerah', 'berawan sebagian', 'berawan', 'mendung', 'hujan ringan']
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    
    // Base temperature on latitude (cooler in north/south)
    const baseTemp = region.latitude! > 0 ? 26 : region.latitude! < -7 ? 22 : 28
    
    return {
      temperature: baseTemp + (Math.random() * 8 - 4),
      humidity: 60 + Math.floor(Math.random() * 35),
      weatherDesc: condition,
      weatherDescEn: condition,
      windSpeed: 5 + Math.floor(Math.random() * 20),
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      cloudCover: Math.floor(Math.random() * 100),
      visibility: ['5 km', '8 km', '10 km', '15 km', '20 km'][Math.floor(Math.random() * 5)],
      datetime: new Date().toISOString(),
      localDatetime: new Date().toISOString()
    }
  }

  // Batch fetch multiple regions with rate limiting
  async batchFetchWeather(regions: Region[], delayMs = 1000): Promise<Map<string, CurrentWeather>> {
    const results = new Map<string, CurrentWeather>()
    
    for (const region of regions) {
      try {
        const weather = await this.getCurrentWeather(region)
        
        if (weather) {
          results.set(region.id, weather)
        } else {
          // Fallback to mock data
          results.set(region.id, this.generateFallbackWeather(region))
        }
        
        // Add delay to respect rate limits (60 requests per minute)
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      } catch {
        console.warn(`Failed to fetch weather for ${region.name}, using fallback`)
        results.set(region.id, this.generateFallbackWeather(region))
      }
    }
    
    return results
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}

export const bmkgApiService = new BMKGApiService()
export default bmkgApiService