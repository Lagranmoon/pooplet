# 本地开发指南

本文档介绍如何在本地设置和运行拉屎记录应用的开发环境。

## 前置要求

在开始之前，请确保你的系统已安装以下软件：

- **Node.js** (推荐 v20 或更高版本)
- **npm** (随 Node.js 安装)
- **Docker** (用于 PostgreSQL 数据库)

### 验证安装

```bash
node --version
npm --version
docker --version
```

## 快速开始

### 1. 克隆仓库

```bash
git clone <repository-url>
cd pooplet
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

创建开发环境的 `.env` 文件：

```env
# Development Environment Variables

# Database Configuration
DB_NAME=pooplet_dev
DB_USER=pooplet
DB_PASSWORD=devpassword
DATABASE_URL="postgresql://pooplet:devpassword@localhost:5432/pooplet_dev?schema=public"

# Application Configuration
NODE_ENV=development
APP_URL=http://localhost:3000
DISABLE_REGISTRATION=false

# Authentication Security
BETTER_AUTH_SECRET=dev-secret-key-change-in-production-minimum-32-chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECURE=false

# Development Settings
ENABLE_RATE_LIMITING=false
NEXT_TELEMETRY_DISABLED=1
```

### 4. 启动 PostgreSQL 数据库

使用简单的 Docker 命令启动数据库：

```bash
docker run -d \
  --name pooplet-postgres-dev \
  -e POSTGRES_DB=pooplet_dev \
  -e POSTGRES_USER=pooplet \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 \
  postgres:15-alpine
```

### 5. 初始化数据库

运行数据库迁移以创建表结构：

```bash
npm run db:generate
npm run db:push
```

### 6. 启动开发服务器

```bash
npm run dev
```

现在你可以在浏览器中访问 http://localhost:3000

## 开发命令

### 数据库命令

```bash
# 生成 Prisma Client
npm run db:generate

# 应用数据库迁移
npm run db:push

# 创建新的迁移
npm run db:migrate

# 打开 Prisma Studio
npm run db:studio

# 添加测试数据
npm run db:seed
```

### 应用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 运行类型检查
npx tsc --noEmit
```

## 数据库管理

### 查看数据库状态

```bash
# 检查数据库容器是否运行
docker ps

# 查看数据库日志
docker logs pooplet-postgres-dev
```

### 重启数据库

```bash
docker restart pooplet-postgres-dev
```

### 停止数据库

```bash
# 停止但不删除容器
docker stop pooplet-postgres-dev

# 停止并删除容器
docker stop pooplet-postgres-dev
docker rm pooplet-postgres-dev
```

### 完全重置数据库

```bash
# 删除现有容器
docker stop pooplet-postgres-dev
docker rm pooplet-postgres-dev

# 重新启动数据库
docker run -d \
  --name pooplet-postgres-dev \
  -e POSTGRES_DB=pooplet_dev \
  -e POSTGRES_USER=pooplet \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 \
  postgres:15-alpine

# 重新初始化数据库
npm run db:push
```

## 故障排除

### 端口冲突

如果端口 3000 或 5432 被占用：

```bash
# 检查端口占用
lsof -i :3000
lsof -i :5432

# 停止占用端口的进程或使用其他端口
```

### 数据库连接问题

1. 确保数据库容器正在运行：`docker ps`
2. 检查 `.env` 文件中的 `DATABASE_URL`
3. 验证数据库凭据是否匹配

### 权限问题

如果遇到权限问题：

```bash
# 修复 npm 权限
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.cache

# 或使用 nvm 管理 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

## 开发工具

### 推荐 VS Code 扩展

- **TypeScript and JavaScript Language Features**
- **Tailwind CSS IntelliSense**
- **Prisma**
- **ES7+ React/Redux/React-Native snippets**
- **Auto Rename Tag**

### 项目结构

```
pooplet/
├── app/                 # Next.js 应用程序页面
├── components/          # React 组件
├── lib/                 # 工具库和配置
├── prisma/             # 数据库架构和迁移
├── public/             # 静态资源
├── scripts/            # 开发脚本
└── types/              # TypeScript 类型定义
```

## 部署

开发完成后，使用 `docker-compose.yml` 部署到生产环境：

```bash
# 构建和启动生产环境
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 生产部署

详细的部署指南请查看：

- [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) - Docker 部署指南
- [DEV_SETUP.md](./DEV_SETUP.md) - 简化版开发设置指南