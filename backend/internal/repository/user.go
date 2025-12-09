package repository

import (
	"database/sql"
	"image-uploader-backend/internal/models"
	"time"

	"github.com/google/uuid"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	user.ID = uuid.New().String()
	user.CreatedAt = time.Now()

	query := `
		INSERT INTO users (id, username, password_hash, role, created_at)
		VALUES (?, ?, ?, ?, ?)
	`

	_, err := r.db.Exec(query, user.ID, user.Username, user.PasswordHash, user.Role, user.CreatedAt)
	return err
}

func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, username, password_hash, role, created_at 
	          FROM users WHERE username = ?`

	err := r.db.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.PasswordHash, &user.Role, &user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetByID(id string) (*models.User, error) {
	user := &models.User{}
	query := `SELECT id, username, password_hash, role, created_at 
	          FROM users WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Username, &user.PasswordHash, &user.Role, &user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetAllWithImageCount() ([]*models.UserWithImageCount, error) {
	query := `
		SELECT 
			u.id, 
			u.username, 
			u.password_hash, 
			u.role, 
			u.created_at,
			COUNT(i.id) as image_count
		FROM users u
		LEFT JOIN images i ON u.id = i.user_id
		GROUP BY u.id, u.username, u.password_hash, u.role, u.created_at
		ORDER BY u.created_at DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.UserWithImageCount
	for rows.Next() {
		user := &models.UserWithImageCount{}
		err := rows.Scan(
			&user.ID, &user.Username, &user.PasswordHash, &user.Role, &user.CreatedAt, &user.ImageCount,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

