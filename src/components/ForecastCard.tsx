import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import type { ForecastWeather } from '@/types'
import { 
  formatTemperature, 
  getWeatherIcon,
  formatTime
} from '@/lib/utils'

interface ForecastCardProps {
  forecast: ForecastWeather[]
  className?: string
}

export function ForecastCard({ forecast, className }: ForecastCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={className}
    >
      <Card className="glass-effect border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            📊 Prakiraan 3 Hari
          </h3>
          
          <div className="space-y-3">
            {forecast.slice(0, 8).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getWeatherIcon(item.weatherDesc)}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {formatTime(item.localDatetime)}
                    </div>
                    <div className="text-white/70 text-sm capitalize">
                      {item.weatherDesc}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-white text-lg font-semibold">
                      {formatTemperature(item.temperature)}
                    </div>
                    <div className="text-white/60 text-sm">
                      {item.humidity}% RH
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {Math.round(item.windSpeed)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {forecast.length > 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-center"
            >
              <div className="text-white/60 text-sm">
                Dan {forecast.length - 8} prakiraan lainnya...
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}