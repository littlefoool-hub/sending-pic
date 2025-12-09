package models

import "time"

type Image struct {
	ID           string    `json:"id" db:"id"`
	UserID       string    `json:"user_id" db:"user_id"`
	OriginalName string    `json:"original_name" db:"original_name"`
	FileName     string    `json:"file_name" db:"file_name"`
	FilePath     string    `json:"file_path" db:"file_path"`
	MimeType     string    `json:"mime_type" db:"mime_type"`
	Size         int64     `json:"size" db:"size"`
	URL          string    `json:"url" db:"-"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type UploadResponse struct {
	URL      string `json:"url"`
	ID       string `json:"id"`
	Filename string `json:"filename"`
}

type ErrorResponse struct {
	Error string `json:"error"`
	Code  string `json:"code,omitempty"`
}
