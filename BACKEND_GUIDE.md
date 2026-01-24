# Pooplet 后端开发指南

## 项目概述

Pooplet 是一个基于 Next.js 14 全栈框架的健康记录跟踪应用，帮助用户记录和分析排便习惯。本指南专为后端开发者设计，详细介绍项目的架构、技术栈和实现细节。

## 技术栈详解

### 核心框架
- **Next.js 14**: React 全栈框架
  - App Router: 基于文件系统的路由
  - Server Actions: 服务端操作，减少 API 调用
  - API Routes: RESTful API 端点
  - Server Components: 服务端渲染组件

### 数据库层
- **PostgreSQL**: 关系型数据库
- **Prisma ORM**: 类型安全的数据库访问
  - Schema 定义: `prisma/schema.prisma`
  - 自动生成类型: `@prisma/client`
  - 迁移管理: `prisma migrate`
  - 数据库可视化: `prisma studio`

### 认证系统
- **better-auth**: 轻量级认证库
  - 会话管理: Cookie-based sessions
  - 邮箱密码登录
  - Prisma 适配器集成
  - 安全的 Cookie 配置

### 数据验证
- **Zod**: TypeScript-first schema validation
  - 输入验证
  - 类型推导
  - 错误处理

### 安全保护
- **rate-limiter-flexible**: API 限流
  - 防止暴力破解
  - 保护 API 端点

## 项目架构

### 目录结构
```
pooplet/
├── app/                      # Next.js App Router 主目录
│   ├── (auth)/              # 认证相关路由组
│   │   ├── login/           # 登录页面
│   │   └── register/        # 注册页面
│   ├── (dashboard)/         # 仪表盘路由组
│   │   └── dashboard/       # 仪表盘主页面
│   ├── actions/             # Server Actions
│   │   └── recordActions.ts # 记录 CRUD 操作
│   ├── api/                 # API Routes
│   │   ├── auth/           # 认证相关 API
│   │   ├── records/        # 记录 CRUD API
│   │   └── stats/          # 统计数据 API
│   └── layout.tsx           # 根布局
├── components/              # React 组件
│   ├── ui/                  # 基础 UI 组件（Radix UI）
│   └── records/             # 记录相关组件
├── lib/                     # 工具函数和配置
│   ├── auth.ts              # better-auth 配置
│   ├── db.ts                # Prisma 客户端
│   ├── rate-limiter.ts      # API 限流
│   ├── api-responses.ts     # API 响应类型
│   └── api-error-handler.ts # 错误处理
├── prisma/                  # Prisma 配置
│   ├── schema.prisma        # 数据库模型定义
│   └── seed.ts              # 种子数据
├── src/                     # 源代码
│   ├── components/          # 内部组件
│   ├── hooks/               # React Hooks
│   └── types/               # 类型定义
├── scripts/                 # 管理脚本
│   ├── delete-user.ts       # 删除用户脚本
│   ├── reset-password.ts    # 重置密码脚本
│   └── list-users.ts        # 列出用户脚本
└── types/                   # 全局类型定义
```

### 数据模型

#### User (用户)
```typescript
{
  id: string           // 唯一标识 (CUID)
  email: string        // 邮箱 (唯一)
  emailVerified: boolean // 邮箱验证状态
  name: string?        // 用户名
  image: string?       // 头像 URL
  createdAt: DateTime  // 创建时间
  updatedAt: DateTime  // 更新时间
}
```

#### Record (记录)
```typescript
{
  id: string           // 唯一标识 (CUID)
  userId: string       // 用户 ID (外键)
  occurredAt: DateTime // 发生时间
  qualityRating: number // 质量评分 (1-7)
  notes: string?       // 备注
  createdAt: DateTime  // 创建时间
  updatedAt: DateTime  // 更新时间
}
```

#### Session (会话)
```typescript
{
  id: string           // 唯一标识 (CUID)
  userId: string       // 用户 ID (外键)
  token: string        // 会话令牌 (唯一)
  expiresAt: DateTime  // 过期时间
  ipAddress: string?   // IP 地址
  userAgent: string?   // 用户代理
  createdAt: DateTime  // 创建时间
  updatedAt: DateTime  // 更新时间
}
```

#### Account (账户)
```typescript
{
  id: string              // 唯一标识 (CUID)
  accountId: string       // 账户 ID
  userId: string          // 用户 ID (外键)
  providerId: string      // 提供商 ID
  providerUserId: string? // 提供商用户 ID
  password: string?       // 密码哈希
  accessToken: string?    // 访问令牌
  refreshToken: string?   // 刷新令牌
  expiresAt: DateTime?   // 过期时间
  createdAt: DateTime     // 创建时间
  updatedAt: DateTime     // 更新时间
}
```

## 关键技术点

### 1. Next.js App Router

**路由系统**: 基于 `app/` 目录的文件系统路由

```
app/
├── (auth)/login/page.tsx      → /login
├── (dashboard)/dashboard/page.tsx → /dashboard
└── api/records/route.ts        → /api/records
```

**路由组**: 使用括号 `()` 定义不影响 URL 的逻辑分组

### 2. Server Actions

**定义**: 使用 `"use server"` 指令的服务端函数

```typescript
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function createRecord(formData: FormData) {
  const session = await auth.api.getSession();
  if (!session) return { success: false, error: "未认证" };

  const record = await prisma.record.create({
    data: {
      userId: session.user.id,
      // ...
    },
  });

  return { success: true, data: record };
}
```

**优势**:
- 直接在组件中调用，无需 fetch
- 自动处理认证
- 类型安全

### 3. API Routes

**RESTful API 实现**:

```typescript
// app/api/records/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "未认证" }, { status: 401 });

  const records = await prisma.record.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ success: true, data: records });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // 创建记录逻辑
}
```

### 4. 数据验证

**Zod Schema 验证**:

```typescript
import { z } from "zod";

const createRecordSchema = z.object({
  occurredAt: z.string().datetime().refine(
    (date) => new Date(date) <= new Date(),
    "发生时间不能是未来时间"
  ),
  qualityRating: z.number().int().min(1).max(7),
  notes: z.string().max(500).optional(),
});

const validated = createRecordSchema.safeParse(body);
if (!validated.success) {
  return { error: "验证失败" };
}
```

### 5. Prisma ORM

**数据库操作**:

```typescript
// 查询
const records = await prisma.record.findMany({
  where: { userId: session.user.id },
  orderBy: { occurredAt: "desc" },
  take: 20,
});

// 创建
const record = await prisma.record.create({
  data: {
    userId: session.user.id,
    occurredAt: new Date(),
    qualityRating: 5,
    notes: "测试记录",
  },
});

// 更新
const updated = await prisma.record.update({
  where: { id },
  data: { notes: "更新的备注" },
});

// 删除
await prisma.record.delete({
  where: { id },
});

// 批量删除
await prisma.record.deleteMany({
  where: { id: { in: ids } },
});
```

**事务处理**:

```typescript
await prisma.$transaction(async (tx) => {
  // 多个操作在一个事务中执行
  await tx.record.create({ data: {...} });
  await tx.user.update({ where: {...}, data: {...} });
});
```

### 6. better-auth 认证

**配置** (`lib/auth.ts`):

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    updateAge: 60 * 60 * 24, // 24 小时更新一次
    cookieCache: {
      enabled: true,
      maxAge: 30 * 24 * 60 * 60, // 30 天
    },
  },
});
```

**使用**:

```typescript
// 获取当前会话
const session = await auth.api.getSession({ headers: request.headers });

// 检查认证
if (!session) {
  return NextResponse.json({ error: "未认证" }, { status: 401 });
}

// 访问用户信息
const userId = session.user.id;
const userEmail = session.user.email;
```

### 7. API 限流

**限流器配置** (`lib/rate-limiter.ts`):

```typescript
import { RateLimiterMemory } from "rate-limiter-flexible";

export const rateLimiter = new RateLimiterMemory({
  points: 100, // 100 次请求
  duration: 60, // 60 秒内
});

// 使用
try {
  await rateLimiter.consume(userId);
} catch (rejRes) {
  return NextResponse.json({ error: "请求过于频繁" }, { status: 429 });
}
```

### 8. 错误处理

**统一错误响应**:

```typescript
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/api-responses";

export function handleApiError(error: unknown): ApiErrorResponse {
  if (error instanceof Error) {
    return {
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? "服务器错误"
        : error.message,
    };
  }
  return { success: false, error: "未知错误" };
}
```

## 数据库索引优化

### Record 表索引

```prisma
@@index([userId(sort: Desc), occurredAt(sort: Desc)], name: "idx_user_records")
@@index([occurredAt, qualityRating], name: "idx_date_quality")
@@index([userId, occurredAt], name: "idx_user_daily")
```

**用途**:
1. `idx_user_records`: 优化用户记录查询（按用户和时间降序）
2. `idx_date_quality`: 优化日期和质量统计查询
3. `idx_user_daily`: 优化用户每日统计查询

## API 端点列表

### 认证 API

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/auth/sign-in/email` | 邮箱登录 |
| POST | `/api/auth/sign-up/email` | 邮箱注册 |
| POST | `/api/auth/signout` | 退出登录 |
| GET | `/api/auth/get-session` | 获取当前会话 |
| POST | `/api/auth/delete-session` | 删除会话 |
| GET | `/api/auth/check-registration-status` | 检查注册状态 |

### 记录 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/records` | 获取记录列表（支持分页和日期过滤） |
| POST | `/api/records` | 创建记录或批量删除 |
| GET | `/api/records/[id]` | 获取单条记录 |
| PUT | `/api/records/[id]` | 更新记录 |
| DELETE | `/api/records/[id]` | 删除记录 |

### 统计 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/stats/overview` | 获取概览统计 |
| GET | `/api/stats/daily` | 获取每日统计 |
| GET | `/api/stats/quality` | 获取质量统计 |
| GET | `/api/stats/frequency` | 获取频率统计 |

### 其他 API

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/health` | 健康检查 |

## 开发命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 数据库
npm run db:generate      # 生成 Prisma 客户端
npm run db:migrate       # 运行数据库迁移
npm run db:push          # 推送架构更改
npm run db:studio        # 打开 Prisma Studio
npm run db:seed          # 运行种子数据

# 用户管理
npm run delete-user      # 删除用户
npm run reset-password   # 重置密码
npm run list-users       # 列出所有用户
```

## 环境变量

### `.env.example`

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/pooplet_dev"

# 认证
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECURE="false"

# 应用
NODE_ENV="development"
PORT=3000
```

### `.env.production.example`

```env
# 数据库
DATABASE_URL="postgresql://user:password@postgres:5432/pooplet"

# 认证
BETTER_AUTH_URL="https://yourdomain.com"
BETTER_AUTH_SECURE="true"

# 应用
NODE_ENV="production"
PORT=3000
```

## 安全最佳实践

### 1. 数据验证
- 所有用户输入使用 Zod 验证
- 防止 SQL 注入（Prisma 自动处理）
- 验证数据范围和格式

### 2. 认证和授权
- 所有 API 端点检查会话
- 用户只能访问自己的记录
- 使用安全的 Cookie 配置（httpOnly, secure, sameSite）

### 3. 限流保护
- API 端点使用限流器
- 防止暴力破解攻击
- 保护敏感操作

### 4. 环境隔离
- 开发和生产环境分离
- 不提交敏感信息到代码库
- 使用 `.gitignore` 保护 `.env` 文件

### 5. 错误处理
- 生产环境隐藏详细错误信息
- 记录错误日志
- 友好的用户错误提示

## 性能优化

### 1. 数据库查询优化
- 使用索引加速查询
- 避免 N+1 查询
- 使用 `select` 只查询需要的字段
- 使用 `include` 或 `join` 优化关联查询

### 2. 缓存策略
- better-auth 的 Cookie 缓存
- Prisma 查询结果缓存
- React 组件 memo 优化

### 3. 代码分割
- Next.js 自动代码分割
- 动态导入大型组件
- 按路由加载代码

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t pooplet .

# 运行容器
docker-compose up -d
```

### 环境要求
- Node.js 18+
- PostgreSQL 18
- Docker (可选)

## 调试技巧

### 1. 查看数据库查询

```typescript
// lib/db.ts
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### 2. 开发环境日志

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### 3. Prisma Studio

```bash
npm run db:studio
```

## 相关文档

- [AGENTS.md](./AGENTS.md) - 开发规范和最佳实践
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发环境指南
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 生产部署指南
- [README.md](./README.md) - 项目简介

## 学习路径建议

1. **了解 Next.js 基础**
   - App Router 概念
   - Server Components vs Client Components
   - API Routes 和 Server Actions

2. **学习 Prisma ORM**
   - Schema 定义
   - CRUD 操作
   - 迁移管理

3. **掌握 better-auth**
   - 认证流程
   - 会话管理
   - 安全配置

4. **实践项目**
   - 添加新的 API 端点
   - 创建新的数据模型
   - 实现新的功能特性

## 常见问题

### Q: 如何添加新的 API 端点？
A: 在 `app/api/` 目录下创建新的路由文件，遵循 RESTful 规范。

### Q: 如何修改数据库结构？
A: 编辑 `prisma/schema.prisma`，然后运行 `npm run db:migrate`。

### Q: 如何添加认证检查？
A: 在 API 或 Server Action 中使用 `await auth.api.getSession({ headers })` 检查会话。

### Q: 如何部署到生产环境？
A: 参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 文档。

---

**最后更新**: 2026-01-24
**版本**: 1.0.0
