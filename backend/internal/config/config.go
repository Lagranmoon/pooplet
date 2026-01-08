package config

import (
	"os"
	"strconv"
)

type Config struct {
	ServerPort   int    `json:"server_port"`
	DatabaseURL  string `json:"database_url"`
	JWTSecret    string `json:"jwt_secret"`
	JWTExpiresAt int    `json:"jwt_expires_at"`
	Environment  string `json:"environment"`

	// Initial admin account (created on startup if not exists)
	InitialAdminEmail    string `json:"initial_admin_email"`
	InitialAdminPassword string `json:"initial_admin_password"`
	InitialAdminName     string `json:"initial_admin_name"`
}

func Load() *Config {
	return &Config{
		ServerPort:           getEnvInt("SERVER_PORT", 8080),
		DatabaseURL:          getEnv("DATABASE_URL", "postgres://pooplet:pooplet@localhost:5432/pooplet?sslmode=disable"),
		JWTSecret:            getEnv("JWT_SECRET", "your-super-secret-key-change-in-production"),
		JWTExpiresAt:         getEnvInt("JWT_EXPIRES_AT", 24*7), // 7 days
		Environment:          getEnv("ENVIRONMENT", "development"),
		InitialAdminEmail:    getEnv("INITIAL_ADMIN_EMAIL", ""),
		InitialAdminPassword: getEnv("INITIAL_ADMIN_PASSWORD", ""),
		InitialAdminName:     getEnv("INITIAL_ADMIN_NAME", "Administrator"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
