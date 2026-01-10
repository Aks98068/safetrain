package models

import "time"

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
