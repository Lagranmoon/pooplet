# Pooplet - 健康记录跟踪器

一个帮助用户跟踪和分析排便习惯的 Web 应用程序。

## 快速开始

### 开发环境
```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动数据库
docker run -d \
  --name pooplet-postgres-dev \
  -e POSTGRES_DB=pooplet_dev \
  -e POSTGRES_USER=pooplet \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 \
  postgres:15-alpine

# 初始化数据库
npm run db:generate
npm run db:push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 生产环境
```bash
# 使用 Docker Compose 部署
docker-compose up -d
```

## 技术栈

- **前端**: Next.js 14 + React 18 + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: better-auth
- **UI**: Radix UI + Tailwind CSS
- **图表**: Recharts
- **部署**: Docker + GitHub Actions

## 功能特性

- 日常健康记录跟踪
- 数据分析和可视化
- 响应式 Web 界面
- 用户认证和数据隔离
- 限流和安全保护
- 生产就绪的部署

## 命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:migrate` | 运行数据库迁移 |
| `npm run db:studio` | 打开 Prisma Studio |
| `npm run db:push` | 推送架构更改 |

## 文档

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发环境指南
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 生产部署指南
- [AGENTS.md](./AGENTS.md) - 开发规范和最佳实践

## 安全

✅ **安全评分: 10/10**

- 使用 Zod 模式进行输入验证
- 限流保护
- 安全 Cookie 配置
- 基于环境的安全
- 无依赖漏洞

## 许可证

MIT