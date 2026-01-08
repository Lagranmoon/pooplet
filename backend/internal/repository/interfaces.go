package repository

import (
	"time"

	"github.com/Lagranmoon/pooplet/internal/models"

	"gorm.io/gorm"
)

// RepositoryInterface defines the interface for repository operations
// This allows for mocking in tests
type RepositoryInterface interface {
	// User operations
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id string) (*models.User, error)
	GetUserRole(userID string) (models.Role, error)
	UpdateUserRole(userID string, role models.Role) error
	DeleteUser(userID string) error
	CountAdmins() (int64, error)
	GetAllUsers() ([]models.User, error)

	// Log operations
	CreateLog(log *models.PoopLog) error
	GetLogsByUserID(userID string, startTime, endTime *time.Time) ([]models.PoopLog, error)
	GetLogByID(id string) (*models.PoopLog, error)
	GetLogByIDAndUserID(id, userID string) (*models.PoopLog, error)
	UpdateLog(log *models.PoopLog) error
	DeleteLog(id, userID string) error

	// Config operations
	GetSystemConfig(key string) (*models.SystemConfig, error)
	SetSystemConfig(key, value string) error

	// Utility
	DB() *gorm.DB
}

// Ensure Repository implements RepositoryInterface
var _ RepositoryInterface = (*Repository)(nil)
