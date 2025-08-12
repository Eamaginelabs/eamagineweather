# EamagineWeather 🌤️

Aplikasi prakiraan cuaca Indonesia yang modern dan interaktif menggunakan data resmi dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika). 

## 🚀 Teknologi yang Digunakan

### Frontend
- **React 19** dengan TypeScript
- **Vite** untuk build tool dan development
- **Tailwind CSS** untuk styling
- **Framer Motion** untuk animasi yang smooth
- **Recharts** untuk visualisasi data cuaca
- **Zustand** untuk state management
- **Radix UI** untuk komponen UI yang accessible

### Backend
- **Golang** dengan framework Gin
- **Prisma** sebagai ORM
- **PostgreSQL** database (Supabase)
- **Redis** untuk caching
- **Docker** untuk containerization

### API
- **BMKG API** - Data cuaca resmi Indonesia
- **RESTful API** dengan rate limiting
- **Real-time updates** setiap 3 jam

## ✨ Fitur Utama

### 🎨 UI/UX yang Menawan
- **Gradient background** yang berubah sesuai waktu
- **Glass morphism** design yang modern
- **Smooth animations** dengan Framer Motion
- **Responsive design** untuk semua perangkat
- **Dark/Light mode** support

### 🌍 Data Cuaca Lengkap
- Prakiraan cuaca untuk **seluruh kelurahan/desa di Indonesia**
- Data real-time setiap **3 jam** dalam **3 hari**
- **Suhu, kelembapan, angin, tutupan awan**
- **Jarak pandang** dan kondisi cuaca detail

### 📊 Visualisasi Data
- **Interactive charts** untuk tren cuaca
- **Line charts** untuk suhu dan kelembapan  
- **Area charts** untuk kecepatan angin
- **Bar charts** untuk tutupan awan
- **Real-time tooltips** dengan detail lengkap

### 🔍 Pencarian Cerdas
- **Auto-complete** lokasi
- **Fuzzy search** untuk nama daerah
- **Favorites system** untuk lokasi yang sering dilihat
- **Recent searches** history

### 🚨 Weather Alerts
- **Peringatan cuaca ekstrem** dari BMKG
- **Push notifications** untuk kondisi berbahaya
- **Severity levels**: Low, Medium, High, Critical
- **Real-time updates** status peringatan

### ⚡ Performance
- **Redis caching** untuk response yang cepat
- **Lazy loading** komponen
- **Optimistic updates** untuk UX yang smooth
- **Service worker** untuk offline support

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Go 1.22+
- PostgreSQL
- Redis (optional)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Backend Setup
```bash
cd backend

# Install Go dependencies
go mod download

# Generate Prisma client
go run github.com/steebchen/prisma-client-go generate

# Run database migrations
go run github.com/steebchen/prisma-client-go db push

# Start development server
go run main.go
```

### Environment Variables
Salin `.env.example` ke `.env` dan sesuaikan konfigurasi:

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

**Backend (.env)**  
```env
DATABASE_URL=postgresql://user:password@localhost:5432/eamagine_weather
REDIS_URL=redis://localhost:6379
BMKG_API_BASE_URL=https://api.bmkg.go.id/publik
```

## 📁 Struktur Proyek

```
eamagineweather/
├── backend/                 # Golang API server
│   ├── internal/
│   │   ├── config/         # Konfigurasi aplikasi
│   │   ├── database/       # Database connection
│   │   ├── handler/        # HTTP handlers
│   │   ├── middleware/     # Middlewares
│   │   ├── repository/     # Data access layer
│   │   ├── service/        # Business logic
│   │   └── models/         # Data models
│   ├── schema.prisma       # Database schema
│   └── main.go            # Entry point
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components  
│   │   ├── WeatherCard.tsx
│   │   ├── ForecastCard.tsx
│   │   ├── WeatherChart.tsx
│   │   └── SearchBar.tsx
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & API client
│   ├── stores/            # Zustand state stores
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions
└── public/                # Static assets
```

## 🌊 API Endpoints

### Weather
- `GET /api/v1/weather/current/:regionCode` - Cuaca saat ini
- `GET /api/v1/weather/forecast/:regionCode` - Prakiraan cuaca
- `GET /api/v1/weather/search?q=query` - Cari lokasi
- `POST /api/v1/weather/sync/:regionCode` - Sync data manual

### Regions
- `GET /api/v1/regions` - Daftar wilayah
- `GET /api/v1/regions/:code` - Detail wilayah
- `GET /api/v1/regions/popular` - Wilayah populer

### User (Auth required)
- `GET /api/v1/users/profile` - Profil user
- `PUT /api/v1/users/profile` - Update profil
- `GET /api/v1/users/favorites` - Lokasi favorit
- `POST /api/v1/users/favorites` - Tambah favorit
- `DELETE /api/v1/users/favorites/:regionId` - Hapus favorit

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (sky to ocean)
- **Secondary**: Purple accent
- **Background**: Time-based gradients
- **Glass**: Semi-transparent with backdrop blur

### Typography
- **Font**: Inter (system fallback)
- **Scale**: Fluid typography with responsive sizing
- **Weight**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Animations
- **Duration**: 200ms (micro), 500ms (normal), 800ms (complex)
- **Easing**: CSS cubic-bezier dan spring physics
- **Patterns**: Fade in, slide in, bounce, weather floating

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Fly.io)
```dockerfile
FROM golang:1.22-alpine
WORKDIR /app
COPY . .
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]
```

## 📱 Progressive Web App

- **Service Worker** untuk offline caching
- **Web App Manifest** untuk install prompt  
- **Push Notifications** untuk weather alerts
- **Background Sync** untuk data updates

## 🔧 Monitoring & Analytics

- **Health checks** endpoint
- **Prometheus metrics** untuk monitoring
- **Structured logging** dengan levels
- **Error tracking** dengan Sentry

## 🌟 Roadmap

- [ ] **Mobile app** dengan React Native
- [ ] **Weather maps** dengan layers
- [ ] **Historical data** dan trends
- [ ] **Weather widgets** untuk website
- [ ] **Voice commands** dengan Web Speech API
- [ ] **Machine learning** predictions
- [ ] **Social features** untuk sharing cuaca

## 📜 License

MIT License - bebas untuk digunakan dan dimodifikasi

## 🤝 Contributing

Kontribusi sangat diterima! Silakan buat issue atau pull request.

## 📞 Support

Untuk pertanyaan atau support, silakan buat issue di GitHub repository ini.

---

**Dibuat dengan ❤️ untuk Indonesia**
*Menggunakan data resmi BMKG*