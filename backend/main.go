package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"eamagine-weather-backend/internal/config"
	"eamagine-weather-backend/internal/database"
	"eamagine-weather-backend/internal/handler"
	"eamagine-weather-backend/internal/middleware"
	"eamagine-weather-backend/internal/repository"
	"eamagine-weather-backend/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.NewConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Disconnect()

	// Initialize Redis
	redisClient := database.NewRedisClient(cfg.RedisURL)
	defer redisClient.Close()

	// Initialize repositories
	regionRepo := repository.NewRegionRepository(db.Client)
	weatherRepo := repository.NewWeatherRepository(db.Client)
	userRepo := repository.NewUserRepository(db.Client)

	// Initialize services
	bmkgService := service.NewBMKGService(cfg.BMKGAPIBaseURL, redisClient)
	weatherService := service.NewWeatherService(weatherRepo, regionRepo, bmkgService, redisClient)
	userService := service.NewUserService(userRepo)

	// Initialize handlers
	weatherHandler := handler.NewWeatherHandler(weatherService)
	userHandler := handler.NewUserHandler(userService)
	regionsHandler := handler.NewSimpleRegionsHandler(db.Client, redisClient)

	// Setup Gin
	if cfg.GinMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// CORS configuration - Allow all origins for development
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	router.Use(cors.New(corsConfig))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().Unix(),
			"service":   "eamagine-weather-api",
		})
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// Weather routes
		weather := api.Group("/weather")
		{
			weather.GET("/current/:regionCode", weatherHandler.GetCurrentWeather)
			weather.GET("/forecast/:regionCode", weatherHandler.GetWeatherForecast)
			weather.GET("/search", weatherHandler.SearchRegions)
			weather.POST("/sync/:regionCode", weatherHandler.SyncWeatherData)
		}

		// Region routes
		regions := api.Group("/regions")
		{
			regions.GET("/provinces", regionsHandler.GetProvinces)
			regions.GET("/regencies/:provinceCode", regionsHandler.GetRegenciesByProvince)
			regions.GET("/villages/:regencyCode", regionsHandler.GetVillagesByRegency)
			regions.GET("/search", regionsHandler.SearchRegions)
		}

		// User routes (protected)
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			users.GET("/profile", userHandler.GetProfile)
			users.PUT("/profile", userHandler.UpdateProfile)
			users.GET("/favorites", userHandler.GetFavorites)
			users.POST("/favorites", userHandler.AddFavorite)
			users.DELETE("/favorites/:regionId", userHandler.RemoveFavorite)
		}
	}

	// Start background services
	go weatherService.StartPeriodicSync(context.Background())

	// Setup server
	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Graceful shutdown with 10 second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}