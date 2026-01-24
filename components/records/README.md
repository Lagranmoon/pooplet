# 业务组件库

本目录包含与排便记录相关的业务组件，处理数据录入、展示和交互。

## 组件列表

### RecordForm (记录表单)

**文件位置：** `records/RecordForm.tsx`

**功能：** 用于创建和管理排便记录的表单组件。

**技术特点：**
- 客户端组件 (`"use client"` 指令)
- 使用 `useState` 管理组件状态
- 乐观更新（Optimistic UI）提升用户体验
- 集成 Server Actions 进行数据操作
- 自动表单提交处理

**数据模型：**
```typescript
interface RecordData {
  id: string;
  occurredAt: Date;
  qualityRating: number;
  notes?: string;
}
```

**State 管理：**
```typescript
const [isPending, setIsPending] = useState(false);
const [optimisticRecords, setOptimisticRecords] = useState<RecordData[]>([]);
```

**关键方法：**

**handleSubmit() - 提交记录**
```typescript
const handleSubmit = async (formData: FormData) => {
  // 1. 设置加载状态
  setIsPending(true);
  
  // 2. 创建临时记录用于乐观更新
  const tempRecord: RecordData = {
    id: `temp-${Date.now()}`,
    occurredAt: new Date(formData.get("occurredAt") as string),
    qualityRating: parseInt(formData.get("qualityRating") as string),
    notes: formData.get("notes") as string,
  };
  
  // 3. 乐观更新 UI
  setOptimisticRecords([...optimisticRecords, tempRecord]);
  
  // 4. 调用 Server Action
  const result = await createRecord(formData);
  setIsPending(false);
  
  // 5. 更新真实数据
  if (result.success && result.data) {
    setOptimisticRecords([...optimisticRecords, result.data]);
  }
};
```

**handleDelete() - 删除记录**
```typescript
const handleDelete = async (id: string) => {
  setIsPending(true);
  const result = await deleteRecord(id);
  setIsPending(false);
  
  if (result.success) {
    alert("删除成功");
  }
};
```

**表单字段：**
1. **发生时间 (occurredAt)**
   - 类型：`datetime-local`
   - 必填字段
   - 默认为当前时间

2. **质量评级 (qualityRating)**
   - 类型：`number`
   - 范围：1-7
   - 必填字段

3. **备注 (notes)**
   - 类型：`text`
   - 可选字段
   - 最多 4 行文本

**使用示例：**
```typescript
import { RecordForm } from "@/components/records/RecordForm";

function MyPage() {
  return (
    <div>
      <h1>添加记录</h1>
      <RecordForm />
    </div>
  );
}
```

**UI 特性：**
- 加载状态显示（"保存中..."）
- 禁用提交按钮防止重复提交
- 实时显示最近添加的记录
- 每条记录显示时间、质量评级和备注
- 支持删除操作

**样式特点：**
- 垂直布局（`space-y-4`）
- 响应式表单字段
- 圆角边框和阴影效果
- 悬停和焦点状态样式

---

### RecordList (记录列表)

**文件位置：** `records/RecordList.tsx`

**功能：** 以表格形式展示排便记录列表，支持添加和删除操作。

**技术特点：**
- 客户端组件 (`"use client"` 指令)
- 使用 `useState` 管理记录列表
- 使用 `useOptimistic` Hook 实现乐观更新
- 集成 date-fns 进行日期格式化
- 复用 UI 组件（Table、Badge、Button）
- 响应式设计（移动端适配）

**数据模型：**
```typescript
interface RecordItem {
  id: string;
  occurredAt: Date;
  qualityRating: number;
  notes?: string;
}
```

**Props：**
```typescript
interface RecordListProps {
  initialRecords: RecordItem[];
}
```

**State 管理：**
```typescript
const [records, setRecords] = useState<RecordItem[]>(initialRecords);

// 乐观更新 Hook
const [optimisticRecords] = useOptimistic(
  records,
  (state, newItem: RecordItem) => [...state, newItem]
);
```

**关键方法：**

**handleSubmit() - 添加记录**
```typescript
const handleSubmit = async (formData: FormData) => {
  const result = await createRecord(formData);
  
  if (result.success && result.data) {
    const newItem: RecordItem = {
      id: result.data.id,
      occurredAt: result.data.occurredAt,
      qualityRating: result.data.qualityRating,
      notes: result.data.notes,
    };
    setRecords([...records, newItem]);
  }
};
```

**handleDelete() - 删除记录**
```typescript
const handleDelete = async (id: string) => {
  const result = await deleteRecord(id);
  
  if (result.success) {
    setRecords(records.filter(r => r.id !== id));
  }
};
```

**表单字段：**
1. **发生时间 (occurredAt)**
   - 类型：`datetime-local`
   - 必填字段
   - 默认为当前时间（ISO 格式）

2. **质量评级 (qualityRating)**
   - 类型：`number`
   - 范围：1-7
   - 必填字段
   - 提示文字："1-7"

3. **备注 (notes)**
   - 类型：`text`
   - 可选字段
   - 占位符："可选备注"

**表格列：**
1. **时间** - 格式化为 `yyyy-MM-dd HH:mm`
2. **质量评级** - 使用 Badge 组件显示
3. **备注** - 显示备注内容，无备注显示 "-"
4. **操作** - 删除按钮

**使用示例：**
```typescript
import { RecordList } from "@/components/records/RecordList";

async function getInitialRecords() {
  const result = await fetch('/api/records');
  const data = await result.json();
  return data;
}

function MyPage({ records }: { records: RecordItem[] }) {
  return (
    <div>
      <h1>我的记录</h1>
      <RecordList initialRecords={records} />
    </div>
  );
}
```

**UI 特性：**
- 双列响应式表单布局（grid-cols-1 md:grid-cols-2）
- 表格悬停效果
- 空状态提示（"暂无记录，开始添加第一条记录"）
- 临时记录禁用删除按钮
- 加载状态处理

**样式特点：**
- 使用 Tailwind CSS 工具类
- 白色卡片背景（暗黑模式自适应）
- 圆角和阴影效果
- 一致的间距和对齐

---

## 集成说明

### Server Actions 集成

两个组件都使用 Server Actions 进行数据操作：

```typescript
import { createRecord, deleteRecord } from "@/app/actions/recordActions";

// 创建记录
const result = await createRecord(formData);

// 删除记录
const result = await deleteRecord(id);
```

**API 响应类型：**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### UI 组件依赖

**RecordList 组件使用的 UI 组件：**
```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
```

### 日期处理

使用 `date-fns` 库进行日期格式化：

```typescript
import { format } from "date-fns";

// 格式化为 "2026-01-25 14:30"
format(record.occurredAt, "yyyy-MM-dd HH:mm")
```

---

## 设计模式

### 1. 乐观更新模式

通过 `useOptimistic` Hook 或手动管理状态实现即时 UI 响应：

```typescript
// 立即更新 UI
setRecords([...records, newItem]);

// 后台处理请求
const result = await createRecord(formData);
```

**优势：**
- 提升用户体验（减少感知延迟）
- 避免重复提交
- 更流畅的交互

### 2. 受控/非受控表单混合模式

- 使用原生 HTML 表单元素（非完全受控）
- 通过 `FormData` 获取表单数据
- 提交时进行数据处理

**优势：**
- 减少状态管理复杂度
- 更好的性能
- 符合 HTML 标准

### 3. 加载状态模式

使用 `isPending` 状态控制 UI 反馈：

```typescript
const [isPending, setIsPending] = useState(false);

// 加载中
setIsPending(true);
await operation();
setIsPending(false);

// UI 中使用
<Button disabled={isPending}>
  {isPending ? "保存中..." : "保存"}
</Button>
```

### 4. 错误处理模式

通过 API 响应的 `success` 标志处理错误：

```typescript
if (result.success) {
  // 成功处理
} else {
  // 错误处理
}
```

---

## 状态管理策略

### 本地状态

每个组件独立管理自己的状态：

```typescript
// RecordForm
const [isPending, setIsPending] = useState(false);
const [optimisticRecords, setOptimisticRecords] = useState<RecordData[]>([]);

// RecordList
const [records, setRecords] = useState<RecordItem[]>(initialRecords);
```

### 数据流向

```
用户操作 → 表单提交 → Server Action → 数据库
                 ↓
            本地状态更新 → UI 渲染
```

### 乐观更新流程

```
1. 用户提交表单
   ↓
2. 创建临时记录（前端）
   ↓
3. 更新本地状态（立即显示）
   ↓
4. 调用 Server Action
   ↓
5. 服务器处理
   ↓
6. 返回真实数据
   ↓
7. 更新为真实记录
```

---

## 性能优化

### 1. 乐观更新

- 减少网络请求感知延迟
- 提升用户感知性能

### 2. 响应式设计

- 移动优先布局
- 断点适配（`md:` 前缀）

### 3. 条件渲染

- 空状态处理
- 加载状态显示

### 4. 防重复提交

```typescript
<Button disabled={isPending}>
  {isPending ? "保存中..." : "保存"}
</Button>
```

---

## 可访问性

### 表单关联

```html
<label htmlFor="occurredAt">发生时间</label>
<input id="occurredAt" name="occurredAt" />
```

### 语义化 HTML

- 使用正确的表单元素类型
- 表格使用语义化标签
- 按钮使用 `<button>` 元素

### 键盘导航

- 表单字段支持 Tab 键导航
- 按钮支持 Enter 键触发
- 焦点样式可见

---

## 扩展指南

### 添加新字段

1. 更新 `RecordData` 接口
2. 在表单中添加输入字段
3. 在表格中添加对应列
4. 更新 `handleSubmit` 方法处理新字段

**示例：**
```typescript
// 1. 更新接口
interface RecordData {
  id: string;
  occurredAt: Date;
  qualityRating: number;
  notes?: string;
  newField?: string; // 新字段
}

// 2. 表单添加字段
<input
  id="newField"
  name="newField"
  type="text"
  placeholder="新字段"
/>

// 3. 表格添加列
<TableCell>{record.newField || "-"}</TableCell>
```

### 添加编辑功能

1. 创建编辑状态
2. 添加编辑按钮
3. 显示编辑表单
4. 实现更新逻辑

**示例：**
```typescript
const [editingId, setEditingId] = useState<string | null>(null);

const handleEdit = (id: string) => {
  setEditingId(id);
};

const handleSave = async (formData: FormData) => {
  const result = await updateRecord(formData);
  if (result.success) {
    setEditingId(null);
  }
};
```

### 添加筛选和排序

1. 添加筛选状态
2. 实现筛选逻辑
3. 实现排序逻辑
4. 添加筛选 UI

**示例：**
```typescript
const [filter, setFilter] = useState<"all" | "recent">("all");
const [sort, setSort] = useState<"asc" | "desc">("desc");

const filteredRecords = records
  .filter(r => filter === "all" || isRecent(r.occurredAt))
  .sort((a, b) => sort === "desc" 
    ? b.occurredAt.getTime() - a.occurredAt.getTime()
    : a.occurredAt.getTime() - b.occurredAt.getTime()
  );
```

---

## 测试建议

### 单元测试

```typescript
describe("RecordForm", () => {
  it("正确渲染表单字段", () => {
    render(<RecordForm />);
    expect(screen.getByLabelText(/发生时间/)).toBeInTheDocument();
    expect(screen.getByLabelText(/质量评级/)).toBeInTheDocument();
  });

  it("提交时调用 createRecord", async () => {
    render(<RecordForm />);
    // 填写表单
    // 提交表单
    // 验证调用
  });
});
```

### 集成测试

```typescript
describe("RecordList Integration", () => {
  it("添加记录后显示在列表中", async () => {
    // 设置初始记录
    // 填写表单并提交
    // 验证记录出现在列表中
  });
});
```

---

## 最佳实践

1. **类型安全** - 使用 TypeScript 定义所有接口
2. **错误处理** - 检查 API 响应的 success 标志
3. **用户体验** - 使用乐观更新减少等待时间
4. **可访问性** - 使用语义化 HTML 和表单关联
5. **性能** - 合理使用 React Hooks，避免不必要的重渲染
6. **响应式** - 移动优先设计，适配不同屏幕尺寸
7. **一致性** - 保持代码风格和 UI 一致性
8. **可维护性** - 拆分大组件，保持单一职责

---

## 相关文档

- [Server Actions 文档](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [useOptimistic Hook 文档](https://react.dev/reference/react/useOptimistic)
- [date-fns 文档](https://date-fns.org/)
- [UI 组件文档](./ui/README.md)
