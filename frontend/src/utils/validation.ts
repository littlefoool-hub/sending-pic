export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB в байтах

export function validateImageFile(file: File): ValidationResult {
  // Проверка типа файла
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Неподдерживаемый формат изображения. Разрешены: JPG, PNG, GIF, WebP',
    };
  }

  // Проверка размера файла
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `Размер файла превышает ${maxSizeMB}MB`,
    };
  }

  // Проверка, что файл не пустой
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Файл пустой',
    };
  }

  return {
    valid: true,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

