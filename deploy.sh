#!/bin/bash

# Pooplet Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: staging, production

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"
HEALTH_TIMEOUT=300

echo "=== Pooplet Deployment Script ==="
echo "Environment: $ENVIRONMENT"
echo "Compose file: $COMPOSE_FILE"
echo

# Check if environment is valid
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "Error: Invalid environment '$ENVIRONMENT'"
    echo "Valid environments: staging, production"
    echo "Note: Development environment uses 'npm run dev' + docker"
    exit 1
fi

# Check if compose file exists
if [[ ! -f "$COMPOSE_FILE" ]]; then
    echo "Error: Compose file '$COMPOSE_FILE' not found"
    exit 1
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p backups

# Set proper permissions
chmod 755 backups

# Check if .env file exists
if [[ ! -f ".env" ]]; then
    echo "Warning: .env file not found"
    echo "Please copy .env.example to .env and configure it"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pre-deployment checks
echo "Running pre-deployment checks..."

# Check Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

# Check disk space (require at least 10GB)
AVAILABLE_SPACE=$(df . | awk 'NR==2 {print $4}')
if [[ $AVAILABLE_SPACE -lt 10485760 ]]; then  # 10GB in KB
    echo "Warning: Less than 10GB disk space available"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Pre-deployment checks passed"
echo

# Pull latest images
echo "Pulling latest images..."
docker-compose -f "$COMPOSE_FILE" pull

# Build application if needed
if [[ "$ENVIRONMENT" == "dev" ]]; then
    echo "Building application..."
    docker-compose -f "$COMPOSE_FILE" build app
fi

# Stop existing containers
echo "Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true

# Start services
echo "Starting services..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 10

# Health check
echo "Performing health check..."
HEALTH_STATUS=$(docker-compose -f "$COMPOSE_FILE" ps --services --filter "health=healthy" | wc -l)
TOTAL_SERVICES=$(docker-compose -f "$COMPOSE_FILE" ps --services | wc -l)

if [[ $HEALTH_STATUS -eq $TOTAL_SERVICES ]]; then
    echo "All services are healthy ✓"
else
    echo "Warning: Some services are not healthy"
    docker-compose -f "$COMPOSE_FILE" ps
fi

# Run database migrations
echo "Running database migrations..."
docker-compose -f "$COMPOSE_FILE" exec -T app npm run db:migrate || {
    echo "Warning: Database migration failed, attempting to continue..."
}

# Test application endpoint
echo "Testing application endpoint..."
for i in {1..30}; do
    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "Application is responding ✓"
        break
    fi
    if [[ $i -eq 30 ]]; then
        echo "Warning: Application health check failed"
        docker-compose -f "$COMPOSE_FILE" logs app
    fi
    echo "Waiting for application... ($i/30)"
    sleep 5
done

echo
echo "=== Deployment Complete ==="
echo "Environment: $ENVIRONMENT"
echo "Services: $(docker-compose -f "$COMPOSE_FILE" ps --services)"
echo
echo "Useful commands:"
echo "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "  Stop services: docker-compose -f $COMPOSE_FILE down"
echo "  Restart services: docker-compose -f $COMPOSE_FILE restart"
echo "  Check status: docker-compose -f $COMPOSE_FILE ps"
echo
echo "Application URLs:"
if [[ "$ENVIRONMENT" == "dev" ]]; then
    echo "  Application: http://localhost:3000"
    echo "  Database: localhost:5432"
    echo "  Redis: localhost:6379"
else
    echo "  Application: https://your-domain.com"
    echo "  Health check: https://your-domain.com/health"
fi
echo