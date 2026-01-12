package routes

import (
	"safetrain360/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterAdminHazardRoutes(router *gin.Engine, db *gorm.DB) {
	admin := router.Group("/api/admin/hazard-modules")
	{
		// Fetch all hazard modules
		admin.GET("/", func(c *gin.Context) {
			var modules []models.HazardPerceptionModule
			if err := db.Preload("Hazards").Find(&modules).Error; err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, gin.H{"modules": modules})
		})

		// Create new hazard module
		admin.POST("/", func(c *gin.Context) {
			var req struct {
				Title       string          `json:"title"`
				Description string          `json:"description"`
				SceneImage  string          `json:"scene_image"`
				Hazards     []models.Hazard `json:"hazards"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			module := models.HazardPerceptionModule{
				Title:       req.Title,
				Description: req.Description,
				SceneImage:  req.SceneImage,
				Hazards:     req.Hazards,
			}

			if err := db.Create(&module).Error; err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			c.JSON(201, gin.H{"message": "Hazard module created successfully"})
		})

		// Update hazard module
		admin.PUT("/:id", func(c *gin.Context) {
			id := c.Param("id")
			var module models.HazardPerceptionModule
			if err := db.Preload("Hazards").First(&module, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Module not found"})
				return
			}

			var req struct {
				Title       string          `json:"title"`
				Description string          `json:"description"`
				SceneImage  string          `json:"scene_image"`
				Hazards     []models.Hazard `json:"hazards"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			module.Title = req.Title
			module.Description = req.Description
			module.SceneImage = req.SceneImage

			// Replace hazards
			db.Where("module_id = ?", module.ID).Delete(&models.Hazard{})
			module.Hazards = req.Hazards

			if err := db.Save(&module).Error; err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, gin.H{"message": "Hazard module updated successfully"})
		})

		// Delete hazard module
		admin.DELETE("/:id", func(c *gin.Context) {
			id := c.Param("id")
			if err := db.Delete(&models.HazardPerceptionModule{}, id).Error; err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			// Delete associated hazards
			db.Where("module_id = ?", id).Delete(&models.Hazard{})
			c.JSON(200, gin.H{"message": "Hazard module deleted successfully"})
		})
	}
}
