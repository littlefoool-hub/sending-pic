
FROM golang:1.25.4

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY main.go .

RUN go build -o test-go main.go

CMD ["./test-go"]

EXPOSE 6666
