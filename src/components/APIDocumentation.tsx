import { useState } from 'react'
import { motion } from 'framer-motion'

interface APIEndpoint {
  method: string
  path: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    example?: string
  }>
  response: {
    description: string
    example: string
  }
}

const APIDocumentation: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const endpoints: APIEndpoint[] = [
    {
      method: 'GET',
      path: '/api/v1/regions/provinces',
      description: 'Mendapatkan daftar semua provinsi di Indonesia',
      response: {
        description: 'Daftar provinsi dengan informasi dasar',
        example: `{
  "data": [
    {
      "id": "01",
      "code": "11",
      "name": "Aceh",
      "level": 1
    },
    {
      "id": "02",
      "code": "12",
      "name": "Sumatera Utara",
      "level": 1
    }
  ],
  "total": 34
}`
      }
    },
    {
      method: 'GET',
      path: '/api/v1/regions/regencies/:provinceCode',
      description: 'Mendapatkan daftar kabupaten/kota dalam suatu provinsi',
      parameters: [
        {
          name: 'provinceCode',
          type: 'string',
          required: true,
          description: 'Kode provinsi (contoh: 31 untuk DKI Jakarta)',
          example: '31'
        }
      ],
      response: {
        description: 'Daftar kabupaten/kota dalam provinsi',
        example: `{
  "data": [
    {
      "id": "3101",
      "code": "31.01",
      "name": "Jakarta Pusat",
      "level": 2,
      "provinceCode": "31"
    },
    {
      "id": "3102",
      "code": "31.02",
      "name": "Jakarta Utara",
      "level": 2,
      "provinceCode": "31"
    }
  ],
  "total": 6
}`
      }
    },
    {
      method: 'GET',
      path: '/api/v1/regions/villages/:regencyCode',
      description: 'Mendapatkan daftar desa dengan data cuaca dalam suatu kabupaten',
      parameters: [
        {
          name: 'regencyCode',
          type: 'string',
          required: true,
          description: 'Kode kabupaten (contoh: 31.01 untuk Jakarta Pusat)',
          example: '31.01'
        },
        {
          name: 'page',
          type: 'number',
          required: false,
          description: 'Nomor halaman (default: 1)',
          example: '1'
        },
        {
          name: 'limit',
          type: 'number',
          required: false,
          description: 'Jumlah data per halaman (default: 20, max: 50)',
          example: '20'
        }
      ],
      response: {
        description: 'Daftar desa dengan flag cuaca tersedia',
        example: `{
  "data": [
    {
      "id": "310101001",
      "code": "31.01.01.1001",
      "name": "Gambir",
      "level": 4,
      "regencyCode": "31.01",
      "hasWeatherData": true
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}`
      }
    },
    {
      method: 'GET',
      path: '/api/v1/regions/search',
      description: 'Mencari wilayah berdasarkan nama dengan pencarian fuzzy',
      parameters: [
        {
          name: 'q',
          type: 'string',
          required: true,
          description: 'Kata kunci pencarian',
          example: 'Jakarta'
        },
        {
          name: 'level',
          type: 'number',
          required: false,
          description: 'Level wilayah (1=Provinsi, 2=Kabupaten, 3=Kecamatan, 4=Desa)',
          example: '4'
        },
        {
          name: 'limit',
          type: 'number',
          required: false,
          description: 'Jumlah hasil maksimal (default: 20, max: 50)',
          example: '20'
        }
      ],
      response: {
        description: 'Hasil pencarian wilayah dengan informasi hierarki',
        example: `{
  "data": [
    {
      "id": "310101001",
      "code": "31.01.01.1001",
      "name": "Gambir",
      "level": 4,
      "provinceName": "DKI Jakarta",
      "regencyName": "Jakarta Pusat",
      "districtName": "Gambir",
      "displayName": "Gambir, Kec. Gambir, Jakarta Pusat, DKI Jakarta",
      "hasWeatherData": true
    }
  ],
  "total": 15
}`
      }
    },
    {
      method: 'GET',
      path: '/api/v1/weather/current/:regionCode',
      description: 'Mendapatkan data cuaca terkini untuk wilayah tertentu',
      parameters: [
        {
          name: 'regionCode',
          type: 'string',
          required: true,
          description: 'Kode wilayah (contoh: 31.01.01.1001)',
          example: '31.01.01.1001'
        }
      ],
      response: {
        description: 'Data cuaca terkini dari BMKG',
        example: `{
  "data": [
    {
      "jamCuaca": "202412051800",
      "kodecuaca": "3",
      "cuaca": [
        [
          {
            "datetime": "202412051800",
            "t": 28.5,
            "tcc": 45,
            "tp": 0,
            "weather_desc": "Berawan Sebagian",
            "weather_desc_en": "Partly Cloudy",
            "wd_deg": 135,
            "wd_to": "SE",
            "ws": 12.5,
            "hu": 75,
            "vs_text": "10 Km"
          }
        ]
      ]
    }
  ],
  "success": true
}`
      }
    }
  ]

  const copyToClipboard = async (text: string, endpoint: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedEndpoint(endpoint)
      setTimeout(() => setCopiedEndpoint(null), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500/20 text-green-200 border-green-400/30'
      case 'POST': return 'bg-blue-500/20 text-blue-200 border-blue-400/30'
      case 'PUT': return 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'
      case 'DELETE': return 'bg-red-500/20 text-red-200 border-red-400/30'
      default: return 'bg-gray-500/20 text-gray-200 border-gray-400/30'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <a 
              href="/" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-white/80 hover:text-white text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to Weather App</span>
            </a>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl mb-4">
            EamagineWeather API
          </h1>
          <p className="text-xl text-white/80 drop-shadow-lg mb-8">
            Professional Weather Data API for Indonesia
          </p>
          
          {/* API Base URL */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-4xl mx-auto">
            <h2 className="text-white font-semibold mb-4">Base URL</h2>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-green-300 flex items-center justify-between">
              <span>https://eamagineweather-production.up.railway.app</span>
              <button
                onClick={() => copyToClipboard('https://eamagineweather-production.up.railway.app', 'base-url')}
                className="text-white/60 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                {copiedEndpoint === 'base-url' ? '✓' : '📋'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">{endpoints.length}</div>
            <div className="text-white/80 text-sm">API Endpoints</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">34</div>
            <div className="text-white/80 text-sm">Provinces</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">500+</div>
            <div className="text-white/80 text-sm">Cities/Regencies</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">10K+</div>
            <div className="text-white/80 text-sm">Villages</div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">API Endpoints</h2>
          
          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setSelectedEndpoint(selectedEndpoint === endpoint.path ? null : endpoint.path)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-white font-mono text-lg">{endpoint.path}</code>
                    </div>
                    <div className="text-white/60">
                      {selectedEndpoint === endpoint.path ? '▼' : '▶'}
                    </div>
                  </div>
                  <p className="text-white/80 mt-2 ml-16">{endpoint.description}</p>
                </div>

                {selectedEndpoint === endpoint.path && (
                  <motion.div
                    className="border-t border-white/20 p-6 bg-black/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Parameters */}
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-white font-semibold mb-4">Parameters</h4>
                        <div className="space-y-3">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="bg-white/5 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <code className="text-blue-300 font-mono">{param.name}</code>
                                <span className={`text-xs px-2 py-1 rounded ${param.required ? 'bg-red-500/20 text-red-200' : 'bg-gray-500/20 text-gray-300'}`}>
                                  {param.required ? 'Required' : 'Optional'}
                                </span>
                                <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded">
                                  {param.type}
                                </span>
                              </div>
                              <p className="text-white/80 text-sm">{param.description}</p>
                              {param.example && (
                                <div className="mt-2">
                                  <code className="text-green-300 text-sm bg-black/30 px-2 py-1 rounded">
                                    Example: {param.example}
                                  </code>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Response */}
                    <div>
                      <h4 className="text-white font-semibold mb-4">Response</h4>
                      <p className="text-white/80 mb-4">{endpoint.response.description}</p>
                      <div className="bg-black/40 rounded-lg p-4 relative">
                        <button
                          onClick={() => copyToClipboard(endpoint.response.example, endpoint.path)}
                          className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors text-sm"
                          title="Copy response example"
                        >
                          {copiedEndpoint === endpoint.path ? '✓ Copied' : '📋 Copy'}
                        </button>
                        <pre className="text-green-300 text-sm overflow-x-auto whitespace-pre-wrap">
                          {endpoint.response.example}
                        </pre>
                      </div>
                    </div>

                    {/* cURL Example */}
                    <div className="mt-6">
                      <h4 className="text-white font-semibold mb-4">cURL Example</h4>
                      <div className="bg-black/40 rounded-lg p-4 relative">
                        <button
                          onClick={() => copyToClipboard(
                            `curl -X ${endpoint.method} "https://eamagineweather-production.up.railway.app${endpoint.path.replace(':provinceCode', '31').replace(':regencyCode', '31.01').replace(':regionCode', '31.01.01.1001')}"`,
                            `curl-${endpoint.path}`
                          )}
                          className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors text-sm"
                          title="Copy cURL command"
                        >
                          {copiedEndpoint === `curl-${endpoint.path}` ? '✓ Copied' : '📋 Copy'}
                        </button>
                        <code className="text-yellow-300 text-sm">
                          curl -X {endpoint.method} "https://eamagineweather-production.up.railway.app{endpoint.path.replace(':provinceCode', '31').replace(':regencyCode', '31.01').replace(':regionCode', '31.01.01.1001')}"
                        </code>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-4xl mx-auto">
            <h3 className="text-white font-semibold mb-4">About EamagineWeather API</h3>
            <p className="text-white/80 mb-4">
              API ini mengintegrasikan data cuaca real-time dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) 
              dengan struktur wilayah administratif Indonesia yang lengkap dari tingkat provinsi hingga desa.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-white font-medium mb-2">🌦️ Weather Data</h4>
                <p className="text-white/70">Real-time weather from BMKG API with 3-hour updates</p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">🏛️ Administrative Regions</h4>
                <p className="text-white/70">Complete hierarchy: Provinces → Cities → Districts → Villages</p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">🔍 Smart Search</h4>
                <p className="text-white/70">Fuzzy search across all administrative levels</p>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">⚡ Performance</h4>
                <p className="text-white/70">Redis caching and optimized queries for fast response</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default APIDocumentation