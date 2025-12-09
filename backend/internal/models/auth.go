package models

type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Password string `json:"password" validate:"required,min=6"`
	Role     string `json:"role,omitempty"` // По умолчанию "user", админ создается вручную
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	User  User   `json:"user"`
	Token string `json:"token,omitempty"` // Не используется, но оставлено для совместимости
}

type AuthResponse struct {
	User User `json:"user"`
}

