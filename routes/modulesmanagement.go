package routes

import (
	"net/http"
	Db "safetrain360/db"
	"safetrain360/models"

	"github.com/gin-gonic/gin"
)

// Get all modules
func GetModules(c *gin.Context) {
	var modules []models.Module
	if err := Db.DB.Order("created_at DESC").Find(&modules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch modules"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"modules": modules})
}

// Create module
func CreateModule(c *gin.Context) {
	var input models.Module
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := Db.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create module"})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// Update module
func UpdateModule(c *gin.Context) {
	id := c.Param("id")
	var module models.Module

	if err := Db.DB.First(&module, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Module not found"})
		return
	}

	var input models.Module
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	Db.DB.Model(&module).Updates(input)
	c.JSON(http.StatusOK, module)
}

// Delete module
func DeleteModule(c *gin.Context) {
	id := c.Param("id")

	if err := Db.DB.Delete(&models.Module{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete module"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Module deleted successfully"})
}

// Add optional content
func AddModuleContent(c *gin.Context) {
	var input struct {
		ID          int    `json:"id" binding:"required"`
		ContentType string `json:"content_type"`
		ContentText string `json:"content_text"`
		Media       string `json:"media"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	module := models.Module{}
	if err := Db.DB.First(&module, input.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Module not found"})
		return
	}

	updates := map[string]interface{}{
		"content_type": input.ContentType,
		"content_text": input.ContentText,
		"media":        input.Media,
	}

	Db.DB.Model(&module).Updates(updates)
	c.JSON(http.StatusOK, module)
}
