# Image Uploader Backend

Бэкенд для загрузки изображений на Go + Echo + SQLite.

## Требования

- Go 1.24+
- SQLite (используется pure Go драйвер `modernc.org/sqlite`, CGO не требуется)
- Docker (опционально, но рекомендуется)

## Установка

1. Установите зависимости:
```bash
go mod download
```

2. Настройте переменные окружения (опционально, скопируйте .env.example в .env):
```bash
cp .env.example .env
```

Файл базы данных SQLite создастся автоматически при первом запуске.

3. Запустите сервер:
```bash
go run ./cmd/server/main.go
```

## API Endpoints

### Аутентификация

#### Регистрация
- **POST** `/api/auth/register`
- Тело запроса:
```json
{
  "username": "user123",
  "password": "password123",
  "role": "user"
}
```

#### Вход
- **POST** `/api/auth/login`
- Тело запроса:
```json
{
  "username": "user123",
  "password": "password123"
}
```

#### Выход
- **POST** `/api/auth/logout`
- Требует аутентификации

#### Получить текущего пользователя
- **GET** `/api/auth/me`
- Требует аутентификации
- Возвращает данные текущего пользователя

### Загрузка изображения
- **POST** `/api/upload`
- Требует аутентификации (только обычные пользователи, не админы)
- Формат: `multipart/form-data`
- Поле: `image`
- Ответ: 
```json
{
  "url": "http://localhost:8080/images/2024/01/15/uuid.jpg",
  "id": "uuid",
  "filename": "uuid.jpg"
}
```

### Административные endpoints

#### Получить список пользователей
- **GET** `/api/admin/users`
- Требует роль администратора
- Ответ: массив пользователей с количеством изображений

#### Получить изображения пользователя
- **GET** `/api/admin/users/:id/images`
- Требует роль администратора
- Ответ: массив изображений конкретного пользователя

### Прочие endpoints

#### Health check
- **GET** `/health` или **HEAD** `/health`
- Ответ: 
```json
{
  "status": "OK"
}
```

#### Получить изображение
- **GET** `/images/YYYY/MM/DD/filename.jpg`
- Возвращает изображение напрямую

## Структура проекта

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # Точка входа, создание таблиц
├── internal/
│   ├── handlers/            # HTTP обработчики
│   │   ├── auth.go         # Аутентификация
│   │   ├── upload.go       # Загрузка изображений
│   │   └── admin.go        # Административные endpoints
│   ├── service/             # Бизнес-логика
│   │   ├── auth.go         # Сервис аутентификации
│   │   └── image.go        # Сервис работы с изображениями
│   ├── repository/          # Работа с БД
│   │   ├── user.go         # Репозиторий пользователей
│   │   └── image.go        # Репозиторий изображений
│   ├── models/              # Модели данных
│   │   ├── user.go
│   │   ├── image.go
│   │   └── auth.go
│   ├── middleware/          # Middleware
│   │   └── auth.go         # Проверка аутентификации и ролей
│   └── config/              # Конфигурация
│       └── config.go
├── Dockerfile               # Dockerfile для бэкенда
├── Dockerfile.db            # Dockerfile для контейнера БД
├── database.db              # SQLite база данных (создается автоматически)
└── uploads/                 # Загруженные файлы
```

## Docker

### Сборка образа
```bash
docker build -t image-uploader-backend .
```

### Запуск контейнера
```bash
docker run -p 8080:8080 -v $(pwd)/database.db:/app/database.db -v $(pwd)/uploads:/app/uploads image-uploader-backend
```

## База данных

Таблицы создаются автоматически при первом запуске приложения через SQL запросы в `main.go`.

## Переменные окружения

| Переменная | Описание | По умолчанию |
|-----------|----------|--------------|
| PORT | Порт сервера | 8080 |
| DB_PATH | Путь к файлу SQLite БД | ./database.db |
| UPLOAD_DIR | Папка для загрузок | ./uploads |
| BASE_URL | Базовый URL приложения | http://localhost:8080 |
| SENTRY_DSN | DSN для Sentry | (пусто) |

## Безопасность

- Валидация типов файлов (только изображения)
- Ограничение размера файла (10MB по умолчанию)
- Защита от переполнения
- CORS настроен для фронтенда

## Разработка

Для разработки используйте:
```bash
go run ./cmd/server/main.go
```

Сервер будет доступен на `http://localhost:8080`
База данных SQLite создастся автоматически в `database.db`

