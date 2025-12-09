# Image Uploader Backend

Бэкенд для загрузки изображений на Go + Echo + SQLite.

## Требования

- Go 1.21+
- SQLite (встроен в Go через CGO, или используйте Docker)
- Docker (опционально)

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

### Загрузка изображения
- **POST** `/api/upload`
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

### Получить все изображения (админка)
- **GET** `/api/admin/images?limit=50&offset=0`
- Ответ: массив объектов Image

### Удалить изображение (админка)
- **DELETE** `/api/admin/images/:id`
- Ответ: 
```json
{
  "message": "Image deleted successfully"
}
```

### Health check
- **GET** `/health`
- Ответ: 
```json
{
  "status": "OK"
}
```

### Получить изображение
- **GET** `/images/YYYY/MM/DD/filename.jpg`
- Возвращает изображение напрямую

## Структура проекта

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # Точка входа
├── internal/
│   ├── handlers/            # HTTP обработчики
│   ├── service/             # Бизнес-логика
│   ├── repository/          # Работа с БД
│   ├── models/              # Модели данных
│   └── config/              # Конфигурация
├── migrations/              # SQL миграции
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

## Миграции

Миграции запускаются автоматически при старте приложения.

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

