package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"eamagineweather-backend/internal/models"

	"github.com/redis/go-redis/v9"
)

type BMKGService struct {
	baseURL     string
	httpClient  *http.Client
	redisClient *redis.Client
}

func NewBMKGService(baseURL string, redisClient *redis.Client) *BMKGService {
	return &BMKGService{
		baseURL:     baseURL,
		httpClient:  &http.Client{Timeout: 30 * time.Second},
		redisClient: redisClient,
	}
}

func (s *BMKGService) GetWeatherData(ctx context.Context, regionCode string) (*models.BMKGWeatherResponse, error) {
	// Check cache first
	if s.redisClient != nil {
		cacheKey := fmt.Sprintf("weather:%s", regionCode)
		cached, err := s.redisClient.Get(ctx, cacheKey).Result()
		if err == nil {
			var response models.BMKGWeatherResponse
			if err := json.Unmarshal([]byte(cached), &response); err == nil {
				return &response, nil
			}
		}
	}

	// Fetch from BMKG API
	url := fmt.Sprintf("%s/prakiraan-cuaca?adm4=%s", s.baseURL, regionCode)
	
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("User-Agent", "EamagineWeather/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("BMKG API returned status %d", resp.StatusCode)
	}

	var weatherResponse models.BMKGWeatherResponse
	if err := json.NewDecoder(resp.Body).Decode(&weatherResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Cache the response for 30 minutes
	if s.redisClient != nil {
		cacheKey := fmt.Sprintf("weather:%s", regionCode)
		if data, err := json.Marshal(weatherResponse); err == nil {
			s.redisClient.Set(ctx, cacheKey, data, 30*time.Minute)
		}
	}

	return &weatherResponse, nil
}

func (s *BMKGService) GetCurrentWeather(ctx context.Context, regionCode string) (*models.CurrentWeather, error) {
	weatherData, err := s.GetWeatherData(ctx, regionCode)
	if err != nil {
		return nil, err
	}

	if len(weatherData.Data) == 0 {
		return nil, fmt.Errorf("no weather data available for region %s", regionCode)
	}

	// Get the most recent data point
	current := weatherData.Data[0]
	
	utcTime, err := time.Parse("2006-01-02 15:04:05", current.UTCDatetime)
	if err != nil {
		return nil, fmt.Errorf("failed to parse UTC datetime: %w", err)
	}

	localTime, err := time.Parse("2006-01-02 15:04:05", current.LocalDatetime)
	if err != nil {
		return nil, fmt.Errorf("failed to parse local datetime: %w", err)
	}

	return &models.CurrentWeather{
		Temperature:   current.Temperature,
		Humidity:      current.Humidity,
		WeatherDesc:   current.WeatherDesc,
		WeatherDescEn: current.WeatherDescEn,
		WindSpeed:     current.WindSpeed,
		WindDirection: current.WindDirection,
		CloudCover:    current.CloudCover,
		Visibility:    current.Visibility,
		DateTime:      utcTime,
		LocalDateTime: localTime,
	}, nil
}

func (s *BMKGService) GetWeatherForecast(ctx context.Context, regionCode string) ([]models.ForecastWeather, error) {
	weatherData, err := s.GetWeatherData(ctx, regionCode)
	if err != nil {
		return nil, err
	}

	forecasts := make([]models.ForecastWeather, 0, len(weatherData.Data))
	
	for _, data := range weatherData.Data {
		utcTime, err := time.Parse("2006-01-02 15:04:05", data.UTCDatetime)
		if err != nil {
			continue // Skip invalid datetime
		}

		localTime, err := time.Parse("2006-01-02 15:04:05", data.LocalDatetime)
		if err != nil {
			continue // Skip invalid datetime
		}

		forecast := models.ForecastWeather{
			Temperature:   data.Temperature,
			Humidity:      data.Humidity,
			WeatherDesc:   data.WeatherDesc,
			WeatherDescEn: data.WeatherDescEn,
			WindSpeed:     data.WindSpeed,
			WindDirection: data.WindDirection,
			CloudCover:    data.CloudCover,
			Visibility:    data.Visibility,
			DateTime:      utcTime,
			LocalDateTime: localTime,
		}
		
		forecasts = append(forecasts, forecast)
	}

	return forecasts, nil
}