package config

import "os"

type Config struct {
	Port         string
	DBPath       string
	UploadDir    string
	BaseURL      string
	SentryDSN    string
	MaxFileSize  int64
	AllowedTypes []string
}

func Load() *Config {
	return &Config{
		Port:         getEnv("PORT", "8080"),
		DBPath:       getEnv("DB_PATH", "./database.db"),
		UploadDir:    getEnv("UPLOAD_DIR", "./uploads"),
		BaseURL:      getEnv("BASE_URL", "http://localhost:8080"),
		SentryDSN:    getEnv("SENTRY_DSN", ""),
		MaxFileSize:  10 * 1024 * 1024, // 10MB
		AllowedTypes: []string{"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
