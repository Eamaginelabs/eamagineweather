package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL      string
	RedisURL         string
	Port             string
	GinMode          string
	BMKGAPIBaseURL   string
	BMKGAPIRateLimit int
	JWTSecret        string
	AllowedOrigins   []string
	SupabaseURL      string
	SupabaseAnonKey  string
	SupabaseServiceKey string
}

func Load() *Config {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config := &Config{
		DatabaseURL:      getEnv("DATABASE_URL", "postgresql://localhost:5432/eamagine_weather?sslmode=disable"),
		RedisURL:         getEnv("REDIS_URL", "redis://localhost:6379"),
		Port:             getEnv("PORT", "8080"),
		GinMode:          getEnv("GIN_MODE", "debug"),
		BMKGAPIBaseURL:   getEnv("BMKG_API_BASE_URL", "https://api.bmkg.go.id/publik"),
		BMKGAPIRateLimit: 60,
		JWTSecret:        getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		SupabaseURL:      getEnv("SUPABASE_URL", ""),
		SupabaseAnonKey:  getEnv("SUPABASE_ANON_KEY", ""),
		SupabaseServiceKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
	}

	// Parse allowed origins
	allowedOriginsStr := getEnv("ALLOWED_ORIGINS", "")
	if allowedOriginsStr != "" {
		config.AllowedOrigins = strings.Split(allowedOriginsStr, ",")
	} else {
		config.AllowedOrigins = []string{} // Empty means allow all origins in main.go
	}

	return config
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}