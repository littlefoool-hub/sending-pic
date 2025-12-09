package handlers

import (
	"image-uploader-backend/internal/models"
	"image-uploader-backend/internal/repository"
	"image-uploader-backend/internal/service"
	"net/http"

	"github.com/labstack/echo/v4"
)

type AdminHandler struct {
	imageService *service.ImageService
	userRepo     *repository.UserRepository
}

func NewAdminHandler(imageService *service.ImageService, userRepo *repository.UserRepository) *AdminHandler {
	return &AdminHandler{
		imageService: imageService,
		userRepo:     userRepo,
	}
}

func (h *AdminHandler) GetUsers(c echo.Context) error {
	users, err := h.userRepo.GetAllWithImageCount()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to get users",
			Code:  "GET_ERROR",
		})
	}

	// Убираем пароли из ответа
	for i := range users {
		users[i].PasswordHash = ""
	}

	return c.JSON(http.StatusOK, users)
}

func (h *AdminHandler) GetUserImages(c echo.Context) error {
	userID := c.Param("id")

	images, err := h.imageService.GetByUserID(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to get user images",
			Code:  "GET_ERROR",
		})
	}

	return c.JSON(http.StatusOK, images)
}
