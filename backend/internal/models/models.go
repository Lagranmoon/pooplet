package models

import (
	"errors"
	"time"
	"unicode"
)

type Role string

const (
	RoleAdmin Role = "admin"
	RoleUser  Role = "user"
)

type User struct {
	ID        string    `json:"id" gorm:"primaryKey;size:36"`
	Email     string    `json:"email" gorm:"uniqueIndex;size:255;not null"`
	Password  string    `json:"-" gorm:"size:255;not null"`
	Name      string    `json:"name" gorm:"size:255;not null"`
	Role      Role      `json:"role" gorm:"size:20;not null;default:'user'"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PoopLog struct {
	ID         string    `json:"id" gorm:"primaryKey;size:36"`
	UserID     string    `json:"user_id" gorm:"index;not null;size:36"`
	Timestamp  time.Time `json:"timestamp" gorm:"not null"`
	Difficulty string    `json:"difficulty" gorm:"size:20;not null"`
	Note       string    `json:"note" gorm:"type:text"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	User       User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type Difficulty string

const (
	DifficultyEasy     Difficulty = "easy"
	DifficultyNormal   Difficulty = "normal"
	DifficultyHard     Difficulty = "hard"
	DifficultyVeryHard Difficulty = "very_hard"
)

func (d Difficulty) IsValid() bool {
	switch d {
	case DifficultyEasy, DifficultyNormal, DifficultyHard, DifficultyVeryHard:
		return true
	}
	return false
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=10"`
	Name     string `json:"name" binding:"required,min=1,max=100"`
}

type CreateLogRequest struct {
	Timestamp  string `json:"timestamp" binding:"required"`
	Difficulty string `json:"difficulty" binding:"required"`
	Note       string `json:"note"`
}

type UpdateLogRequest struct {
	Timestamp  *string `json:"timestamp"`
	Difficulty *string `json:"difficulty"`
	Note       *string `json:"note"`
}

type TokenResponse struct {
	Token     string `json:"token"`
	ExpiresAt int64  `json:"expires_at"`
}

type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type LogResponse struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	Timestamp  time.Time `json:"timestamp"`
	Difficulty string    `json:"difficulty"`
	Note       string    `json:"note"`
	CreatedAt  time.Time `json:"created_at"`
}

type SystemConfig struct {
	Key      string `json:"key" gorm:"primaryKey;size:100"`
	Value    string `json:"value" gorm:"type:text;not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

const (
	ConfigRegistrationEnabled = "registration_enabled"
)

type UpdateUserRequest struct {
	Role *Role `json:"role"`
}

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=10"`
	Name     string `json:"name" binding:"required,min=1,max=100"`
	Role     Role   `json:"role" binding:"required,oneof=admin user"`
}

type UpdateSystemConfigRequest struct {
	Value string `json:"value" binding:"required"`
}

type UserListResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// ValidatePassword validates password strength requirements:
// - At least 10 characters long
// - Contains at least one uppercase letter
// - Contains at least one lowercase letter
// - Contains at least one digit
func ValidatePassword(password string) error {
	if len(password) < 10 {
		return errors.New("password must be at least 10 characters long")
	}

	var hasUpper, hasLower, hasDigit bool

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasDigit = true
		}
	}

	if !hasUpper {
		return errors.New("password must contain at least one uppercase letter")
	}
	if !hasLower {
		return errors.New("password must contain at least one lowercase letter")
	}
	if !hasDigit {
		return errors.New("password must contain at least one digit")
	}

	return nil
}
