package routes

import (
	"net/http"
	"time"

	Db "safetrain360/db"
	"safetrain360/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

var JwtSecret = []byte("2a7f9c3d8e1b4f6a9c0d7e5f2b1a8c4d") // move to .env later

// JWT Claims
type Claims struct {
	ID   uint
	Role string
	jwt.StandardClaims
}

// -------------------------
// Register all routes
// -------------------------
func Routes(r *gin.Engine) {
	// --- Public pages ---
	// ---------- PUBLIC ----------
	r.GET("/login", func(c *gin.Context) {
		if tokenStr, err := c.Cookie("auth_token"); err == nil && tokenStr != "" {
			claims := &Claims{}
			token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
				return JwtSecret, nil
			})
			if err == nil && token.Valid {
				redirectByRole(c, claims.Role)
				return
			}
		}
		c.HTML(http.StatusOK, "login.html", nil)
	})

	// --- Auth API ---
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", Register)
		auth.POST("/login", Login)
	}

	// --- Dashboard routes ---
	dashboard := r.Group("/dashboard")
	dashboard.Use(AuthMiddleware())
	{
		dashboard.GET("/admin", RoleMiddleware("admin"), func(c *gin.Context) {
			c.HTML(http.StatusOK, "dashboard_admin.html", gin.H{"title": "Admin Dashboard"})
		})

		dashboard.GET("/trainee", RoleMiddleware("trainee"), func(c *gin.Context) {
			c.HTML(http.StatusOK, "dashboard_trainee.html", gin.H{"title": "Trainee Dashboard"})
		})

		// Dashboard stats API

		dashboard.GET("/api/stats", DashboardStats)
	}

	trainee := r.Group("/api/trainee")
	trainee.Use(AuthMiddleware(), RoleMiddleware("trainee"))
	{
		trainee.GET("/module", func(c *gin.Context) {
			c.HTML(http.StatusOK, "modules.html", gin.H{"title": "Modules"})
		})
		trainee.GET("/quizz", func(c *gin.Context) { c.HTML(http.StatusOK, "quizzmodule.html", gin.H{"title": "quizzes"}) })
		trainee.GET("/hazard", func(c *gin.Context) { c.HTML(http.StatusOK, "hazardmodule.html", gin.H{"title": "hazards"}) })
		trainee.GET("/360scene", func(c *gin.Context) { c.HTML(http.StatusOK, "scene.html", gin.H{"title": "360 d scene"}) })
		trainee.GET("/scene", func(c *gin.Context) {
			c.HTML(http.StatusOK, "360scenemodule.html", gin.H{"title": "warehouse safety "})
		})
		trainee.GET("/forklift", func(c *gin.Context) { c.HTML(http.StatusOK, "hazard.html", gin.H{"title": "forklift"}) })
		trainee.GET("/handling", func(c *gin.Context) { c.HTML(http.StatusOK, "handling.html", gin.H{"title": "manual handling"}) })
		trainee.GET("/result", func(c *gin.Context) { c.HTML(http.StatusOK, "result.html", gin.H{"title": "result"}) })

	}

	// --- Admin User Management ---
	admin := r.Group("/api/admin")
	admin.Use(AuthMiddleware(), RoleMiddleware("admin"))
	{
		admin.GET("/users", GetUsers)
		admin.POST("/users", CreateUser)
		admin.PUT("/users/:id", UpdateUser)
		admin.DELETE("/users/:id", DeactivateUser)
		admin.GET("/modules", GetModules)
		admin.POST("/modules", CreateModule)
		admin.PUT("/modules/:id", UpdateModule)
		admin.DELETE("/modules/:id", DeleteModule)

	}

}

// / -------------------------
// Register (FIXED)
// -------------------------
func Register(c *gin.Context) {
	var input struct {
		FirstName string `form:"first_name" json:"first_name"`
		LastName  string `form:"last_name" json:"last_name"`
		Email     string `form:"email" json:"email"`
		Password  string `form:"password" json:"password"`
		Role      string `form:"role" json:"role"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	var exists models.User
	if err := Db.DB.Where("email = ?", input.Email).First(&exists).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Email already exists"})
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	user := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Password:  string(hash),
		Role:      input.Role,
		IsActive:  true,
	}

	if err := Db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Registration failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful"})
}

// -------------------------
// Login (FIXED)
// -------------------------
func Login(c *gin.Context) {
	var input struct {
		Email    string `form:"email" json:"email"`
		Password string `form:"password" json:"password"`
		Role     string `form:"role" json:"role"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	var user models.User
	if err := Db.DB.Where("email = ? AND role = ? AND is_active = 1", input.Email, input.Role).
		First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}

	exp := time.Now().Add(2 * time.Hour)
	claims := &Claims{
		ID:   user.ID,
		Role: user.Role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: exp.Unix(),
		},
	}

	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(JwtSecret)
	c.SetCookie("auth_token", token, 7200, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"role":    user.Role,
	})
}

// -------------------------
// Middleware
// -------------------------
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr, err := c.Cookie("auth_token")
		if err != nil {
			c.Redirect(http.StatusSeeOther, "/login")
			c.Abort()
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return JwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.Redirect(http.StatusSeeOther, "/login")
			c.Abort()
			return
		}

		c.Set("userID", claims.ID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func RoleMiddleware(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetString("role") != role {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Next()
	}
}

// -------------------------
// Helpers
// -------------------------
func redirectByRole(c *gin.Context, role string) {
	switch role {
	case "admin":
		c.Redirect(http.StatusSeeOther, "/dashboard/admin")
	case "trainee":
		c.Redirect(http.StatusSeeOther, "/dashboard/trainee")
	default:
		c.Redirect(http.StatusSeeOther, "/login")
	}
}
