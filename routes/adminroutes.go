package routes

import (
	"net/http"
	"time"

	Db "safetrain360/db"
	"safetrain360/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func DashboardStats(c *gin.Context) {
	var totalUsers int64
	var supervisors int64
	var trainees int64
	var pending int64

	Db.DB.Model(&models.User{}).Count(&totalUsers)
	Db.DB.Model(&models.User{}).Where("role = ?", "supervisor").Count(&supervisors)
	Db.DB.Model(&models.User{}).Where("role = ?", "trainee").Count(&trainees)
	Db.DB.Model(&models.User{}).Where("is_active = ?", false).Count(&pending)

	c.JSON(http.StatusOK, gin.H{
		"totalUsers":       totalUsers,
		"supervisors":      supervisors,
		"trainees":         trainees,
		"pendingApprovals": pending,
	})
}

func GetUsers(c *gin.Context) {
	var users []models.User
	if err := Db.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context) {
	var input struct {
		FirstName string `json:"first_name" binding:"required"`
		LastName  string `json:"last_name" binding:"required"`
		Email     string `json:"email" binding:"required,email"`
		Password  string `json:"password" binding:"required"`
		Role      string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Password:  string(hashedPassword),
		Role:      input.Role,
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	if err := Db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists or invalid data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User created successfully", "user": user})
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := Db.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var input struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Password  string `json:"password"` // optional
		Role      string `json:"role"`
		IsActive  *bool  `json:"is_active"` // optional
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.FirstName != "" {
		user.FirstName = input.FirstName
	}
	if input.LastName != "" {
		user.LastName = input.LastName
	}
	if input.Email != "" {
		user.Email = input.Email
	}
	if input.Role != "" {
		user.Role = input.Role
	}
	if input.Password != "" {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		user.Password = string(hashedPassword)
	}
	if input.IsActive != nil {
		user.IsActive = *input.IsActive
	}

	if err := Db.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "user": user})
}

func DeactivateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := Db.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.IsActive = false
	if err := Db.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deactivate user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deactivated successfully"})
}
