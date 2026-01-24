#!/bin/sh
set -e

run_migrations() {
    echo "Running database migrations..."
    cd /app/standalone

    if npx prisma migrate deploy; then
        echo "Migrations completed successfully"
        return 0
    fi

    echo "Error: Database migration failed"
    exit 1
}

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
    exit 1
}

start_app() {
    echo "Starting application..."
    cd /app/standalone
    exec node server.js
}

trap 'echo "Received SIGTERM, shutting down gracefully..."; kill -TERM $APP_PID; wait $APP_PID' TERM
trap 'echo "Received SIGINT, shutting down gracefully..."; kill -INT $APP_PID; wait $APP_PID' INT

echo "=== Pooplet Container Starting ==="
echo "Environment: $NODE_ENV"
echo "User: $(whoami)"

run_migrations

echo "Starting application..."
start_app &
APP_PID=$!

echo "Application started with PID: $APP_PID"

health_check

echo "Application is ready and running..."
wait $APP_PID
