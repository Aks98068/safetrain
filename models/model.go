package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint   `gorm:"primaryKey"`
	FirstName string `gorm:"size:50"`
	LastName  string `gorm:"size:50"`
	Email     string `gorm:"unique"`
	Password  string `gorm:"column:password_hash"`
	Role      string `gorm:"type:enum('admin','supervisor','trainee')"`
	IsActive  bool   `gorm:"default:true"`
	CreatedAt time.Time
}

type QuizQuestion struct {
	ID            uint   `gorm:"primaryKey"`
	ModuleID      string `gorm:"size:50"`
	Question      string `gorm:"type:text"`
	OptionA       string
	OptionB       string
	OptionC       string
	OptionD       string
	CorrectOption string `gorm:"size:1"` // A, B, C, D
	Feedback      string
}

type QuizAttempt struct {
	ID             uint `gorm:"primaryKey"`
	UserID         uint
	ModuleID       string
	Score          int
	TotalQuestions int
	Percentage     float64
	Result         string // PASS / FAIL
	CreatedAt      time.Time
}

type QuizAnswer struct {
	ID         uint `gorm:"primaryKey"`
	AttemptID  uint
	QuestionID uint
	Selected   string `gorm:"size:1"`
	IsCorrect  bool
}

type ContactMessage struct {
	ID        uint           `gorm:"primaryKey"`
	Name      string         `gorm:"size:100;not null"`
	Email     string         `gorm:"size:100;not null"`
	Message   string         `gorm:"type:text;not null"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type Module struct {
	ID          int       `gorm:"primaryKey;column:id" json:"id"` // INT(11)
	Title       string    `gorm:"size:100;not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	Type        string    `gorm:"size:50" json:"type"`
	Image       string    `gorm:"size:255" json:"image,omitempty"`
	VideoURL    string    `gorm:"size:255" json:"video_url,omitempty"`
	ContentType string    `gorm:"column:content_type;type:varchar(50)" json:"content_type,omitempty"`
	ContentText string    `gorm:"column:content_text;type:text" json:"content_text,omitempty"`
	Media       string    `gorm:"column:media;type:varchar(255)" json:"media,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Module) TableName() string {
	return "modules" // Assuming one table "modules" with optional content columns
}
