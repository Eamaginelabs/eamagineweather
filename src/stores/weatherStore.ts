import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { WeatherResponse, Region, UserFavorite, LoadingState } from '@/types'

interface WeatherStore {
  // Current weather data
  currentWeather: WeatherResponse | null
  
  // Favorites
  favorites: UserFavorite[]
  
  // Search results
  searchResults: Region[]
  
  // Loading states
  loadingStates: {
    weather: LoadingState
    search: LoadingState
    favorites: LoadingState
  }
  
  // Selected region
  selectedRegion: Region | null
  
  // Actions
  setCurrentWeather: (weather: WeatherResponse | null) => void
  setFavorites: (favorites: UserFavorite[]) => void
  addFavorite: (favorite: UserFavorite) => void
  removeFavorite: (regionId: string) => void
  setSearchResults: (results: Region[]) => void
  setSelectedRegion: (region: Region | null) => void
  setLoadingState: (key: keyof WeatherStore['loadingStates'], state: LoadingState) => void
  
  // Clear data
  clearWeatherData: () => void
}

export const useWeatherStore = create<WeatherStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentWeather: null,
        favorites: [],
        searchResults: [],
        selectedRegion: null,
        loadingStates: {
          weather: { isLoading: false, error: null },
          search: { isLoading: false, error: null },
          favorites: { isLoading: false, error: null }
        },
        
        setCurrentWeather: (weather) => {
          set({ currentWeather: weather }, false, 'setCurrentWeather')
        },
        
        setFavorites: (favorites) => {
          set({ favorites }, false, 'setFavorites')
        },
        
        addFavorite: (favorite) => {
          const { favorites } = get()
          const exists = favorites.find(f => f.regionId === favorite.regionId)
          if (!exists) {
            set({ 
              favorites: [...favorites, favorite] 
            }, false, 'addFavorite')
          }
        },
        
        removeFavorite: (regionId) => {
          const { favorites } = get()
          set({ 
            favorites: favorites.filter(f => f.regionId !== regionId) 
          }, false, 'removeFavorite')
        },
        
        setSearchResults: (results) => {
          set({ searchResults: results }, false, 'setSearchResults')
        },
        
        setSelectedRegion: (region) => {
          set({ selectedRegion: region }, false, 'setSelectedRegion')
        },
        
        setLoadingState: (key, state) => {
          set(
            (prev) => ({
              loadingStates: {
                ...prev.loadingStates,
                [key]: state
              }
            }),
            false,
            'setLoadingState'
          )
        },
        
        clearWeatherData: () => {
          set({
            currentWeather: null,
            searchResults: []
          }, false, 'clearWeatherData')
        }
      }),
      {
        name: 'weather-store',
        partialize: (state) => ({
          favorites: state.favorites,
          selectedRegion: state.selectedRegion
        })
      }
    ),
    { name: 'WeatherStore' }
  )
)