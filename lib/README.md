# lib 目录说明文档

## 目录概述

`lib` 目录包含项目的核心工具库，提供认证、数据库访问、API 响应处理、限流等基础设施功能。所有模块都经过精心设计，确保代码的可维护性和复用性。

---

## 文件清单

| 文件名 | 功能 | 主要技术 |
|--------|------|----------|
| `auth.ts` | 服务端认证配置 | better-auth + Prisma |
| `auth-client.ts` | 客户端认证配置 | better-auth/react |
| `db.ts` | Prisma 数据库客户端 | Prisma ORM |
| `rate-limiter.ts` | 请求限流器 | rate-limiter-flexible |
| `api-responses.ts` | API 响应标准化 | TypeScript 泛型 |
| `api-error-handler.ts` | API 错误处理 | Next.js Response |
| `api-helper.ts` | API 辅助函数 | 错误处理 |
| `utils.ts` | 通用工具函数 | clsx + tailwind-merge |

---

## 文件详解

### auth.ts

服务端认证配置，使用 **better-auth** 提供完整的用户认证功能。

#### 核心配置

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [nextCookies()],
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  session: { updateAge: 60 * 60 * 24 }
});
```

#### 技术点

1. **Prisma 适配器**: 使用 `prismaAdapter` 将 better-auth 与 PostgreSQL 数据库集成
2. **Cookie 管理**: 通过 `nextCookies()` 插件实现 Next.js 的 cookie 管理
3. **会话配置**: 
   - `updateAge`: 24小时更新一次会话
   - `cookieCache`: 30天缓存会话数据
4. **安全配置**: 生产环境自动启用 `Secure` 和 `SameSite=Strict` cookie

#### 使用示例

```typescript
import { auth } from '@/lib/auth';

// 验证会话
const session = await auth.api.getSession({
  headers: request.headers
});

// 登录
await auth.api.signIn.email({
  body: { email, password }
});
```

---

### auth-client.ts

客户端认证配置，为 React 组件提供认证 hooks 和方法。

#### 导出功能

```typescript
export const { signIn, signUp, signOut, useSession } = authClient;
```

#### 技术点

1. **自动 baseURL**: 根据运行环境自动选择 API 基础 URL
2. **凭据包含**: 配置 `credentials: "include"` 确保发送 cookie

#### 使用示例

```typescript
import { useSession, signIn } from '@/lib/auth-client';

function LoginForm() {
  const { data: session } = useSession();

  const handleLogin = async () => {
    await signIn.email({ email, password });
  };

  return <div>{session ? <Dashboard /> : <LoginForm />}</div>;
}
```

---

### db.ts

Prisma 数据库客户端单例实现，防止开发环境热重载创建多个连接。

#### 技术点

1. **单例模式**: 使用 `globalThis` 缓存 Prisma 实例
2. **日志配置**: 启用 query、error、warn 级别日志

#### 使用示例

```typescript
import { prisma } from '@/lib/db';

const users = await prisma.user.findMany();
const user = await prisma.user.create({
  data: { email, password: hashedPassword }
});
```

---

### rate-limiter.ts

请求限流器，防止 API 滥用和 DDoS 攻击。

#### 限流策略

| 策略 | 阈值 | 时间窗口 | 封禁时长 |
|------|------|----------|----------|
| default | 10次 | 60秒 | 60秒 |
| strict | 5次 | 300秒 | 300秒 |

#### 技术点

1. **内存限流器**: 使用 `RateLimiterMemory` 实现高性能限流
2. **开发环境豁免**: 默认禁用，可通过 `ENABLE_RATE_LIMITING=true` 启用
3. **IP 获取**: 支持多种代理头（CF-Connecting-IP、X-Real-IP、X-Forwarded-For）

#### 使用示例

```typescript
import { rateLimiter, getClientIP } from '@/lib/rate-limiter';

const ip = getClientIP(request.headers);
const allowed = await rateLimiter.check(ip);

if (!allowed) {
  return NextResponse.json({ error: '请求过于频繁' }, { status: 429 });
}
```

---

### api-responses.ts

API 响应标准化工具，确保所有 API 返回一致的格式。

#### 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

#### 主要函数

- `handleApiRequest<T>()`: 包装异步请求并捕获错误
- `createPaginatedResponse()`: 创建分页响应
- `createSuccessResponse<T>()`: 创建成功响应
- `createErrorResponse()`: 创建错误响应

#### 使用示例

```typescript
import { handleApiRequest, createPaginatedResponse } from '@/lib/api-responses';

const response = await handleApiRequest(async () => {
  const records = await prisma.record.findMany();
  return createSuccessResponse(records);
});
```

---

### api-error-handler.ts

API 错误处理工具，简化 Next.js API 路由的错误响应。

#### 主要函数

- `handleApiSuccess<T>()`: 处理成功响应
- `handleApiErrorNext()`: 处理错误响应

#### 使用示例

```typescript
import { handleApiSuccess, handleApiErrorNext } from '@/lib/api-error-handler';

// 成功
return handleApiSuccess(data, '操作成功', 200);

// 失败
return handleApiErrorNext('参数错误', 'createUser', 400);
```

---

### api-helper.ts

API 辅助函数，提供基础的响应创建和错误处理。

#### 主要函数

- `createApiResponse<T>()`: 创建标准 API 响应
- `createErrorResponse()`: 创建错误响应
- `handleApiError()`: 处理未知错误并记录日志

#### 使用示例

```typescript
import { createApiResponse, handleApiError } from '@/lib/api-helper';

try {
  const result = await someOperation();
  return createApiResponse(result);
} catch (error) {
  return handleApiError(error, 'createRecord');
}
```

---

### utils.ts

通用工具函数，目前提供 Tailwind CSS 类名合并功能。

#### cn 函数

智能合并 Tailwind CSS 类名，处理冲突和条件类名。

```typescript
import { cn } from '@/lib/utils';

// 基础使用
cn('px-4 py-2', 'bg-blue-500') // → 'px-4 py-2 bg-blue-500'

// 处理冲突（后面的优先）
cn('px-4 px-8', 'bg-blue-500 bg-red-500') // → 'px-8 bg-red-500'

// 条件类名
cn('base-class', isActive && 'active-class') // → 'base-class active-class'
```

#### 技术点

1. **clsx**: 处理条件类名和数组/对象形式的类名
2. **tailwind-merge**: 智能合并 Tailwind 类名，消除冲突

---

## 最佳实践

### 认证流程

```typescript
// 1. 服务端验证
import { auth } from '@/lib/auth';
const session = await auth.api.getSession({ headers });

// 2. 客户端检查
import { useSession } from '@/lib/auth-client';
const { data: session } = useSession();
```

### 数据库操作

```typescript
import { prisma } from '@/lib/db';

// 使用事务
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data });
  await tx.record.create({ data });
});
```

### API 路由模板

```typescript
import { NextRequest } from 'next/server';
import { rateLimiter, getClientIP } from '@/lib/rate-limiter';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createApiResponse, handleApiError } from '@/lib/api-helper';

export async function GET(request: NextRequest) {
  // 限流
  const ip = getClientIP(request.headers);
  if (!(await rateLimiter.check(ip))) {
    return NextResponse.json({ error: '请求过于频繁' }, { status: 429 });
  }

  // 认证
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  // 业务逻辑
  try {
    const records = await prisma.record.findMany({
      where: { userId: session.user.id }
    });
    return NextResponse.json(createApiResponse(records));
  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 });
  }
}
```

---

## 依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                         lib/                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  auth.ts ────────────────┐                                  │
│                          ▼                                  │
│  auth-client.ts          │    prisma                         │
│                          │    (PrismaClient)                │
│  db.ts ──────────────────┼──────────────────┐               │
│                          │                  │               │
│  rate-limiter.ts         │                  ▼               │
│                          │          api-responses.ts         │
│  api-helper.ts ──────────┼──────────────────┤               │
│                          │                  │               │
│  api-error-handler.ts ───┼──────────────────┼──────┐        │
│                          │                  │      │        │
│  utils.ts                │                  ▼      ▼        │
│                          │              api-helper.ts        │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `BETTER_AUTH_URL` | 认证服务基础 URL | `http://localhost:3000` |
| `BETTER_AUTH_SECURE` | 是否启用安全 cookie | 生产环境 `true` |
| `ENABLE_RATE_LIMITING` | 开发环境是否启用限流 | `false` |
| `NEXT_PUBLIC_APP_URL` | 公开的应用 URL | `http://localhost:3000` |

---

## 性能优化建议

1. **数据库连接池**: 生产环境配置 Prisma 连接池参数
2. **限流器持久化**: 考虑使用 Redis 替代内存限流器
3. **会话缓存**: 对频繁访问的会话数据进行缓存
4. **日志聚合**: 使用专业日志服务替代 console.log

---

## 常见问题

### Q: 开发环境如何测试限流功能？

A: 设置环境变量 `ENABLE_RATE_LIMITING=true`

### Q: 如何自定义认证配置？

A: 在 `auth.ts` 中修改 better-auth 配置，参考 [better-auth 文档](https://www.better-auth.com)

### Q: Prisma 查询太慢怎么办？

A: 检查数据库索引、使用 `select` 只查询需要的字段、考虑分页

---

## 维护者备注

- 添加新的认证方法时，需同步更新 `auth.ts` 和 `auth-client.ts`
- 修改 API 响应格式前，确保前端已适配
- 限流阈值应根据实际负载调整
