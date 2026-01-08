package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/Lagranmoon/pooplet/internal/models"
	"github.com/Lagranmoon/pooplet/internal/services"
)

type Handler struct {
	service *services.Service
}

func NewHandler(service *services.Service) *Handler {
	return &Handler{service: service}
}

// serverError returns a generic error message without leaking internal details
func serverError(c *gin.Context, err error, message string) {
	// Log the full error for debugging
	log.Printf("Server error: %v", err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": message})
}

// Check if we're in development mode based on environment variable
func isDevelopment() bool {
	// This is a simple check - in production you'd want to use config
	return true // Simplified for now
}

func (h *Handler) Register(c *gin.Context) {
	// Check if registration is enabled
	regEnabled, err := h.service.GetSystemConfig(models.ConfigRegistrationEnabled)
	if err != nil {
		serverError(c, err, "Failed to check registration status")
		return
	}
	if regEnabled != "true" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Registration is currently disabled"})
		return
	}

	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, expiresAt, err := h.service.Register(&req)
	if err != nil {
		if err == services.ErrUserAlreadyExists {
			c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
			return
		}
		serverError(c, err, "Failed to register user")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token":      token,
		"expires_at": expiresAt,
		"user": models.UserResponse{
			ID:        user.ID,
			Role:      user.Role,
			Email:     user.Email,
			Name:      user.Name,
			CreatedAt: user.CreatedAt,
		},
	})
}

func (h *Handler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, expiresAt, err := h.service.Login(&req)
	if err != nil {
		if err == services.ErrInvalidCredential {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		serverError(c, err, "Login failed")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      token,
		"expires_at": expiresAt,
		"user": models.UserResponse{
			ID:        user.ID,
			Role:      user.Role,
			Email:     user.Email,
			Name:      user.Name,
			CreatedAt: user.CreatedAt,
		},
	})
}

func (h *Handler) GetProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	user, err := h.service.GetUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, models.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	})
}

func (h *Handler) CreateLog(c *gin.Context) {
	userID := c.GetString("user_id")

	var req models.CreateLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log, err := h.service.CreateLog(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.LogResponse{
		ID:         log.ID,
		UserID:     log.UserID,
		Timestamp:  log.Timestamp,
		Difficulty: log.Difficulty,
		Note:       log.Note,
		CreatedAt:  log.CreatedAt,
	})
}

func (h *Handler) GetLogs(c *gin.Context) {
	userID := c.GetString("user_id")

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var startDate, endDate *time.Time
	if startDateStr != "" {
		t, err := time.Parse("2006-01-02", startDateStr)
		if err == nil {
			startDate = &t
		}
	}
	if endDateStr != "" {
		t, err := time.Parse("2006-01-02", endDateStr)
		if err == nil {
			endDate = &t
		}
	}

	logs, err := h.service.GetLogs(userID, startDate, endDate)
	if err != nil {
		serverError(c, err, "Failed to fetch logs")
		return
	}

	response := make([]models.LogResponse, 0, len(logs))
	for _, log := range logs {
		response = append(response, models.LogResponse{
			ID:         log.ID,
			UserID:     log.UserID,
			Timestamp:  log.Timestamp,
			Difficulty: log.Difficulty,
			Note:       log.Note,
			CreatedAt:  log.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) GetLog(c *gin.Context) {
	userID := c.GetString("user_id")
	logID := c.Param("id")

	log, err := h.service.GetLog(logID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Log not found"})
		return
	}

	c.JSON(http.StatusOK, models.LogResponse{
		ID:         log.ID,
		UserID:     log.UserID,
		Timestamp:  log.Timestamp,
		Difficulty: log.Difficulty,
		Note:       log.Note,
		CreatedAt:  log.CreatedAt,
	})
}

func (h *Handler) UpdateLog(c *gin.Context) {
	userID := c.GetString("user_id")
	logID := c.Param("id")

	var req models.UpdateLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log, err := h.service.UpdateLog(logID, userID, &req)
	if err != nil {
		if err == services.ErrLogNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Log not found"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.LogResponse{
		ID:         log.ID,
		UserID:     log.UserID,
		Timestamp:  log.Timestamp,
		Difficulty: log.Difficulty,
		Note:       log.Note,
		CreatedAt:  log.CreatedAt,
	})
}

func (h *Handler) DeleteLog(c *gin.Context) {
	userID := c.GetString("user_id")
	logID := c.Param("id")

	if err := h.service.DeleteLog(logID, userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Log not found"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (h *Handler) GetStats(c *gin.Context) {
	userID := c.GetString("user_id")

	logs, err := h.service.GetLogs(userID, nil, nil)
	if err != nil {
		serverError(c, err, "Failed to fetch logs for stats")
		return
	}

	today := time.Now()
	todayStart := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())
	weekStart := todayStart.AddDate(0, 0, -int(today.Weekday())+1)

	todayLogs := 0
	weekLogs := 0
	streak := 0

	difficultyCount := map[string]int{
		"easy":      0,
		"normal":    0,
		"hard":      0,
		"very_hard": 0,
	}

	dateLogs := make(map[string]int)

	for _, log := range logs {
		if log.Timestamp.After(todayStart) {
			todayLogs++
		}
		if log.Timestamp.After(weekStart) {
			weekLogs++
		}

		difficultyCount[log.Difficulty]++

		dateKey := log.Timestamp.Format("2006-01-02")
		dateLogs[dateKey]++
	}

	// Calculate streak
	for i := 0; i < 365; i++ {
		checkDate := todayStart.AddDate(0, 0, -i)
		dateKey := checkDate.Format("2006-01-02")
		if dateLogs[dateKey] > 0 {
			streak++
		} else if i > 0 {
			break
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"today_count":    todayLogs,
		"week_count":     weekLogs,
		"week_avg":       float64(weekLogs) / 7.0,
		"total_count":    len(logs),
		"streak":         streak,
		"difficulty_map": difficultyCount,
		"date_logs":      dateLogs,
	})
}

func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *Handler) GetAllUsers(c *gin.Context) {
	users, err := h.service.GetAllUsers()
	if err != nil {
		serverError(c, err, "Failed to fetch users")
		return
	}

	response := make([]models.UserListResponse, 0, len(users))
	for _, user := range users {
		response = append(response, models.UserListResponse{
			ID:        user.ID,
			Email:     user.Email,
			Name:      user.Name,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *Handler) UpdateUserRole(c *gin.Context) {
	userID := c.Param("id")

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateUserRole(userID, req.Role); err != nil {
		serverError(c, err, "Failed to update user role")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}

func (h *Handler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")
	currentUserID := c.GetString("user_id")

	// Prevent deleting yourself
	if userID == currentUserID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete yourself"})
		return
	}

	if err := h.service.DeleteUser(userID); err != nil {
		serverError(c, err, "Failed to delete user")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func (h *Handler) CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, expiresAt, err := h.service.CreateUser(&req)
	if err != nil {
		serverError(c, err, "Failed to create user")
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "User created successfully",
		"user":       user,
		"token":      token,
		"expires_at": expiresAt,
	})
}

func (h *Handler) GetSystemConfig(c *gin.Context) {
	key := c.Param("key")
	value, err := h.service.GetSystemConfig(key)
	if err != nil {
		serverError(c, err, "Failed to get system config")
		return
	}

	c.JSON(http.StatusOK, gin.H{"key": key, "value": value})
}

func (h *Handler) SetSystemConfig(c *gin.Context) {
	key := c.Param("key")

	var req models.UpdateSystemConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.SetSystemConfig(key, req.Value); err != nil {
		serverError(c, err, "Failed to set system config")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Config updated successfully", "key": key, "value": req.Value})
}
