# Dashboard 仪表板

仪表板首页，提供记录的快速添加和今日/最近记录查看。

## 文件位置
`app/(dashboard)/dashboard/page.tsx`

## 核心功能

### 1. 记录管理
- 添加新记录（时间、质量、备注）
- 查看今日记录
- 查看最近 5 条记录

### 2. 性能优化
- 使用 `useReducer` 管理复杂状态
- 组件 memo 化防止不必要重渲染
- `useMemo` 缓存计算结果
- `useCallback` 缓存回调函数

### 3. 错误处理
- 错误边界（Error Boundary）
- 网络错误处理
- 表单验证错误

## 组件架构

### 主组件层级
```
OptimizedDashboardPage (Error Boundary)
└── DashboardContent
    ├── RecordForm
    ├── RecordsList (今日记录)
    └── RecordsList (最近记录)
```

### 子组件说明

#### RecordItem（记录项）
展示单条记录的组件：
```typescript
interface RecordItemProps {
  record: BowelRecord;
}
```
- 显示时间、质量评级、备注
- 根据质量评级显示不同颜色
- 使用 `memo` 优化性能

#### RecordsList（记录列表）
记录列表容器组件：
```typescript
interface RecordsListProps {
  title: string;
  records: BowelRecord[];
  loading: boolean;
  emptyMessage: string;
  showCount?: boolean;
  onAddRecord?: () => void;
}
```
- 处理加载状态
- 处理空状态
- 显示记录数量

#### RecordForm（记录表单）
添加记录的表单组件：
```typescript
interface RecordFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => Promise<{ success: boolean; error?: string }>;
  submitting: boolean;
  onCancel: () => void;
}
```
- 日期时间选择器
- 质量评级选择（1-7 分）
- 备注输入框
- 表单验证

#### ErrorMessage（错误提示）
显示错误信息的组件：
```typescript
interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}
```
- 红色警示框
- 可关闭的错误提示

## 状态管理

### DashboardState 接口
```typescript
interface DashboardState {
  records: BowelRecord[];      // 记录列表
  loading: boolean;            // 加载状态
  submitting: boolean;         // 提交状态
  showForm: boolean;           // 是否显示表单
  error: string | null;        // 错误信息
  initialized: boolean;        // 是否已初始化
}
```

### Action 类型
```typescript
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RECORDS'; payload: BowelRecord[] }
  | { type: 'ADD_RECORD'; payload: BowelRecord }
  | { type: 'REMOVE_RECORD'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'TOGGLE_FORM' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_INITIALIZED'; payload: boolean };
```

### Reducer 实现
```typescript
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_RECORDS':
      return { ...state, records: action.payload, loading: false, initialized: true };
    case 'ADD_RECORD':
      return { ...state, records: [action.payload, ...state.records] };
    case 'REMOVE_RECORD':
      return { ...state, records: state.records.filter(r => r.id !== action.payload) };
    // ... 其他 case
  }
}
```

## 自定义 Hooks

### useRecords
管理记录数据的 Hook：
```typescript
const {
  records,          // 所有记录
  loading,          // 加载状态
  error,            // 错误信息
  fetchRecords,     // 获取记录
  addRecord,        // 添加记录
  todayRecords,     // 今日记录
  sortedRecords     // 排序后的记录
} = useRecords();
```

### useFormData
管理表单数据的 Hook：
```typescript
const {
  formData,          // 表单数据
  setFormData,       // 设置表单数据
  isSubmitting,      // 提交状态
  showForm,          // 是否显示表单
  toggleForm,        // 切换表单显示
  handleSubmit       // 提交表单
} = useFormData();
```

### useAuth
获取认证状态的 Hook：
```typescript
const { data, isPending } = useAuth();
```

## 质量评级系统

### 质量选项映射
```typescript
const qualityOptionsMap = {
  1: { value: 1, label: "很差", color: "bg-red-500", text: "text-red-500", bg: "bg-red-50" },
  2: { value: 2, label: "较差", color: "bg-orange-500", text: "text-orange-500", bg: "bg-orange-50" },
  3: { value: 3, label: "一般", color: "bg-yellow-500", text: "text-yellow-500", bg: "bg-yellow-50" },
  4: { value: 4, label: "还好", color: "bg-lime-500", text: "text-lime-500", bg: "bg-lime-50" },
  5: { value: 5, label: "良好", color: "bg-green-400", text: "text-green-400", bg: "bg-green-50" },
  6: { value: 6, label: "很好", color: "bg-green-500", text: "text-green-500", bg: "bg-green-50" },
  7: { value: 7, label: "完美", color: "bg-emerald-500", text: "text-emerald-500", bg: "bg-emerald-50" },
};
```

### 工具函数
```typescript
const utils = {
  formatTime: (date: string) => {
    return format(new Date(date), "HH:mm");
  },
  formatDate: (date: string) => {
    return format(new Date(date), "yyyy年M月d日");
  }
};
```

## 表单数据结构

```typescript
interface FormData {
  occurredAt: string;      // 发生时间（ISO 格式）
  qualityRating: number;   // 质量评级（1-7）
  notes: string;           // 备注（可选）
}
```

## 表单验证规则

### 发生时间
```typescript
z.string().datetime().refine(
  (date) => new Date(date) <= new Date(),
  "发生时间不能是未来时间"
)
```

### 质量评级
```typescript
z.number().int().min(1).max(7)
```

### 备注
```typescript
z.string().max(500).optional()
```

## 交互流程

### 添加记录流程
```
1. 用户点击"添加记录"按钮
   → toggleForm() → showForm = true
2. 显示表单
3. 用户填写数据
4. 点击"保存记录"
   → handleFormSubmit()
   → addRecord(formData)
   → 调用 Server Action 或 API
   → 成功：dispatch({ type: 'TOGGLE_FORM' })
   → 清空表单数据
5. 更新记录列表
```

### 初始化流程
```
1. 组件挂载
2. useEffect 检测会话状态
3. 如果已登录 → fetchRecords()
4. loading = true
5. 数据加载完成 → SET_RECORDS
6. loading = false, initialized = true
```

## UI 特性

### 1. 响应式布局
```tsx
<div className="grid md:grid-cols-2 gap-6">
  {/* 移动端单列，桌面端双列 */}
</div>
```

### 2. 过渡动画
```css
transition-all duration-200 hover:scale-105
```

### 3. 加载状态
```tsx
{loading ? (
  <div>加载中...</div>
) : (
  // 内容
)}
```

### 4. 空状态
```tsx
{records.length === 0 ? (
  <div>还没有任何记录</div>
) : (
  // 记录列表
)}
```

## 错误处理

### 错误类型
1. 网络错误：`网络连接失败`
2. 认证错误：`未认证`
3. 验证错误：`验证失败`
4. 数据库错误：`保存失败`

### 错误显示
```tsx
{state.error && (
  <ErrorMessage
    error={state.error}
    onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
  />
)}
```

## 性能优化细节

### 1. 组件 Memoization
```typescript
const RecordItem = memo(function RecordItem({ record }) {
  // 只有当 record 变化时才重新渲染
});
```

### 2. 计算缓存
```typescript
const recentRecords = useMemo(() => {
  return sortedRecords.slice(0, 5);
}, [sortedRecords]);
```

### 3. 回调缓存
```typescript
const handleFormSubmit = useCallback(async (e) => {
  // 缓存函数引用，避免子组件重渲染
}, [formData, addRecord, setFormData]);
```

## 测试建议

### 单元测试
- 测试 Reducer 的 action 处理
- 测试表单验证逻辑
- 测试工具函数

### 集成测试
- 测试记录创建流程
- 测试记录列表渲染
- 测试错误处理

### 端到端测试
- 测试完整的添加记录流程
- 测试错误场景
- 测试响应式布局

## 未来扩展

- 添加记录编辑功能
- 添加记录批量操作
- 添加记录搜索和筛选
- 添加记录导出功能
- 添加记录提醒功能
