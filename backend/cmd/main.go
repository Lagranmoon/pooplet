package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/Lagranmoon/pooplet/internal/config"
	"github.com/Lagranmoon/pooplet/internal/handlers"
	"github.com/Lagranmoon/pooplet/internal/middleware"
	"github.com/Lagranmoon/pooplet/internal/models"
	"github.com/Lagranmoon/pooplet/internal/repository"
	"github.com/Lagranmoon/pooplet/internal/services"
)

func main() {
	cfg := config.Load()

	models.SetJWTSecret(cfg.JWTSecret)

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	repo, err := repository.NewRepository(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer repo.Close()

	service := services.NewService(repo)
	handler := handlers.NewHandler(service)

	// Create initial admin if configured and no users exist
	if cfg.InitialAdminEmail != "" && cfg.InitialAdminPassword != "" {
		log.Printf("Attempting to create initial admin account...")
		err := service.CreateInitialAdmin(
			cfg.InitialAdminEmail,
			cfg.InitialAdminPassword,
			cfg.InitialAdminName,
		)
		if err != nil {
			// If users already exist, that's okay - just log it
			log.Printf("Initial admin creation skipped: %v", err)
		} else {
			log.Printf("Initial admin account created successfully: %s", cfg.InitialAdminEmail)
		}
	}

	router := gin.Default()

	// Serve static files from frontend/dist
	router.Static("/assets", "./frontend/dist/assets")
	router.StaticFile("/", "./frontend/dist/index.html")

	// SPA fallback: serve index.html for unmatched routes
	router.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		// Skip API routes
		if len(path) > 4 && path[:4] == "/api" {
			c.JSON(http.StatusNotFound, gin.H{"error": "API endpoint not found"})
			return
		}
		c.File("./frontend/dist/index.html")
	})

	api := router.Group("/api/v1")
	{
		api.GET("/health", handler.HealthCheck)
		api.POST("/auth/register", handler.Register)
		api.POST("/auth/login", handler.Login)

		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			protected.GET("/profile", handler.GetProfile)
			protected.GET("/logs", handler.GetLogs)
			protected.POST("/logs", handler.CreateLog)
			protected.GET("/logs/:id", handler.GetLog)
			protected.PUT("/logs/:id", handler.UpdateLog)
			protected.DELETE("/logs/:id", handler.DeleteLog)
			protected.GET("/stats", handler.GetStats)

			admin := protected.Group("")
			admin.Use(middleware.AdminMiddleware())
			{
				admin.GET("/admin/users", handler.GetAllUsers)
				admin.POST("/admin/users", handler.CreateUser)
				admin.PUT("/admin/users/:id/role", handler.UpdateUserRole)
				admin.DELETE("/admin/users/:id", handler.DeleteUser)
				admin.GET("/admin/config/:key", handler.GetSystemConfig)
				admin.PUT("/admin/config/:key", handler.SetSystemConfig)
			}
		}
	}

	router.Run(":" + strconv.Itoa(cfg.ServerPort))

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
}
