package repository

import (
	"fmt"
	"log"
	"time"

	"github.com/Lagranmoon/pooplet/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(databaseURL string) (*Repository, error) {
	log.Printf("Connecting to database with URL: %s", databaseURL)

	dialector := postgres.Open(databaseURL)
	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Create tables if they don't exist
	migrator := db.Migrator()

	// Create users table
	if !migrator.HasTable(&models.User{}) {
		if err := migrator.CreateTable(&models.User{}); err != nil {
			return nil, fmt.Errorf("failed to create users table: %w", err)
		}
		log.Printf("Created users table")
	} else {
		// Ensure role column exists (for backward compatibility)
		if !migrator.HasColumn(&models.User{}, "role") {
			if err := migrator.AddColumn(&models.User{}, "role"); err != nil {
				log.Printf("Warning: failed to add role column: %v", err)
			}
		}
	}

	// Create poop_logs table
	if !migrator.HasTable(&models.PoopLog{}) {
		if err := migrator.CreateTable(&models.PoopLog{}); err != nil {
			return nil, fmt.Errorf("failed to create poop_logs table: %w", err)
		}
		log.Printf("Created poop_logs table")
	}

	// Create system_configs table
	if !migrator.HasTable(&models.SystemConfig{}) {
		if err := migrator.CreateTable(&models.SystemConfig{}); err != nil {
			return nil, fmt.Errorf("failed to create system_configs table: %w", err)
		}
		log.Printf("Created system_configs table")
	}

	log.Printf("Database connected successfully")

	return &Repository{db: db}, nil
}

func (r *Repository) Close() error {
	sqlDB, err := r.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func (r *Repository) DB() *gorm.DB {
	return r.db
}

func (r *Repository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *Repository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) GetUserByID(id string) (*models.User, error) {
	var user models.User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) CreateLog(log *models.PoopLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) GetLogsByUserID(userID string, startTime, endTime *time.Time) ([]models.PoopLog, error) {
	var logs []models.PoopLog

	query := r.db.Where("user_id = ?", userID)
	if startTime != nil {
		query = query.Where("timestamp >= ?", *startTime)
	}
	if endTime != nil {
		query = query.Where("timestamp <= ?", *endTime)
	}

	err := query.Order("timestamp DESC").Find(&logs).Error
	return logs, err
}

func (r *Repository) GetLogByID(id string) (*models.PoopLog, error) {
	var log models.PoopLog
	err := r.db.Where("id = ?", id).First(&log).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}

func (r *Repository) GetLogByIDAndUserID(id, userID string) (*models.PoopLog, error) {
	var log models.PoopLog
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&log).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}

func (r *Repository) UpdateLog(log *models.PoopLog) error {
	return r.db.Save(log).Error
}

func (r *Repository) DeleteLog(id, userID string) error {
	result := r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.PoopLog{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *Repository) GetAllUsers() ([]models.User, error) {
	var users []models.User
	err := r.db.Order("created_at DESC").Find(&users).Error
	return users, err
}

func (r *Repository) UpdateUserRole(userID string, role models.Role) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("role", role).Error
}

func (r *Repository) DeleteUser(userID string) error {
	// First, delete all logs associated with this user
	if err := r.db.Where("user_id = ?", userID).Delete(&models.PoopLog{}).Error; err != nil {
		return err
	}

	// Then, delete the user
	result := r.db.Where("id = ?", userID).Delete(&models.User{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *Repository) GetSystemConfig(key string) (*models.SystemConfig, error) {
	var config models.SystemConfig
	err := r.db.Where("key = ?", key).First(&config).Error
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func (r *Repository) SetSystemConfig(key, value string) error {
	config := &models.SystemConfig{
		Key:   key,
		Value: value,
	}
	return r.db.Save(config).Error
}

func (r *Repository) CountAdmins() (int64, error) {
	var count int64
	err := r.db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count).Error
	return count, err
}

func (r *Repository) GetUserRole(userID string) (models.Role, error) {
	var user models.User
	err := r.db.Where("id = ?", userID).Select("role").First(&user).Error
	if err != nil {
		return "", err
	}
	return user.Role, nil
}
