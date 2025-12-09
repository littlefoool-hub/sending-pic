FROM golang:alpine AS builder

WORKDIR /app

# Устанавливаем зависимости (modernc.org/sqlite не требует CGO)
RUN apk add --no-cache git

# Копируем go mod файлы
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходный код
COPY . .

# Собираем приложение (без CGO, modernc.org/sqlite работает без него)
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server/main.go

# Финальный образ
FROM alpine:latest

WORKDIR /app

# Устанавливаем только необходимые библиотеки
RUN apk add --no-cache ca-certificates

# Копируем бинарник
COPY --from=builder /app/server .

# Создаем папки для database и uploads
RUN mkdir -p /app/uploads /app/data

ENV PORT=8080
ENV DB_PATH=/app/data/database.db
EXPOSE 8080

CMD ["./server"]
