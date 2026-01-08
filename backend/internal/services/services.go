package services

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"github.com/Lagranmoon/pooplet/internal/models"
	"github.com/Lagranmoon/pooplet/internal/repository"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrInvalidCredential = errors.New("invalid credentials")
	ErrLogNotFound       = errors.New("log not found")
)

type Service struct {
	repo repository.RepositoryInterface
}

func NewService(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

// NewServiceWithInterface creates a service with a repository interface
func NewServiceWithInterface(repo repository.RepositoryInterface) *Service {
	return &Service{repo: repo}
}

func (s *Service) Register(req *models.RegisterRequest) (*models.User, string, int64, error) {
	// Validate password strength
	if err := models.ValidatePassword(req.Password); err != nil {
		return nil, "", 0, err
	}

	existingUser, err := s.repo.GetUserByEmail(req.Email)
	if err == nil && existingUser != nil {
		return nil, "", 0, ErrUserAlreadyExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", 0, err
	}

	// Registration always creates regular users
	// Admins must be created by other admins through the CreateUser endpoint
	user := &models.User{
		ID:       models.GenerateUUID(),
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
		Role:     models.RoleUser,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, "", 0, err
	}

	token, expiresAt, err := models.GenerateToken(user)
	if err != nil {
		return nil, "", 0, err
	}

	return user, token, expiresAt, nil
}

func (s *Service) Login(req *models.LoginRequest) (*models.User, string, int64, error) {
	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, "", 0, ErrInvalidCredential
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, "", 0, ErrInvalidCredential
	}

	token, expiresAt, err := models.GenerateToken(user)
	if err != nil {
		return nil, "", 0, err
	}

	return user, token, expiresAt, nil
}

func (s *Service) GetUser(userID string) (*models.User, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *Service) GetUserByEmail(email string) (*models.User, error) {
	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *Service) CreateLog(userID string, req *models.CreateLogRequest) (*models.PoopLog, error) {
	timestamp, err := time.Parse(time.RFC3339, req.Timestamp)
	if err != nil {
		return nil, err
	}

	if !models.Difficulty(req.Difficulty).IsValid() {
		return nil, errors.New("invalid difficulty value")
	}

	log := &models.PoopLog{
		ID:         models.GenerateUUID(),
		UserID:     userID,
		Timestamp:  timestamp,
		Difficulty: req.Difficulty,
		Note:       req.Note,
	}

	if err := s.repo.CreateLog(log); err != nil {
		return nil, err
	}

	return log, nil
}

func (s *Service) GetLogs(userID string, startDate, endDate *time.Time) ([]models.PoopLog, error) {
	return s.repo.GetLogsByUserID(userID, startDate, endDate)
}

func (s *Service) GetLog(logID, userID string) (*models.PoopLog, error) {
	log, err := s.repo.GetLogByIDAndUserID(logID, userID)
	if err != nil {
		return nil, ErrLogNotFound
	}
	return log, nil
}

func (s *Service) UpdateLog(logID, userID string, req *models.UpdateLogRequest) (*models.PoopLog, error) {
	log, err := s.repo.GetLogByIDAndUserID(logID, userID)
	if err != nil {
		return nil, ErrLogNotFound
	}

	if req.Timestamp != nil {
		timestamp, err := time.Parse(time.RFC3339, *req.Timestamp)
		if err != nil {
			return nil, err
		}
		log.Timestamp = timestamp
	}

	if req.Difficulty != nil {
		if !models.Difficulty(*req.Difficulty).IsValid() {
			return nil, errors.New("invalid difficulty value")
		}
		log.Difficulty = *req.Difficulty
	}

	if req.Note != nil {
		log.Note = *req.Note
	}

	if err := s.repo.UpdateLog(log); err != nil {
		return nil, err
	}

	return log, nil
}

func (s *Service) DeleteLog(logID, userID string) error {
	err := s.repo.DeleteLog(logID, userID)
	if err == gorm.ErrRecordNotFound {
		return ErrLogNotFound
	}
	return err
}

func (s *Service) GetAllUsers() ([]models.User, error) {
	return s.repo.GetAllUsers()
}

func (s *Service) UpdateUserRole(userID string, role *models.Role) error {
	if role == nil {
		return errors.New("role is required")
	}

	// If trying to change role to user, check if this is the last admin
	if *role == models.RoleUser {
		currentRole, err := s.repo.GetUserRole(userID)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				return ErrUserNotFound
			}
			return err
		}

		// Only check if the user is currently an admin
		if currentRole == models.RoleAdmin {
			adminCount, err := s.repo.CountAdmins()
			if err != nil {
				return err
			}

			// Prevent downgrading the last admin
			if adminCount <= 1 {
				return errors.New("cannot downgrade the last admin to user")
			}
		}
	}

	err := s.repo.UpdateUserRole(userID, *role)
	if err == gorm.ErrRecordNotFound {
		return ErrUserNotFound
	}
	return err
}

func (s *Service) DeleteUser(userID string) error {
	err := s.repo.DeleteUser(userID)
	if err == gorm.ErrRecordNotFound {
		return ErrUserNotFound
	}
	return err
}

func (s *Service) CreateUser(req *models.CreateUserRequest) (*models.User, string, int64, error) {
	// Validate password strength
	if err := models.ValidatePassword(req.Password); err != nil {
		return nil, "", 0, err
	}

	// Check if user already exists
	_, err := s.repo.GetUserByEmail(req.Email)
	if err == nil {
		return nil, "", 0, errors.New("user already exists")
	}
	if err != gorm.ErrRecordNotFound {
		return nil, "", 0, err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", 0, err
	}

	// Generate ID and create user
	user := &models.User{
		ID:       models.GenerateUUID(),
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
		Role:     req.Role,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, "", 0, err
	}

	// Generate token
	token, expiresAt, err := models.GenerateToken(user)
	if err != nil {
		return nil, "", 0, err
	}

	return user, token, expiresAt, nil
}

func (s *Service) GetSystemConfig(key string) (string, error) {
	config, err := s.repo.GetSystemConfig(key)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Return default value for registration_enabled
			if key == models.ConfigRegistrationEnabled {
				return "true", nil
			}
		}
		return "", err
	}
	return config.Value, nil
}

func (s *Service) SetSystemConfig(key, value string) error {
	return s.repo.SetSystemConfig(key, value)
}

// CreateInitialAdmin creates an initial admin account if one doesn't already exist
// This should only be called during system startup
func (s *Service) CreateInitialAdmin(email, password, name string) error {
	// Check if any users already exist
	allUsers, err := s.repo.GetAllUsers()
	if err != nil {
		return err
	}

	// Only create initial admin if no users exist
	if len(allUsers) > 0 {
		return errors.New("users already exist, cannot create initial admin")
	}

	// Check if email is provided
	if email == "" {
		return errors.New("initial admin email is required")
	}

	// Check if user with this email already exists
	existingUser, err := s.repo.GetUserByEmail(email)
	if err == nil && existingUser != nil {
		return errors.New("user with this email already exists")
	}

	// Validate password strength
	if err := models.ValidatePassword(password); err != nil {
		return err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Create admin user
	user := &models.User{
		ID:       models.GenerateUUID(),
		Email:    email,
		Password: string(hashedPassword),
		Name:     name,
		Role:     models.RoleAdmin,
	}

	return s.repo.CreateUser(user)
}
