FROM golang:alpine AS builder

WORKDIR /app

# Устанавливаем зависимости (modernc.org/sqlite не требует CGO)
RUN apk add --no-cache git

# Копируем go mod файлы (для лучшего кэширования)
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходный код
COPY . .

# Собираем приложение (без CGO, modernc.org/sqlite работает без него)
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o server ./cmd/server/main.go

# Финальный образ
FROM alpine:latest

WORKDIR /app

# Устанавливаем только необходимые библиотеки для healthcheck
RUN apk add --no-cache ca-certificates wget

# Создаем непривилегированного пользователя
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Копируем бинарник
COPY --from=builder /app/server .

# Создаем папки для database и uploads
RUN mkdir -p /app/uploads /app/data && \
    chown -R appuser:appuser /app && \
    chmod 755 /app/data

# Переключаемся на непривилегированного пользователя
USER appuser

ENV PORT=8080
ENV DB_PATH=/app/data/database.db
EXPOSE 8080

CMD ["./server"]
