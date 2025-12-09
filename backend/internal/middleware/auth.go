package middleware

import (
	"image-uploader-backend/internal/models"
	"image-uploader-backend/internal/service"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

const (
	UserContextKey = "user"
)

func RequireAuth(authService *service.AuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Получаем session_id из cookie
			cookie, err := c.Cookie("session_id")
			if err != nil || cookie.Value == "" {
				return c.JSON(http.StatusUnauthorized, models.ErrorResponse{
					Error: "Unauthorized",
					Code:  "UNAUTHORIZED",
				})
			}

			// Проверяем сессию
			user, err := authService.ValidateSession(cookie.Value)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, models.ErrorResponse{
					Error: "Invalid or expired session",
					Code:  "INVALID_SESSION",
				})
			}

			// Сохраняем пользователя в контекст
			c.Set(UserContextKey, user)

			return next(c)
		}
	}
}

func RequireAdmin(authService *service.AuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Получаем session_id из cookie
			cookie, err := c.Cookie("session_id")
			if err != nil || cookie.Value == "" {
				return c.JSON(http.StatusUnauthorized, models.ErrorResponse{
					Error: "Unauthorized",
					Code:  "UNAUTHORIZED",
				})
			}

			// Проверяем сессию
			user, err := authService.ValidateSession(cookie.Value)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, models.ErrorResponse{
					Error: "Invalid or expired session",
					Code:  "INVALID_SESSION",
				})
			}

			// Проверяем роль
			if user.Role != "admin" {
				return c.JSON(http.StatusForbidden, models.ErrorResponse{
					Error: "Forbidden - admin access required",
					Code:  "FORBIDDEN",
				})
			}

			// Сохраняем пользователя в контекст
			c.Set(UserContextKey, user)

			return next(c)
		}
	}
}

func GetCurrentUser(c echo.Context) *models.User {
	user, ok := c.Get(UserContextKey).(*models.User)
	if !ok {
		return nil
	}
	return user
}

func CORSWithCredentials() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			origin := c.Request().Header.Get("Origin")
			
			// Разрешаем только определенные origin
			allowedOrigins := []string{"http://localhost:3000", "http://localhost", "http://localhost:80"}
			allowed := false
			for _, allowedOrigin := range allowedOrigins {
				if origin == allowedOrigin {
					allowed = true
					break
				}
			}

			if allowed {
				c.Response().Header().Set("Access-Control-Allow-Origin", origin)
				c.Response().Header().Set("Access-Control-Allow-Credentials", "true")
				c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			}

			// Обрабатываем preflight запросы
			if c.Request().Method == "OPTIONS" {
				return c.NoContent(http.StatusNoContent)
			}

			return next(c)
		}
	}
}

func GetCookieDomain(c echo.Context) string {
	host := c.Request().Host
	if strings.Contains(host, "localhost") || strings.Contains(host, "127.0.0.1") {
		return ""
	}
	return host
}

