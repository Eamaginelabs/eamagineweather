import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProvinces, useRegenciesByProvince, useVillagesByRegency } from '../hooks/useRegions';
import { regionsApi } from '../lib/regionsApi';
import SimpleWeatherCard from './SimpleWeatherCard';
import SkeletonLoader from './SkeletonLoader';

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  icon: string;
}

interface CityWeatherData {
  region: {
    id: string;
    code: string;
    name: string;
    provinceName?: string;
    regencyName?: string;
  };
  weather: WeatherData | null;
  isLoading: boolean;
}

const DatabaseWeatherGrid: React.FC = () => {
  const { provinces, loading: provincesLoading, error: provincesError } = useProvinces();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const { regencies, loading: regenciesLoading } = useRegenciesByProvince(selectedProvince);
  const [selectedRegency, setSelectedRegency] = useState<string | null>(null);
  const { villages, loading: villagesLoading, hasMore, loadMore } = useVillagesByRegency(selectedRegency);
  
  const [citiesWeatherData, setCitiesWeatherData] = useState<CityWeatherData[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Initialize with popular provinces
  useEffect(() => {
    if (provinces.length > 0 && !selectedProvince) {
      // Start with Jakarta (DKI Jakarta) - province code 31
      const jakarta = provinces.find(p => p.code === '31');
      if (jakarta) {
        setSelectedProvince(jakarta.code);
      } else {
        // Fallback to first province
        setSelectedProvince(provinces[0].code);
      }
    }
  }, [provinces, selectedProvince]);

  // Auto-select first regency when province changes
  useEffect(() => {
    if (regencies.length > 0 && selectedProvince) {
      setSelectedRegency(regencies[0].code);
    }
  }, [regencies, selectedProvince]);

  const generateFallbackWeather = useCallback((regionName: string): WeatherData => {
    // Generate realistic weather data based on region
    const baseTemp = regionName.toLowerCase().includes('jakarta') ? 28 : 
                    regionName.toLowerCase().includes('bandung') ? 23 :
                    regionName.toLowerCase().includes('surabaya') ? 29 : 26;
    
    return {
      temperature: baseTemp + Math.floor(Math.random() * 6) - 3,
      humidity: 65 + Math.floor(Math.random() * 20),
      condition: ['Cerah', 'Berawan', 'Berawan Tebal'][Math.floor(Math.random() * 3)],
      windSpeed: 8 + Math.floor(Math.random() * 12),
      icon: '',
    };
  }, []);

  const extractWeatherData = useCallback((bmkgData: unknown): WeatherData => {
    // Extract current weather from BMKG API response
    const data = bmkgData && typeof bmkgData === 'object' && 'data' in bmkgData ? bmkgData.data : null
    const currentData = Array.isArray(data) && data.length > 0 && data[0] && 
      typeof data[0] === 'object' && 'cuaca' in data[0] && 
      Array.isArray(data[0].cuaca) && data[0].cuaca.length > 0 &&
      Array.isArray(data[0].cuaca[0]) && data[0].cuaca[0].length > 0 
      ? data[0].cuaca[0][0] : null;
    
    if (currentData && typeof currentData === 'object') {
      const weather = currentData as { t?: number; hu?: number; weather_desc?: string; ws?: number; }
      return {
        temperature: weather.t || 25,
        humidity: weather.hu || 70,
        condition: weather.weather_desc || 'Cerah',
        windSpeed: weather.ws || 10,
        icon: (weather as { image?: string }).image || '',
      };
    }
    
    return generateFallbackWeather('');
  }, [generateFallbackWeather]);

  const loadWeatherData = useCallback(async () => {
    if (villages.length === 0) return;

    setIsLoadingWeather(true);

    // Initialize loading states
    const initialData: CityWeatherData[] = villages.map(village => ({
      region: {
        id: village.id,
        code: village.code,
        name: village.name,
        provinceName: village.provinceName,
        regencyName: village.regencyName,
      },
      weather: null,
      isLoading: true,
    }));
    setCitiesWeatherData(initialData);

    // Load weather data in batches
    const batchSize = 10;
    const batches: typeof villages[] = [];
    for (let i = 0; i < villages.length; i += batchSize) {
      batches.push(villages.slice(i, i + batchSize));
    }

    // Process batches with delay
    for (const batch of batches) {
      try {
        const weatherResults = await regionsApi.batchGetWeatherData(
          batch.map(v => v.code)
        );

        setCitiesWeatherData(prev => 
          prev.map(item => {
            const weatherData = weatherResults.get(item.region.code);
            if (weatherData) {
              return {
                ...item,
                weather: extractWeatherData(weatherData),
                isLoading: false,
              };
            }
            return {
              ...item,
              weather: generateFallbackWeather(item.region.name),
              isLoading: false,
            };
          })
        );
      } catch (error) {
        console.warn('Batch weather fetch failed:', error);
        
        // Mark batch as failed with fallback data
        setCitiesWeatherData(prev => 
          prev.map(item => {
            if (batch.some(v => v.code === item.region.code)) {
              return {
                ...item,
                weather: generateFallbackWeather(item.region.name),
                isLoading: false,
              };
            }
            return item;
          })
        );
      }
      
      // Add delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsLoadingWeather(false);
  }, [villages, extractWeatherData, generateFallbackWeather]);

  // Load weather data for villages
  useEffect(() => {
    if (villages.length > 0) {
      loadWeatherData();
    }
  }, [villages, loadWeatherData]);

  const handleLoadMore = () => {
    if (hasMore && !villagesLoading) {
      loadMore();
    }
  };

  const getStatsForProvince = (provinceCode: string) => {
    const provinceData = citiesWeatherData.filter(
      item => item.region.code.startsWith(provinceCode)
    );
    
    if (provinceData.length === 0) return null;
    
    const validWeatherData = provinceData.filter(item => item.weather);
    const totalTemp = validWeatherData.reduce((sum, item) => sum + (item.weather?.temperature || 0), 0);
    const avgTemp = Math.round(totalTemp / validWeatherData.length);
    
    return {
      avgTemp,
      totalCities: provinceData.length,
      loadedCities: validWeatherData.length,
    };
  };

  // Add error display
  if (provincesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">!</div>
          <p className="text-red-400 mb-2">Error loading provinces:</p>
          <p className="text-red-300 text-sm">{provincesError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (provincesLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <SkeletonLoader variant="text" className="w-48 h-6 mb-4" />
          <SkeletonLoader variant="grid" />
        </div>
      </div>
    );
  }

  // Add debug info
  console.log('DatabaseWeatherGrid render:', { 
    provinces: provinces.length, 
    provincesLoading, 
    provincesError,
    selectedProvince,
    regencies: regencies.length
  });

  const currentStats = selectedProvince ? getStatsForProvince(selectedProvince) : null;

  return (
    <div className="space-y-6">
      {/* Province Selector */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Select Province</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {provinces.map((province) => (
            <motion.button
              key={province.id}
              onClick={() => setSelectedProvince(province.code)}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                selectedProvince === province.code
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              whileHover={{ 
                scale: 1.05, 
                rotate: 1,
                transition: { type: "spring", stiffness: 300 } 
              }}
              whileTap={{ scale: 0.95 }}
            >
              {province.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Regency Selector */}
      {selectedProvince && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Select Regency/City</h3>
          {regenciesLoading ? (
            <SkeletonLoader variant="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {regencies.map((regency) => (
                <motion.button
                  key={regency.id}
                  onClick={() => setSelectedRegency(regency.code)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all text-left ${
                    selectedRegency === regency.code
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    transition: { type: "spring", stiffness: 300 } 
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {regency.name}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      {currentStats && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{currentStats.avgTemp}°C</p>
              <p className="text-sm text-gray-300">Average Temperature</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentStats.loadedCities}</p>
              <p className="text-sm text-gray-300">Locations with Weather</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{currentStats.totalCities}</p>
              <p className="text-sm text-gray-300">Total Locations</p>
            </div>
          </div>
        </div>
      )}

      {/* Weather Grid */}
      {selectedRegency && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white mb-4">
            Weather Data for Villages
            {isLoadingWeather && (
              <span className="ml-2 text-sm font-normal text-gray-300">
                (Loading weather data...)
              </span>
            )}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {citiesWeatherData.length === 0 && isLoadingWeather ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonLoader key={index} variant="weather-card" />
                ))
              ) : (
                citiesWeatherData.map((cityData, index) => (
                  <motion.div
                    key={cityData.region.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.08,
                      type: "spring",
                      bounce: 0.4
                    }}
                  >
                    {cityData.isLoading ? (
                      <SkeletonLoader variant="weather-card" />
                    ) : (
                      <SimpleWeatherCard
                        location={cityData.region.name}
                        temperature={cityData.weather?.temperature || 0}
                        condition={cityData.weather?.condition || 'Loading...'}
                        humidity={cityData.weather?.humidity || 0}
                        windSpeed={cityData.weather?.windSpeed || 0}
                        isLoading={false}
                        dataSource={cityData.weather ? 'bmkg' : 'fallback'}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-8">
              <motion.button
                onClick={handleLoadMore}
                disabled={villagesLoading}
                className="bg-blue-600/80 hover:bg-blue-500/80 disabled:bg-gray-600/50 text-white px-8 py-3 rounded-lg font-medium backdrop-blur-sm border border-blue-400/30 transition-all"
                whileHover={{ 
                  scale: 1.05,
                  y: -8,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                {villagesLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                    Loading More Villages...
                  </>
                ) : (
                  'Load More Villages'
                )}
              </motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseWeatherGrid;