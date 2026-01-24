# (dashboard) 路由组

仪表板相关页面的路由组，包含仪表板的公共布局和三个主要页面。

## 目录说明

`(dashboard)` 是 Next.js 路由组，括号表示该目录名不会出现在 URL 路径中。例如：
- `app/(dashboard)/dashboard/page.tsx` → `/dashboard`
- `app/(dashboard)/dashboard/records/page.tsx` → `/dashboard/records`
- `app/(dashboard)/dashboard/stats/page.tsx` → `/dashboard/stats`

## 目录结构

```
app/(dashboard)/
├── layout.tsx           # 仪表板公共布局（导航栏）
└── dashboard/
    ├── page.tsx        # 仪表板首页（记录列表）
    ├── records/        # 所有记录页面
    │   └── page.tsx
    └── stats/          # 统计分析页面
        └── page.tsx
```

## 公共布局

### 文件位置
`app/(dashboard)/layout.tsx`

### 核心功能

#### 1. 导航栏组件
```typescript
const navItems = [
  { href: "/dashboard", label: "记录", icon: "📝" },
  { href: "/dashboard/records", label: "所有记录", icon: "📋" },
  { href: "/dashboard/stats", label: "统计", icon: "📊" },
];
```

#### 2. 会话管理
```typescript
const { data: session } = authClient.useSession();
```

#### 3. 退出登录
```typescript
const handleSignOut = async () => {
  await signOut();
  redirect("/login");
};
```

#### 4. UI 特点
- 响应式导航栏（桌面端横向，移动端折叠）
- 毛玻璃效果：`backdrop-blur-md`
- 动态高亮当前页面
- 显示用户信息（名称或邮箱）

## 仪表板首页

### 文件位置
`app/(dashboard)/dashboard/page.tsx`

### 核心功能

#### 1. 状态管理（useReducer）
```typescript
interface DashboardState {
  records: BowelRecord[];
  loading: boolean;
  submitting: boolean;
  showForm: boolean;
  error: string | null;
  initialized: boolean;
}
```

#### 2. 性能优化
- **Memo 组件**: `memo()` 防止不必要的重新渲染
- **useMemo**: 缓存计算结果
- **useCallback**: 缓存回调函数

#### 3. 组件拆分
- `RecordItem`: 单条记录展示
- `RecordsList`: 记录列表容器
- `RecordForm`: 添加记录表单
- `ErrorMessage`: 错误提示

#### 4. 错误边界
```typescript
<ErrorBoundary level="section">
  <Suspense fallback={<RecordsList loading />}>
    <RecordsList {...props} />
  </Suspense>
</ErrorBoundary>
```

## 所有记录页面

### 文件位置
`app/(dashboard)/dashboard/records/page.tsx`

### 核心功能

#### 1. 分页功能
```typescript
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const fetchRecords = async () => {
  const res = await fetch(`/api/records?page=${page}&limit=20`);
  // ...
};
```

#### 2. 删除确认
```typescript
const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
const [deleteId, setDeleteId] = useState<string | null>(null);

const confirmDelete = async () => {
  const result = await deleteRecord(deleteId);
  if (result.success) {
    fetchRecords();
  }
};
```

#### 3. UI 特点
- 表格形式展示记录
- 分页导航（上一页/下一页）
- 质量评级颜色标识
- 删除操作二次确认

## 统计分析页面

### 文件位置
`app/(dashboard)/dashboard/stats/page.tsx`

### 核心功能

#### 1. 图表展示（Recharts）
```typescript
<LineChart data={stats.frequencyData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="count" stroke="#3b82f6" />
</LineChart>
```

#### 2. 时间周期选择
```typescript
const [period, setPeriod] = useState("7"); // 7, 14, 30 天

fetch('/api/stats/overview?period=${period}');
```

#### 3. 统计卡片
- 总记录数
- 日均排便次数
- 平均质量评级

#### 4. 图表类型
- **频率趋势**: 折线图
- **质量分布**: 饼图
- **质量趋势**: 柱状图

## 技术点说明

### 1. 路由组继承
所有子路由共享 `layout.tsx` 导航栏，避免重复代码。

### 2. 客户端数据获取
```typescript
const { data: session } = useSession();
```

### 3. 挂载检查
```typescript
if (!session && !isPending) {
  return <div>加载中...</div>;
}
```

### 4. 错误边界
```typescript
<ErrorBoundary level="page">
  <DashboardContent />
</ErrorBoundary>
```

### 5. Suspense 延迟加载
```typescript
<Suspense fallback={<RecordsList loading />}>
  <RecordsList records={todayRecords} />
</Suspense>
```

## 性能优化策略

### 1. 组件 Memoization
```typescript
const RecordItem = memo(function RecordItem({ record }) {
  // ...
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
const handleDelete = useCallback((id: string) => {
  setDeleteId(id);
  setConfirmDialogOpen(true);
}, []);
```

### 4. 代码分割
- 动态导入图表库
- 按需加载组件

## 数据流

### 记录创建流程
```
用户填写表单
→ handleSubmit()
→ addRecord(formData)
→ 调用 Server Action 或 API
→ 数据库插入
→ 更新本地状态
→ UI 刷新
```

### 记录删除流程
```
用户点击删除
→ handleDelete(id)
→ 显示确认对话框
→ 用户确认
→ confirmDelete()
→ deleteRecord(id) [Server Action]
→ 数据库删除
→ fetchRecords()
→ UI 刷新
```

### 统计数据流程
```
用户选择时间周期
→ setPeriod()
→ fetchStats()
→ API: /api/stats/overview?period=7
→ 数据库聚合查询
→ 返回统计数据
→ 更新图表
```

## 样式规范

### 颜色方案
- 主色调：`emerald-500` → `teal-600`
- 背景：`bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30`
- 卡片：`bg-white/80 backdrop-blur-xl`

### 质量评级颜色
```typescript
const qualityOptions = [
  { value: 1, label: "很差", color: "bg-red-500" },
  { value: 2, label: "较差", color: "bg-orange-500" },
  { value: 3, label: "一般", color: "bg-yellow-500" },
  { value: 4, label: "还好", color: "bg-lime-500" },
  { value: 5, label: "良好", color: "bg-green-400" },
  { value: 6, label: "很好", color: "bg-green-500" },
  { value: 7, label: "完美", color: "bg-emerald-500" },
];
```

## 未来扩展

- 添加数据导出功能（CSV、PDF）
- 添加自定义时间范围选择器
- 添加健康建议功能
- 添加提醒功能
- 添加多用户对比功能
