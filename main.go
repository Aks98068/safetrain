package main

import (
	"log"
	"net/http"
	Db "safetrain360/db"
	"safetrain360/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize DB
	Db.Init()

	r := gin.Default()

	// Disable cache
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Writer.Header().Set("Pragma", "no-cache")
		c.Writer.Header().Set("Expires", "0")
		c.Next()
	})

	// Static files & templates
	r.Static("/public", "./public")
	r.LoadHTMLGlob("templates/*")

	// Public landing page
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	// Logout route
	r.GET("/logout", func(c *gin.Context) {
		// Clear auth cookie
		c.SetCookie("auth_token", "", -1, "/", "", false, true)
		// Redirect to home page
		c.Redirect(http.StatusSeeOther, "/")
	})

	// Register all routes (login, dashboard, admin APIs, etc.)
	routes.Routes(r)
	// quizz
	routes.RegisterQuizRoutes(r, Db.DB)
	routes.RegisterContactRoutes(r, Db.DB)
	routes.RegisterAdminQuizRoutes(r, Db.DB)
	routes.RegisterAdminHazardRoutes(r, Db.DB)
	training := r.Group("/api/training")
	routes.TrainingHazardRoutes(training, Db.DB)

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
