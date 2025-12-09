package middleware

import (
	"image-uploader-backend/internal/models"
	"image-uploader-backend/internal/service"
	"net/http"

	"github.com/labstack/echo/v4"
)

const (
	UserContextKey = "user"
)

// validateSession проверяет сессию и возвращает пользователя или ошибку
func validateSession(c echo.Context, authService *service.AuthService) (*models.User, error) {
	cookie, err := c.Cookie("session_id")
	if err != nil || cookie.Value == "" {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, models.ErrorResponse{
			Error: "Unauthorized",
			Code:  "UNAUTHORIZED",
		})
	}

	user, err := authService.ValidateSession(cookie.Value)
	if err != nil {
		return nil, echo.NewHTTPError(http.StatusUnauthorized, models.ErrorResponse{
			Error: "Invalid or expired session",
			Code:  "INVALID_SESSION",
		})
	}

	return user, nil
}

func RequireAuth(authService *service.AuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user, err := validateSession(c, authService)
			if err != nil {
				return err
			}

			c.Set(UserContextKey, user)
			return next(c)
		}
	}
}

func RequireUser(authService *service.AuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user, err := validateSession(c, authService)
			if err != nil {
				return err
			}

			if user.Role == "admin" {
				return c.JSON(http.StatusForbidden, models.ErrorResponse{
					Error: "Forbidden - admin cannot access user resources",
					Code:  "FORBIDDEN",
				})
			}

			c.Set(UserContextKey, user)
			return next(c)
		}
	}
}

func RequireAdmin(authService *service.AuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			user, err := validateSession(c, authService)
			if err != nil {
				return err
			}

			if user.Role != "admin" {
				return c.JSON(http.StatusForbidden, models.ErrorResponse{
					Error: "Forbidden - admin access required",
					Code:  "FORBIDDEN",
				})
			}

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

