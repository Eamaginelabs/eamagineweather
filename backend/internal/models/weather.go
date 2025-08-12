package models

import (
	"time"
)

// BMKGWeatherResponse represents the response from BMKG API
type BMKGWeatherResponse struct {
	Data []BMKGWeatherData `json:"data"`
}

// BMKGWeatherData represents individual weather data point from BMKG
type BMKGWeatherData struct {
	UTCDatetime    string  `json:"utc_datetime"`
	LocalDatetime  string  `json:"local_datetime"`
	Temperature    float64 `json:"t"`
	Humidity       int     `json:"hu"`
	WeatherDesc    string  `json:"weather_desc"`
	WeatherDescEn  string  `json:"weather_desc_en"`
	WindSpeed      float64 `json:"ws"`
	WindDirection  string  `json:"wd"`
	CloudCover     int     `json:"tcc"`
	Visibility     string  `json:"vs_text"`
	AnalysisDate   string  `json:"analysis_date"`
}

// WeatherResponse represents the API response for weather data
type WeatherResponse struct {
	Current  *CurrentWeather    `json:"current,omitempty"`
	Forecast []ForecastWeather  `json:"forecast,omitempty"`
	Region   RegionInfo         `json:"region"`
}

// CurrentWeather represents current weather conditions
type CurrentWeather struct {
	Temperature   float64 `json:"temperature"`
	Humidity      int     `json:"humidity"`
	WeatherDesc   string  `json:"weather_desc"`
	WeatherDescEn string  `json:"weather_desc_en"`
	WindSpeed     float64 `json:"wind_speed"`
	WindDirection string  `json:"wind_direction"`
	CloudCover    int     `json:"cloud_cover"`
	Visibility    string  `json:"visibility"`
	DateTime      time.Time `json:"datetime"`
	LocalDateTime time.Time `json:"local_datetime"`
}

// ForecastWeather represents forecast weather data
type ForecastWeather struct {
	Temperature   float64   `json:"temperature"`
	Humidity      int       `json:"humidity"`
	WeatherDesc   string    `json:"weather_desc"`
	WeatherDescEn string    `json:"weather_desc_en"`
	WindSpeed     float64   `json:"wind_speed"`
	WindDirection string    `json:"wind_direction"`
	CloudCover    int       `json:"cloud_cover"`
	Visibility    string    `json:"visibility"`
	DateTime      time.Time `json:"datetime"`
	LocalDateTime time.Time `json:"local_datetime"`
}

// RegionInfo represents region information
type RegionInfo struct {
	Code      string   `json:"code"`
	Name      string   `json:"name"`
	Province  string   `json:"province"`
	Regency   string   `json:"regency"`
	District  string   `json:"district"`
	Village   string   `json:"village"`
	Latitude  *float64 `json:"latitude,omitempty"`
	Longitude *float64 `json:"longitude,omitempty"`
}

// SearchRegionResponse represents search results for regions
type SearchRegionResponse struct {
	Regions []RegionInfo `json:"regions"`
	Total   int          `json:"total"`
}

// WeatherAlert represents weather alert information
type WeatherAlert struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Severity    string    `json:"severity"`
	Region      string    `json:"region,omitempty"`
	StartTime   time.Time `json:"start_time"`
	EndTime     *time.Time `json:"end_time,omitempty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

// UserFavorite represents user's favorite region
type UserFavorite struct {
	ID        string     `json:"id"`
	RegionID  string     `json:"region_id"`
	Region    RegionInfo `json:"region"`
	Order     int        `json:"order"`
	CreatedAt time.Time  `json:"created_at"`
}