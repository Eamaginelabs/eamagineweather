package service

import (
	"context"
	"log"
	"time"

	"eamagine-weather-backend/internal/repository"
	"github.com/redis/go-redis/v9"
)

type WeatherService struct {
	weatherRepo *repository.WeatherRepository
	regionRepo  *repository.RegionRepository
	bmkgService *BMKGService
	redis       *redis.Client
}

func NewWeatherService(
	weatherRepo *repository.WeatherRepository,
	regionRepo *repository.RegionRepository,
	bmkgService *BMKGService,
	redisClient *redis.Client,
) *WeatherService {
	return &WeatherService{
		weatherRepo: weatherRepo,
		regionRepo:  regionRepo,
		bmkgService: bmkgService,
		redis:       redisClient,
	}
}

func (s *WeatherService) StartPeriodicSync(ctx context.Context) {
	ticker := time.NewTicker(3 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			log.Println("Starting periodic weather data sync...")
			// TODO: Implement periodic sync logic
		}
	}
}

func (s *WeatherService) GetCurrentWeather(ctx context.Context, regionCode string) (interface{}, error) {
	// Try cache first
	cacheKey := "weather:" + regionCode
	cached := s.redis.Get(ctx, cacheKey)
	if cached.Err() == nil {
		// Return cached data - TODO: implement proper caching
	}

	// Check if region exists in database
	region, err := s.regionRepo.FindByCode(ctx, regionCode)
	if err != nil || region == nil {
		// Region not in database - try direct BMKG API call
		return s.bmkgService.GetWeatherData(ctx, regionCode)
	}

	// Region exists in database - fetch weather from BMKG API
	return s.bmkgService.GetWeatherData(ctx, regionCode)
}

func (s *WeatherService) FetchWeatherDirectFromBMKG(ctx context.Context, regionCode string) (interface{}, error) {
	// Call BMKG API directly for regions not in our database
	return s.bmkgService.GetWeatherData(ctx, regionCode)
}

func (s *WeatherService) SyncWeatherData(ctx context.Context, regionCode string) error {
	// TODO: Implement sync logic
	return nil
}