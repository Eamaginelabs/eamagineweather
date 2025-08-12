package handler

import (
	"net/http"
	"eamagineweather-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	// TODO: Extract user ID from JWT token
	userID := "dummy-user-id"
	
	profile, err := h.userService.GetProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch profile",
		})
		return
	}
	
	c.JSON(http.StatusOK, profile)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := "dummy-user-id"
	
	var updateData interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request data",
		})
		return
	}
	
	err := h.userService.UpdateProfile(c.Request.Context(), userID, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update profile",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
	})
}

func (h *UserHandler) GetFavorites(c *gin.Context) {
	userID := "dummy-user-id"
	
	favorites, err := h.userService.GetFavorites(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch favorites",
		})
		return
	}
	
	c.JSON(http.StatusOK, favorites)
}

func (h *UserHandler) AddFavorite(c *gin.Context) {
	userID := "dummy-user-id"
	
	var request struct {
		RegionID string `json:"regionId" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request data",
		})
		return
	}
	
	err := h.userService.AddFavorite(c.Request.Context(), userID, request.RegionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to add favorite",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Favorite added successfully",
	})
}

func (h *UserHandler) RemoveFavorite(c *gin.Context) {
	userID := "dummy-user-id"
	regionID := c.Param("regionId")
	
	err := h.userService.RemoveFavorite(c.Request.Context(), userID, regionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to remove favorite",
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Favorite removed successfully",
	})
}