package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"image-uploader-backend/internal/models"
	"image-uploader-backend/internal/repository"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type Session struct {
	UserID    string
	ExpiresAt time.Time
}

type AuthService struct {
	userRepo *repository.UserRepository
	sessions map[string]*Session
	mu       sync.RWMutex
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		sessions: make(map[string]*Session),
	}
}

func (s *AuthService) Register(username, password, role string) (*models.User, error) {
	// Проверяем, существует ли пользователь
	_, err := s.userRepo.GetByUsername(username)
	if err == nil {
		// Пользователь уже существует
		return nil, errors.New("username already exists")
	}
	// Если ошибка - это нормально (пользователь не найден), продолжаем

	// Устанавливаем роль по умолчанию
	if role == "" {
		role = "user"
	}

	// Хешируем пароль
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	// Создаем пользователя
	user := &models.User{
		Username:     username,
		PasswordHash: string(hashedPassword),
		Role:         role,
	}

	err = s.userRepo.Create(user)
	if err != nil {
		// Проверяем, является ли ошибка нарушением UNIQUE constraint
		if strings.Contains(err.Error(), "UNIQUE constraint") || strings.Contains(err.Error(), "unique constraint") {
			return nil, errors.New("username already exists")
		}
		return nil, errors.New("failed to create user")
	}

	// Не возвращаем хеш пароля
	user.PasswordHash = ""
	return user, nil
}

func (s *AuthService) Login(username, password string) (string, *models.User, error) {
	// Получаем пользователя
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	// Проверяем пароль
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	// Создаем сессию
	sessionID := generateSessionID()
	expiresAt := time.Now().Add(24 * time.Hour) // Сессия на 24 часа

	s.mu.Lock()
	s.sessions[sessionID] = &Session{
		UserID:    user.ID,
		ExpiresAt: expiresAt,
	}
	s.mu.Unlock()

	// Очищаем старые сессии периодически (простая очистка при логине)
	s.cleanExpiredSessions()

	// Не возвращаем хеш пароля
	user.PasswordHash = ""
	return sessionID, user, nil
}

func (s *AuthService) ValidateSession(sessionID string) (*models.User, error) {
	s.mu.RLock()
	session, exists := s.sessions[sessionID]
	s.mu.RUnlock()

	if !exists {
		return nil, errors.New("invalid session")
	}

	// Проверяем срок действия
	if time.Now().After(session.ExpiresAt) {
		s.mu.Lock()
		delete(s.sessions, sessionID)
		s.mu.Unlock()
		return nil, errors.New("session expired")
	}

	// Получаем пользователя
	user, err := s.userRepo.GetByID(session.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Не возвращаем хеш пароля
	user.PasswordHash = ""
	return user, nil
}

func (s *AuthService) Logout(sessionID string) {
	s.mu.Lock()
	delete(s.sessions, sessionID)
	s.mu.Unlock()
}

func (s *AuthService) cleanExpiredSessions() {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	for sessionID, session := range s.sessions {
		if now.After(session.ExpiresAt) {
			delete(s.sessions, sessionID)
		}
	}
}

func generateSessionID() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

