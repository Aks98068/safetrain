package routes

import (
	"net/http"
	"safetrain360/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterContactRoutes sets up the route
func RegisterContactRoutes(r *gin.Engine, db *gorm.DB) {
	r.POST("/contact", func(c *gin.Context) {
		var input struct {
			Name    string `form:"name" binding:"required"`
			Email   string `form:"email" binding:"required,email"`
			Message string `form:"message" binding:"required"`
		}

		if err := c.ShouldBind(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		contact := models.ContactMessage{
			Name:    input.Name,
			Email:   input.Email,
			Message: input.Message,
		}

		if err := db.Create(&contact).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message"})
			return
		}

		// Redirect to home page with success alert
		c.Redirect(http.StatusSeeOther, "/?success=1")
	})
}
