#!/bin/sh
set -e

echo "Running database migrations..."
cd /app
./node_modules/prisma/build/index.js migrate deploy --schema prisma/schema.prisma 2>/dev/null || true

echo "Starting application..."
exec node server.js
