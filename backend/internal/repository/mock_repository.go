package repository

import (
	"time"

	"github.com/Lagranmoon/pooplet/internal/models"

	"gorm.io/gorm"
)

// MockRepository is a mock implementation of RepositoryInterface for testing
type MockRepository struct {
	users        map[string]*models.User
	logs         map[string][]models.PoopLog
	configs      map[string]*models.SystemConfig
	userIDCounter int
	logIDCounter  int
	returnErrors map[string]error
}

func NewMockRepository() *MockRepository {
	return &MockRepository{
		users:   make(map[string]*models.User),
		logs:    make(map[string][]models.PoopLog),
		configs: make(map[string]*models.SystemConfig),
		returnErrors: make(map[string]error),
	}
}

func (r *MockRepository) nextUserID() string {
	r.userIDCounter++
	// 使用计数器生成唯一 ID，确保在快速测试中不会冲突
	return "test-user-" + string(rune('a'+r.userIDCounter%26))
}

func (r *MockRepository) nextLogID() string {
	r.logIDCounter++
	return models.GenerateUUID()
}

func (r *MockRepository) SetError(operation string, err error) {
	r.returnErrors[operation] = err
}

func (r *MockRepository) ClearErrors() {
	r.returnErrors = make(map[string]error)
}

func (r *MockRepository) getError(operation string) error {
	if err, ok := r.returnErrors[operation]; ok {
		return err
	}
	return nil
}

// User operations

func (r *MockRepository) CreateUser(user *models.User) error {
	if err := r.getError("CreateUser"); err != nil {
		return err
	}
	if user.ID == "" {
		user.ID = r.nextUserID()
	}
	// 只存储一次，使用 ID 作为键
	// Email 查找通过遍历实现
	r.users[user.ID] = user
	return nil
}

func (r *MockRepository) GetUserByEmail(email string) (*models.User, error) {
	if err := r.getError("GetUserByEmail"); err != nil {
		return nil, err
	}
	// 遍历 map 查找匹配的 Email
	for _, user := range r.users {
		if user.Email == email {
			return user, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (r *MockRepository) GetUserByID(id string) (*models.User, error) {
	if err := r.getError("GetUserByID"); err != nil {
		return nil, err
	}
	if user, ok := r.users[id]; ok {
		return user, nil
	}
	return nil, gorm.ErrRecordNotFound
}

func (r *MockRepository) GetUserRole(userID string) (models.Role, error) {
	if err := r.getError("GetUserRole"); err != nil {
		return "", err
	}
	if user, ok := r.users[userID]; ok {
		return user.Role, nil
	}
	return "", gorm.ErrRecordNotFound
}

func (r *MockRepository) UpdateUserRole(userID string, role models.Role) error {
	if err := r.getError("UpdateUserRole"); err != nil {
		return err
	}
	if user, ok := r.users[userID]; ok {
		user.Role = role
		return nil
	}
	return gorm.ErrRecordNotFound
}

func (r *MockRepository) DeleteUser(userID string) error {
	if err := r.getError("DeleteUser"); err != nil {
		return err
	}
	if _, ok := r.users[userID]; ok {
		delete(r.users, userID)
		// Delete user's logs
		delete(r.logs, userID)
		return nil
	}
	return gorm.ErrRecordNotFound
}

func (r *MockRepository) CountAdmins() (int64, error) {
	if err := r.getError("CountAdmins"); err != nil {
		return 0, err
	}
	count := int64(0)
	seen := make(map[string]bool)
	for _, user := range r.users {
		if !seen[user.ID] {
			if user.Role == models.RoleAdmin {
				count++
			}
			seen[user.ID] = true
		}
	}
	return count, nil
}

func (r *MockRepository) GetAllUsers() ([]models.User, error) {
	if err := r.getError("GetAllUsers"); err != nil {
		return nil, err
	}
	users := make([]models.User, 0)
	seen := make(map[string]bool)
	for _, user := range r.users {
		if !seen[user.ID] {
			users = append(users, *user)
			seen[user.ID] = true
		}
	}
	return users, nil
}

// Log operations

func (r *MockRepository) CreateLog(log *models.PoopLog) error {
	if err := r.getError("CreateLog"); err != nil {
		return err
	}
	if log.ID == "" {
		log.ID = r.nextLogID()
	}
	r.logs[log.UserID] = append(r.logs[log.UserID], *log)
	return nil
}

func (r *MockRepository) GetLogsByUserID(userID string, startTime, endTime *time.Time) ([]models.PoopLog, error) {
	if err := r.getError("GetLogsByUserID"); err != nil {
		return nil, err
	}
	logs, ok := r.logs[userID]
	if !ok {
		return []models.PoopLog{}, nil
	}

	if startTime == nil && endTime == nil {
		return logs, nil
	}

	filtered := make([]models.PoopLog, 0)
	for _, log := range logs {
		if startTime != nil && log.Timestamp.Before(*startTime) {
			continue
		}
		if endTime != nil && log.Timestamp.After(*endTime) {
			continue
		}
		filtered = append(filtered, log)
	}
	return filtered, nil
}

func (r *MockRepository) GetLogByID(id string) (*models.PoopLog, error) {
	if err := r.getError("GetLogByID"); err != nil {
		return nil, err
	}
	for _, logs := range r.logs {
		for i := range logs {
			if logs[i].ID == id {
				return &logs[i], nil
			}
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (r *MockRepository) GetLogByIDAndUserID(id, userID string) (*models.PoopLog, error) {
	if err := r.getError("GetLogByIDAndUserID"); err != nil {
		return nil, err
	}
	logs, ok := r.logs[userID]
	if !ok {
		return nil, gorm.ErrRecordNotFound
	}
	for i := range logs {
		if logs[i].ID == id {
			return &logs[i], nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (r *MockRepository) UpdateLog(log *models.PoopLog) error {
	if err := r.getError("UpdateLog"); err != nil {
		return err
	}
	logs, ok := r.logs[log.UserID]
	if !ok {
		return gorm.ErrRecordNotFound
	}
	for i := range logs {
		if logs[i].ID == log.ID {
			logs[i] = *log
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (r *MockRepository) DeleteLog(id, userID string) error {
	if err := r.getError("DeleteLog"); err != nil {
		return err
	}
	logs, ok := r.logs[userID]
	if !ok {
		return gorm.ErrRecordNotFound
	}
	for i := range logs {
		if logs[i].ID == id {
			r.logs[userID] = append(logs[:i], logs[i+1:]...)
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

// Config operations

func (r *MockRepository) GetSystemConfig(key string) (*models.SystemConfig, error) {
	if err := r.getError("GetSystemConfig"); err != nil {
		return nil, err
	}
	if config, ok := r.configs[key]; ok {
		return config, nil
	}
	return nil, gorm.ErrRecordNotFound
}

func (r *MockRepository) SetSystemConfig(key, value string) error {
	if err := r.getError("SetSystemConfig"); err != nil {
		return err
	}
	r.configs[key] = &models.SystemConfig{
		Key:   key,
		Value: value,
	}
	return nil
}

// Utility

func (r *MockRepository) DB() *gorm.DB {
	return nil
}

func (r *MockRepository) Close() error {
	return nil
}

// Helper methods for tests

func (r *MockRepository) AddUser(user *models.User) {
	r.users[user.ID] = user
}

func (r *MockRepository) AddLog(userID string, log *models.PoopLog) {
	r.logs[userID] = append(r.logs[userID], *log)
}

// Compile-time check that MockRepository implements RepositoryInterface
var _ RepositoryInterface = (*MockRepository)(nil)
