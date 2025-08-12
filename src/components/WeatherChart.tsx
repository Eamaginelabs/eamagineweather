import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ForecastWeather } from '@/types'
import { formatTime } from '@/lib/utils'

interface WeatherChartProps {
  forecast: ForecastWeather[]
  className?: string
}

export function WeatherChart({ forecast, className }: WeatherChartProps) {
  // Prepare chart data
  const chartData = forecast.map((item, index) => ({
    time: formatTime(item.localDatetime),
    temperature: Math.round(item.temperature),
    humidity: item.humidity,
    windSpeed: Math.round(item.windSpeed),
    cloudCover: item.cloudCover,
    index
  }))

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; dataKey: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-800">{`Waktu: ${label}`}</p>
          {payload.map((entry: { color: string; dataKey: string; value: number }, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey === 'temperature' ? 'Suhu' :
                 entry.dataKey === 'humidity' ? 'Kelembapan' :
                 entry.dataKey === 'windSpeed' ? 'Kecepatan Angin' :
                 entry.dataKey === 'cloudCover' ? 'Tutupan Awan' : entry.dataKey
                }: ${entry.value}${
                 entry.dataKey === 'temperature' ? '°C' :
                 entry.dataKey === 'humidity' ? '%' :
                 entry.dataKey === 'windSpeed' ? ' km/h' :
                 entry.dataKey === 'cloudCover' ? '%' : ''
                }`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={className}
    >
      <div className="grid gap-6">
        {/* Temperature and Humidity Chart */}
        <Card className="glass-effect border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              🌡️ Suhu & Kelembapan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="temp"
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="humidity"
                    orientation="right"
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ff6b6b"
                    strokeWidth={3}
                    dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ff6b6b', strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="humidity"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#4ecdc4"
                    strokeWidth={3}
                    dot={{ fill: '#4ecdc4', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#4ecdc4', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Wind Speed Area Chart */}
        <Card className="glass-effect border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              💨 Kecepatan Angin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#45B7D1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#45B7D1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="windSpeed"
                    stroke="#45B7D1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#windGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cloud Cover Bar Chart */}
        <Card className="glass-effect border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              ☁️ Tutupan Awan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="cloudGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#96CEB4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#96CEB4" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <Bar
                    dataKey="cloudCover"
                    fill="url(#cloudGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}