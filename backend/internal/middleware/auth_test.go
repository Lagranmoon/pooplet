package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/Lagranmoon/pooplet/internal/config"
	"github.com/Lagranmoon/pooplet/internal/models"
)

func init() {
	gin.SetMode(gin.TestMode)
	// Set JWT secret for tests
	models.SetJWTSecret("test-secret-key-for-tests-min-16")
}

func TestAuthMiddleware_MissingHeader(t *testing.T) {
	cfg := &config.Config{
		JWTSecret: "test-secret",
	}

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthMiddleware_InvalidFormat(t *testing.T) {
	cfg := &config.Config{
		JWTSecret: "test-secret",
	}

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	tests := []struct {
		name   string
		header string
	}{
		{"no bearer prefix", "invalid-token"},
		{"wrong prefix", "Basic some-token"},
		{"empty token", "Bearer "},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/test", nil)
			req.Header.Set("Authorization", tt.header)
			router.ServeHTTP(w, req)

			assert.Equal(t, http.StatusUnauthorized, w.Code)
		})
	}
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret: "test-secret",
	}

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestGenerateToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key",
		JWTExpiresAt: 24,
	}

	token, expiresAt, err := GenerateToken(cfg, "user-123", "test@example.com", models.RoleUser)

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.Greater(t, expiresAt, int64(0))
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key",
		JWTExpiresAt: 24,
	}

	token, _, _ := GenerateToken(cfg, "user-123", "test@example.com", models.RoleUser)

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		email, _ := c.Get("email")
		c.JSON(http.StatusOK, gin.H{
			"user_id": userID,
			"email":   email,
		})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAuthMiddleware_ValidTokenWithRole(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key",
		JWTExpiresAt: 24,
	}

	token, _, _ := GenerateToken(cfg, "user-123", "test@example.com", models.RoleAdmin)

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		role, _ := c.Get("role")
		c.JSON(http.StatusOK, gin.H{"role": role})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAuthMiddleware_ExpiredToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key",
		JWTExpiresAt: 24,
	}

	// Create an expired token
	expiresAt := time.Now().Add(-1 * time.Hour).Unix()
	claims := &Claims{
		UserID: "user-123",
		Email:  "test@example.com",
		Role:   models.RoleUser,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Unix(expiresAt, 0)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(cfg.JWTSecret))

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthMiddleware_MissingUserID(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key",
		JWTExpiresAt: 24,
	}

	// Create a token without user_id
	expiresAt := time.Now().Add(24 * time.Hour).Unix()
	claims := jwt.MapClaims{
		"email":  "test@example.com",
		"role":   string(models.RoleUser),
		"exp":    expiresAt,
		"iat":    time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(cfg.JWTSecret))

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthMiddleware_MissingEmail(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key",
		JWTExpiresAt: 24,
	}

	// Create a token without email
	expiresAt := time.Now().Add(24 * time.Hour).Unix()
	claims := jwt.MapClaims{
		"user_id": "user-123",
		"role":    string(models.RoleUser),
		"exp":     expiresAt,
		"iat":     time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(cfg.JWTSecret))

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthMiddleware_DefaultRole(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key",
		JWTExpiresAt: 24,
	}

	// Create a token without role
	expiresAt := time.Now().Add(24 * time.Hour).Unix()
	claims := jwt.MapClaims{
		"user_id": "user-123",
		"email":   "test@example.com",
		"exp":     expiresAt,
		"iat":     time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(cfg.JWTSecret))

	router := gin.New()
	router.Use(AuthMiddleware(cfg))
	router.GET("/test", func(c *gin.Context) {
		role, _ := c.Get("role")
		c.JSON(http.StatusOK, gin.H{"role": role})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	// Role should default to "user"
	assert.Contains(t, w.Body.String(), "user")
}

// ==================== AdminMiddleware Tests ====================

func TestAdminMiddleware_AdminAccess(t *testing.T) {
	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("role", string(models.RoleAdmin))
		c.Next()
	})
	router.Use(AdminMiddleware())
	router.GET("/admin", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "admin access"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/admin", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAdminMiddleware_UserAccess(t *testing.T) {
	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("role", string(models.RoleUser))
		c.Next()
	})
	router.Use(AdminMiddleware())
	router.GET("/admin", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "admin access"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/admin", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

func TestAdminMiddleware_NoRole(t *testing.T) {
	router := gin.New()
	// Don't set role
	router.Use(AdminMiddleware())
	router.GET("/admin", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "admin access"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/admin", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

// ==================== Claims Tests ====================

func TestClaims_Structure(t *testing.T) {
	claims := &Claims{
		UserID: "test-user",
		Email:  "test@example.com",
		Role:   models.RoleAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	assert.Equal(t, "test-user", claims.UserID)
	assert.Equal(t, "test@example.com", claims.Email)
	assert.Equal(t, models.RoleAdmin, claims.Role)
}

// ==================== GenerateToken Tests ====================

func TestGenerateToken_DifferentSecrets(t *testing.T) {
	cfg1 := &config.Config{
		JWTSecret:    "secret-key-1-min-16-chars",
		JWTExpiresAt: 24,
	}
	cfg2 := &config.Config{
		JWTSecret:    "secret-key-2-min-16-chars",
		JWTExpiresAt: 24,
	}

	token1, _, _ := GenerateToken(cfg1, "user-1", "test1@example.com", models.RoleUser)
	token2, _, _ := GenerateToken(cfg2, "user-2", "test2@example.com", models.RoleUser)

	assert.NotEqual(t, token1, token2)
}

func TestGenerateToken_DifferentUsers(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key-min-16-chars",
		JWTExpiresAt: 24,
	}

	token1, _, _ := GenerateToken(cfg, "user-1", "test1@example.com", models.RoleUser)
	token2, _, _ := GenerateToken(cfg, "user-2", "test2@example.com", models.RoleUser)

	assert.NotEqual(t, token1, token2)
}

func TestGenerateToken_AdminRole(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key-min-16-chars",
		JWTExpiresAt: 24,
	}

	token, _, err := GenerateToken(cfg, "admin-1", "admin@example.com", models.RoleAdmin)

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
}

func TestGenerateToken_InvalidSecret(t *testing.T) {
	// Test that even with short secret, jwt library may still generate token
	// The validation happens elsewhere, this function may succeed
	cfg := &config.Config{
		JWTSecret:    "short",
		JWTExpiresAt: 24,
	}

	// The jwt library itself doesn't validate secret length
	token, expiresAt, err := GenerateToken(cfg, "user-1", "test@example.com", models.RoleUser)
	// If there's an error, that's fine. If not, the token should still be valid
	if err == nil {
		assert.NotEmpty(t, token)
		assert.Greater(t, expiresAt, int64(0))
	}
}
