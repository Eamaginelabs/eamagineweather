package handler

import (
	"net/http"
	"eamagine-weather-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type WeatherHandler struct {
	weatherService *service.WeatherService
}

func NewWeatherHandler(weatherService *service.WeatherService) *WeatherHandler {
	return &WeatherHandler{weatherService: weatherService}
}

func (h *WeatherHandler) GetCurrentWeather(c *gin.Context) {
	regionCode := c.Param("regionCode")
	
	weather, err := h.weatherService.GetCurrentWeather(c.Request.Context(), regionCode)
	if err != nil {
		// If region not found in database, try to fetch directly from BMKG API
		if weather, bmkgErr := h.weatherService.FetchWeatherDirectFromBMKG(c.Request.Context(), regionCode); bmkgErr == nil && weather != nil {
			c.JSON(http.StatusOK, weather)
			return
		}
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch weather data",
			"details": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, weather)
}

func (h *WeatherHandler) GetWeatherForecast(c *gin.Context) {
	regionCode := c.Param("regionCode")
	
	// TODO: Implement forecast logic
	c.JSON(http.StatusOK, gin.H{
		"regionCode": regionCode,
		"forecast": []interface{}{},
	})
}

func (h *WeatherHandler) SearchRegions(c *gin.Context) {
	query := c.Query("q")
	
	// TODO: Implement search logic
	c.JSON(http.StatusOK, gin.H{
		"query": query,
		"results": []interface{}{},
	})
}

func (h *WeatherHandler) SyncWeatherData(c *gin.Context) {
	regionCode := c.Param("regionCode")
	
	err := h.weatherService.SyncWeatherData(c.Request.Context(), regionCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to sync weather data",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Weather data synced successfully",
		"regionCode": regionCode,
	})
}