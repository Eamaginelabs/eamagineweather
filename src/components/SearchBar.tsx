import { useState, useCallback, useEffect } from 'react'
import type { Region } from '@/types'
import { useRegionSearch } from '../hooks/useRegions'
import { debounce } from '@/lib/utils'
import type { Region as ApiRegion } from '../lib/regionsApi'

interface SearchBarProps {
  onRegionSelect: (region: Region) => void
  className?: string
}

export function SearchBar({ onRegionSelect, className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { results, loading, search, clear } = useRegionSearch()

  // Convert ApiRegion to Region format
  const convertApiRegionToRegion = useCallback((apiRegion: ApiRegion): Region => {
    return {
      id: apiRegion.id,
      code: apiRegion.code,
      name: apiRegion.name,
      province: apiRegion.provinceName || '',
      regency: apiRegion.regencyName || '',
      district: apiRegion.districtName || '',
      village: apiRegion.villageName || apiRegion.name,
      latitude: apiRegion.latitude,
      longitude: apiRegion.longitude
    }
  }, [])

  // Debounce search function to avoid too many API calls
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      const debouncedFn = debounce((query: string) => {
        if (query.trim().length > 2) {
          search(query, 4) // Search for villages (level 4)
        } else {
          clear()
        }
      }, 300)
      debouncedFn(searchQuery)
    },
    [search, clear]
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setIsOpen(value.length > 0)
  }

  const handleRegionSelect = (apiRegion: ApiRegion) => {
    setQuery(apiRegion.name)
    setIsOpen(false)
    const region = convertApiRegionToRegion(apiRegion)
    onRegionSelect(region)
  }

  const filteredRegions = results

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
          🔍
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(query.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Cari lokasi cuaca..."
          className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
        />
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-white/80 text-sm font-medium px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <span>{loading ? 'Mencari...' : 'Hasil Pencarian'}</span>
              {!loading && filteredRegions.length > 0 && (
                <span className="text-white/50 text-xs">{filteredRegions.length} lokasi</span>
              )}
            </div>
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            {!loading && filteredRegions.length > 0 && filteredRegions.map((apiRegion) => (
              <div
                key={apiRegion.id}
                className="flex items-start space-x-3 p-4 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
                onClick={() => handleRegionSelect(apiRegion)}
              >
                <span className="text-white/60">📍</span>
                <div className="flex-1">
                  <div className="text-white font-medium flex items-center gap-2">
                    {apiRegion.name}
                    {apiRegion.hasWeatherData && (
                      <span className="text-green-400 text-xs">☀️</span>
                    )}
                  </div>
                  <div className="text-white/60 text-xs space-y-0.5 mt-1">
                    {apiRegion.districtName && (
                      <div><span className="text-white/40">Kecamatan:</span> {apiRegion.districtName}</div>
                    )}
                    {apiRegion.regencyName && (
                      <div><span className="text-white/40">Kabupaten:</span> {apiRegion.regencyName}</div>
                    )}
                    {apiRegion.provinceName && (
                      <div><span className="text-white/40">Provinsi:</span> {apiRegion.provinceName}</div>
                    )}
                    {!apiRegion.districtName && !apiRegion.regencyName && !apiRegion.provinceName && (
                      <div className="text-white/40">Level {apiRegion.level}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!loading && filteredRegions.length === 0 && query.length > 2 && (
              <div className="p-4 text-center text-white/60">
                Tidak ada hasil untuk "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}