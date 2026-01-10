package routes

import (
	"net/http"

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

// -------------------------
// Admin User Management
// -------------------------
func GetUsers(c *gin.Context) {
	var users []models.User
	if err := Db.DB.Order("id desc").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": users})
}

func CreateUser(c *gin.Context) {
	var input struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Role      string `json:"role"`
		Password  string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	user := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Role:      input.Role,
		Password:  string(hashedPassword),
	}

	if err := Db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
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
		Role      string `json:"role"`
		Password  string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if input.Password != "" {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		user.Password = string(hashedPassword)
	}

	user.FirstName = input.FirstName
	user.LastName = input.LastName
	user.Email = input.Email
	user.Role = input.Role

	Db.DB.Save(&user)
	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func DeactivateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := Db.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	Db.DB.Save(&user)
	c.JSON(http.StatusOK, gin.H{"message": "User deactivated successfully"})
}
