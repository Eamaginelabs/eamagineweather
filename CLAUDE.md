# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend
- `npm run dev` - Start development server with Vite and HMR
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

### Backend
- `cd backend && go run main.go` - Start Golang backend server
- `cd backend && go mod download` - Install Go dependencies
- `cd backend && go run github.com/steebchen/prisma-client-go generate` - Generate Prisma client
- `cd backend && go run github.com/steebchen/prisma-client-go db push` - Push database schema

## Project Architecture

This is a full-stack weather application using:

### Frontend
- **React 19.1.1** with TypeScript
- **Vite 7.1.0** with `@vitejs/plugin-react`
- **Tailwind CSS** for styling with custom design system
- **Framer Motion** for animations
- **Zustand** for state management
- **Recharts** for weather data visualization
- **Radix UI** for accessible components

### Backend  
- **Golang 1.22** with Gin framework
- **Prisma** as ORM with PostgreSQL
- **Redis** for caching weather data
- **BMKG API** integration for Indonesia weather data

### Key Frontend Components

- `src/App.tsx` - Main application with time-based gradients
- `src/components/WeatherDashboard.tsx` - Main weather interface with tabs
- `src/components/WeatherCard.tsx` - Current weather display with glass morphism
- `src/components/ForecastCard.tsx` - Weather forecast list
- `src/components/WeatherChart.tsx` - Data visualization charts
- `src/components/SearchBar.tsx` - Location search with autocomplete
- `src/stores/weatherStore.ts` - Zustand state management
- `src/lib/api.ts` - API client for backend communication
- `src/lib/utils.ts` - Utility functions for weather display

### Backend Structure

- `backend/main.go` - Entry point with Gin server setup
- `backend/internal/service/bmkg.go` - BMKG API integration service
- `backend/schema.prisma` - Database schema for weather data
- `backend/internal/config/` - Application configuration
- `backend/internal/handler/` - HTTP request handlers
- `backend/internal/repository/` - Data access layer

### Key Features Implemented

1. **Glass Morphism UI** - Modern transparent design with backdrop blur
2. **Time-based Gradients** - Background changes based on time of day
3. **Weather Data Visualization** - Interactive charts for temperature, humidity, wind
4. **Search with Favorites** - Location search with favorite locations
5. **Responsive Design** - Works on mobile and desktop
6. **Weather Alerts** - Alert system for extreme weather conditions
7. **BMKG API Integration** - Real Indonesian weather data every 3 hours

### Environment Configuration

Copy `.env.example` to `.env` for both frontend and backend:
- Frontend uses VITE_ prefixed variables
- Backend uses standard environment variables
- Supabase for database hosting
- Redis for caching (optional in development)