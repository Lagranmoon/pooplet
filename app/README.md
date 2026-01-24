# App 目录总览

Pooplet 应用的核心目录，采用 Next.js 14 App Router 架构，包含认证、仪表板、API 路由和服务端操作。

## 目录结构

```
app/
├── (auth)/              # 认证相关页面（路由组）
├── (dashboard)/        # 仪表板相关页面（路由组）
├── actions/            # Server Actions（服务端操作）
├── api/                # API Routes（RESTful API）
├── layout.tsx          # 根布局（HTML 结构、全局字体）
├── page.tsx            # 首页（根据认证状态重定向）
└── globals.css         # 全局样式
```

## 核心技术点

### 1. Next.js App Router

- **文件系统路由**: `app/(auth)/login/page.tsx` → `/login`
- **路由组**: `(auth)` 和 `(dashboard)` 括号不会出现在 URL 中，仅用于组织代码
- **布局**: 嵌套布局，`layout.tsx` 会包裹其子路由

### 2. 认证架构

使用 `better-auth` 进行用户认证：

```typescript
import { auth } from "@/lib/auth";

// API 中获取会话
const session = await auth.api.getSession({ headers: request.headers });

// React 客户端获取会话
import { useSession } from "@/lib/auth-client";
const { data: session } = useSession();
```

### 3. Server Actions

在 `app/actions/` 目录中定义可从客户端调用的服务端函数：

```typescript
"use server";

export async function createRecord(formData: FormData) {
  const session = await auth.api.getSession();
  // 数据库操作
}
```

### 4. API Routes

在 `app/api/` 目录中定义 RESTful API 端点：

```typescript
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  return NextResponse.json({ data });
}
```

### 5. 数据库访问

所有数据库操作通过 Prisma ORM：

```typescript
import { prisma } from "@/lib/db";

const records = await prisma.record.findMany({
  where: { userId: session.user.id },
});
```

## 路由说明

| 路由 | 文件 | 功能 |
|------|------|------|
| `/` | `page.tsx` | 首页（已登录→/dashboard，未登录→/login） |
| `/login` | `(auth)/login/page.tsx` | 登录页 |
| `/register` | `(auth)/register/page.tsx` | 注册页 |
| `/dashboard` | `(dashboard)/dashboard/page.tsx` | 仪表板首页 |
| `/dashboard/records` | `(dashboard)/dashboard/records/page.tsx` | 所有记录列表 |
| `/dashboard/stats` | `(dashboard)/dashboard/stats/page.tsx` | 统计分析 |

## API 端点

### 认证相关

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/auth/check-registration-status` | GET | 检查注册是否禁用 |
| `/api/auth/get-session` | GET | 获取当前会话 |
| `/api/auth/signout` | POST | 退出登录 |

### 记录管理

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/records` | GET | 获取记录列表（分页） |
| `/api/records` | POST | 创建记录 |
| `/api/records/[id]` | GET | 获取单条记录 |
| `/api/records/[id]` | PUT | 更新记录 |
| `/api/records/[id]` | DELETE | 删除记录 |

### 统计分析

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/stats/overview` | GET | 总览统计 |
| `/api/stats/daily` | GET | 每日统计 |
| `/api/stats/frequency` | GET | 频率统计 |
| `/api/stats/quality` | GET | 质量分布 |

### 系统健康

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/health` | GET | 健康检查 |

## 环境变量

```env
DISABLE_REGISTRATION=true    # 禁用公开注册
NODE_ENV=production            # 生产/开发环境
```

## 安全注意事项

1. **认证检查**: 所有 API 和 Server Actions 都必须验证用户会话
2. **数据隔离**: 数据库查询必须包含 `userId` 过滤条件
3. **输入验证**: 使用 Zod 进行请求参数验证
4. **错误处理**: 生产环境不暴露详细错误信息

## 开发建议

1. 使用 Server Actions 代替 API Routes（适用于表单提交）
2. 客户端组件使用 `"use client"` 指令
3. 优先使用服务端组件，按需使用客户端组件
4. 遵循单一职责原则，业务逻辑放在 actions 或 services 中
