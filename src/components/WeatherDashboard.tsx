
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WeatherCard } from '@/components/WeatherCard'
import { ForecastCard } from '@/components/ForecastCard'
import { WeatherChart } from '@/components/WeatherChart'
import { WeatherAlerts } from '@/components/WeatherAlerts'
import type { WeatherResponse, WeatherAlert } from '@/types'

interface WeatherDashboardProps {
  weatherData: WeatherResponse
  className?: string
}

export function WeatherDashboard({ weatherData, className }: WeatherDashboardProps) {
  // Mock alerts data - replace with actual API data
  const mockAlerts: WeatherAlert[] = [
    {
      id: '1',
      title: 'Peringatan Hujan Lebat',
      description: 'Potensi hujan lebat hingga sangat lebat disertai angin kencang di wilayah Jakarta dan sekitarnya. Waspada potensi banjir dan genangan.',
      severity: 'HIGH',
      region: 'DKI Jakarta',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Peringatan Angin Kencang',
      description: 'Kecepatan angin dapat mencapai 25-35 km/jam dengan arah angin tidak menentu.',
      severity: 'MEDIUM',
      region: weatherData.region.regency,
      startTime: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Tabs defaultValue="overview" className="w-full">
        <div className="mb-8">
          <TabsList className="glass-effect bg-white/10 backdrop-blur-md border-0 p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 transition-all duration-200"
            >
              📊 Overview
            </TabsTrigger>
            <TabsTrigger 
              value="forecast" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 transition-all duration-200"
            >
              📈 Prakiraan
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 transition-all duration-200"
            >
              📊 Grafik
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 transition-all duration-200"
            >
              🚨 Peringatan
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <WeatherCard
              weather={weatherData.current!}
              region={weatherData.region}
            />
            <ForecastCard forecast={weatherData.forecast?.slice(0, 8) || []} />
          </div>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="glass-effect bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🌡️</div>
              <div className="text-white/60 text-sm">Suhu Rata-rata</div>
              <div className="text-white text-xl font-semibold">
                {Math.round(
                  (weatherData.forecast?.slice(0, 8).reduce((acc, curr) => acc + curr.temperature, 0) || 0) / 8
                )}°C
              </div>
            </div>
            
            <div className="glass-effect bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">💧</div>
              <div className="text-white/60 text-sm">Kelembapan Rata-rata</div>
              <div className="text-white text-xl font-semibold">
                {Math.round(
                  (weatherData.forecast?.slice(0, 8).reduce((acc, curr) => acc + curr.humidity, 0) || 0) / 8
                )}%
              </div>
            </div>
            
            <div className="glass-effect bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">💨</div>
              <div className="text-white/60 text-sm">Angin Rata-rata</div>
              <div className="text-white text-xl font-semibold">
                {Math.round(
                  (weatherData.forecast?.slice(0, 8).reduce((acc, curr) => acc + curr.windSpeed, 0) || 0) / 8
                )} km/h
              </div>
            </div>
            
            <div className="glass-effect bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">☁️</div>
              <div className="text-white/60 text-sm">Awan Rata-rata</div>
              <div className="text-white text-xl font-semibold">
                {Math.round(
                  (weatherData.forecast?.slice(0, 8).reduce((acc, curr) => acc + curr.cloudCover, 0) || 0) / 8
                )}%
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="forecast">
          <ForecastCard forecast={weatherData.forecast || []} />
        </TabsContent>

        <TabsContent value="charts">
          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <WeatherChart forecast={weatherData.forecast} />
          )}
        </TabsContent>

        <TabsContent value="alerts">
          <WeatherAlerts alerts={mockAlerts} />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}