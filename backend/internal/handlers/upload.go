package handlers

import (
	"image-uploader-backend/internal/models"
	"image-uploader-backend/internal/service"
	"net/http"

	"github.com/labstack/echo/v4"
)

type UploadHandler struct {
	imageService *service.ImageService
}

func NewUploadHandler(imageService *service.ImageService) *UploadHandler {
	return &UploadHandler{
		imageService: imageService,
	}
}

func (h *UploadHandler) UploadImage(c echo.Context) error {
	// Получаем текущего пользователя из контекста
	user := c.Get("user")
	if user == nil {
		return c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "Unauthorized",
			Code:  "UNAUTHORIZED",
		})
	}

	userModel, ok := user.(*models.User)
	if !ok {
		return c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error: "Unauthorized",
			Code:  "UNAUTHORIZED",
		})
	}

	// Получаем файл из формы
	file, err := c.FormFile("image")
	if err != nil {
		return c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "No image file provided",
			Code:  "NO_FILE",
		})
	}

	// Валидируем файл
	if err := h.imageService.ValidateFile(file); err != nil {
		return c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: err.Error(),
			Code:  "VALIDATION_ERROR",
		})
	}

	// Сохраняем файл с привязкой к пользователю
	image, err := h.imageService.SaveFile(file, userModel.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Failed to save image",
			Code:  "SAVE_ERROR",
		})
	}

	// Возвращаем ответ
	return c.JSON(http.StatusOK, models.UploadResponse{
		URL:      image.URL,
		ID:       image.ID,
		Filename: image.FileName,
	})
}
