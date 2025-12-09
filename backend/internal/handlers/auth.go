package handlers

import (
	"image-uploader-backend/internal/middleware"
	"image-uploader-backend/internal/models"
	"image-uploader-backend/internal/service"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Register(c echo.Context) error {
	var req models.RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Invalid request",
			Code:  "INVALID_REQUEST",
		})
	}

	// Валидация
	if req.Username == "" || len(req.Username) < 3 {
		return c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Username must be at least 3 characters",
			Code:  "VALIDATION_ERROR",
		})
	}

	if req.Password == "" || len(req.Password) < 6 {
		return c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Password must be at least 6 characters",
			Code:  "VALIDATION_ERROR",
		})
	}

	// Устанавливаем роль по умолчанию
	if req.Role == "" {
		req.Role = "user"
	}

	// Регистрация
	user, err := h.authService.Register(req.Username, req.Password, req.Role)
	if err != nil {
		// Проверяем тип ошибки для более детального сообщения
		errorCode := "REGISTRATION_ERROR"
		if err.Error() == "username already exists" {
			errorCode = "USERNAME_EXISTS"
		}
		return c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: err.Error(),
			Code:  errorCode,
		})
	}

	return c.JSON(http.StatusCreated, models.AuthResponse{
		User: *user,
	})
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req models.LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Invalid request",
			Code:  "INVALID_REQUEST",
		})
	}

	// Логин
	sessionID, user, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: err.Error(),
			Code:  "LOGIN_ERROR",
		})
	}

	// Устанавливаем cookie
	cookie := new(http.Cookie)
	cookie.Name = "session_id"
	cookie.Value = sessionID
	cookie.Expires = time.Now().Add(24 * time.Hour)
	cookie.HttpOnly = true
	cookie.Path = "/"
	cookie.SameSite = http.SameSiteLaxMode
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, models.LoginResponse{
		User: *user,
	})
}

func (h *AuthHandler) Logout(c echo.Context) error {
	cookie, err := c.Cookie("session_id")
	if err == nil && cookie.Value != "" {
		h.authService.Logout(cookie.Value)
	}

	// Удаляем cookie
	deleteCookie := new(http.Cookie)
	deleteCookie.Name = "session_id"
	deleteCookie.Value = ""
	deleteCookie.Expires = time.Unix(0, 0)
	deleteCookie.HttpOnly = true
	deleteCookie.Path = "/"
	c.SetCookie(deleteCookie)

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Logged out successfully",
	})
}

func (h *AuthHandler) GetMe(c echo.Context) error {
	user := middleware.GetCurrentUser(c)
	if user == nil {
		return c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "Unauthorized",
			Code:  "UNAUTHORIZED",
		})
	}

	return c.JSON(http.StatusOK, models.AuthResponse{
		User: *user,
	})
}

