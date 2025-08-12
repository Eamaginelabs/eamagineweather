
import { motion } from 'framer-motion';

interface SimpleWeatherCardProps {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  isLoading?: boolean;
  dataSource?: 'bmkg' | 'fallback';
}

function getWeatherIcon(condition: string): string {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('cerah') || lowerCondition.includes('sunny')) return '☀️';
  if (lowerCondition.includes('berawan') || lowerCondition.includes('cloudy')) return '⛅';
  if (lowerCondition.includes('hujan') || lowerCondition.includes('rain')) return '🌧️';
  if (lowerCondition.includes('petir') || lowerCondition.includes('storm')) return '⛈️';
  if (lowerCondition.includes('kabut') || lowerCondition.includes('fog')) return '🌫️';
  if (lowerCondition.includes('mendung')) return '☁️';
  return '🌤️';
}

function getWeatherGradient(condition: string): string {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('cerah') || lowerCondition.includes('sunny')) 
    return 'bg-gradient-to-br from-yellow-400/20 via-orange-400/10 to-red-400/20';
  if (lowerCondition.includes('berawan') || lowerCondition.includes('cloudy')) 
    return 'bg-gradient-to-br from-blue-400/20 via-gray-400/10 to-blue-500/20';
  if (lowerCondition.includes('hujan') || lowerCondition.includes('rain')) 
    return 'bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-gray-600/20';
  if (lowerCondition.includes('petir') || lowerCondition.includes('storm')) 
    return 'bg-gradient-to-br from-purple-600/20 via-gray-600/10 to-black/20';
  if (lowerCondition.includes('kabut') || lowerCondition.includes('fog')) 
    return 'bg-gradient-to-br from-gray-400/20 via-white/10 to-gray-500/20';
  if (lowerCondition.includes('mendung')) 
    return 'bg-gradient-to-br from-gray-500/20 via-gray-400/10 to-gray-600/20';
  return 'bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-blue-500/20';
}

const SimpleWeatherCard: React.FC<SimpleWeatherCardProps> = ({
  location,
  temperature,
  condition,
  humidity,
  windSpeed,
  isLoading = false,
  dataSource = 'bmkg'
}) => {
  if (isLoading) {
    return (
      <motion.div 
        className="group relative overflow-hidden rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Loading background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl border border-white/30"></div>
        
        {/* Animated shimmer effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
        
        {/* Loading accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/50 to-purple-500/50 animate-pulse"></div>
        
        <div className="relative z-10 p-6">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
                  <div className="h-5 bg-white/20 rounded-lg w-32"></div>
                </div>
                <div className="h-4 bg-white/15 rounded-full w-20"></div>
              </div>
            </div>
            
            {/* Temperature skeleton */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400/50 rounded-full animate-ping"></div>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-white/20 rounded-lg w-20"></div>
                <div className="h-4 bg-white/15 rounded-lg w-24"></div>
              </div>
            </div>
            
            {/* Metrics skeleton */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 rounded-2xl p-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                    <div className="h-3 bg-white/15 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/15 rounded-2xl p-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-xl"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-white/20 rounded w-full"></div>
                    <div className="h-3 bg-white/15 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer skeleton */}
            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-white/15 rounded w-24"></div>
                <div className="h-3 bg-white/15 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="group relative overflow-hidden rounded-3xl transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        type: "spring", 
        bounce: 0.3 
      }}
      whileHover={{ 
        scale: 1.03,
        y: -8,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Enhanced glass morphism background with weather-based gradient */}
      <div className={`absolute inset-0 ${getWeatherGradient(condition)} backdrop-blur-xl border border-white/30`}></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div className="absolute top-4 right-4 text-6xl opacity-30 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
          {getWeatherIcon(condition)}
        </div>
      </div>

      {/* Weather condition accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        condition.toLowerCase().includes('cerah') ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
        condition.toLowerCase().includes('berawan') ? 'bg-gradient-to-r from-blue-400 to-gray-500' :
        condition.toLowerCase().includes('hujan') ? 'bg-gradient-to-r from-blue-600 to-gray-700' :
        condition.toLowerCase().includes('petir') ? 'bg-gradient-to-r from-purple-600 to-gray-800' :
        'bg-gradient-to-r from-blue-400 to-purple-500'
      }`}></div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header with location and status */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full animate-pulse ${dataSource === 'bmkg' ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <h3 className="text-white font-bold text-lg truncate tracking-tight">
                {location}
              </h3>
            </div>
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              dataSource === 'bmkg' 
                ? 'bg-green-500/30 text-green-200 border border-green-400/30' 
                : 'bg-orange-500/30 text-orange-200 border border-orange-400/30'
            }`}>
              <span>{dataSource === 'bmkg' ? '📡' : '🔄'}</span>
              <span className="font-medium">
                {dataSource === 'bmkg' ? 'BMKG Live' : 'Estimated'}
              </span>
            </div>
          </div>
        </div>

        {/* Main weather display */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="text-5xl drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
                {getWeatherIcon(condition)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400/80 rounded-full animate-ping"></div>
            </div>
            <div>
              <div className="text-5xl font-extralight text-white drop-shadow-2xl tracking-tighter">
                {Math.round(temperature)}°
              </div>
              <div className="text-white/90 text-sm font-medium capitalize tracking-wide">
                {condition}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced weather metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="group/metric bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cyan-500/30 rounded-xl flex items-center justify-center group-hover/metric:scale-110 transition-transform duration-300">
                <span className="text-sm">💧</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-lg">{humidity}%</div>
                <div className="text-white/70 text-xs font-medium">Kelembapan</div>
              </div>
            </div>
          </div>
          
          <div className="group/metric bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 hover:bg-white/25 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/30 rounded-xl flex items-center justify-center group-hover/metric:scale-110 transition-transform duration-300">
                <span className="text-sm">💨</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-lg">{windSpeed}</div>
                <div className="text-white/70 text-xs font-medium">km/h Angin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with timestamp */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span className="flex items-center gap-1">
              <span>🕐</span>
              <span>Diperbarui baru-baru ini</span>
            </span>
            <span className="flex items-center gap-1">
              <span>📍</span>
              <span>Indonesia</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SimpleWeatherCard;