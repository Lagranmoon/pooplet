#!/bin/sh
set -e

# Health check function
health_check() {
    echo "Performing health check..."
    for i in $(seq 1 30); do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            echo "Health check passed"
            return 0
        fi
        echo "Waiting for application to be healthy... ($i/30)"
        sleep 2
    done
    echo "Health check failed"
    return 1
}

# Database migration function
run_migrations() {
    echo "Running database migrations..."
    cd /app
    
    # Wait for database to be ready
    echo "Waiting for database connection..."
    for i in $(seq 1 30); do
        if npx prisma db push --accept-data-loss >/dev/null 2>&1; then
            echo "Database connection successful"
            break
        fi
        echo "Waiting for database... ($i/30)"
        sleep 2
    done
    
    # Run migrations
    echo "Applying database schema..."
    npx prisma generate
    npx prisma migrate deploy --schema prisma/schema.prisma || {
        echo "Migration failed, attempting to push schema..."
        npx prisma db push --accept-data-loss
    }
    
    echo "Database migrations completed"
}

# Start application function
start_app() {
    echo "Starting application..."
    
    # Check if this is a standalone build
    if [ -f "server.js" ]; then
        exec node server.js
    else
        # Next.js standalone mode
        exec node .next/standalone/server.js
    fi
}

# Signal handlers
trap 'echo "Received SIGTERM, shutting down gracefully..."; kill -TERM $APP_PID; wait $APP_PID' TERM
trap 'echo "Received SIGINT, shutting down gracefully..."; kill -INT $APP_PID; wait $APP_PID' INT

# Main execution
echo "=== Pooplet Container Starting ==="
echo "Environment: $NODE_ENV"
echo "User: $(whoami)"
echo "Working directory: $(pwd)"

# Run migrations
run_migrations

# Start application in background and wait for it
start_app &
APP_PID=$!

echo "Application started with PID: $APP_PID"

# Wait for application to be ready
health_check

# Keep container running and wait for signals
echo "Application is ready and running..."
wait $APP_PID
