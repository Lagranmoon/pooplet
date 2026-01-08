package services

import (
	"errors"
	"testing"
	"time"

	"github.com/Lagranmoon/pooplet/internal/models"
	"github.com/Lagranmoon/pooplet/internal/repository"

	"github.com/stretchr/testify/require"
)

func init() {
	// Set a valid JWT secret for tests
	models.SetJWTSecret("test-secret-key-for-testing-purposes-only-123456789")
}

// Helper to create a service with mock repository
func newTestService() *Service {
	mockRepo := repository.NewMockRepository()
	return NewServiceWithInterface(mockRepo)
}

func TestRegister_Success(t *testing.T) {
	svc := newTestService()

	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test User",
	}

	user, token, expiresAt, err := svc.Register(req)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if user == nil {
		t.Error("Expected user, got nil")
	}
	if token == "" {
		t.Error("Expected token, got empty string")
	}
	if expiresAt == 0 {
		t.Error("Expected expiresAt, got 0")
	}
	if user.Email != "test@example.com" {
		t.Errorf("Expected email 'test@example.com', got '%s'", user.Email)
	}
	if user.Role != models.RoleUser {
		t.Errorf("Expected role 'user', got '%s'", user.Role)
	}
}

func TestRegister_UserAlreadyExists(t *testing.T) {
	svc := newTestService()

	// Add existing user
	existingUser := &models.User{
		ID:       "existing-id",
		Email:    "test@example.com",
		Name:     "Existing",
		Role:     models.RoleUser,
		Password: "hashed",
	}
	mockRepo := svc.repo.(*repository.MockRepository)
	mockRepo.AddUser(existingUser)

	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test User",
	}

	_, token, expiresAt, err := svc.Register(req)

	if err != ErrUserAlreadyExists {
		t.Errorf("Expected ErrUserAlreadyExists, got %v", err)
	}
	if token != "" {
		t.Error("Expected token to be empty")
	}
	if expiresAt != 0 {
		t.Error("Expected expiresAt to be 0")
	}
}

func TestRegister_WeakPassword(t *testing.T) {
	svc := newTestService()

	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "weak",
		Name:     "Test User",
	}

	user, _, _, err := svc.Register(req)

	if err == nil {
		t.Error("Expected error for weak password")
	}
	if user != nil {
		t.Error("Expected user to be nil")
	}
}

func TestRegister_RepoError(t *testing.T) {
	svc := newTestService()

	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test User",
	}

	mockRepo := svc.repo.(*repository.MockRepository)
	mockRepo.SetError("CreateUser", errors.New("database error"))

	user, token, _, err := svc.Register(req)

	if err == nil {
		t.Error("Expected error for repo failure")
	}
	if user != nil {
		t.Error("Expected user to be nil")
	}
	if token != "" {
		t.Error("Expected token to be empty")
	}
}

func TestLogin_Success(t *testing.T) {
	svc := newTestService()

	// First register a user
	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test User",
	}
	_, _, _, err := svc.Register(req)
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}

	// Now login
	loginReq := &models.LoginRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
	}

	loggedInUser, token, expiresAt, err := svc.Login(loginReq)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if loggedInUser == nil {
		t.Error("Expected user, got nil")
	}
	if token == "" {
		t.Error("Expected token, got empty string")
	}
	if expiresAt == 0 {
		t.Error("Expected expiresAt, got 0")
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	svc := newTestService()

	req := &models.LoginRequest{
		Email:    "nonexistent@example.com",
		Password: "password123",
	}

	user, _, _, err := svc.Login(req)

	if err != ErrInvalidCredential {
		t.Errorf("Expected ErrInvalidCredential, got %v", err)
	}
	if user != nil {
		t.Error("Expected user to be nil")
	}
}

func TestLogin_InvalidPassword(t *testing.T) {
	svc := newTestService()

	// Register a user
	registerReq := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test User",
	}
	_, _, _, err := svc.Register(registerReq)
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}

	// Try login with wrong password
	loginReq := &models.LoginRequest{
		Email:    "test@example.com",
		Password: "WrongPassword123!",
	}

	user, _, _, err := svc.Login(loginReq)

	if err != ErrInvalidCredential {
		t.Errorf("Expected ErrInvalidCredential, got %v", err)
	}
	if user != nil {
		t.Error("Expected user to be nil")
	}
}

func TestGetUser_Success(t *testing.T) {
	svc := newTestService()

	// Register a user first
	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test User",
	}
	user, _, _, err := svc.Register(req)
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}

	result, err := svc.GetUser(user.ID)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if result == nil {
		t.Error("Expected user, got nil")
	}
	if result.ID != user.ID {
		t.Errorf("Expected ID '%s', got '%s'", user.ID, result.ID)
	}
}

func TestGetUser_NotFound(t *testing.T) {
	svc := newTestService()

	user, err := svc.GetUser("nonexistent-id")

	if err != ErrUserNotFound {
		t.Errorf("Expected ErrUserNotFound, got %v", err)
	}
	if user != nil {
		t.Error("Expected user to be nil")
	}
}

func TestCreateLog_Success(t *testing.T) {
	svc := newTestService()

	timestamp := time.Now().Format(time.RFC3339)
	req := &models.CreateLogRequest{
		Timestamp:  timestamp,
		Difficulty: "easy",
		Note:       "Test note",
	}

	log, err := svc.CreateLog("user-id", req)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if log == nil {
		t.Error("Expected log, got nil")
	}
	if log.UserID != "user-id" {
		t.Errorf("Expected userID 'user-id', got '%s'", log.UserID)
	}
	if log.Difficulty != "easy" {
		t.Errorf("Expected difficulty 'easy', got '%s'", log.Difficulty)
	}
}

func TestCreateLog_InvalidDifficulty(t *testing.T) {
	svc := newTestService()

	req := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "invalid",
		Note:       "Test note",
	}

	log, err := svc.CreateLog("user-id", req)

	if err == nil {
		t.Error("Expected error for invalid difficulty")
	}
	if log != nil {
		t.Error("Expected log to be nil")
	}
}

func TestCreateLog_InvalidTimestamp(t *testing.T) {
	svc := newTestService()

	req := &models.CreateLogRequest{
		Timestamp:  "not-a-valid-timestamp",
		Difficulty: "easy",
		Note:       "Test note",
	}

	log, err := svc.CreateLog("user-id", req)

	if err == nil {
		t.Error("Expected error for invalid timestamp")
	}
	if log != nil {
		t.Error("Expected log to be nil")
	}
}

func TestGetLogs_Success(t *testing.T) {
	svc := newTestService()

	// Create some logs
	for i := 0; i < 3; i++ {
		req := &models.CreateLogRequest{
			Timestamp:  time.Now().Format(time.RFC3339),
			Difficulty: "easy",
		}
		_, err := svc.CreateLog("user-id", req)
		if err != nil {
			t.Fatalf("Failed to create log: %v", err)
		}
	}

	logs, err := svc.GetLogs("user-id", nil, nil)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if len(logs) != 3 {
		t.Errorf("Expected 3 logs, got %d", len(logs))
	}
}

func TestGetLogs_WithDateFilter(t *testing.T) {
	svc := newTestService()

	now := time.Now()
	yesterday := now.AddDate(0, 0, -1)

	req := &models.CreateLogRequest{
		Timestamp:  now.Format(time.RFC3339),
		Difficulty: "easy",
	}
	_, err := svc.CreateLog("user-id", req)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	// Filter with start date (should include the log)
	startDate := yesterday
	logs, err := svc.GetLogs("user-id", &startDate, nil)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if len(logs) < 1 {
		t.Errorf("Expected at least 1 log, got %d", len(logs))
	}
}

func TestGetLog_Success(t *testing.T) {
	svc := newTestService()

	// Create a log
	createReq := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
		Note:       "Test note",
	}
	log, err := svc.CreateLog("user-id", createReq)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	result, err := svc.GetLog(log.ID, "user-id")

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if result == nil {
		t.Error("Expected log, got nil")
	}
	if result.ID != log.ID {
		t.Errorf("Expected ID '%s', got '%s'", log.ID, result.ID)
	}
}

func TestGetLog_NotFound(t *testing.T) {
	svc := newTestService()

	log, err := svc.GetLog("nonexistent-id", "user-id")

	if err != ErrLogNotFound {
		t.Errorf("Expected ErrLogNotFound, got %v", err)
	}
	if log != nil {
		t.Error("Expected log to be nil")
	}
}

func TestUpdateLog_Success(t *testing.T) {
	svc := newTestService()

	// Create a log
	createReq := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
		Note:       "Original note",
	}
	log, err := svc.CreateLog("user-id", createReq)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	note := "Updated note"
	req := &models.UpdateLogRequest{
		Note: &note,
	}

	result, err := svc.UpdateLog(log.ID, "user-id", req)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if result.Note != "Updated note" {
		t.Errorf("Expected note 'Updated note', got '%s'", result.Note)
	}
}

func TestUpdateLog_ChangeDifficulty(t *testing.T) {
	svc := newTestService()

	// Create a log
	createReq := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
	}
	log, err := svc.CreateLog("user-id", createReq)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	difficulty := "hard"
	req := &models.UpdateLogRequest{
		Difficulty: &difficulty,
	}

	result, err := svc.UpdateLog(log.ID, "user-id", req)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if result.Difficulty != "hard" {
		t.Errorf("Expected difficulty 'hard', got '%s'", result.Difficulty)
	}
}

func TestUpdateLog_NotFound(t *testing.T) {
	svc := newTestService()

	note := "Updated note"
	req := &models.UpdateLogRequest{
		Note: &note,
	}

	log, err := svc.UpdateLog("nonexistent-id", "user-id", req)

	if err != ErrLogNotFound {
		t.Errorf("Expected ErrLogNotFound, got %v", err)
	}
	if log != nil {
		t.Error("Expected log to be nil")
	}
}

func TestUpdateLog_InvalidDifficulty(t *testing.T) {
	svc := newTestService()

	// Create a log
	createReq := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
	}
	log, err := svc.CreateLog("user-id", createReq)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	difficulty := "invalid"
	req := &models.UpdateLogRequest{
		Difficulty: &difficulty,
	}

	_, err = svc.UpdateLog(log.ID, "user-id", req)

	if err == nil {
		t.Error("Expected error for invalid difficulty")
	}
}

func TestDeleteLog_Success(t *testing.T) {
	svc := newTestService()

	// Create a log
	createReq := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
	}
	log, err := svc.CreateLog("user-id", createReq)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	err = svc.DeleteLog(log.ID, "user-id")

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
}

func TestDeleteLog_NotFound(t *testing.T) {
	svc := newTestService()

	err := svc.DeleteLog("nonexistent-id", "user-id")

	if err != ErrLogNotFound {
		t.Errorf("Expected ErrLogNotFound, got %v", err)
	}
}

func TestGetAllUsers_Success(t *testing.T) {
	svc := newTestService()

	// Register some users with unique emails
	emails := []string{"user1@example.com", "user2@example.com", "user3@example.com"}
	for _, email := range emails {
		req := &models.RegisterRequest{
			Email:    email,
			Password: "TestPassword123!",
			Name:     "User",
		}
		_, _, _, err := svc.Register(req)
		if err != nil {
			t.Fatalf("Failed to register user %s: %v", email, err)
		}
	}

	users, err := svc.GetAllUsers()

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if len(users) < 3 {
		t.Errorf("Expected at least 3 users, got %d", len(users))
	}
}

func TestUpdateUserRole_Success(t *testing.T) {
	svc := newTestService()

	// Register a user first
	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test User",
	}
	user, _, _, err := svc.Register(req)
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}

	role := models.RoleAdmin
	err = svc.UpdateUserRole(user.ID, &role)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Verify the role was updated
	updatedUser, err := svc.GetUser(user.ID)
	if err != nil {
		t.Errorf("Expected no error getting user, got %v", err)
	}
	if updatedUser.Role != models.RoleAdmin {
		t.Errorf("Expected role 'admin', got '%s'", updatedUser.Role)
	}
}

func TestUpdateUserRole_UserNotFound(t *testing.T) {
	svc := newTestService()

	role := models.RoleAdmin
	err := svc.UpdateUserRole("nonexistent-id", &role)

	if err != ErrUserNotFound {
		t.Errorf("Expected ErrUserNotFound, got %v", err)
	}
}

func TestUpdateUserRole_NilRole(t *testing.T) {
	svc := newTestService()

	err := svc.UpdateUserRole("user-id", nil)

	if err == nil {
		t.Error("Expected error for nil role")
	}
}

func TestUpdateUserRole_CannotDowngradeLastAdmin(t *testing.T) {
	svc := newTestService()

	// Register an admin user
	req := &models.CreateUserRequest{
		Email:    "admin@example.com",
		Password: "TestPassword123!",
		Name:     "Admin User",
		Role:     models.RoleAdmin,
	}
	admin, _, _, err := svc.CreateUser(req)
	if err != nil {
		t.Fatalf("Failed to create admin: %v", err)
	}

	// Try to downgrade the admin
	role := models.RoleUser
	err = svc.UpdateUserRole(admin.ID, &role)

	if err == nil {
		t.Error("Expected error for last admin downgrade")
	}
}

func TestDeleteUser_Success(t *testing.T) {
	svc := newTestService()

	// Register a user
	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test User",
	}
	user, _, _, err := svc.Register(req)
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}

	err = svc.DeleteUser(user.ID)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Verify user is deleted
	_, err = svc.GetUser(user.ID)
	if err != ErrUserNotFound {
		t.Errorf("Expected ErrUserNotFound after deletion, got %v", err)
	}
}

func TestDeleteUser_NotFound(t *testing.T) {
	svc := newTestService()

	err := svc.DeleteUser("nonexistent-id")

	if err != ErrUserNotFound {
		t.Errorf("Expected ErrUserNotFound, got %v", err)
	}
}

func TestCreateUser_Success(t *testing.T) {
	svc := newTestService()

	req := &models.CreateUserRequest{
		Email:    "newuser@example.com",
		Password: "TestPassword123!",
		Name:     "New User",
		Role:     models.RoleUser,
	}

	user, token, expiresAt, err := svc.CreateUser(req)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if user == nil {
		t.Error("Expected user, got nil")
	}
	if token == "" {
		t.Error("Expected token, got empty string")
	}
	if expiresAt == 0 {
		t.Error("Expected expiresAt, got 0")
	}
}

func TestCreateUser_AlreadyExists(t *testing.T) {
	svc := newTestService()

	// Add existing user
	mockRepo := svc.repo.(*repository.MockRepository)
	mockRepo.AddUser(&models.User{
		ID:       "existing-id",
		Email:    "newuser@example.com",
		Name:     "Existing",
		Role:     models.RoleUser,
		Password: "hashed",
	})

	req := &models.CreateUserRequest{
		Email:    "newuser@example.com",
		Password: "TestPassword123!",
		Name:     "New User",
		Role:     models.RoleUser,
	}

	newUser, token, _, err := svc.CreateUser(req)

	if err == nil {
		t.Error("Expected error for existing user")
	}
	if newUser != nil {
		t.Error("Expected user to be nil")
	}
	if token != "" {
		t.Error("Expected token to be empty")
	}
}

func TestCreateUser_WeakPassword(t *testing.T) {
	svc := newTestService()

	req := &models.CreateUserRequest{
		Email:    "newuser@example.com",
		Password: "weak",
		Name:     "New User",
		Role:     models.RoleUser,
	}

	user, _, _, err := svc.CreateUser(req)

	if err == nil {
		t.Error("Expected error for weak password")
	}
	if user != nil {
		t.Error("Expected user to be nil")
	}
}

func TestGetSystemConfig_Success(t *testing.T) {
	svc := newTestService()

	mockRepo := svc.repo.(*repository.MockRepository)
	mockRepo.SetSystemConfig("test_key", "test_value")

	value, err := svc.GetSystemConfig("test_key")

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if value != "test_value" {
		t.Errorf("Expected 'test_value', got '%s'", value)
	}
}

func TestGetSystemConfig_Default(t *testing.T) {
	svc := newTestService()

	value, err := svc.GetSystemConfig(models.ConfigRegistrationEnabled)

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if value != "true" {
		t.Errorf("Expected 'true' for registration enabled default, got '%s'", value)
	}
}

func TestGetSystemConfig_NotFound(t *testing.T) {
	svc := newTestService()

	value, err := svc.GetSystemConfig("nonexistent_key")

	if err == nil {
		t.Error("Expected error for nonexistent config")
	}
	if value != "" {
		t.Error("Expected empty value")
	}
}

func TestSetSystemConfig_Success(t *testing.T) {
	svc := newTestService()

	err := svc.SetSystemConfig("test_key", "new_value")

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	mockRepo := svc.repo.(*repository.MockRepository)
	config, _ := mockRepo.GetSystemConfig("test_key")
	if config.Value != "new_value" {
		t.Errorf("Expected 'new_value', got '%s'", config.Value)
	}
}

func TestCreateInitialAdmin_Success(t *testing.T) {
	svc := newTestService()

	err := svc.CreateInitialAdmin("admin@example.com", "TestPassword123!", "Admin")

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	user, err := svc.GetUserByEmail("admin@example.com")
	if err != nil {
		t.Errorf("Expected no error getting user, got %v", err)
	}
	if user.Role != models.RoleAdmin {
		t.Errorf("Expected role 'admin', got '%s'", user.Role)
	}
}

func TestCreateInitialAdmin_UsersExist(t *testing.T) {
	svc := newTestService()

	// Add an existing user
	mockRepo := svc.repo.(*repository.MockRepository)
	mockRepo.AddUser(&models.User{
		ID:       "existing-id",
		Email:    "test@example.com",
		Name:     "Existing",
		Role:     models.RoleUser,
		Password: "hashed",
	})

	err := svc.CreateInitialAdmin("admin@example.com", "TestPassword123!", "Admin")

	if err == nil {
		t.Error("Expected error when users exist")
	}
}

func TestCreateInitialAdmin_EmptyEmail(t *testing.T) {
	svc := newTestService()

	err := svc.CreateInitialAdmin("", "TestPassword123!", "Admin")

	if err == nil {
		t.Error("Expected error for empty email")
	}
}

func TestCreateInitialAdmin_WeakPassword(t *testing.T) {
	svc := newTestService()

	err := svc.CreateInitialAdmin("admin@example.com", "weak", "Admin")

	if err == nil {
		t.Error("Expected error for weak password")
	}
}

func TestCreateInitialAdmin_UserExists(t *testing.T) {
	svc := newTestService()

	// Add user with same email
	mockRepo := svc.repo.(*repository.MockRepository)
	mockRepo.AddUser(&models.User{
		ID:       "existing-id",
		Email:    "admin@example.com",
		Name:     "Existing",
		Role:     models.RoleUser,
		Password: "hashed",
	})

	err := svc.CreateInitialAdmin("admin@example.com", "TestPassword123!", "Admin")

	if err == nil {
		t.Error("Expected error when user exists")
	}
}

func TestGetUserByEmail(t *testing.T) {
	svc := newTestService()

	// Register a user
	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test User",
	}
	_, _, _, err := svc.Register(req)
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}

	user, err := svc.GetUserByEmail("test@example.com")
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if user == nil {
		t.Error("Expected user, got nil")
	}
}

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name      string
		password  string
		expectErr bool
	}{
		{"valid password", "TestPassword123!", false},
		{"too short", "Test123!", true},
		{"no number", "TestPassword!", true},
		{"no uppercase", "testpassword123!", true},
		{"no lowercase", "TESTPASSWORD123!", true},
		{"just numbers", "1234567890", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := models.ValidatePassword(tt.password)
			if tt.expectErr && err == nil {
				t.Error("Expected error, got nil")
			}
			if !tt.expectErr && err != nil {
				t.Error("Expected no error, got", err)
			}
		})
	}
}

func TestDifficulty_IsValid(t *testing.T) {
	tests := []struct {
		difficulty string
		valid      bool
	}{
		{"easy", true},
		{"normal", true},
		{"hard", true},
		{"very_hard", true},
		{"invalid", false},
		{"", false},
	}

	for _, tt := range tests {
		t.Run(tt.difficulty, func(t *testing.T) {
			result := models.Difficulty(tt.difficulty).IsValid()
			if result != tt.valid {
				t.Errorf("Expected %v, got %v", tt.valid, result)
			}
		})
	}
}

func TestGenerateUUID(t *testing.T) {
	uuid1 := models.GenerateUUID()
	uuid2 := models.GenerateUUID()

	if uuid1 == "" {
		t.Error("Expected non-empty UUID")
	}
	if uuid1 == uuid2 {
		t.Error("Expected different UUIDs")
	}
}

// 附加测试用例以提高覆盖率

func TestUpdateUserRole_DowngradeWithMultipleAdmins(t *testing.T) {
	svc := newTestService()

	// 创建两个管理员
	admin1 := &models.CreateUserRequest{
		Email:    "admin1@example.com",
		Password: "TestPassword123!",
		Name:     "Admin 1",
		Role:     models.RoleAdmin,
	}
	_, _, _, err := svc.CreateUser(admin1)
	require.NoError(t, err)

	admin2 := &models.CreateUserRequest{
		Email:    "admin2@example.com",
		Password: "TestPassword123!",
		Name:     "Admin 2",
		Role:     models.RoleAdmin,
	}
	user2, _, _, err := svc.CreateUser(admin2)
	require.NoError(t, err)

	// 降级其中一个管理员应该成功
	role := models.RoleUser
	err = svc.UpdateUserRole(user2.ID, &role)
	if err != nil {
		t.Errorf("Expected no error when downgrading admin with multiple admins, got %v", err)
	}
}

func TestUpdateUserRole_PromoteToAdmin(t *testing.T) {
	svc := newTestService()

	// 创建一个普通用户
	req := &models.RegisterRequest{
		Email:    "user@example.com",
		Password: "TestPassword123!",
		Name:     "User",
	}
	user, _, _, err := svc.Register(req)
	require.NoError(t, err)

	// 提升为管理员
	role := models.RoleAdmin
	err = svc.UpdateUserRole(user.ID, &role)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
}

func TestUpdateLog_WithTimestamp(t *testing.T) {
	svc := newTestService()

	// 创建一个日志
	createReq := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
		Note:       "Original",
	}
	log, err := svc.CreateLog("user-id", createReq)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	// 更新时间戳
	newTimestamp := time.Now().Add(1 * time.Hour).Format(time.RFC3339)
	req := &models.UpdateLogRequest{
		Timestamp: &newTimestamp,
	}

	result, err := svc.UpdateLog(log.ID, "user-id", req)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if result.Timestamp.Format(time.RFC3339) != newTimestamp {
		t.Error("Timestamp was not updated correctly")
	}
}

func TestCreateUser_GetUserEmailError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 GetUserByEmail 返回非 RecordNotFound 错误
	mockRepo.SetError("GetUserByEmail", errors.New("database error"))

	req := &models.CreateUserRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test",
		Role:     models.RoleUser,
	}

	_, _, _, err := svc.CreateUser(req)
	if err == nil {
		t.Error("Expected error for GetUserEmail failure")
	}
}

func TestGetSystemConfig_OtherKeyNotFound(t *testing.T) {
	svc := newTestService()

	// 请求一个不存在的配置（不是 registration_enabled）
	value, err := svc.GetSystemConfig("nonexistent_key")
	if err == nil {
		t.Error("Expected error for nonexistent config key")
	}
	if value != "" {
		t.Error("Expected empty value for error")
	}
}

func TestDeleteLog_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 DeleteLog 返回非 RecordNotFound 错误
	mockRepo.SetError("DeleteLog", errors.New("database error"))

	err := svc.DeleteLog("log-id", "user-id")
	if err == nil {
		t.Error("Expected error for repository failure")
	}
	if err.Error() != "database error" {
		t.Errorf("Expected repository error, got %v", err)
	}
}

func TestCreateLog_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	req := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
	}

	mockRepo.SetError("CreateLog", errors.New("database error"))

	_, err := svc.CreateLog("user-id", req)
	if err == nil {
		t.Error("Expected error for repository failure")
	}
}

func TestUpdateLog_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 首先创建一个日志
	req := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
	}
	log, err := svc.CreateLog("user-id", req)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	// 设置 UpdateLog 返回错误
	mockRepo.SetError("UpdateLog", errors.New("database error"))

	updateReq := &models.UpdateLogRequest{
		Note: stringPtr("Updated"),
	}

	_, err = svc.UpdateLog(log.ID, "user-id", updateReq)
	if err == nil {
		t.Error("Expected error for repository failure")
	}
}

func TestDeleteUser_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 DeleteUser 返回非 RecordNotFound 错误
	mockRepo.SetError("DeleteUser", errors.New("database error"))

	err := svc.DeleteUser("user-id")
	if err == nil {
		t.Error("Expected error for repository failure")
	}
	if err.Error() != "database error" {
		t.Errorf("Expected repository error, got %v", err)
	}
}

// 辅助函数

func stringPtr(s string) *string {
	return &s
}

// 更多测试用例以提高覆盖率

func TestUpdateUserRole_GetUserRoleError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 GetUserRole 返回非 RecordNotFound 错误
	mockRepo.SetError("GetUserRole", errors.New("database error"))

	role := models.RoleUser
	err := svc.UpdateUserRole("user-id", &role)
	if err == nil {
		t.Error("Expected error for GetUserRole failure")
	}
}

func TestUpdateUserRole_CountAdminsError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 创建一个管理员
	admin := &models.User{
		ID:       "admin-id",
		Email:    "admin@example.com",
		Password: "hashed",
		Name:     "Admin",
		Role:     models.RoleAdmin,
	}
	mockRepo.AddUser(admin)

	// 设置 CountAdmins 返回错误
	mockRepo.SetError("CountAdmins", errors.New("database error"))

	role := models.RoleUser
	err := svc.UpdateUserRole("admin-id", &role)
	if err == nil {
		t.Error("Expected error for CountAdmins failure")
	}
}

func TestCreateUser_CreateUserError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	req := &models.CreateUserRequest{
		Email:    "test@example.com",
		Password: "TestPassword123!",
		Name:     "Test",
		Role:     models.RoleUser,
	}

	// 设置 CreateUser 返回错误
	mockRepo.SetError("CreateUser", errors.New("database error"))

	_, _, _, err := svc.CreateUser(req)
	if err == nil {
		t.Error("Expected error for CreateUser failure")
	}
}

func TestGetLogs_DateFilter(t *testing.T) {
	svc := newTestService()

	now := time.Now()
	startDate := now.Add(-24 * time.Hour)
	endDate := now

	logs, err := svc.GetLogs("user-id", &startDate, &endDate)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if logs == nil {
		t.Error("Expected logs slice, got nil")
	}
}

func TestGetLogs_StartDateOnly(t *testing.T) {
	svc := newTestService()

	startDate := time.Now().Add(-24 * time.Hour)

	logs, err := svc.GetLogs("user-id", &startDate, nil)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if logs == nil {
		t.Error("Expected logs slice, got nil")
	}
}

func TestGetLogs_EndDateOnly(t *testing.T) {
	svc := newTestService()

	endDate := time.Now()

	logs, err := svc.GetLogs("user-id", nil, &endDate)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if logs == nil {
		t.Error("Expected logs slice, got nil")
	}
}

func TestUpdateLog_AllFields(t *testing.T) {
	svc := newTestService()

	// 首先创建一个日志
	createReq := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
		Note:       "Original",
	}
	log, err := svc.CreateLog("user-id", createReq)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	// 更新所有字段
	newTimestamp := time.Now().Add(1 * time.Hour).Format(time.RFC3339)
	newDifficulty := "hard"
	newNote := "Updated note"

	req := &models.UpdateLogRequest{
		Timestamp:  &newTimestamp,
		Difficulty: &newDifficulty,
		Note:       &newNote,
	}

	result, err := svc.UpdateLog(log.ID, "user-id", req)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if result.Note != newNote {
		t.Errorf("Expected note '%s', got '%s'", newNote, result.Note)
	}
}

func TestGetLogs_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 GetLogsByUserID 返回错误
	mockRepo.SetError("GetLogsByUserID", errors.New("database error"))

	_, err := svc.GetLogs("user-id", nil, nil)
	if err == nil {
		t.Error("Expected error for repository failure")
	}
}

func TestGetAllUsers_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 GetAllUsers 返回错误
	mockRepo.SetError("GetAllUsers", errors.New("database error"))

	_, err := svc.GetAllUsers()
	if err == nil {
		t.Error("Expected error for repository failure")
	}
}

func TestGetSystemConfig_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 GetSystemConfig 返回错误
	mockRepo.SetError("GetSystemConfig", errors.New("database error"))

	_, err := svc.GetSystemConfig("some_key")
	if err == nil {
		t.Error("Expected error for repository failure")
	}
}

func TestSetSystemConfig_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 SetSystemConfig 返回错误
	mockRepo.SetError("SetSystemConfig", errors.New("database error"))

	err := svc.SetSystemConfig("key", "value")
	if err == nil {
		t.Error("Expected error for repository failure")
	}
}

func TestUpdateUserRole_UpdateRepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 首先创建一个用户
	req := &models.RegisterRequest{
		Email:    "user@example.com",
		Password: "TestPassword123!",
		Name:     "User",
	}
	user, _, _, err := svc.Register(req)
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}

	// 清除之前的错误
	mockRepo.ClearErrors()
	// 设置 UpdateUserRole 返回错误
	mockRepo.SetError("UpdateUserRole", errors.New("database error"))

	role := models.RoleAdmin
	err = svc.UpdateUserRole(user.ID, &role)
	if err == nil {
		t.Error("Expected error for UpdateUserRole failure")
	}
}

func TestGetLog_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 GetLogByIDAndUserID 返回错误
	mockRepo.SetError("GetLogByIDAndUserID", errors.New("database error"))

	_, err := svc.GetLog("log-id", "user-id")
	if err == nil {
		t.Error("Expected error for repository failure")
	}
	if err != ErrLogNotFound {
		t.Errorf("Expected ErrLogNotFound, got %v", err)
	}
}

func TestGetUserByEmail_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 GetUserByEmail 返回错误
	mockRepo.SetError("GetUserByEmail", errors.New("database error"))

	_, err := svc.GetUserByEmail("test@example.com")
	if err == nil {
		t.Error("Expected error for repository failure")
	}
	if err != ErrUserNotFound {
		t.Errorf("Expected ErrUserNotFound, got %v", err)
	}
}

func TestGetUserByID_RepositoryError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 GetUserByID 返回错误
	mockRepo.SetError("GetUserByID", errors.New("database error"))

	_, err := svc.GetUser("user-id")
	if err == nil {
		t.Error("Expected error for repository failure")
	}
	if err != ErrUserNotFound {
		t.Errorf("Expected ErrUserNotFound, got %v", err)
	}
}

func TestCreateInitialAdmin_GetAllUsersError(t *testing.T) {
	svc := newTestService()
	mockRepo := svc.repo.(*repository.MockRepository)

	// 设置 GetAllUsers 返回错误
	mockRepo.SetError("GetAllUsers", errors.New("database error"))

	err := svc.CreateInitialAdmin("admin@example.com", "TestPassword123!", "Admin")
	if err == nil {
		t.Error("Expected error for GetAllUsers failure")
	}
}

func TestCreateInitialAdmin_UsersAlreadyExist(t *testing.T) {
	svc := newTestService()

	// 首先创建一个用户
	req := &models.RegisterRequest{
		Email:    "user@example.com",
		Password: "TestPassword123!",
		Name:     "User",
	}
	_, _, _, err := svc.Register(req)
	if err != nil {
		t.Fatalf("Failed to register user: %v", err)
	}

	// 尝试创建初始管理员应该失败
	err = svc.CreateInitialAdmin("admin@example.com", "TestPassword123!", "Admin")
	if err == nil {
		t.Error("Expected error when users already exist")
	}
}

func TestCreateInitialAdmin_EmailAlreadyExists(t *testing.T) {
	svc := newTestService()

	// 首先创建一个用户（不通过 Register，直接添加到 mock）
	mockRepo := svc.repo.(*repository.MockRepository)
	user := &models.User{
		ID:       "existing-user",
		Email:    "admin@example.com",
		Password: "hashed",
		Name:     "Existing User",
		Role:     models.RoleUser,
	}
	mockRepo.AddUser(user)

	// 尝试创建初始管理员应该失败
	err := svc.CreateInitialAdmin("admin@example.com", "TestPassword123!", "Admin")
	if err == nil {
		t.Error("Expected error when email already exists")
	}
}

func TestUpdateLog_InvalidDifficultyUpdate(t *testing.T) {
	svc := newTestService()

	// 首先创建一个日志
	createReq := &models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
		Note:       "Original",
	}
	log, err := svc.CreateLog("user-id", createReq)
	if err != nil {
		t.Fatalf("Failed to create log: %v", err)
	}

	// 尝试更新为无效的难度
	invalidDifficulty := "invalid"
	req := &models.UpdateLogRequest{
		Difficulty: &invalidDifficulty,
	}

	_, err = svc.UpdateLog(log.ID, "user-id", req)
	if err == nil {
		t.Error("Expected error for invalid difficulty")
	}
}
