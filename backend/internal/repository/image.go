package repository

import (
	"database/sql"
	"image-uploader-backend/internal/models"
	"time"

	"github.com/google/uuid"
)

type ImageRepository struct {
	db *sql.DB
}

func NewImageRepository(db *sql.DB) *ImageRepository {
	return &ImageRepository{db: db}
}

func (r *ImageRepository) Create(image *models.Image) error {
	image.ID = uuid.New().String()
	image.CreatedAt = time.Now()

	query := `
		INSERT INTO images (id, user_id, original_name, file_name, file_path, mime_type, size, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := r.db.Exec(query, image.ID, image.UserID, image.OriginalName, image.FileName, image.FilePath,
		image.MimeType, image.Size, image.CreatedAt)

	return err
}

func (r *ImageRepository) GetByUserID(userID string) ([]*models.Image, error) {
	query := `
		SELECT id, user_id, original_name, file_name, file_path, mime_type, size, created_at 
		FROM images 
		WHERE user_id = ?
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []*models.Image
	for rows.Next() {
		image := &models.Image{}
		err := rows.Scan(
			&image.ID, &image.UserID, &image.OriginalName, &image.FileName, &image.FilePath,
			&image.MimeType, &image.Size, &image.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		images = append(images, image)
	}

	return images, nil
}
