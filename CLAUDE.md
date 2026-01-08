# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在本代码库中工作时提供指导。

# 项目要求
1. 单元测试覆盖率必须大于90%，每次改动完必须执行测试并且全部通过
2. 核心功能必须全部端到端测试覆盖，每次需求改动结束通过playwright调用浏览器验证核心功能
3. 如果没有特别描述，不要生成总结文档

## 项目概述

Pooplet - 一个可爱风格的排便记录Web应用。个人习惯追踪应用，带有可爱风格设计。

## 技术栈

**前端**：React 19 + TypeScript + Vite，shadcn/ui + Tailwind CSS v4，Framer Motion，date-fns，Lucide React，Recharts，React Router DOM

**后端**：Go 1.23 + Gin，GORM + PostgreSQL，JWT 认证

## 常用命令

### Docker（推荐用于完整项目）
```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 清理（删除数据卷）
docker-compose down -v
```

### Makefile 快捷命令
```bash
make up          # 构建并启动所有服务
make down        # 停止所有服务
make logs        # 查看日志（持续跟踪）
make test        # 运行后端测试
make lint        # 运行代码检查（后端 + 前端）
make dev         # 启动开发服务器（前端 + 后端）
make install     # 安装所有依赖
make build       # 构建镜像但不启动
```

### 后端（Go）
```bash
cd backend
go mod tidy
go run ./cmd/main.go           # 启动服务器
go test ./... -cover           # 运行测试
golangci-lint run ./...        # 运行代码检查
```

### 前端
```bash
cd frontend
npm install
npm run dev                    # 开发服务器 localhost:5173
npm run build                  # 生产构建
npm run lint                   # 运行 ESLint
npm run test:e2e               # Playwright 端到端测试
npm run test:api               # API 集成测试
```

## 项目架构

### 后端（Go/Gin）
标准分层架构：
```
backend/
├── cmd/main.go           # 程序入口，路由配置
└── internal/
    ├── config/           # 配置加载
    ├── handlers/         # HTTP 处理器（gin.Context）
    ├── middleware/       # 认证中间件等
    ├── models/           # 数据模型，JWT，请求/响应类型
    ├── repository/       # 数据库操作（GORM）
    └── services/         # 业务逻辑
```

路由结构（位于 `main.go:39-56`）：
- `/api/v1/auth/*` - 公开认证端点（注册、登录）
- `/api/v1/protected/*` - 需要 JWT 的受保护端点

### 前端（React）
组件化架构：
```
frontend/src/
├── App.tsx              # 路由配置，认证提供者包装
├── components/          # 可复用 UI 组件（ui/、features/、layout/）
├── pages/               # 页面组件（Home、AddLog、Logs、Stats、Calendar）
├── hooks/               # 自定义 React Hooks
├── lib/                 # 工具函数（api.ts HTTP 客户端，auth.tsx 认证上下文）
└── types/               # TypeScript 类型定义
```

前端 API 客户端（`lib/api.ts`）使用 `VITE_API_BASE_URL` 环境变量（默认为 `/api/v1`）。

## 数据库

PostgreSQL 配合 GORM 自动迁移。数据模型：
- `User` - id，email，password（加密），name
- `PoopLog` - id，user_id，timestamp，difficulty，note

难度等级：`easy`（顺畅/💩）、`normal`（正常/😐）、`hard`（困难/😣）、`very_hard`（艰辛/😫）

## 环境变量

**后端**（`.env` 或 docker-compose）：
- `SERVER_PORT`（默认：8080）
- `DATABASE_URL` - PostgreSQL 连接字符串
- `JWT_SECRET` - JWT 签名密钥
- `JWT_EXPIRES_AT` - Token 过期时间（小时，默认 168 = 7 天）
- `ENVIRONMENT` - `development` 或 `production`

**前端**：
- `VITE_API_BASE_URL` - 后端 API 前缀（默认：`/api/v1`）

## 服务端口（Docker）
- 前端：http://localhost:3000
- 后端 API：http://localhost:8080/api/v1
- PostgreSQL：localhost:5432
