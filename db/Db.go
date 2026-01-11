package Db

import (
	"fmt"
	"log"
	"os"

	"safetrain360/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("❌ Error loading .env file")
	}

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASS"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{DisableForeignKeyConstraintWhenMigrating: true})
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	// migrate
	if err := database.AutoMigrate(&models.User{}, &models.QuizQuestion{}, &models.QuizAttempt{}, &models.QuizAnswer{}, &models.ContactMessage{}, &models.Module{}); err != nil {
		log.Fatal("❌ AutoMigrate failed:", err)
	}

	DB = database
	log.Println("✅ GORM database initialized")
}
