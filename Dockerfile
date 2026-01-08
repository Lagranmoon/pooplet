# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend files
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./
COPY frontend/index.html ./
COPY frontend/src ./src

# Install dependencies and build
RUN npm ci
RUN npm run build

# Stage 2: Build backend
FROM golang:1.23-alpine AS backend-builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .

# Copy frontend dist to backend directory
COPY --from=frontend-builder /app/dist ./frontend/dist

# Build backend
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o backend ./cmd/main.go

# Stage 3: Runtime image
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy backend binary and frontend dist
COPY --from=backend-builder /app/backend .
COPY --from=backend-builder /app/frontend ./frontend

ENV TZ=Asia/Shanghai

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./backend"]
