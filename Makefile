.PHONY: all build up down logs clean test lint test-backend test-frontend test-all

# Build and start all services
up: build
	docker-compose up -d

# Build services without starting
build:
	docker-compose build

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Clean up
clean:
	docker-compose down -v
	rm -rf frontend/dist backend/data

# Run backend tests using test compose
test-backend:
	docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from backend-test
	docker-compose -f docker-compose.test.yml down -v

# Run frontend tests
test-frontend:
	cd frontend && npm run test:unit

# Run all tests
test-all: test-backend test-frontend

# Run frontend linter
lint:
	cd frontend && npm run lint

# Install dependencies
install:
	cd frontend && npm install
	cd ../backend && go mod tidy

# Build frontend only
build-frontend:
	cd frontend && npm run build

# Build backend only (without frontend)
build-backend:
	cd backend && CGO_ENABLED=0 go build -ldflags="-s -w" -o backend ./cmd/main.go

# Rebuild and restart
restart: down up
