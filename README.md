# Image Uploader Project

Микросервис для загрузки изображений с веб-интерфейсом.

## Технологии

- **Backend**: Go + Echo + SQLite
- **Frontend**: React + TypeScript + Vite
- **Docker**: Docker Compose для оркестрации

## Быстрый запуск с Docker Compose

### 1. Запуск всех сервисов

```bash
docker-compose up -d
```

Или для просмотра логов:

```bash
docker-compose up
```

### 2. Доступ к приложению

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

### 3. Остановка

```bash
docker-compose down
```

Для удаления volumes (база данных и загруженные файлы):

```bash
docker-compose down -v
```

## Структура проекта

```
dockerTest/
├── backend/              # Go бэкенд
│   ├── cmd/server/      # Точка входа
│   ├── internal/        # Внутренние пакеты
│   ├── migrations/      # SQL миграции
│   └── Dockerfile
├── frontend/            # React фронтенд
│   ├── src/            # Исходный код
│   └── Dockerfile
├── docker-compose.yml   # Основной compose файл
└── README.md
```

## Volumes

Docker Compose создает два именованных volume:

- `backend-data` - хранит SQLite базу данных (`database.db`)
- `backend-uploads` - хранит загруженные изображения

Данные сохраняются между перезапусками контейнеров.

## Переменные окружения

### Backend

| Переменная | Описание | По умолчанию |
|-----------|----------|--------------|
| PORT | Порт сервера | 8080 |
| DB_PATH | Путь к SQLite БД | /app/data/database.db |
| UPLOAD_DIR | Папка для загрузок | /app/uploads |
| BASE_URL | Базовый URL | http://localhost:8080 |
| SENTRY_DSN | DSN для Sentry | (пусто) |

Можно создать файл `.env` в корне проекта:

```env
SENTRY_DSN=your_sentry_dsn_here
```

## Полезные команды

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только бэкенд
docker-compose logs -f backend

# Только фронтенд
docker-compose logs -f frontend
```

### Пересборка образов

```bash
docker-compose build
docker-compose up -d
```

### Перезапуск сервисов

```bash
docker-compose restart
```

### Просмотр статуса

```bash
docker-compose ps
```

### Выполнение команд в контейнере

```bash
# В бэкенд контейнере
docker-compose exec backend sh

# В фронтенд контейнере
docker-compose exec frontend sh
```

## Разработка без Docker

### Backend

```bash
cd backend
go run ./cmd/server/main.go
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/upload` - загрузка изображения
- `GET /api/admin/images` - список всех изображений
- `DELETE /api/admin/images/:id` - удаление изображения
- `GET /health` - проверка здоровья сервера
- `GET /images/*` - получение изображений

## Миграции

Миграции базы данных выполняются автоматически при первом запуске бэкенда.

## Troubleshooting

### Порт уже занят

Измените порты в `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8081:8080"  # Измените 8080 на другой порт
  frontend:
    ports:
      - "8080:80"    # Измените 80 на другой порт
```

### Проблемы с volumes

Очистите volumes и пересоздайте:

```bash
docker-compose down -v
docker-compose up -d
```

### Проблемы с сетью

Убедитесь, что сервисы в одной сети (по умолчанию используется `app-network`).

## Production

Для production используйте:

1. Настройте переменные окружения через `.env` файл
2. Используйте reverse proxy (nginx/traefik) перед frontend
3. Настройте мониторинг и логирование
4. Используйте внешнее хранилище для uploads (S3, etc.)
5. Настройте backup для базы данных

