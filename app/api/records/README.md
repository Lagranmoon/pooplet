# Records API

记录管理 API，提供记录的 CRUD 操作。

## 目录说明

`app/api/records/` 目录存放记录管理的 API Routes。

## 目录结构

```
app/api/records/
├── route.ts          # 获取记录列表、批量删除、创建记录
└── [id]/
    └── route.ts      # 单条记录的查询、更新、删除
```

## API 端点

### 1. GET /api/records

**功能：** 获取记录列表（支持分页和日期筛选）

**请求：**
```http
GET /api/records?page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31
```

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `page` | number | 否 | 1 | 页码 |
| `limit` | number | 否 | 20 | 每页条数（最大 100） |
| `startDate` | string | 否 | - | 开始日期（ISO 格式） |
| `endDate` | string | 否 | - | 结束日期（ISO 格式） |

**响应：**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "rec_123",
        "userId": "user_456",
        "occurredAt": "2024-01-15T10:30:00Z",
        "qualityRating": 5,
        "notes": "正常",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
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

**实现：**
```typescript
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Prisma.RecordWhereInput = { userId: session.user.id };
  if (startDate) {
    where.occurredAt = { gte: new Date(startDate) };
  }
  if (endDate) {
    where.occurredAt = { lte: new Date(endDate) };
  }

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.record.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  });
}
```

**使用场景：**
- 记录列表页面
- 历史记录查询
- 日期范围筛选

---

### 2. POST /api/records

**功能：** 创建新记录

**请求：**
```http
POST /api/records
Content-Type: application/json
```

**请求体：**
```json
{
  "occurredAt": "2024-01-15T10:30:00Z",
  "qualityRating": 5,
  "notes": "正常"
}
```

**验证规则：**

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| `occurredAt` | string | 是 | datetime，不能是未来时间 |
| `qualityRating` | number | 是 | 整数，1-7 |
| `notes` | string | 否 | 最大 500 字符 |

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "rec_123",
    "userId": "user_456",
    "occurredAt": "2024-01-15T10:30:00Z",
    "qualityRating": 5,
    "notes": "正常",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**实现：**
```typescript
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.ids) {
      // 批量删除
      const { count } = await prisma.record.deleteMany({
        where: {
          id: { in: body.ids },
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        data: { deletedCount: count },
        message: `删除成功`,
      });
    }

    // 创建记录
    const validated = createRecordSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "验证失败" },
        { status: 400 }
      );
    }

    const record = await prisma.record.create({
      data: {
        userId: session.user.id,
        occurredAt: new Date(validated.data.occurredAt),
        qualityRating: validated.data.qualityRating,
        notes: validated.data.notes,
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    const errorMessage = process.env.NODE_ENV === 'production'
      ? "创建记录失败"
      : error.message || "创建记录失败";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
```

**使用场景：**
- 添加新记录
- 快速记录功能

---

### 3. GET /api/records/[id]

**功能：** 获取单条记录

**请求：**
```http
GET /api/records/rec_123
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "rec_123",
    "userId": "user_456",
    "occurredAt": "2024-01-15T10:30:00Z",
    "qualityRating": 5,
    "notes": "正常",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**错误响应（404）：**
```json
{
  "success": false,
  "error": "记录不存在或无权访问"
}
```

**实现：**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const { id } = await params;
  const record = await prisma.record.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!record) {
    return NextResponse.json(
      { error: "记录不存在或无权访问" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: record });
}
```

**使用场景：**
- 查看记录详情
- 编辑前获取记录

---

### 4. PUT /api/records/[id]

**功能：** 更新记录

**请求：**
```http
PUT /api/records/rec_123
Content-Type: application/json
```

**请求体：**
```json
{
  "occurredAt": "2024-01-15T11:00:00Z",
  "qualityRating": 6,
  "notes": "更新后的备注"
}
```

**验证规则：** 所有字段都是可选的

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "rec_123",
    "userId": "user_456",
    "occurredAt": "2024-01-15T11:00:00Z",
    "qualityRating": 6,
    "notes": "更新后的备注",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  },
  "message": "记录更新成功"
}
```

**实现：**
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = updateRecordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "验证失败",
          details: process.env.NODE_ENV === 'development'
            ? validated.error.errors
            : undefined
        },
        { status: 400 }
      );
    }

    const { id } = await params;

    const record = await prisma.record.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        ...validated.data,
        occurredAt: validated.data.occurredAt
          ? new Date(validated.data.occurredAt)
          : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: record,
      message: "记录更新成功",
    });
  } catch (error: any) {
    const errorMessage = process.env.NODE_ENV === 'production'
      ? "更新记录失败"
      : error.message || "更新记录失败";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
```

**使用场景：**
- 编辑记录
- 修正错误数据

---

### 5. DELETE /api/records/[id]

**功能：** 删除记录

**请求：**
```http
DELETE /api/records/rec_123
```

**响应：**
```json
{
  "success": true,
  "message": "记录删除成功"
}
```

**实现：**
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.record.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    success: true,
    message: "记录删除成功",
  });
}
```

**使用场景：**
- 删除错误记录
- 清理过期数据

## 数据验证

### Zod Schema

#### createRecordSchema
```typescript
const createRecordSchema = z.object({
  occurredAt: z.string().datetime().refine(
    (date) => new Date(date) <= new Date(),
    "发生时间不能是未来时间"
  ),
  qualityRating: z.number().int().min(1).max(7),
  notes: z.string().max(500).optional(),
});
```

#### updateRecordSchema
```typescript
const updateRecordSchema = z.object({
  occurredAt: z.string().datetime().optional(),
  qualityRating: z.number().int().min(1).max(7).optional(),
  notes: z.string().max(500).optional(),
});
```

## 错误处理

### 错误代码

| HTTP 状态 | 错误 | 说明 |
|-----------|------|------|
| 400 | "验证失败" | 请求数据不符合验证规则 |
| 401 | "未认证" | 用户未登录或会话无效 |
| 404 | "记录不存在或无权访问" | 记录不存在或用户无权访问 |
| 500 | "创建记录失败" | 服务器内部错误 |

### 错误响应格式
```json
{
  "success": false,
  "error": "错误描述",
  "details": {  // 仅开发环境
    "field": "错误详情"
  }
}
```

## 数据隔离

所有查询都包含 `userId` 过滤：

```typescript
// 查询
prisma.record.findFirst({
  where: {
    id,
    userId: session.user.id,  // 只能访问自己的记录
  },
});

// 更新
prisma.record.update({
  where: {
    id,
    userId: session.user.id,  // 只能更新自己的记录
  },
});

// 删除
prisma.record.delete({
  where: {
    id,
    userId: session.user.id,  // 只能删除自己的记录
  },
});
```

## 性能优化

### 1. 并行查询
```typescript
const [records, total] = await Promise.all([
  prisma.record.findMany({ /* ... */ }),
  prisma.record.count({ where }),
]);
```

### 2. 选择性查询
```typescript
prisma.record.findMany({
  select: {
    id: true,
    occurredAt: true,
    qualityRating: true,
    notes: true,
    // 不查询不需要的字段
  },
});
```

### 3. 索引优化（数据库）
```prisma
model Record {
  id            String   @id @default(cuid())
  userId        String
  occurredAt    DateTime @index
  qualityRating Int
  // ...
}
```

## 测试

### 单元测试
```typescript
describe('Records API', () => {
  it('should get records', async () => {
    const request = new NextRequest('http://localhost:3000/api/records');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should create a record', async () => {
    const request = new NextRequest('http://localhost:3000/api/records', {
      method: 'POST',
      body: JSON.stringify({
        occurredAt: '2024-01-15T10:30:00Z',
        qualityRating: 5,
        notes: '测试'
      })
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## 使用示例

### 客户端调用

#### 获取记录列表
```typescript
const response = await fetch('/api/records?page=1&limit=20');
const data = await response.json();

if (data.success) {
  console.log(data.data.records);
  console.log(data.data.pagination);
}
```

#### 创建记录
```typescript
const response = await fetch('/api/records', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    occurredAt: new Date().toISOString(),
    qualityRating: 5,
    notes: '正常'
  })
});
const data = await response.json();

if (data.success) {
  console.log(data.data);
}
```

#### 更新记录
```typescript
const response = await fetch('/api/records/rec_123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    qualityRating: 6
  })
});
const data = await response.json();

if (data.success) {
  console.log(data.data);
}
```

#### 删除记录
```typescript
const response = await fetch('/api/records/rec_123', {
  method: 'DELETE'
});
const data = await response.json();

if (data.success) {
  console.log(data.message);
}
```

## 未来扩展

- 添加记录搜索功能
- 添加记录导出功能（CSV、Excel）
- 添加记录排序功能
- 添加高级筛选功能
- 添加记录统计功能
- 添加记录备份功能
