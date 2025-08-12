package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"eamagine-weather-backend/db"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type SimpleRegionsHandler struct {
	db    *db.PrismaClient
	redis *redis.Client
}

func NewSimpleRegionsHandler(database *db.PrismaClient, redisClient *redis.Client) *SimpleRegionsHandler {
	return &SimpleRegionsHandler{
		db:    database,
		redis: redisClient,
	}
}

// GET /api/regions/provinces - Get all provinces (with Redis caching)
func (h *SimpleRegionsHandler) GetProvinces(c *gin.Context) {
	cacheKey := "regions:provinces"
	ctx := c.Request.Context()

	// Try to get from Redis cache first
	if h.redis != nil {
		cached, err := h.redis.Get(ctx, cacheKey).Result()
		if err == nil {
			c.Header("X-Cache", "HIT")
			c.Header("Content-Type", "application/json")
			c.String(http.StatusOK, cached)
			return
		}
	}

	provinces, err := h.db.Region.FindMany(
		db.Region.Level.Equals(1),
		db.Region.IsActive.Equals(true),
	).OrderBy(db.Region.Name.Order(db.SortOrderAsc)).Exec(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch provinces",
			"details": err.Error(),
		})
		return
	}

	// Simple response structure
	result := make([]map[string]interface{}, len(provinces))
	for i, province := range provinces {
		result[i] = map[string]interface{}{
			"id":    province.ID,
			"code":  province.Code,
			"name":  province.Name,
			"level": province.Level,
		}
	}

	response := gin.H{
		"data":  result,
		"total": len(result),
	}

	// Cache the result for 24 hours (provinces rarely change)
	if h.redis != nil {
		if responseJson, err := json.Marshal(response); err == nil {
			h.redis.Set(ctx, cacheKey, responseJson, 24*time.Hour)
		}
	}

	c.Header("X-Cache", "MISS")
	c.JSON(http.StatusOK, response)
}

// GET /api/regions/regencies/:provinceCode - Get regencies by province
func (h *SimpleRegionsHandler) GetRegenciesByProvince(c *gin.Context) {
	provinceCode := c.Param("provinceCode")

	regencies, err := h.db.Region.FindMany(
		db.Region.Level.Equals(2),
		db.Region.ProvinceCode.Equals(provinceCode),
		db.Region.IsActive.Equals(true),
	).OrderBy(db.Region.Name.Order(db.SortOrderAsc)).Exec(c.Request.Context())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch regencies",
			"details": err.Error(),
		})
		return
	}

	result := make([]map[string]interface{}, len(regencies))
	for i, regency := range regencies {
		result[i] = map[string]interface{}{
			"id":           regency.ID,
			"code":         regency.Code,
			"name":         regency.Name,
			"level":        regency.Level,
			"provinceCode": provinceCode,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  result,
		"total": len(result),
	})
}

// GET /api/regions/villages/:regencyCode - Get villages with weather data by regency
func (h *SimpleRegionsHandler) GetVillagesByRegency(c *gin.Context) {
	regencyCode := c.Param("regencyCode")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 20
	}

	offset := (page - 1) * limit

	// Get villages with pagination
	villages, err := h.db.Region.FindMany(
		db.Region.Level.Equals(4),
		db.Region.RegencyCode.Equals(regencyCode),
		db.Region.HasWeatherData.Equals(true),
		db.Region.IsActive.Equals(true),
	).Skip(offset).
		Take(limit).
		OrderBy(db.Region.Name.Order(db.SortOrderAsc)).
		Exec(c.Request.Context())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch villages",
			"details": err.Error(),
		})
		return
	}

	// Get total count (simplified - in production you'd want to optimize this)
	allVillages, _ := h.db.Region.FindMany(
		db.Region.Level.Equals(4),
		db.Region.RegencyCode.Equals(regencyCode),
		db.Region.HasWeatherData.Equals(true),
		db.Region.IsActive.Equals(true),
	).Exec(c.Request.Context())
	totalCount := len(allVillages)

	result := make([]map[string]interface{}, len(villages))
	for i, village := range villages {
		result[i] = map[string]interface{}{
			"id":             village.ID,
			"code":           village.Code,
			"name":           village.Name,
			"level":          village.Level,
			"regencyCode":    regencyCode,
			"hasWeatherData": village.HasWeatherData,
		}
	}

	totalPages := (totalCount + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"data":       result,
		"total":      totalCount,
		"page":       page,
		"pageSize":   limit,
		"totalPages": totalPages,
	})
}

// GET /api/regions/search?q=malang&level=2 - Search regions
func (h *SimpleRegionsHandler) SearchRegions(c *gin.Context) {
	query := c.Query("q")
	level := c.Query("level")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Query parameter 'q' is required",
		})
		return
	}

	if limit < 1 || limit > 50 {
		limit = 20
	}

	// Build search conditions - case-insensitive search across all levels
	conditions := []db.RegionWhereParam{
		db.Region.IsActive.Equals(true),
	}

	// Use case-insensitive search by normalizing to title case
	queryTrimmed := strings.TrimSpace(query)
	queryTitle := strings.Title(strings.ToLower(queryTrimmed))
	
	// Search using title case since most Indonesian region names follow title case
	conditions = append(conditions, db.Region.Name.Contains(queryTitle))

	// Only filter by level if explicitly specified
	// This allows searching across all levels (provinces, regencies, districts, villages)
	if level != "" {
		if levelInt, err := strconv.Atoi(level); err == nil {
			conditions = append(conditions, db.Region.Level.Equals(levelInt))
		}
	}

	regions, err := h.db.Region.FindMany(conditions...).
		Take(limit).
		OrderBy(
			db.Region.HasWeatherData.Order(db.SortOrderDesc),
			db.Region.Level.Order(db.SortOrderDesc),
			db.Region.Name.Order(db.SortOrderAsc),
		).
		Exec(c.Request.Context())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to search regions",
			"details": err.Error(),
		})
		return
	}

	// Create a safe response structure to avoid Prisma method serialization
	type SimpleRegion struct {
		ID             string `json:"id"`
		Code           string `json:"code"`
		Name           string `json:"name"`
		Level          int    `json:"level"`
		ProvinceName   string `json:"provinceName"`
		RegencyName    string `json:"regencyName"`
		DistrictName   string `json:"districtName"`
		VillageName    string `json:"villageName"`
		DisplayName    string `json:"displayName"` // Full hierarchical name for display
		HasWeatherData bool   `json:"hasWeatherData"`
	}

	result := make([]SimpleRegion, len(regions))
	for i, region := range regions {
		// Get optional values using Prisma methods
		var provinceName, regencyName, districtName, villageName string
		
		if pName, ok := region.ProvinceName(); ok {
			provinceName = pName
		}
		if rName, ok := region.RegencyName(); ok {
			regencyName = rName
		}
		if dName, ok := region.DistrictName(); ok {
			districtName = dName
		}
		if vName, ok := region.VillageName(); ok {
			villageName = vName
		}
		
		// Build hierarchical display name based on level
		var displayName string
		switch region.Level {
		case 1: // Province
			displayName = region.Name
		case 2: // Regency/City
			if provinceName != "" {
				displayName = region.Name + ", " + provinceName
			} else {
				displayName = region.Name
			}
		case 3: // District
			if regencyName != "" && provinceName != "" {
				displayName = region.Name + ", " + regencyName + ", " + provinceName
			} else if provinceName != "" {
				displayName = region.Name + ", " + provinceName
			} else {
				displayName = region.Name
			}
		case 4: // Village
			if districtName != "" && regencyName != "" && provinceName != "" {
				displayName = region.Name + ", Kec. " + districtName + ", " + regencyName + ", " + provinceName
			} else if regencyName != "" && provinceName != "" {
				displayName = region.Name + ", " + regencyName + ", " + provinceName
			} else if provinceName != "" {
				displayName = region.Name + ", " + provinceName
			} else {
				displayName = region.Name
			}
		default:
			displayName = region.Name
		}
		
		result[i] = SimpleRegion{
			ID:             region.ID,
			Code:           region.Code,
			Name:           region.Name,
			Level:          region.Level,
			ProvinceName:   provinceName,
			RegencyName:    regencyName,
			DistrictName:   districtName,
			VillageName:    villageName,
			DisplayName:    displayName,
			HasWeatherData: region.HasWeatherData,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  result,
		"total": len(result),
	})
}
