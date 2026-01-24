# 拉屎记录应用

一个帮助用户跟踪和分析排便习惯的 Web 应用程序。

## 快速开始

### 本地开发

详细的开发环境设置请查看 [DEV_SETUP.md](./DEV_SETUP.md)

快速启动：

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env

# 3. 启动 PostgreSQL 数据库
docker run -d \
  --name pooplet-postgres-dev \
  -e POSTGRES_DB=pooplet_dev \
  -e POSTGRES_USER=pooplet \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 \
  postgres:15-alpine

# 4. 初始化数据库
npm run db:generate
npm run db:push

# 5. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: better-auth
- **UI**: Radix UI + Tailwind CSS
- **图表**: Recharts

## 文档

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 本地开发指南
- [AGENTS.md](./AGENTS.md) - 开发规范
- [database/README.md](./database/README.md) - 数据库架构
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - 部署指南

## 主要功能

- 日常排便记录
- 数据统计分析
- 响应式 Web 界面
- 用户认证和数据隔离

## 许可证

MIT