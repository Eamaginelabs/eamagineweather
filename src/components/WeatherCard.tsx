
import type { CurrentWeather, Region } from '@/types'

interface WeatherCardProps {
  weather: CurrentWeather
  region: Region
  className?: string
}

function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`
}

function getWeatherIcon(condition: string): string {
  const lowerCondition = condition.toLowerCase()
  if (lowerCondition.includes('cerah')) return '☀️'
  if (lowerCondition.includes('berawan')) return '⛅'
  if (lowerCondition.includes('hujan')) return '🌧️'
  if (lowerCondition.includes('petir')) return '⛈️'
  if (lowerCondition.includes('kabut')) return '🌫️'
  if (lowerCondition.includes('mendung')) return '☁️'
  return '🌤️'
}

function getWeatherGradient(condition: string): string {
  const lowerCondition = condition.toLowerCase()
  if (lowerCondition.includes('cerah')) return 'bg-gradient-to-br from-yellow-400 to-orange-500'
  if (lowerCondition.includes('berawan')) return 'bg-gradient-to-br from-blue-400 to-gray-500'
  if (lowerCondition.includes('hujan')) return 'bg-gradient-to-br from-blue-600 to-gray-700'
  if (lowerCondition.includes('petir')) return 'bg-gradient-to-br from-purple-600 to-gray-800'
  if (lowerCondition.includes('kabut')) return 'bg-gradient-to-br from-gray-400 to-gray-600'
  if (lowerCondition.includes('mendung')) return 'bg-gradient-to-br from-gray-500 to-gray-700'
  return 'bg-gradient-to-br from-blue-400 to-purple-500'
}

function getWindDirection(direction: string): string {
  const directions: Record<string, string> = {
    'N': 'Utara', 'NE': 'Timur Laut', 'E': 'Timur', 'SE': 'Tenggara',
    'S': 'Selatan', 'SW': 'Barat Daya', 'W': 'Barat', 'NW': 'Barat Laut'
  }
  return directions[direction.toUpperCase()] || direction
}

function formatTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit', minute: '2-digit'
  }).format(d)
}

export function WeatherCard({ weather, region, className }: WeatherCardProps) {
  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl group">
        {/* Enhanced glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl border border-white/30"></div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse"></div>
          <div className="absolute top-8 right-8 text-8xl opacity-20 group-hover:scale-110 transition-transform duration-700">
            {getWeatherIcon(weather.weatherDesc)}
          </div>
        </div>
        
        {/* Weather-based accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${getWeatherGradient(weather.weatherDesc)}`}></div>
        
        <div className="relative z-10 p-8">
          {/* Header with location and time */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg tracking-tight">
                  {region.name}
                </h2>
              </div>
              <div className="space-y-1">
                <p className="text-white/90 text-base font-medium">
                  {region.district && `${region.district}, `}{region.regency}
                </p>
                <p className="text-white/70 text-sm flex items-center gap-2">
                  <span>🕐</span>
                  <span>Diperbarui {formatTime(weather.localDatetime)}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Main temperature display */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="text-7xl drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                  {getWeatherIcon(weather.weatherDesc)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <div className="space-y-1">
                <div className="text-6xl font-extralight text-white drop-shadow-2xl tracking-tighter">
                  {formatTemperature(weather.temperature)}
                </div>
                <div className="text-white/90 text-lg font-medium capitalize tracking-wide">
                  {weather.weatherDesc}
                </div>
                <div className="text-white/70 text-sm">
                  {weather.weatherDescEn}
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced weather metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group/item bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                  <span className="text-xl">💨</span>
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-lg">{weather.windSpeed} km/h</div>
                  <div className="text-white/70 text-sm font-medium">{getWindDirection(weather.windDirection)}</div>
                </div>
              </div>
            </div>
            
            <div className="group/item bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                  <span className="text-xl">💧</span>
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-lg">{weather.humidity}%</div>
                  <div className="text-white/70 text-sm font-medium">Kelembapan</div>
                </div>
              </div>
            </div>
            
            <div className="group/item bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                  <span className="text-xl">👁️</span>
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-lg">{weather.visibility}</div>
                  <div className="text-white/70 text-sm font-medium">Jarak Pandang</div>
                </div>
              </div>
            </div>
            
            <div className="group/item bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/25 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                  <span className="text-xl">☁️</span>
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-lg">{weather.cloudCover}%</div>
                  <div className="text-white/70 text-sm font-medium">Tutupan Awan</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with data source */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-white/60 text-xs">
              <span className="flex items-center gap-1">
                <span>📡</span>
                <span>Data BMKG</span>
              </span>
              <span className="flex items-center gap-1">
                <span>🌐</span>
                <span>EamagineWeather</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}