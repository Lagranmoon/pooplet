package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoad_DefaultValues(t *testing.T) {
	// Clear environment variables
	os.Unsetenv("SERVER_PORT")
	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("JWT_EXPIRES_AT")
	os.Unsetenv("ENVIRONMENT")

	cfg := Load()

	assert.Equal(t, 8080, cfg.ServerPort)
	assert.Equal(t, "postgres://pooplet:pooplet@localhost:5432/pooplet?sslmode=disable", cfg.DatabaseURL)
	assert.Equal(t, "your-super-secret-key-change-in-production", cfg.JWTSecret)
	assert.Equal(t, 168, cfg.JWTExpiresAt) // 7 days * 24
	assert.Equal(t, "development", cfg.Environment)
}

func TestLoad_CustomValues(t *testing.T) {
	os.Setenv("SERVER_PORT", "9090")
	os.Setenv("DATABASE_URL", "custom-db-url")
	os.Setenv("JWT_SECRET", "custom-secret")
	os.Setenv("JWT_EXPIRES_AT", "48")
	os.Setenv("ENVIRONMENT", "production")

	defer func() {
		os.Unsetenv("SERVER_PORT")
		os.Unsetenv("DATABASE_URL")
		os.Unsetenv("JWT_SECRET")
		os.Unsetenv("JWT_EXPIRES_AT")
		os.Unsetenv("ENVIRONMENT")
	}()

	cfg := Load()

	assert.Equal(t, 9090, cfg.ServerPort)
	assert.Equal(t, "custom-db-url", cfg.DatabaseURL)
	assert.Equal(t, "custom-secret", cfg.JWTSecret)
	assert.Equal(t, 48, cfg.JWTExpiresAt)
	assert.Equal(t, "production", cfg.Environment)
}

func TestGetEnv(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue string
		setValue     string
		expected     string
	}{
		{
			name:         "returns default when not set",
			key:          "TEST_KEY_NOT_SET",
			defaultValue: "default",
			setValue:     "",
			expected:     "default",
		},
		{
			name:         "returns value when set",
			key:          "TEST_KEY_SET",
			defaultValue: "default",
			setValue:     "custom",
			expected:     "custom",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setValue != "" {
				os.Setenv(tt.key, tt.setValue)
				defer os.Unsetenv(tt.key)
			}

			result := getEnv(tt.key, tt.defaultValue)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestGetEnvInt(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue int
		setValue     string
		expected     int
	}{
		{
			name:         "returns default when not set",
			key:          "TEST_INT_KEY_NOT_SET",
			defaultValue: 42,
			setValue:     "",
			expected:     42,
		},
		{
			name:         "returns value when set",
			key:          "TEST_INT_KEY_SET",
			defaultValue: 42,
			setValue:     "100",
			expected:     100,
		},
		{
			name:         "returns default when invalid",
			key:          "TEST_INT_KEY_INVALID",
			defaultValue: 42,
			setValue:     "invalid",
			expected:     42,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.setValue != "" {
				os.Setenv(tt.key, tt.setValue)
				defer os.Unsetenv(tt.key)
			}

			result := getEnvInt(tt.key, tt.defaultValue)
			assert.Equal(t, tt.expected, result)
		})
	}
}
