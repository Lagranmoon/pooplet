# Development Setup Guide

This guide will help you set up the development environment for Pooplet.

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- npm

## Quick Start

### 1. Start Database Dependencies

```bash
# Start PostgreSQL database
docker run -d \
  --name pooplet-postgres-dev \
  -e POSTGRES_DB=pooplet_dev \
  -e POSTGRES_USER=pooplet \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. Start the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DATABASE_URL="postgresql://pooplet:devpassword@localhost:5432/pooplet_dev"

# Auth Configuration
BETTER_AUTH_SECRET="dev-secret-key-change-in-production-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DISABLE_REGISTRATION=false
```

## Database Operations

### Run Migrations
```bash
npm run db:migrate
```

### Open Prisma Studio
```bash
npm run db:studio
```

### Reset Database
```bash
npm run db:push
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:push` | Push schema changes to database |

## Stopping the Database

```bash
# Stop and remove the development database container
docker stop pooplet-postgres-dev
docker rm pooplet-postgres-dev
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker ps`
- Check DATABASE_URL in `.env` file
- Verify database credentials match

### Port Conflicts
- If port 3000 is in use, stop other services or modify ports
- If port 5432 is in use, change the PostgreSQL port mapping

## Production Deployment

For production deployment, use the main `docker-compose.yml`:

```bash
docker-compose up -d
```