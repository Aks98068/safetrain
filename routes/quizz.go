package routes

import (
	"net/http"
	"safetrain360/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ===== REGISTER QUIZ ROUTES =====
func RegisterQuizRoutes(router *gin.Engine, db *gorm.DB) {
	quiz := router.Group("/api/quiz")
	{
		quiz.GET("/:module", func(c *gin.Context) {
			module := c.Param("module")
			var questions []models.QuizQuestion
			if err := db.Where("module_id = ?", module).Find(&questions).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, questions)
		})

		quiz.POST("/submit", func(c *gin.Context) {
			var req struct {
				UserID   uint
				ModuleID string
				Score    int
				Total    int
				Answers  []struct {
					QuestionID uint
					Selected   string
					IsCorrect  bool
				}
			}

			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			percentage := (float64(req.Score) / float64(req.Total)) * 100
			result := "FAIL"
			if percentage >= 70 {
				result = "PASS"
			}

			attempt := models.QuizAttempt{
				UserID:         req.UserID,
				ModuleID:       req.ModuleID,
				Score:          req.Score,
				TotalQuestions: req.Total,
				Percentage:     percentage,
				Result:         result,
			}

			if err := db.Create(&attempt).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			// store answers
			for _, a := range req.Answers {
				answer := models.QuizAnswer{
					AttemptID:  attempt.ID,
					QuestionID: a.QuestionID,
					Selected:   a.Selected,
					IsCorrect:  a.IsCorrect,
				}
				db.Create(&answer)
			}

			c.JSON(http.StatusOK, gin.H{
				"message":    "Quiz submitted successfully",
				"percentage": percentage,
				"result":     result,
			})
		})
	}
}
