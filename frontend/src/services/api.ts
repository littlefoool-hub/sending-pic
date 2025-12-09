export interface UploadResponse {
  url: string;
  id: string;
  filename: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  user: User;
}

export interface AuthResponse {
  user: User;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

export type ProgressCallback = (progress: number) => void;

// Базовая функция для API запросов с поддержкой cookies
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include', // Важно для отправки cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Аутентификация
export async function register(username: string, password: string): Promise<User> {
  const response: AuthResponse = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return response.user;
}

export async function login(username: string, password: string): Promise<User> {
  const response: LoginResponse = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return response.user;
}

export async function logout(): Promise<void> {
  await apiRequest('/api/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<User> {
  const response: AuthResponse = await apiRequest<AuthResponse>('/api/auth/me', {
    method: 'GET',
  });
  return response.user;
}

export function uploadImage(
  file: File,
  onProgress: ProgressCallback
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    // Создаем XMLHttpRequest для отслеживания прогресса
    const xhr = new XMLHttpRequest();

    // Формируем FormData с файлом
    const formData = new FormData();
    formData.append('image', file);

    // Обработка прогресса загрузки
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    // Обработка успешного завершения
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as UploadResponse;
          resolve(response);
        } catch (error) {
          reject(new Error('Ошибка при разборе ответа сервера'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText) as ErrorResponse;
          reject(new Error(errorResponse.error || `Ошибка сервера: ${xhr.status}`));
        } catch {
          reject(new Error(`Ошибка сервера: ${xhr.status} ${xhr.statusText}`));
        }
      }
    });

    // Обработка ошибок сети
    xhr.addEventListener('error', () => {
      reject(new Error('Ошибка сети при загрузке файла'));
    });

    // Обработка отмены загрузки
    xhr.addEventListener('abort', () => {
      reject(new Error('Загрузка файла была отменена'));
    });

    // Настраиваем запрос с поддержкой cookies
    xhr.open('POST', '/api/upload');
    xhr.withCredentials = true; // Важно для отправки cookies

    // Отправляем запрос
    xhr.send(formData);
  });
}

// API для админа
export async function getAdminUsers(): Promise<any[]> {
  return apiRequest<any[]>('/api/admin/users', {
    method: 'GET',
  });
}

export async function getUserImages(userId: string): Promise<any[]> {
  return apiRequest<any[]>(`/api/admin/users/${userId}/images`, {
    method: 'GET',
  });
}

