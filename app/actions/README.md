# Server Actions

服务端操作目录，包含记录的 CRUD 操作。

## 目录说明

`app/actions/` 目录存放 Server Actions，这是 Next.js 14 的一项功能，允许在服务端执行函数并从客户端调用，无需手动创建 API 端点。

## 核心优势

1. **简化数据操作**: 无需创建 API Routes
2. **类型安全**: 直接使用 TypeScript
3. **减少网络请求**: 服务端和客户端在同一服务器
4. **更好的性能**: 减少往返延迟
5. **表单集成**: 与原生 HTML 表单无缝集成

## 文件列表

| 文件 | 功能 | 导出函数 |
|------|------|----------|
| `recordActions.ts` | 记录 CRUD 操作 | `createRecord`, `updateRecord`, `deleteRecord`, `deleteRecords` |

## recordActions.ts

### 文件位置
`app/actions/recordActions.ts`

### 导出函数

#### createRecord
创建新记录

**签名：**
```typescript
export async function createRecord(formData: FormData): Promise<ActionResult>
```

**参数：**
- `formData`: FormData 对象
  - `occurredAt`: 发生时间（ISO 格式字符串）
  - `qualityRating`: 质量评级（1-7 的整数）
  - `notes`: 备注（可选，最大 500 字符）

**返回值：**
```typescript
interface ActionResult {
  success: boolean;
  data?: Record;
  error?: string;
}
```

**示例：**
```typescript
const result = await createRecord(formData);
if (result.success) {
  console.log("记录创建成功", result.data);
} else {
  console.error("创建失败", result.error);
}
```

**实现：**
```typescript
export async function createRecord(formData: FormData) {
  const session = await auth.api.getSession();
  if (!session) {
    return { success: false, error: "未认证" };
  }

  const occurredAt = formData.get("occurredAt") as string;
  const qualityRating = parseInt(formData.get("qualityRating") as string);
  const notes = formData.get("notes") as string;

  const validated = createRecordSchema.safeParse({
    occurredAt,
    qualityRating,
    notes,
  });

  if (!validated.success) {
    return { success: false, error: "验证失败" };
  }

  const record = await prisma.record.create({
    data: {
      userId: session.user.id,
      occurredAt: new Date(validated.data.occurredAt),
      qualityRating: validated.data.qualityRating,
      notes: validated.data.notes,
    },
  });

  return { success: true, data: record };
}
```

---

#### updateRecord
更新记录

**签名：**
```typescript
export async function updateRecord(id: string, formData: FormData): Promise<ActionResult>
```

**参数：**
- `id`: 记录 ID
- `formData`: FormData 对象（与 createRecord 相同结构）

**返回值：**
```typescript
interface ActionResult {
  success: boolean;
  data?: Record;
  error?: string;
}
```

**示例：**
```typescript
const result = await updateRecord(recordId, formData);
if (result.success) {
  console.log("记录更新成功", result.data);
} else {
  console.error("更新失败", result.error);
}
```

**实现：**
```typescript
export async function updateRecord(id: string, formData: FormData) {
  const session = await auth.api.getSession();
  if (!session) {
    return { success: false, error: "未认证" };
  }

  const occurredAt = formData.get("occurredAt") as string;
  const qualityRating = formData.get("qualityRating") as string;
  const notes = formData.get("notes") as string;

  const validated = createRecordSchema.safeParse({
    occurredAt,
    qualityRating,
    notes,
  });

  if (!validated.success) {
    return { success: false, error: "验证失败" };
  }

  const record = await prisma.record.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      occurredAt: validated.data.occurredAt ? new Date(validated.data.occurredAt) : undefined,
      qualityRating: validated.data.qualityRating ?? undefined,
      notes: validated.data.notes,
    },
  });

  return { success: true, data: record };
}
```

---

#### deleteRecord
删除单条记录

**签名：**
```typescript
export async function deleteRecord(id: string): Promise<ActionResult>
```

**参数：**
- `id`: 记录 ID

**返回值：**
```typescript
interface ActionResult {
  success: boolean;
  error?: string;
}
```

**示例：**
```typescript
const result = await deleteRecord(recordId);
if (result.success) {
  console.log("记录删除成功");
} else {
  console.error("删除失败", result.error);
}
```

**实现：**
```typescript
export async function deleteRecord(id: string) {
  const session = await auth.api.getSession();
  if (!session) {
    return { success: false, error: "未认证" };
  }

  await prisma.record.delete({
    where: {
      id: id,
      userId: session.user.id,
    },
  });

  return { success: true };
}
```

---

#### deleteRecords
批量删除记录

**签名：**
```typescript
export async function deleteRecords(ids: string[]): Promise<ActionResult>
```

**参数：**
- `ids`: 记录 ID 数组

**返回值：**
```typescript
interface ActionResult {
  success: boolean;
  data?: { deletedCount: number };
  error?: string;
}
```

**示例：**
```typescript
const result = await deleteRecords([id1, id2, id3]);
if (result.success) {
  console.log(`删除了 ${result.data.deletedCount} 条记录`);
} else {
  console.error("删除失败", result.error);
}
```

**实现：**
```typescript
export async function deleteRecords(ids: string[]) {
  const session = await auth.api.getSession();
  if (!session) {
    return { success: false, error: "未认证" };
  }

  const { count } = await prisma.record.deleteMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
  });

  return { success: true, data: { deletedCount: count } };
}
```

## 数据验证

### Zod Schema
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

### 验证规则

#### occurredAt
- 类型：字符串（datetime 格式）
- 约束：不能是未来时间

#### qualityRating
- 类型：整数
- 最小值：1
- 最大值：7

#### notes
- 类型：字符串
- 最大长度：500 字符
- 可选

## 认证与授权

### 会话验证
```typescript
const session = await auth.api.getSession();
if (!session) {
  return { success: false, error: "未认证" };
}
```

### 数据隔离
所有数据库操作都包含 `userId` 过滤：

```typescript
// 创建
await prisma.record.create({
  data: {
    userId: session.user.id,
    // ...
  },
});

// 更新
await prisma.record.update({
  where: {
    id,
    userId: session.user.id,  // 只能更新自己的记录
  },
});

// 删除
await prisma.record.delete({
  where: {
    id,
    userId: session.user.id,  // 只能删除自己的记录
  },
});
```

## 客户端调用

### 方式 1：使用 formData（表单）
```tsx
<form action={createRecord}>
  <input name="occurredAt" type="datetime-local" />
  <input name="qualityRating" type="number" />
  <textarea name="notes"></textarea>
  <button type="submit">提交</button>
</form>
```

### 方式 2：使用函数调用
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("occurredAt", "2024-01-15T10:30:00");
  formData.append("qualityRating", "5");
  formData.append("notes", "正常");

  const result = await createRecord(formData);
  if (result.success) {
    // 成功处理
  }
};
```

### 方式 3：使用 useTransition
```tsx
import { useTransition } from "react";

const [isPending, startTransition] = useTransition();

const handleSubmit = () => {
  startTransition(async () => {
    const result = await createRecord(formData);
  });
};
```

## 错误处理

### 返回统一格式
```typescript
return {
  success: boolean;
  data?: any;
  error?: string;
};
```

### 客户端处理
```tsx
const result = await createRecord(formData);

if (result.success) {
  // 成功
  toast.success("记录创建成功");
} else {
  // 失败
  toast.error(result.error || "操作失败");
}
```

## 性能优化

### 1. 使用 Promise.all
```typescript
const [records, total] = await Promise.all([
  prisma.record.findMany(...),
  prisma.record.count(...),
]);
```

### 2. 批量操作
```typescript
await prisma.record.deleteMany({
  where: {
    id: { in: ids },
    userId: session.user.id,
  },
});
```

### 3. 选择性查询
```typescript
await prisma.record.findMany({
  select: {
    id: true,
    occurredAt: true,
    qualityRating: true,
    notes: true,
    // 不查询不需要的字段
  },
});
```

## 安全措施

### 1. 认证检查
每个 Server Action 都检查会话：
```typescript
const session = await auth.api.getSession();
if (!session) {
  return { success: false, error: "未认证" };
}
```

### 2. 输入验证
使用 Zod 验证所有输入：
```typescript
const validated = createRecordSchema.safeParse(data);
if (!validated.success) {
  return { success: false, error: "验证失败" };
}
```

### 3. 数据隔离
确保用户只能访问自己的数据：
```typescript
where: {
  id,
  userId: session.user.id,
}
```

### 4. 时间验证
防止未来日期：
```typescript
.refine(
  (date) => new Date(date) <= new Date(),
  "发生时间不能是未来时间"
)
```

## 测试

### 单元测试
```typescript
import { createRecord } from './recordActions';

describe('createRecord', () => {
  it('should create a record successfully', async () => {
    const formData = new FormData();
    formData.append('occurredAt', '2024-01-15T10:30:00Z');
    formData.append('qualityRating', '5');
    formData.append('notes', 'Test note');

    const result = await createRecord(formData);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
```

## 最佳实践

1. **始终验证输入**: 使用 Zod 或类似库
2. **检查认证**: 每个 action 都验证会话
3. **数据隔离**: 确保用户只能访问自己的数据
4. **错误处理**: 返回清晰的错误信息
5. **类型安全**: 使用 TypeScript 严格模式
6. **事务处理**: 复杂操作使用 Prisma 事务
7. **日志记录**: 记录重要操作和错误

## 与 API Routes 的选择

### 使用 Server Actions 当：
- 表单提交
- 简单的 CRUD 操作
- 需要服务端验证
- 减少往返延迟

### 使用 API Routes 当：
- 需要为第三方提供接口
- 复杂的 RESTful API
- 需要版本控制
- 需要自定义响应头
- WebSocket 或 SSE

## 未来扩展

- 添加记录搜索功能
- 添加记录导出功能
- 添加记录统计功能
- 添加记录导入功能
- 添加记录备份功能
