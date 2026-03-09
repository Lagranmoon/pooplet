# 💩 Pooplet / 便便记录

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite" />
</p>

<p align="center">
  <b>English</b> | <a href="#中文">中文</a>
</p>

---

## English

A simple and cute poop tracking application based on the Bristol Stool Scale (Type 1-7). Track your bowel movements, visualize your digestive health, and maintain healthy habits.

### Features

- 📅 **Calendar View** - Visual calendar with recorded days marked
- 📝 **Record Management** - Add, edit, and delete poop records with time, type, and notes
- 📊 **Statistics & Charts** - View distributions and trends over time
- 🔐 **Multi-user Support** - Secure user authentication system
- 📱 **Mobile Friendly** - Responsive design for all devices
- 🐳 **Docker Ready** - Easy deployment with Docker

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Node.js 20
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS 3 + shadcn/ui
- **Charts**: Recharts
- **Date**: date-fns

### Quick Start

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

### Docker Deployment

**Production (GitHub Packages Image) / 生产环境**

```bash
# Setup data directory permissions / 设置数据目录权限
./scripts/setup-permissions.sh

# Start with pre-built image / 使用预构建镜像启动
docker-compose up -d

# Use specific version / 使用特定版本
POOPLE_TAG=v1.0.0 docker-compose up -d
```

**Development (Local Build) / 开发环境**

```bash
# Build and run locally / 本地构建并运行
docker-compose -f docker-compose.dev.yml up -d --build
```

**Docker Run / 直接运行**

```bash
# Pull and run from GitHub Packages / 从 GitHub Packages 拉取并运行
docker pull ghcr.io/lagranmoon/pooplet:latest
docker run -p 3000:3000 -v $(pwd)/data:/app/data --user 1001:1001 ghcr.io/lagranmoon/pooplet:latest
```

### Environment Variables / 环境变量

Copy `.env.example` to `.env` and customize / 复制 `.env.example` 到 `.env` 并自定义：

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `POOPLE_IMAGE` | Docker image to use | `ghcr.io/lagranmoon/pooplet` |
| `POOPLE_TAG` | Image tag (version) | `latest` |
| `POOPLE_PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for JWT | Random generated |

### Security Notes / 安全说明

- Container runs as non-root user (UID 1001) / 容器以非 root 用户运行 (UID 1001)
- Data directory must have correct permissions / 数据目录需要正确权限
- See `scripts/setup-permissions.sh` for details / 详情见 `scripts/setup-permissions.sh` |

---

## 中文

一款基于布里斯托大便分类法（1-7型）的便便记录应用。追踪排便情况，可视化消化健康，养成健康习惯。

### 功能特性

- 📅 **日历视图** - 直观的日历展示，标记记录日期
- 📝 **记录管理** - 添加、编辑、删除排便记录（时间、类型、备注）
- 📊 **统计图表** - 查看分布和趋势分析
- 🔐 **多用户支持** - 安全的用户认证系统
- 📱 **移动端友好** - 响应式设计，适配各种设备
- 🐳 **Docker 支持** - 轻松部署

### 技术栈

- **框架**: Next.js 15 (App Router)
- **运行时**: Node.js 20
- **数据库**: SQLite (better-sqlite3)
- **样式**: Tailwind CSS 3 + shadcn/ui
- **图表**: Recharts
- **日期**: date-fns

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/Lagranmoon/pooplet.git
cd pooplet

# 安装依赖
npm install

# 初始化数据库
npm run db:init

# 运行开发服务器
npm run dev
```

访问 http://localhost:3000

### Docker 部署

**生产环境 (GitHub Packages 镜像)**

```bash
# 设置数据目录权限
./scripts/setup-permissions.sh

# 使用预构建镜像启动
docker-compose up -d

# 使用特定版本
POOPLE_TAG=v1.0.0 docker-compose up -d
```

**开发环境 (本地构建)**

```bash
# 本地构建并运行
docker-compose -f docker-compose.dev.yml up -d --build
```

**直接运行**

```bash
# 从 GitHub Packages 拉取并运行
docker pull ghcr.io/lagranmoon/pooplet:latest
docker run -p 3000:3000 -v $(pwd)/data:/app/data --user 1001:1001 ghcr.io/lagranmoon/pooplet:latest
```

### 环境变量

复制 `.env.example` 到 `.env` 并自定义：

```bash
cp .env.example .env
```

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `POOPLE_IMAGE` | Docker 镜像 | `ghcr.io/lagranmoon/pooplet` |
| `POOPLE_TAG` | 镜像标签（版本） | `latest` |
| `POOPLE_PORT` | 服务端口 | `3000` |
| `JWT_SECRET` | JWT 密钥 | 随机生成 |

### 安全说明

- 容器以非 root 用户运行 (UID 1001)
- 数据目录需要正确权限
- 详情见 `scripts/setup-permissions.sh`

---

## Bristol Stool Scale Reference / 布里斯托大便分类法

| Type | Description | Health Indicator |
|------|-------------|------------------|
| 1 | Nut-like / 坚果状 | Constipation / 便秘 |
| 2 | Lumpy sausage / 硬块状 | Mild constipation / 轻度便秘 |
| 3 | Cracked sausage / 有裂纹 | Normal / 正常 |
| 4 | Smooth sausage / 香蕉状 | Ideal / 理想 |
| 5 | Soft blobs / 软块状 | Ideal / 理想 |
| 6 | Fluffy edges / 边缘毛糙 | Mild diarrhea / 轻度腹泻 |
| 7 | Watery / 水样 | Diarrhea / 腹泻 |

---

## License / 许可证

MIT License - see [LICENSE](LICENSE) file for details.
