# Records 记录列表

所有记录的查看和管理页面，支持分页、筛选和删除操作。

## 文件位置
`app/(dashboard)/dashboard/records/page.tsx`

## 核心功能

### 1. 记录列表
- 显示所有历史记录
- 支持分页浏览（每页 20 条）
- 按时间倒序排列

### 2. 记录管理
- 查看记录详情
- 删除记录（带确认）
- 记录筛选（日期范围）

### 3. UI 特性
- 表格形式展示
- 质量评级颜色标识
- 响应式设计（移动端隐藏部分列）
- 加载状态和空状态处理

## 数据结构

### 记录接口
```typescript
interface Record {
  id: string;
  userId: string;
  occurredAt: Date;      // 发生时间
  qualityRating: number; // 质量评级（1-7）
  notes: string | null;  // 备注
  createdAt: Date;
  updatedAt: Date;
}
```

### 分页数据
```typescript
interface PaginationData {
  page: number;          // 当前页码
  limit: number;         // 每页条数
  total: number;         // 总记录数
  totalPages: number;    // 总页数
  hasNext: boolean;      // 是否有下一页
  hasPrev: boolean;      // 是否有上一页
}
```

## 状态管理

### 本地状态
```typescript
const [records, setRecords] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [deleting, setDeleting] = useState<string | null>(null);
const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
const [deleteId, setDeleteId] = useState<string | null>(null);
```

## API 交互

### 获取记录列表
```typescript
const fetchRecords = async () => {
  try {
    const res = await fetch(`/api/records?page=${page}&limit=20`);
    const data = await res.json();
    if (data.success) {
      setRecords(data.data.records);
      setTotalPages(data.data.pagination.totalPages);
    }
  } catch (error) {
    console.error("获取记录失败:", error);
  } finally {
    setLoading(false);
  }
};
```

### 删除记录
```typescript
const confirmDelete = async () => {
  if (!deleteId) return;

  setDeleting(deleteId);
  const result = await deleteRecord(deleteId);
  if (result.success) {
    fetchRecords();
  }
  setDeleting(null);
  setDeleteId(null);
  setConfirmDialogOpen(false);
};
```

## Server Actions

### deleteRecord
```typescript
import { deleteRecord } from "../../../actions/recordActions";

// 使用
const result = await deleteRecord(id);
```

## 组件结构

### ConfirmDialog
删除确认对话框组件：
```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText: string;
  cancelText: string;
}
```

### 使用示例
```typescript
<ConfirmDialog
  open={confirmDialogOpen}
  title="删除记录"
  description="确定要删除这条记录吗？此操作无法撤销。"
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
  confirmText="删除"
  cancelText="取消"
/>
```

## 质量评级配置

### 质量选项
```typescript
const qualityOptions = [
  { value: 1, label: "很差", color: "bg-red-500", textColor: "text-red-500" },
  { value: 2, label: "较差", color: "bg-orange-500", textColor: "text-orange-500" },
  { value: 3, label: "一般", color: "bg-yellow-500", textColor: "text-yellow-500" },
  { value: 4, label: "还好", color: "bg-lime-500", textColor: "text-lime-500" },
  { value: 5, label: "良好", color: "bg-green-400", textColor: "text-green-400" },
  { value: 6, label: "很好", color: "bg-green-500", textColor: "text-green-500" },
  { value: 7, label: "完美", color: "bg-emerald-500", textColor: "text-emerald-500" },
];
```

### 质量信息获取
```typescript
const getQualityInfo = (value: number) => {
  return qualityOptionsMap[value] || qualityOptions[0];
};
```

## 表格结构

### 表头
```tsx
<thead className="bg-gray-50 dark:bg-gray-700">
  <tr>
    <th>时间</th>
    <th>质量</th>
    <th>备注</th>
    <th>操作</th>
  </tr>
</thead>
```

### 表格行
```tsx
<tbody className="divide-y divide-gray-200">
  {records.map((record) => {
    const quality = getQualityInfo(record.qualityRating);
    return (
      <tr key={record.id}>
        <td>
          <div>{format(new Date(record.occurredAt), "yyyy年M月d日")}</div>
          <div>{format(new Date(record.occurredAt), "HH:mm")}</div>
        </td>
        <td>
          <span className={`${quality.color} text-white`}>
            {quality.label}
          </span>
        </td>
        <td>{record.notes || "-"}</td>
        <td>
          <button onClick={() => handleDelete(record.id)}>
            {deleting === record.id ? "删除中..." : "删除"}
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
```

## 分页导航

### 分页组件
```tsx
{totalPages > 1 && (
  <div className="flex justify-center gap-2 mt-6">
    <button
      onClick={() => setPage(page - 1)}
      disabled={page === 1}
    >
      上一页
    </button>
    <span>{page} / {totalPages}</span>
    <button
      onClick={() => setPage(page + 1)}
      disabled={page === totalPages}
    >
      下一页
    </button>
  </div>
)}
```

## 响应式设计

### 移动端优化
```tsx
<th className="hidden md:table-cell">备注</th>
<td className="hidden md:table-cell">
  {record.notes || "-"}
</td>
```

### 桌面端显示
- 日期：完整日期和时间
- 备注：完整显示
- 操作：按钮文字

### 移动端显示
- 日期：精简格式
- 备注：隐藏
- 操作：保持按钮

## 删除流程

### 步骤
```
1. 用户点击"删除"按钮
   → handleDelete(id)
   → setDeleteId(id)
   → setConfirmDialogOpen(true)

2. 显示确认对话框

3. 用户点击"删除"
   → confirmDelete()
   → setDeleting(id)
   → 调用 Server Action
   → 删除成功：fetchRecords()
   → 关闭对话框

4. 用户点击"取消"
   → cancelDelete()
   → setDeleteId(null)
   → setConfirmDialogOpen(false)
```

## API 端点

### GET /api/records
获取记录列表

**查询参数：**
- `page`: 页码（默认 1）
- `limit`: 每页条数（默认 20）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）

**响应示例：**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "1",
        "occurredAt": "2024-01-15T10:30:00Z",
        "qualityRating": 5,
        "notes": "正常"
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

### DELETE /api/records/[id]
删除单条记录

**响应示例：**
```json
{
  "success": true,
  "message": "记录删除成功"
}
```

## 错误处理

### 网络错误
```typescript
catch (error) {
  console.error("获取记录失败:", error);
}
```

### 删除错误
```typescript
try {
  const result = await deleteRecord(deleteId);
  if (result.success) {
    fetchRecords();
  }
} catch (error) {
  console.error("删除失败:", error);
}
```

## 加载状态

### 页面加载
```tsx
{loading ? (
  <div className="text-center py-8">加载中...</div>
) : (
  // 记录列表
)}
```

### 删除加载
```tsx
<button
  onClick={() => handleDelete(record.id)}
  disabled={deleting === record.id}
>
  {deleting === record.id ? "删除中..." : "删除"}
</button>
```

## 空状态处理

```tsx
{records.length === 0 ? (
  <div className="text-center p-8">
    <p>还没有任何记录</p>
    <a href="/dashboard">去添加记录</a>
  </div>
) : (
  // 记录列表
)}
```

## 性能优化

### useCallback
```typescript
const fetchRecords = useCallback(async () => {
  // ...
}, [page]);

const handleDelete = useCallback((id: string) => {
  setDeleteId(id);
  setConfirmDialogOpen(true);
}, []);

const confirmDelete = useCallback(async () => {
  // ...
}, [deleteId, fetchRecords]);
```

### useMemo
```typescript
const qualityOptionsMap = useMemo(() => {
  return qualityOptions.reduce((acc, option) => {
    acc[option.value] = option;
    return acc;
  }, {} as Record<number, any>);
}, []);
```

## 日期格式化

### date-fns 配置
```typescript
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// 日期
format(new Date(record.occurredAt), "yyyy年M月d日");

// 时间
format(new Date(record.occurredAt), "HH:mm");
```

## 未来扩展

- 添加记录编辑功能
- 添加批量删除功能
- 添加高级筛选（质量评级、日期范围）
- 添加记录搜索功能
- 添加记录导出功能（CSV、Excel）
- 添加记录排序功能（按质量、时间）
