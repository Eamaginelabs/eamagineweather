import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchBar } from './components/SearchBar'
import { WeatherCard } from './components/WeatherCard'
import DatabaseWeatherGrid from './components/DatabaseWeatherGrid'
import type { Region, WeatherResponse } from '@/types'

// Simple gradient backgrounds
const gradients = {
  morning: 'bg-gradient-to-br from-orange-400 via-yellow-400 to-blue-400',
  afternoon: 'bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600',
  evening: 'bg-gradient-to-br from-orange-600 via-red-500 to-purple-600',
  night: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'
}

function getTimeBasedGradient(): string {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return gradients.morning
  if (hour >= 12 && hour < 18) return gradients.afternoon
  if (hour >= 18 && hour < 21) return gradients.evening
  return gradients.night
}

function App() {
  const [currentWeather, setCurrentWeather] = useState<WeatherResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const backgroundGradient = getTimeBasedGradient()

  const handleRegionSelect = (region: Region) => {
    setIsLoading(true)
    
    // Mock weather data
    setTimeout(() => {
      const mockWeatherData: WeatherResponse = {
        current: {
          temperature: 28.5,
          humidity: 75,
          weatherDesc: 'berawan sebagian',
          weatherDescEn: 'partly cloudy',
          windSpeed: 12,
          windDirection: 'SE',
          cloudCover: 45,
          visibility: '10 km',
          datetime: new Date().toISOString(),
          localDatetime: new Date().toISOString()
        },
        forecast: [],
        region
      }
      
      setCurrentWeather(mockWeatherData)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className={`min-h-screen ${backgroundGradient} relative overflow-hidden`}>
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Link 
              to="/api-docs" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-white/80 hover:text-white text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <span>📚</span>
              <span>API Documentation</span>
            </Link>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl mb-4">
            EamagineWeather
          </h1>
          <p className="text-xl text-white/80 drop-shadow-lg">
            Prakiraan Cuaca Indonesia Terkini dari BMKG
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar 
          onRegionSelect={handleRegionSelect}
          className="max-w-2xl mx-auto mb-12"
        />

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4 animate-spin"></div>
              <p className="text-white text-xl">Memuat data cuaca...</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto">
          {/* Selected Weather Card */}
          {currentWeather && !isLoading && currentWeather.current && (
            <div className="mb-8 relative">
              <div className="absolute top-0 right-0 z-10">
                <button
                  onClick={() => setCurrentWeather(null)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full p-2 text-white/60 hover:text-white transition-colors"
                  title="Tutup"
                >
                  ✕
                </button>
              </div>
              <WeatherCard
                weather={currentWeather.current}
                region={currentWeather.region}
              />
            </div>
          )}

          {/* Weather Grid - Always Visible */}
          <div>
            {!currentWeather && (
              <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold text-white mb-4">
                  Prakiraan Cuaca Indonesia
                </h2>
                <p className="text-lg text-white/80">
                  Data cuaca terkini dari berbagai daerah di Indonesia
                </p>
              </div>
            )}
            <DatabaseWeatherGrid />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App