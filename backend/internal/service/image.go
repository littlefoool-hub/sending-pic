package service

import (
	"fmt"
	"image-uploader-backend/internal/config"
	"image-uploader-backend/internal/models"
	"image-uploader-backend/internal/repository"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

type ImageService struct {
	repo   *repository.ImageRepository
	config *config.Config
}

func NewImageService(repo *repository.ImageRepository, cfg *config.Config) *ImageService {
	// Создаем папку для загрузок если её нет
	os.MkdirAll(cfg.UploadDir, 0755)

	return &ImageService{
		repo:   repo,
		config: cfg,
	}
}

// buildImageURL формирует URL для изображения на основе относительного пути
func (s *ImageService) buildImageURL(relPath string) string {
	return fmt.Sprintf("%s/images/%s", s.config.BaseURL, relPath)
}

func (s *ImageService) ValidateFile(file *multipart.FileHeader) error {
	// Проверка размера
	if file.Size > s.config.MaxFileSize {
		return fmt.Errorf("file size exceeds maximum allowed size of %d bytes", s.config.MaxFileSize)
	}

	// Проверка типа файла
	allowed := false
	mimeType := file.Header.Get("Content-Type")
	for _, allowedType := range s.config.AllowedTypes {
		if mimeType == allowedType {
			allowed = true
			break
		}
	}

	if !allowed {
		return fmt.Errorf("file type %s is not allowed", mimeType)
	}

	return nil
}

func (s *ImageService) SaveFile(file *multipart.FileHeader, userID string) (*models.Image, error) {
	// Открываем файл
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Генерируем уникальное имя файла
	ext := filepath.Ext(file.Filename)
	fileName := uuid.New().String() + ext

	// Создаем структуру папок по дате
	now := time.Now()
	datePath := filepath.Join(
		fmt.Sprintf("%04d", now.Year()),
		fmt.Sprintf("%02d", now.Month()),
		fmt.Sprintf("%02d", now.Day()),
	)

	fullPath := filepath.Join(s.config.UploadDir, datePath)
	os.MkdirAll(fullPath, 0755)

	filePath := filepath.Join(fullPath, fileName)

	// Создаем файл на диске
	dst, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Копируем содержимое
	if _, err := io.Copy(dst, src); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	// Определяем MIME тип более точно
	mimeType := file.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	// Формируем относительный путь для URL
	relPath := strings.ReplaceAll(datePath, string(filepath.Separator), "/") + "/" + fileName

	// Создаем объект изображения
	image := &models.Image{
		UserID:       userID,
		OriginalName: file.Filename,
		FileName:     fileName,
		FilePath:     filePath,
		MimeType:     mimeType,
		Size:         file.Size,
		URL:          s.buildImageURL(relPath),
	}

	// Сохраняем в БД
	if err := s.repo.Create(image); err != nil {
		// Если не удалось сохранить в БД, удаляем файл
		os.Remove(filePath)
		return nil, fmt.Errorf("failed to save to database: %w", err)
	}

	return image, nil
}

func (s *ImageService) GetByUserID(userID string) ([]*models.Image, error) {
	images, err := s.repo.GetByUserID(userID)
	if err != nil {
		return nil, err
	}

	// Формируем URLs для всех изображений
	for _, image := range images {
		relPath := strings.TrimPrefix(image.FilePath, s.config.UploadDir+string(filepath.Separator))
		relPath = strings.ReplaceAll(relPath, string(filepath.Separator), "/")
		image.URL = s.buildImageURL(relPath)
	}

	return images, nil
}
