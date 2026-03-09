# 💩 Pooplet

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite" />
</p>

<p align="center">
  <b>English</b> | <a href="./README.md">中文</a>
</p>

---

A simple and cute poop tracking application based on the Bristol Stool Scale (Type 1-7). Track your bowel movements, visualize your digestive health, and maintain healthy habits.

## Features

- 📅 **Calendar View** - Visual calendar with recorded days marked
- 📝 **Record Management** - Add, edit, and delete poop records with time, type, and notes
- 📊 **Statistics & Charts** - View distributions and trends over time
- 🔐 **Multi-user Support** - Secure user authentication system
- 📱 **Mobile Friendly** - Responsive design for all devices
- 🐳 **Docker Ready** - Easy deployment with Docker

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Node.js 20
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS 3 + shadcn/ui
- **Charts**: Recharts
- **Date**: date-fns

## Quick Start

```bash
# Clone repository
git clone https://github.com/Lagranmoon/pooplet.git
cd pooplet

# Install dependencies
npm install

# Initialize database
npm run db:init

# Run development server
npm run dev
```

Open http://localhost:3000

## Docker Deployment

### Production (GitHub Packages Image)

```bash
# Start with pre-built image
docker-compose up -d

# Use specific version
POOPLE_TAG=v1.0.0 docker-compose up -d
```

### Development (Local Build)

```bash
# Build and run locally
docker-compose -f docker-compose.dev.yml up -d --build
```

### Docker Run

```bash
# Pull and run from GitHub Packages
docker pull ghcr.io/lagranmoon/pooplet:latest
docker run -p 3000:3000 -v $(pwd)/data:/app/data ghcr.io/lagranmoon/pooplet:latest
```

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `POOPLE_IMAGE` | Docker image to use | `ghcr.io/lagranmoon/pooplet` |
| `POOPLE_TAG` | Image tag (version) | `latest` |
| `POOPLE_PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for JWT | Random generated |
| `DISABLE_REGISTRATION` | Disable new user registration | `false` |

---

## Bristol Stool Scale Reference

| Type | Description | Health Indicator |
|------|-------------|------------------|
| 1 | Nut-like | Constipation |
| 2 | Lumpy sausage | Mild constipation |
| 3 | Cracked sausage | Normal |
| 4 | Smooth sausage | Ideal |
| 5 | Soft blobs | Ideal |
| 6 | Fluffy edges | Mild diarrhea |
| 7 | Watery | Diarrhea |

---

## License

MIT License - see [LICENSE](LICENSE) file for details.
