package models

import (
	"errors"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	jwtSecret   string
	jwtSecretMu sync.RWMutex
)

// ErrInvalidJWTSecret indicates that the JWT secret is invalid or uses the default value
var ErrInvalidJWTSecret = errors.New("invalid JWT secret: must be changed from default value")

func SetJWTSecret(secret string) {
	jwtSecretMu.Lock()
	defer jwtSecretMu.Unlock()
	jwtSecret = secret
}

func getJWTSecret() string {
	jwtSecretMu.RLock()
	defer jwtSecretMu.RUnlock()
	return jwtSecret
}

// ValidateJWTSecret checks if the JWT secret is valid (not using default)
func ValidateJWTSecret() error {
	secret := getJWTSecret()
	if secret == "your-super-secret-key-change-in-production" || len(secret) < 16 {
		return ErrInvalidJWTSecret
	}
	return nil
}

func GenerateUUID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	result := make([]byte, length)
	now := time.Now().UnixNano()
	for i := 0; i < length; i++ {
		result[i] = charset[(now+int64(i))%int64(len(charset))]
	}
	return string(result)
}

func GenerateToken(user *User) (string, int64, error) {
	secret := getJWTSecret()
	// Validate secret before generating token
	if secret == "your-super-secret-key-change-in-production" || len(secret) < 16 {
		return "", 0, ErrInvalidJWTSecret
	}

	expiresAt := time.Now().Add(time.Duration(24*7) * time.Hour).Unix()

	// Set default role to user if not set
	role := user.Role
	if role == "" {
		role = RoleUser
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    role,
		"exp":     expiresAt,
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", 0, err
	}

	return tokenString, expiresAt, nil
}
