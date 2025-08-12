import { useState, useMemo, useEffect } from 'react'
import { WeatherCard } from './WeatherCard'
import { indonesianCities } from '../data/indonesianCities'
import type { Region, WeatherResponse, CurrentWeather } from '@/types'
import bmkgApiService from '../services/bmkgApi'

interface WeatherGridProps {
  onCitySelect?: (cityWeather: WeatherResponse) => void
  className?: string
}

const provinces = [
  'Semua Provinsi', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 
  'Bali', 'Sumatera Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Riau',
  'Lampung', 'Kalimantan Timur', 'Kalimantan Selatan', 'Sulawesi Selatan', 
  'Sulawesi Utara', 'Papua'
]

interface CityWeatherData {
  city: Region
  weather: CurrentWeather | null
  isLoading: boolean
  error?: string
}

export function WeatherGrid({ onCitySelect, className }: WeatherGridProps) {
  const [selectedProvince, setSelectedProvince] = useState('Semua Provinsi')
  const [isVisible, setIsVisible] = useState(true)
  const [citiesWeatherData, setCitiesWeatherData] = useState<CityWeatherData[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  // Initialize cities with loading state
  useEffect(() => {
    const initialData: CityWeatherData[] = indonesianCities.map(city => ({
      city,
      weather: null,
      isLoading: true
    }))
    setCitiesWeatherData(initialData)
  }, [])

  // Fetch real weather data from BMKG API
  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsInitialLoading(true)
      
      try {
        console.log('🌤️ Fetching real weather data from BMKG API...')
        
        // Batch fetch with rate limiting (60 requests per minute = 1 per second)
        const weatherResults = await bmkgApiService.batchFetchWeather(indonesianCities, 1100)
        
        // Update state with real data
        setCitiesWeatherData(prev => 
          prev.map(item => ({
            ...item,
            weather: weatherResults.get(item.city.id) || bmkgApiService.generateFallbackWeather(item.city),
            isLoading: false
          }))
        )
        
        console.log('✅ Weather data loaded successfully!')
        
      } catch (error) {
        console.error('❌ Error fetching weather data:', error)
        
        // Use fallback data on error
        setCitiesWeatherData(prev => 
          prev.map(item => ({
            ...item,
            weather: bmkgApiService.generateFallbackWeather(item.city),
            isLoading: false,
            error: 'Using fallback data'
          }))
        )
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchWeatherData()
  }, [retryCount])

  // Filter cities by province
  const filteredCities = useMemo(() => {
    if (selectedProvince === 'Semua Provinsi') {
      return citiesWeatherData
    }
    return citiesWeatherData.filter(item => item.city.province === selectedProvince)
  }, [selectedProvince, citiesWeatherData])

  const handleCityClick = (cityData: CityWeatherData) => {
    if (!cityData.weather) return
    
    const weatherResponse: WeatherResponse = {
      current: cityData.weather,
      forecast: [],
      region: cityData.city
    }
    
    if (onCitySelect) {
      onCitySelect(weatherResponse)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRefresh = () => {
    setRetryCount(prev => prev + 1)
    bmkgApiService.clearCache()
  }

  const loadedCitiesCount = citiesWeatherData.filter(c => c.weather && !c.isLoading).length
  const hasErrors = citiesWeatherData.some(c => c.error)

  return (
    <div className={`animate-fade-in ${className}`}>
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl animate-bounce-gentle">
          🌍 Cuaca Indonesia Real-time dari BMKG
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto drop-shadow-lg">
          Data cuaca terkini langsung dari server BMKG untuk seluruh Indonesia
        </p>
        
        {/* Loading Status */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
          {isInitialLoading && (
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 text-white flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Memuat data real-time...
            </div>
          )}
          
          <div className="bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
            📡 {loadedCitiesCount}/{indonesianCities.length} kota dimuat
          </div>
          
          {hasErrors && (
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              Beberapa menggunakan data cadangan
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            className="bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm rounded-full px-4 py-2 text-white transition-colors duration-200 hover:scale-105"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Province Filter */}
      <div className="mb-8 flex flex-wrap gap-3 justify-center">
        {provinces.map((province) => (
          <button
            key={province}
            onClick={() => setSelectedProvince(province)}
            className={`px-6 py-3 rounded-full backdrop-blur-md border transition-all duration-300 font-medium hover:scale-105 active:scale-95 ${
              selectedProvince === province
                ? 'bg-white/30 border-white/50 text-white shadow-lg scale-105 ring-2 ring-white/30'
                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:border-white/30'
            }`}
          >
            {province}
          </button>
        ))}
      </div>

      {/* Toggle Visibility Button */}
      <div className="text-center mb-6">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          {isVisible ? '🙈 Sembunyikan Grid' : '👀 Tampilkan Grid'} ({filteredCities.length} kota)
        </button>
      </div>

      {/* Weather Cards Grid */}
      {isVisible && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-in">
          {filteredCities.map((cityData, index) => (
            <div
              key={cityData.city.id}
              className="cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 group"
              onClick={() => handleCityClick(cityData)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative">
                {/* Loading overlay */}
                {cityData.isLoading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                      <div className="text-white text-sm">Loading...</div>
                    </div>
                  </div>
                )}

                {/* Glowing effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                
                {cityData.weather && (
                  <WeatherCard
                    weather={cityData.weather}
                    region={cityData.city}
                    className="relative"
                  />
                )}
                
                {/* Status indicators */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {/* Real data indicator */}
                  {cityData.weather && !cityData.error && (
                    <div className="bg-green-500/80 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium">
                      📡 BMKG
                    </div>
                  )}
                  
                  {/* Fallback data indicator */}
                  {cityData.error && (
                    <div className="bg-orange-500/80 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium">
                      🔄 Backup
                    </div>
                  )}
                </div>

                {/* Click indicator */}
                <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  🔍 Klik untuk detail
                </div>

                {/* Province badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium">
                  {cityData.city.province}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {isVisible && filteredCities.length > 0 && !isInitialLoading && (
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-300">
            <div className="text-3xl mb-2 animate-bounce">🌡️</div>
            <div className="text-white font-bold text-2xl">
              {Math.round(filteredCities
                .filter(c => c.weather)
                .reduce((acc, city) => acc + city.weather!.temperature, 0) / 
                filteredCities.filter(c => c.weather).length) || 0}°C
            </div>
            <div className="text-white/70 text-sm">Suhu Rata-rata</div>
          </div>
          
          <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-300">
            <div className="text-3xl mb-2 animate-pulse">💧</div>
            <div className="text-white font-bold text-2xl">
              {Math.round(filteredCities
                .filter(c => c.weather)
                .reduce((acc, city) => acc + city.weather!.humidity, 0) / 
                filteredCities.filter(c => c.weather).length) || 0}%
            </div>
            <div className="text-white/70 text-sm">Kelembapan Rata-rata</div>
          </div>
          
          <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-300">
            <div className="text-3xl mb-2 animate-bounce">💨</div>
            <div className="text-white font-bold text-2xl">
              {Math.round(filteredCities
                .filter(c => c.weather)
                .reduce((acc, city) => acc + city.weather!.windSpeed, 0) / 
                filteredCities.filter(c => c.weather).length) || 0}
            </div>
            <div className="text-white/70 text-sm">Angin (km/h)</div>
          </div>
          
          <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-300">
            <div className="text-3xl mb-2 animate-pulse">🏙️</div>
            <div className="text-white font-bold text-2xl">{filteredCities.length}</div>
            <div className="text-white/70 text-sm">Kota Tersedia</div>
          </div>
        </div>
      )}

      {/* Weather Summary by Province */}
      {isVisible && selectedProvince !== 'Semua Provinsi' && filteredCities.some(c => c.weather) && (
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            📊 Ringkasan Cuaca {selectedProvince}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">🌡️ Rentang Suhu</h4>
              <div className="text-white/80">
                {(() => {
                  const temps = filteredCities.filter(c => c.weather).map(c => c.weather!.temperature)
                  if (temps.length === 0) return 'Data tidak tersedia'
                  return `Minimum: ${Math.round(Math.min(...temps))}°C | Maksimum: ${Math.round(Math.max(...temps))}°C`
                })()}
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">🌦️ Kondisi Dominan</h4>
              <div className="text-white/80">
                {(() => {
                  const conditions = filteredCities.filter(c => c.weather).map(c => c.weather!.weatherDesc)
                  if (conditions.length === 0) return 'Data tidak tersedia'
                  
                  const mostCommon = conditions.reduce((a, b, _, arr) =>
                    arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
                  )
                  return mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1)
                })()}
              </div>
            </div>
          </div>
          
          {/* Data source info */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <div className="text-white/60 text-sm">
              📡 Data langsung dari server BMKG • Update terakhir: {new Date().toLocaleTimeString('id-ID')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}