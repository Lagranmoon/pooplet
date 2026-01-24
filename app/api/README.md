# API Routes

RESTful API 端点，提供前后端数据交互的接口。

## 目录说明

`app/api/` 目录存放 API Routes，使用 Next.js 14 的 Route Handlers 实现 RESTful API。

## 目录结构

```
app/api/
├── auth/              # 认证相关 API
│   ├── check-registration-status/
│   │   └── route.ts
│   ├── delete-session/
│   │   └── route.ts
│   ├── get-session/
│   │   └── route.ts
│   ├── sign-in/
│   │   └── email/
│   │       └── route.ts
│   ├── sign-out/
│   │   └── route.ts
│   └── sign-up/
│       └── email/
│           └── route.ts
├── health/            # 健康检查
│   └── route.ts
├── records/           # 记录管理 API
│   ├── [id]/
│   │   └── route.ts
│   └── route.ts
└── stats/             # 统计分析 API
    ├── daily/
    │   └── route.ts
    ├── frequency/
    │   └── route.ts
    ├── overview/
    │   └── route.ts
    └── quality/
        └── route.ts
```

## 核心技术点

### 1. Route Handlers
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 处理 GET 请求
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  // 处理 POST 请求
  return NextResponse.json({ success: true });
}
```

### 2. 动态路由
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // 使用 id 参数
}
```

### 3. 认证中间件
```typescript
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({ headers: request.headers });
if (!session) {
  return NextResponse.json({ error: "未认证" }, { status: 401 });
}
```

### 4. 错误处理
```typescript
try {
  // 业务逻辑
} catch (error) {
  return NextResponse.json(
    { error: "操作失败" },
    { status: 500 }
  );
}
```

## 统一响应格式

### 成功响应
```json
{
  "success": true,
  "data": { /* 数据 */ },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误描述"
}
```

### 分页响应
```json
{
  "success": true,
  "data": {
    "records": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 认证相关 API

详见 `app/api/auth/README.md`：

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/auth/check-registration-status` | GET | 检查注册是否禁用 |
| `/api/auth/get-session` | GET | 获取当前会话 |
| `/api/auth/signout` | POST | 退出登录 |

## 记录管理 API

详见 `app/api/records/README.md`：

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/records` | GET | 获取记录列表（分页） |
| `/api/records` | POST | 创建记录 |
| `/api/records/[id]` | GET | 获取单条记录 |
| `/api/records/[id]` | PUT | 更新记录 |
| `/api/records/[id]` | DELETE | 删除记录 |

## 统计分析 API

详见 `app/api/stats/README.md`：

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/stats/overview` | GET | 总览统计 |
| `/api/stats/daily` | GET | 每日统计 |
| `/api/stats/frequency` | GET | 频率统计 |
| `/api/stats/quality` | GET | 质量分布 |

## 健康检查

### GET /api/health

**功能：** 系统健康检查

**请求：**
```http
GET /api/health
```

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**实现：**
```typescript
export async function GET(request: NextRequest) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
}
```

## 请求验证

### 使用 Zod 验证
```typescript
import { z } from "zod";

const createRecordSchema = z.object({
  occurredAt: z.string().datetime(),
  qualityRating: z.number().int().min(1).max(7),
  notes: z.string().max(500).optional(),
});

const validated = createRecordSchema.safeParse(body);
if (!validated.success) {
  return NextResponse.json(
    { error: "验证失败" },
    { status: 400 }
  );
}
```

### 查询参数验证
```typescript
const { searchParams } = new URL(request.url);
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "20");

if (page < 1 || limit < 1 || limit > 100) {
  return NextResponse.json(
    { error: "参数无效" },
    { status: 400 }
  );
}
```

## 错误处理

### 统一错误格式
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;  // 开发环境显示详细信息
}
```

### 环境相关错误信息
```typescript
const errorMessage = process.env.NODE_ENV === 'production'
  ? "操作失败"
  : error.message || "操作失败";
```

### 错误日志
```typescript
if (process.env.NODE_ENV === 'development') {
  console.error("API Error:", error);
}
```

## CORS 配置

如需支持跨域请求，在 `next.config.js` 中配置：

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};
```

## 安全措施

### 1. 认证检查
```typescript
const session = await auth.api.getSession({ headers: request.headers });
if (!session) {
  return NextResponse.json({ error: "未认证" }, { status: 401 });
}
```

### 2. 数据隔离
```typescript
const record = await prisma.record.findFirst({
  where: {
    id,
    userId: session.user.id,  // 只能访问自己的记录
  },
});
```

### 3. 输入验证
```typescript
const validated = schema.safeParse(body);
if (!validated.success) {
  return NextResponse.json({ error: "验证失败" }, { status: 400 });
}
```

### 4. 速率限制（未来）
```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

const { success } = await ratelimit.limit(ip);
if (!success) {
  return NextResponse.json({ error: "请求过于频繁" }, { status: 429 });
}
```

## 性能优化

### 1. 数据库查询优化
```typescript
// 使用 select 减少查询字段
const records = await prisma.record.findMany({
  select: {
    id: true,
    occurredAt: true,
    qualityRating: true,
  },
});

// 使用 where 条件过滤
const records = await prisma.record.findMany({
  where: {
    userId: session.user.id,
    occurredAt: {
      gte: startDate,
      lte: endDate,
    },
  },
});
```

### 2. 并行查询
```typescript
const [records, total] = await Promise.all([
  prisma.record.findMany({ /* ... */ }),
  prisma.record.count({ where }),
]);
```

### 3. 缓存（未来）
```typescript
import { unstable_cache } from "next/cache";

const getRecords = unstable_cache(
  async () => prisma.record.findMany(),
  ["records"],
  { revalidate: 60 }
);
```

## 测试

### 单元测试
```typescript
import { GET } from './route';

describe('GET /api/records', () => {
  it('should return records', async () => {
    const request = new NextRequest('http://localhost:3000/api/records');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## 最佳实践

1. **统一响应格式**: 使用 `success`、`data`、`error` 字段
2. **认证检查**: 所有需要认证的端点都检查会话
3. **数据验证**: 使用 Zod 验证输入
4. **错误处理**: 提供清晰的错误信息
5. **环境区分**: 生产环境隐藏详细错误
6. **日志记录**: 记录错误和重要操作
7. **文档完善**: 维护 API 文档
8. **版本控制**: 考虑 API 版本策略

## 未来扩展

- 添加 API 版本控制（v1, v2）
- 添加速率限制
- 添加请求签名
- 添加 GraphQL 支持
- 添加 WebSocket 支持
- 添加 API 文档（Swagger/OpenAPI）
- 添加请求追踪（APM）
