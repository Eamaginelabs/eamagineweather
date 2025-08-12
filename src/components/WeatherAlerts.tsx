
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Info, AlertCircle, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { WeatherAlert } from '@/types'
import { formatDateTime } from '@/lib/utils'

interface WeatherAlertsProps {
  alerts: WeatherAlert[]
  className?: string
}

export function WeatherAlerts({ alerts, className }: WeatherAlertsProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Zap className="w-5 h-5 text-red-400" />
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />
      case 'MEDIUM':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'LOW':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-400/30'
      case 'HIGH':
        return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-400/30'
      case 'MEDIUM':
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/30'
      case 'LOW':
        return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-400/30'
      default:
        return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-400/30'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'Kritis'
      case 'HIGH': return 'Tinggi'
      case 'MEDIUM': return 'Sedang'
      case 'LOW': return 'Rendah'
      default: return severity
    }
  }

  if (alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <Card className="glass-effect border-0 bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-lg border-green-400/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="text-green-400 text-2xl">✅</div>
              <div>
                <h3 className="text-white font-semibold">Tidak Ada Peringatan</h3>
                <p className="text-white/70 text-sm">Kondisi cuaca dalam keadaan normal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          🚨 Peringatan Cuaca
        </h3>
        
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`glass-effect border backdrop-blur-lg ${getSeverityBg(alert.severity)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <motion.div
                      animate={{ 
                        scale: alert.severity === 'CRITICAL' ? [1, 1.2, 1] : 1 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: alert.severity === 'CRITICAL' ? Infinity : 0 
                      }}
                      className="flex-shrink-0 mt-1"
                    >
                      {getSeverityIcon(alert.severity)}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold text-lg">
                          {alert.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                          alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                          alert.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {getSeverityText(alert.severity)}
                        </span>
                      </div>
                      
                      <p className="text-white/80 mb-3 leading-relaxed">
                        {alert.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-white/60">
                        <div className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>Mulai: {formatDateTime(alert.startTime)}</span>
                        </div>
                        {alert.endTime && (
                          <div className="flex items-center space-x-1">
                            <span>⏰</span>
                            <span>Berakhir: {formatDateTime(alert.endTime)}</span>
                          </div>
                        )}
                        {alert.region && (
                          <div className="flex items-center space-x-1">
                            <span>📍</span>
                            <span>Wilayah: {alert.region}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}