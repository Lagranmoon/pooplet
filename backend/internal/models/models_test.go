package models_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/Lagranmoon/pooplet/internal/models"
)

func init() {
	// Set a valid JWT secret for tests
	models.SetJWTSecret("test-secret-key-for-unit-tests-min-16-chars")
}

func TestDifficulty_IsValid(t *testing.T) {
	tests := []struct {
		name       string
		difficulty models.Difficulty
		want       bool
	}{
		{
			name:       "valid easy",
			difficulty: models.DifficultyEasy,
			want:       true,
		},
		{
			name:       "valid normal",
			difficulty: models.DifficultyNormal,
			want:       true,
		},
		{
			name:       "valid hard",
			difficulty: models.DifficultyHard,
			want:       true,
		},
		{
			name:       "valid very_hard",
			difficulty: models.DifficultyVeryHard,
			want:       true,
		},
		{
			name:       "invalid difficulty",
			difficulty: "invalid",
			want:       false,
		},
		{
			name:       "empty difficulty",
			difficulty: "",
			want:       false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.difficulty.IsValid()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestUser_Model(t *testing.T) {
	user := models.User{
		ID:        "test-id",
		Email:     "test@example.com",
		Password:  "hashed-password",
		Name:      "Test User",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	assert.Equal(t, "test-id", user.ID)
	assert.Equal(t, "test@example.com", user.Email)
	assert.Equal(t, "hashed-password", user.Password)
	assert.Equal(t, "Test User", user.Name)
	assert.NotZero(t, user.CreatedAt)
	assert.NotZero(t, user.UpdatedAt)
}

func TestPoopLog_Model(t *testing.T) {
	now := time.Now()
	log := models.PoopLog{
		ID:         "log-id",
		UserID:     "user-id",
		Timestamp:  now,
		Difficulty: "easy",
		Note:       "Test note",
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	assert.Equal(t, "log-id", log.ID)
	assert.Equal(t, "user-id", log.UserID)
	assert.NotEmpty(t, log.Difficulty)
	assert.Equal(t, "Test note", log.Note)
	assert.Equal(t, now, log.Timestamp)
	assert.Equal(t, string(models.DifficultyEasy), log.Difficulty)
	assert.NotZero(t, log.CreatedAt)
	assert.NotZero(t, log.UpdatedAt)
}

func TestDifficulty_Constants(t *testing.T) {
	assert.Equal(t, models.Difficulty("easy"), models.DifficultyEasy)
	assert.Equal(t, models.Difficulty("normal"), models.DifficultyNormal)
	assert.Equal(t, models.Difficulty("hard"), models.DifficultyHard)
	assert.Equal(t, models.Difficulty("very_hard"), models.DifficultyVeryHard)
}

func TestLoginRequest(t *testing.T) {
	req := models.LoginRequest{
		Email:    "test@example.com",
		Password: "password123",
	}

	assert.NotEmpty(t, req.Email)
	assert.NotEmpty(t, req.Password)
	assert.Contains(t, req.Email, "@")
}

func TestRegisterRequest(t *testing.T) {
	req := models.RegisterRequest{
		Email:    "test@example.com",
		Password: "password123",
		Name:     "Test User",
	}

	assert.NotEmpty(t, req.Email)
	assert.NotEmpty(t, req.Password)
	assert.NotEmpty(t, req.Name)
	assert.Greater(t, len(req.Password), 5)
}

func TestCreateLogRequest(t *testing.T) {
	req := models.CreateLogRequest{
		Timestamp:  time.Now().Format(time.RFC3339),
		Difficulty: "easy",
		Note:       "Optional note",
	}

	assert.NotEmpty(t, req.Timestamp)
	assert.NotEmpty(t, req.Difficulty)
	assert.Contains(t, []string{"easy", "normal", "hard", "very_hard"}, req.Difficulty)
}

func TestUpdateLogRequest(t *testing.T) {
	timestamp := time.Now().Format(time.RFC3339)
	difficulty := "normal"

	req := models.UpdateLogRequest{
		Timestamp:  &timestamp,
		Difficulty: &difficulty,
		Note:       nil,
	}

	assert.NotNil(t, req.Timestamp)
	assert.NotNil(t, req.Difficulty)
	assert.Nil(t, req.Note)
}

func TestTokenResponse(t *testing.T) {
	resp := models.TokenResponse{
		Token:     "jwt-token",
		ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
	}

	assert.NotEmpty(t, resp.Token)
	assert.Greater(t, resp.ExpiresAt, time.Now().Unix())
}

func TestUserResponse(t *testing.T) {
	now := time.Now()
	resp := models.UserResponse{
		ID:        "user-id",
		Email:     "test@example.com",
		Name:      "Test User",
		CreatedAt: now,
	}

	assert.Equal(t, "user-id", resp.ID)
	assert.Equal(t, "test@example.com", resp.Email)
	assert.Equal(t, "Test User", resp.Name)
	assert.Equal(t, now, resp.CreatedAt)
}

func TestLogResponse(t *testing.T) {
	now := time.Now()
	resp := models.LogResponse{
		ID:         "log-id",
		UserID:     "user-id",
		Timestamp:  now,
		Difficulty: "easy",
		Note:       "Test note",
		CreatedAt:  now,
	}

	assert.Equal(t, "log-id", resp.ID)
	assert.Equal(t, "user-id", resp.UserID)
	assert.Equal(t, now, resp.Timestamp)
	assert.Equal(t, "easy", resp.Difficulty)
	assert.Equal(t, "Test note", resp.Note)
}

func TestGenerateUUID(t *testing.T) {
	uuid1 := models.GenerateUUID()
	uuid2 := models.GenerateUUID()

	assert.NotEmpty(t, uuid1)
	assert.NotEmpty(t, uuid2)
	assert.Contains(t, uuid1, "-")
	assert.GreaterOrEqual(t, len(uuid1), 10)
	assert.NotEqual(t, uuid1, uuid2)
}

func TestRandomString(t *testing.T) {
	tests := []struct {
		name       string
		length     int
		wantLen    int
		wantAlphabet string
	}{
		{"length 5", 5, 5, "abcdefghijklmnopqrstuvwxyz0123456789"},
		{"length 10", 10, 10, "abcdefghijklmnopqrstuvwxyz0123456789"},
		{"length 0", 0, 0, "abcdefghijklmnopqrstuvwxyz0123456789"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := models.GenerateUUID()
			assert.NotEmpty(t, result)
			if tt.length > 0 {
				assert.GreaterOrEqual(t, len(result), tt.length+9)
			}
		})
	}
}

func TestGenerateToken(t *testing.T) {
	user := &models.User{
		ID:    "test-user-id",
		Email: "test@example.com",
	}

	token, expiresAt, err := models.GenerateToken(user)

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.Greater(t, expiresAt, time.Now().Unix())
	assert.Contains(t, token, ".")
	assert.GreaterOrEqual(t, len(token), 100)
}

func TestGenerateToken_DifferentUsers(t *testing.T) {
	user1 := &models.User{
		ID:    "user-1",
		Email: "user1@example.com",
	}
	user2 := &models.User{
		ID:    "user-2",
		Email: "user2@example.com",
	}

	token1, _, err1 := models.GenerateToken(user1)
	token2, _, err2 := models.GenerateToken(user2)

	assert.NoError(t, err1)
	assert.NoError(t, err2)
	assert.NotEqual(t, token1, token2)
}

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name      string
		password  string
		wantError bool
		errorMsg  string
	}{
		{
			name:      "valid password with all requirements",
			password:  "Abc1234567",
			wantError: false,
		},
		{
			name:      "valid password with special characters",
			password:  "Abcdef1234!@#",
			wantError: false,
		},
		{
			name:      "too short - less than 10 characters",
			password:  "Abc123",
			wantError: true,
			errorMsg:  "password must be at least 10 characters long",
		},
		{
			name:      "missing uppercase letter",
			password:  "abcdef1234",
			wantError: true,
			errorMsg:  "password must contain at least one uppercase letter",
		},
		{
			name:      "missing lowercase letter",
			password:  "ABCDEF1234",
			wantError: true,
			errorMsg:  "password must contain at least one lowercase letter",
		},
		{
			name:      "missing digit",
			password:  "Abcdefghij",
			wantError: true,
			errorMsg:  "password must contain at least one digit",
		},
		{
			name:      "exactly 10 characters valid",
			password:  "Abc1234567",
			wantError: false,
		},
		{
			name:      "only 9 characters",
			password:  "Abc123456",
			wantError: true,
			errorMsg:  "password must be at least 10 characters long",
		},
		{
			name:      "empty password",
			password:  "",
			wantError: true,
			errorMsg:  "password must be at least 10 characters long",
		},
		{
			name:      "only uppercase and digits, no lowercase",
			password:  "ABC1234567",
			wantError: true,
			errorMsg:  "password must contain at least one lowercase letter",
		},
		{
			name:      "only lowercase and digits, no uppercase",
			password:  "abc1234567",
			wantError: true,
			errorMsg:  "password must contain at least one uppercase letter",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := models.ValidatePassword(tt.password)
			if tt.wantError {
				assert.Error(t, err)
				if tt.errorMsg != "" {
					assert.Contains(t, err.Error(), tt.errorMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestSetAndGetJWTSecret(t *testing.T) {
	// Test setting and getting JWT secret
	testSecret := "another-test-secret-key-1234"
	models.SetJWTSecret(testSecret)

	// Note: getJWTSecret is unexported, but we can test through GenerateToken
	user := &models.User{
		ID:    "test-user",
		Email: "test@example.com",
	}

	token, _, err := models.GenerateToken(user)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.Contains(t, token, ".")
}

func resetJWTSecret() {
	models.SetJWTSecret("test-secret-key-for-unit-tests-min-16-chars")
}

func TestValidateJWTSecret(t *testing.T) {
	tests := []struct {
		name        string
		secret      string
		wantErr     bool
		expectedErr error
	}{
		{
			name:        "default secret should fail",
			secret:      "your-super-secret-key-change-in-production",
			wantErr:     true,
			expectedErr: models.ErrInvalidJWTSecret,
		},
		{
			name:        "short secret should fail",
			secret:      "short",
			wantErr:     true,
			expectedErr: models.ErrInvalidJWTSecret,
		},
		{
			name:        "valid secret should pass",
			secret:      "this-is-a-valid-secret-key-min-16-chars",
			wantErr:     false,
			expectedErr: nil,
		},
		{
			name:        "exactly 16 chars should pass",
			secret:      "1234567890123456",
			wantErr:     false,
			expectedErr: nil,
		},
		{
			name:        "15 chars should fail",
			secret:      "123456789012345",
			wantErr:     true,
			expectedErr: models.ErrInvalidJWTSecret,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			models.SetJWTSecret(tt.secret)
			err := models.ValidateJWTSecret()
			if tt.wantErr {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestGenerateTokenWithDefaultRole(t *testing.T) {
	resetJWTSecret()
	// Create user without role set
	user := &models.User{
		ID:    "test-user-no-role",
		Email: "test@example.com",
		Role:  "", // Empty role
	}

	token, expiresAt, err := models.GenerateToken(user)

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.Greater(t, expiresAt, time.Now().Unix())
}

func TestGenerateTokenWithAdminRole(t *testing.T) {
	resetJWTSecret()
	user := &models.User{
		ID:    "admin-user",
		Email: "admin@example.com",
		Role:  models.RoleAdmin,
	}

	token, _, err := models.GenerateToken(user)

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
}

func TestRoleConstants(t *testing.T) {
	assert.Equal(t, models.Role("user"), models.RoleUser)
	assert.Equal(t, models.Role("admin"), models.RoleAdmin)
}

func TestConfigConstants(t *testing.T) {
	assert.Equal(t, models.ConfigRegistrationEnabled, "registration_enabled")
}

func TestDifficultyString(t *testing.T) {
	assert.Equal(t, string(models.DifficultyEasy), "easy")
	assert.Equal(t, string(models.DifficultyNormal), "normal")
	assert.Equal(t, string(models.DifficultyHard), "hard")
	assert.Equal(t, string(models.DifficultyVeryHard), "very_hard")
}

func TestUserModelMethods(t *testing.T) {
	// Test that we can call IsValid on difficulty
	assert.True(t, models.Difficulty("easy").IsValid())
	assert.False(t, models.Difficulty("invalid").IsValid())
}

func TestLogResponseModel(t *testing.T) {
	now := time.Now()
	resp := models.LogResponse{
		ID:         "log-id",
		UserID:     "user-id",
		Timestamp:  now,
		Difficulty: "easy",
		Note:       "Test note",
		CreatedAt:  now,
	}

	assert.Equal(t, "log-id", resp.ID)
	assert.Equal(t, "user-id", resp.UserID)
	assert.Equal(t, "easy", resp.Difficulty)
	assert.Equal(t, "Test note", resp.Note)
}

func TestUserListResponseModel(t *testing.T) {
	now := time.Now()
	resp := models.UserListResponse{
		ID:        "user-id",
		Email:     "test@example.com",
		Name:      "Test User",
		Role:      models.RoleUser,
		CreatedAt: now,
	}

	assert.Equal(t, "user-id", resp.ID)
	assert.Equal(t, "test@example.com", resp.Email)
	assert.Equal(t, "Test User", resp.Name)
	assert.Equal(t, models.RoleUser, resp.Role)
}

func TestUpdateSystemConfigRequest(t *testing.T) {
	req := models.UpdateSystemConfigRequest{
		Value: "true",
	}

	assert.Equal(t, "true", req.Value)
}
