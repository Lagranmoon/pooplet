package services

import (
	"errors"
	"time"

	"github.com/Lagranmoon/pooplet/internal/models"
)

// MockService is a mock implementation of ServiceInterface for testing
type MockService struct {
	// Users
	users map[string]*models.User

	// Logs
	logs map[string][]models.PoopLog

	// Config
	configs map[string]string

	// Errors to return (keyed by operation)
	returnErrors map[string]error

	// Sequence counters
	userIDCounter int
	logIDCounter  int
}

func NewMockService() *MockService {
	return &MockService{
		users:        make(map[string]*models.User),
		logs:         make(map[string][]models.PoopLog),
		configs:      make(map[string]string),
		returnErrors: make(map[string]error),
	}
}

// Helper to generate sequential IDs
func (m *MockService) nextUserID() string {
	m.userIDCounter++
	return models.GenerateUUID()
}

func (m *MockService) nextLogID() string {
	m.logIDCounter++
	return models.GenerateUUID()
}

// SetError sets an error to return for a specific operation
func (m *MockService) SetError(operation string, err error) {
	m.returnErrors[operation] = err
}

// ClearErrors clears all mock errors
func (m *MockService) ClearErrors() {
	m.returnErrors = make(map[string]error)
}

func (m *MockService) getError(operation string) error {
	if err, ok := m.returnErrors[operation]; ok {
		return err
	}
	return nil
}

// AddUser adds a user to the mock service
func (m *MockService) AddUser(user *models.User) {
	m.users[user.ID] = user
	m.users[user.Email] = user // Also index by email
}

// AddLog adds a log to the mock service
func (m *MockService) AddLog(userID string, log *models.PoopLog) {
	m.logs[userID] = append(m.logs[userID], *log)
}

// SetConfig sets a config value
func (m *MockService) SetConfig(key, value string) {
	m.configs[key] = value
}

// Mock implementations

func (m *MockService) Register(req *models.RegisterRequest) (*models.User, string, int64, error) {
	if err := m.getError("Register"); err != nil {
		return nil, "", 0, err
	}

	// Check if user exists
	for _, user := range m.users {
		if user.Email == req.Email {
			return nil, "", 0, ErrUserAlreadyExists
		}
	}

	user := &models.User{
		ID:       m.nextUserID(),
		Email:    req.Email,
		Name:     req.Name,
		Role:     models.RoleUser,
		Password: "hashed_password",
	}

	m.AddUser(user)
	token, expiresAt, _ := models.GenerateToken(user)
	return user, token, expiresAt, nil
}

func (m *MockService) Login(req *models.LoginRequest) (*models.User, string, int64, error) {
	if err := m.getError("Login"); err != nil {
		return nil, "", 0, err
	}

	user, ok := m.users[req.Email]
	if !ok {
		return nil, "", 0, ErrInvalidCredential
	}

	token, expiresAt, _ := models.GenerateToken(user)
	return user, token, expiresAt, nil
}

func (m *MockService) GetUser(userID string) (*models.User, error) {
	if err := m.getError("GetUser"); err != nil {
		return nil, err
	}

	user, ok := m.users[userID]
	if !ok {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (m *MockService) CreateLog(userID string, req *models.CreateLogRequest) (*models.PoopLog, error) {
	if err := m.getError("CreateLog"); err != nil {
		return nil, err
	}

	timestamp, _ := time.Parse(time.RFC3339, req.Timestamp)
	log := &models.PoopLog{
		ID:         m.nextLogID(),
		UserID:     userID,
		Timestamp:  timestamp,
		Difficulty: req.Difficulty,
		Note:       req.Note,
	}

	m.AddLog(userID, log)
	return log, nil
}

func (m *MockService) GetLogs(userID string, startDate, endDate *time.Time) ([]models.PoopLog, error) {
	if err := m.getError("GetLogs"); err != nil {
		return nil, err
	}

	logs, ok := m.logs[userID]
	if !ok {
		return []models.PoopLog{}, nil
	}

	// Filter by date range
	if startDate != nil || endDate != nil {
		filtered := make([]models.PoopLog, 0)
		for _, log := range logs {
			if startDate != nil && log.Timestamp.Before(*startDate) {
				continue
			}
			if endDate != nil && log.Timestamp.After(*endDate) {
				continue
			}
			filtered = append(filtered, log)
		}
		return filtered, nil
	}

	return logs, nil
}

func (m *MockService) GetLog(logID, userID string) (*models.PoopLog, error) {
	if err := m.getError("GetLog"); err != nil {
		return nil, err
	}

	logs, ok := m.logs[userID]
	if !ok {
		return nil, ErrLogNotFound
	}

	for i := range logs {
		if logs[i].ID == logID {
			// Return a copy of the log
			log := logs[i]
			return &log, nil
		}
	}
	return nil, ErrLogNotFound
}

func (m *MockService) UpdateLog(logID, userID string, req *models.UpdateLogRequest) (*models.PoopLog, error) {
	if err := m.getError("UpdateLog"); err != nil {
		return nil, err
	}

	logs, ok := m.logs[userID]
	if !ok {
		return nil, ErrLogNotFound
	}

	for i := range logs {
		if logs[i].ID == logID {
			if req.Timestamp != nil {
				timestamp, _ := time.Parse(time.RFC3339, *req.Timestamp)
				logs[i].Timestamp = timestamp
			}
			if req.Difficulty != nil {
				logs[i].Difficulty = *req.Difficulty
			}
			if req.Note != nil {
				logs[i].Note = *req.Note
			}
			return &logs[i], nil
		}
	}
	return nil, ErrLogNotFound
}

func (m *MockService) DeleteLog(logID, userID string) error {
	if err := m.getError("DeleteLog"); err != nil {
		return err
	}

	logs, ok := m.logs[userID]
	if !ok {
		return ErrLogNotFound
	}

	for i := range logs {
		if logs[i].ID == logID {
			// Remove the log
			m.logs[userID] = append(logs[:i], logs[i+1:]...)
			return nil
		}
	}
	return ErrLogNotFound
}

func (m *MockService) GetAllUsers() ([]models.User, error) {
	if err := m.getError("GetAllUsers"); err != nil {
		return nil, err
	}

	users := make([]models.User, 0, len(m.users))
	for _, user := range m.users {
		// Only add users once (avoid duplicates from email index)
		if user.ID == user.Email || user.ID != "" {
			users = append(users, *user)
			break
		}
	}
	return users, nil
}

func (m *MockService) UpdateUserRole(userID string, role *models.Role) error {
	if err := m.getError("UpdateUserRole"); err != nil {
		return err
	}

	user, ok := m.users[userID]
	if !ok {
		return ErrUserNotFound
	}

	if role == nil {
		return errors.New("role is required")
	}

	user.Role = *role
	return nil
}

func (m *MockService) DeleteUser(userID string) error {
	if err := m.getError("DeleteUser"); err != nil {
		return err
	}

	if _, ok := m.users[userID]; !ok {
		return ErrUserNotFound
	}

	delete(m.users, userID)
	return nil
}

func (m *MockService) CreateUser(req *models.CreateUserRequest) (*models.User, string, int64, error) {
	if err := m.getError("CreateUser"); err != nil {
		return nil, "", 0, err
	}

	// Check if user exists
	for _, user := range m.users {
		if user.Email == req.Email {
			return nil, "", 0, errors.New("user already exists")
		}
	}

	user := &models.User{
		ID:       m.nextUserID(),
		Email:    req.Email,
		Name:     req.Name,
		Role:     req.Role,
		Password: "hashed_password",
	}

	m.AddUser(user)
	token, expiresAt, _ := models.GenerateToken(user)
	return user, token, expiresAt, nil
}

func (m *MockService) GetSystemConfig(key string) (string, error) {
	if err := m.getError("GetSystemConfig"); err != nil {
		return "", err
	}

	if value, ok := m.configs[key]; ok {
		return value, nil
	}

	// Return default for registration_enabled
	if key == models.ConfigRegistrationEnabled {
		return "true", nil
	}

	return "", errors.New("config not found")
}

func (m *MockService) SetSystemConfig(key, value string) error {
	if err := m.getError("SetSystemConfig"); err != nil {
		return err
	}

	m.configs[key] = value
	return nil
}
