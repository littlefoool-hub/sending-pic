package handlers

import (
	"image-uploader-backend/internal/middleware"
	"image-uploader-backend/internal/models"
	"image-uploader-backend/internal/service"
	"net/http"

	"github.com/labstack/echo/v4"
)

type ImagesHandler struct {
	imageService *service.ImageService
}

func NewImagesHandler(imageService *service.ImageService) *ImagesHandler {
	return &ImagesHandler{
		imageService: imageService,
	}
}

func (h *ImagesHandler) GetMyImages(c echo.Context) error {
	// Получаем текущего пользователя
	user := middleware.GetCurrentUser(c)
	if user == nil {
		return c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "Unauthorized",
			Code:  "UNAUTHORIZED",
		})
	}

	// Получаем изображения пользователя
	images, err := h.imageService.GetByUserID(user.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to get images",
			Code:  "GET_ERROR",
		})
	}

	return c.JSON(http.StatusOK, images)
}

