# TypeScript 类型定义文档

## 目录概述

`types/` 目录包含项目的所有 TypeScript 类型定义。这些类型定义提供了完整的类型安全，确保代码在编译时就能发现潜在的错误。

## 文件列表

| 文件名 | 功能说明 |
|--------|----------|
| `index.ts` | 所有类型定义的主入口文件 |

## 类型定义分类

类型定义按照功能模块分为以下几类：

### 1. 核心类型定义

#### User - 用户类型

```typescript
interface User {
  id: string;              // 用户 ID
  email: string;           // 邮箱地址
  name?: string;           // 用户姓名（可选）
  image?: string;          // 用户头像（可选）
  emailVerified: boolean;  // 邮箱是否已验证
  createdAt: Date;         // 创建时间
  updatedAt: Date;         // 更新时间
}
```

#### Session - 会话类型

```typescript
interface Session {
  id: string;              // 会话 ID
  userId: string;          // 用户 ID
  token: string;          // 会话令牌
  expiresAt: Date;        // 过期时间
  ipAddress?: string;     // IP 地址（可选）
  userAgent?: string;      // 用户代理（可选）
  createdAt: Date;        // 创建时间
  updatedAt: Date;        // 更新时间
}
```

#### Account - 账户类型

```typescript
interface Account {
  id: string;                    // 账户 ID
  accountId: string;             // 账户 ID
  userId: string;                // 用户 ID
  providerId: string;            // 提供商 ID
  providerUserId?: string;       // 提供商用户 ID（可选）
  password?: string;             // 密码（可选，加密存储）
  accessToken?: string;          // 访问令牌（可选）
  refreshToken?: string;         // 刷新令牌（可选）
  expiresAt?: Date;              // 过期时间（可选）
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}
```

---

### 2. 业务相关类型定义

#### BowelRecord - 排便记录类型

```typescript
interface BowelRecord {
  id: string;                        // 记录 ID
  userId: string;                   // 用户 ID
  occurredAt: string;               // 发生时间（ISO 8601 格式）
  qualityRating: 1 | 2 | 3 | 4 | 5 | 6 | 7;  // 质量评分（1-7）
  notes?: string;                    // 备注（可选）
  createdAt: string;                 // 创建时间
  updatedAt: string;                 // 更新时间
}
```

**质量评分说明：**
- 1: 很差
- 2: 较差
- 3: 一般
- 4: 还好
- 5: 良好
- 6: 很好
- 7: 完美

#### QualityOption - 质量选项类型

```typescript
interface QualityOption {
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7;     // 质量评分值
  label: string;                          // 显示标签
  color: string;                          // 颜色类名（Tailwind CSS）
  bg: string;                             // 背景类名（Tailwind CSS）
  text: string;                           // 文字类名（Tailwind CSS）
}
```

#### QUALITY_OPTIONS - 质量选项常量

```typescript
const QUALITY_OPTIONS = {
  1: { label: "很差", color: "bg-red-500", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400" },
  2: { label: "较差", color: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-400" },
  3: { label: "一般", color: "bg-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-400" },
  4: { label: "还好", color: "bg-lime-500", bg: "bg-lime-50 dark:bg-lime-900/20", text: "text-lime-700 dark:text-lime-400" },
  5: { label: "良好", color: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400" },
  6: { label: "很好", color: "bg-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-400" },
  7: { label: "完美", color: "bg-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-700 dark:text-cyan-400" },
} as const;
```

**使用示例：**

```typescript
import { QUALITY_OPTIONS, BowelRecord } from '@/types';

function RecordCard({ record }: { record: BowelRecord }) {
  const option = QUALITY_OPTIONS[record.qualityRating];

  return (
    <div className={`${option.bg} ${option.text} p-4 rounded`}>
      <span>{option.label}</span>
    </div>
  );
}
```

#### FormData - 表单数据类型

```typescript
interface FormData {
  occurredAt: string;               // 发生时间（YYYY-MM-DDTHH:mm 格式）
  qualityRating: 1 | 2 | 3 | 4 | 5 | 6 | 7;  // 质量评分
  notes: string;                    // 备注
}
```

---

### 3. API 响应类型

#### ApiResponse - API 响应类型

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;     // 请求是否成功
  data?: T;            // 响应数据（可选）
  error?: string;      // 错误信息（可选）
  message?: string;    // 提示信息（可选）
}
```

**使用示例：**

```typescript
import { ApiResponse, BowelRecord } from '@/types';

// API 响应
const response: ApiResponse<BowelRecord> = {
  success: true,
  data: {
    id: "1",
    userId: "user-1",
    occurredAt: "2024-01-25T10:30:00Z",
    qualityRating: 5,
    createdAt: "2024-01-25T10:30:00Z",
    updatedAt: "2024-01-25T10:30:00Z",
  },
};

// 错误响应
const errorResponse: ApiResponse = {
  success: false,
  error: "创建记录失败",
};
```

#### PaginationMeta - 分页元数据类型

```typescript
interface PaginationMeta {
  page: number;         // 当前页码
  limit: number;        // 每页数量
  total: number;        // 总记录数
  totalPages: number;   // 总页数
  hasNext: boolean;     // 是否有下一页
  hasPrev: boolean;     // 是否有上一页
}
```

#### PaginatedResponse - 分页响应类型

```typescript
interface PaginatedResponse<T> {
  records: T[];                 // 记录列表
  pagination: PaginationMeta;    // 分页元数据
}
```

**使用示例：**

```typescript
import { PaginatedResponse, BowelRecord } from '@/types';

const paginatedData: PaginatedResponse<BowelRecord> = {
  records: [
    // 记录列表
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    hasNext: true,
    hasPrev: false,
  },
};
```

#### RecordStats - 记录统计类型

```typescript
interface RecordStats {
  totalRecords: number;                                              // 总记录数
  dailyAverage: number;                                             // 日均记录数
  averageQuality: number;                                           // 平均质量评分
  qualityDistribution: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>;   // 质量分布
  recordsThisWeek: number;                                          // 本周记录数
  recordsThisMonth: number;                                         // 本月记录数
  longestStreak: number;                                            // 最长连续天数
  currentStreak: number;                                            // 当前连续天数
}
```

**使用示例：**

```typescript
import { RecordStats } from '@/types';

const stats: RecordStats = {
  totalRecords: 50,
  dailyAverage: 2.5,
  averageQuality: 4.8,
  qualityDistribution: {
    1: 2,
    2: 3,
    3: 5,
    4: 10,
    5: 15,
    6: 10,
    7: 5,
  },
  recordsThisWeek: 18,
  recordsThisMonth: 50,
  longestStreak: 7,
  currentStreak: 3,
};
```

---

### 4. 组件相关类型

#### RecordItemProps - 记录项组件 Props

```typescript
interface RecordItemProps {
  record: BowelRecord;    // 记录数据
}
```

#### RecordsListProps - 记录列表组件 Props

```typescript
interface RecordsListProps {
  title: string;                // 标题
  records: BowelRecord[];       // 记录列表
  loading: boolean;             // 加载状态
  emptyMessage: string;         // 空状态消息
  showCount?: boolean;          // 是否显示数量（可选）
  onAddRecord?: () => void;     // 添加记录回调（可选）
}
```

#### RecordFormProps - 记录表单组件 Props

```typescript
interface RecordFormProps {
  formData: FormData;                                                   // 表单数据
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;        // 设置表单数据
  onSubmit: (e: React.FormEvent) => Promise<ApiResponse>;              // 提交处理函数
  submitting: boolean;                                                 // 提交状态
  onCancel: () => void;                                                // 取消处理函数
}
```

#### ErrorBoundaryProps - 错误边界组件 Props

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;                                            // 子组件
  fallback?: React.ReactNode;                                           // 自定义备用 UI（可选）
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;        // 错误回调（可选）
  level?: "page" | "component" | "section";                            // 错误级别（可选）
}
```

#### ErrorBoundaryState - 错误边界组件状态

```typescript
interface ErrorBoundaryState {
  hasError: boolean;              // 是否有错误
  error?: Error;                  // 错误对象
  errorInfo?: React.ErrorInfo;    // 错误信息
}
```

---

### 5. Hooks 返回类型

#### UseRecordsReturn - useRecords Hook 返回类型

```typescript
interface UseRecordsReturn {
  records: BowelRecord[];                                                       // 所有记录
  loading: boolean;                                                             // 加载状态
  error: string | null;                                                          // 错误信息
  fetchRecords: (params?: { page?: number; limit?: number }) => Promise<void>;  // 获取记录
  addRecord: (formData: FormData) => Promise<ApiResponse<BowelRecord>>;        // 添加记录
  deleteRecord: (id: string) => Promise<ApiResponse>;                          // 删除记录
  todayRecords: BowelRecord[];                                                 // 今天的记录
  sortedRecords: BowelRecord[];                                                // 排序后的记录
  setError: (error: string | null) => void;                                   // 设置错误
}
```

#### UseFormDataReturn - useFormData Hook 返回类型

```typescript
interface UseFormDataReturn {
  formData: FormData;                                                    // 表单数据
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;         // 设置表单数据
  isSubmitting: boolean;                                               // 提交状态
  showForm: boolean;                                                    // 表单显示状态
  toggleForm: () => void;                                               // 切换表单显示
  handleSubmit: (e: React.FormEvent, onSubmit: (data: FormData) => Promise<ApiResponse>) => Promise<ApiResponse>;  // 提交处理
  resetForm: () => void;                                                // 重置表单
  setIsSubmitting: (value: boolean) => void;                            // 设置提交状态
  setShowForm: (value: boolean) => void;                                // 设置表单显示
}
```

#### UseAuthReturn - useAuth Hook 返回类型

```typescript
interface UseAuthReturn {
  data: {
    session: Session | null;     // 会话对象
    isPending: boolean;           // 加载状态
  };
  isPending: boolean;             // 加载状态
  isAuthenticated: boolean;       // 是否已认证
}
```

#### UseLocalStorageReturn - useLocalStorage Hook 返回类型

```typescript
interface UseLocalStorageReturn<T> {
  value: T;                                                               // 存储的值
  setValue: (value: T | ((prevValue: T) => T)) => void;                  // 设置值
}
```

---

### 6. 状态管理类型

#### DashboardState - 仪表板状态类型

```typescript
interface DashboardState {
  records: BowelRecord[];     // 记录列表
  loading: boolean;           // 加载状态
  submitting: boolean;        // 提交状态
  showForm: boolean;          // 表单显示状态
  error: string | null;       // 错误信息
  initialized: boolean;       // 是否已初始化
}
```

#### DashboardAction - 仪表板操作类型

```typescript
type DashboardAction =
  | { type: "SET_LOADING"; payload: boolean }                    // 设置加载状态
  | { type: "SET_RECORDS"; payload: BowelRecord[] }              // 设置记录列表
  | { type: "ADD_RECORD"; payload: BowelRecord }                // 添加记录
  | { type: "REMOVE_RECORD"; payload: string }                  // 删除记录
  | { type: "SET_SUBMITTING"; payload: boolean }                // 设置提交状态
  | { type: "TOGGLE_FORM" }                                      // 切换表单显示
  | { type: "SET_ERROR"; payload: string | null }               // 设置错误
  | { type: "CLEAR_ERROR" }                                     // 清除错误
  | { type: "SET_INITIALIZED"; payload: boolean };             // 设置初始化状态
```

**使用示例：**

```typescript
import { DashboardState, DashboardAction } from '@/types';

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_RECORDS":
      return { ...state, records: action.payload };
    case "ADD_RECORD":
      return { ...state, records: [action.payload, ...state.records] };
    default:
      return state;
  }
}
```

---

### 7. 工具类型

#### NonNullable - 非空类型

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

**使用示例：**

```typescript
type NullableString = string | null;
type NonNullString = NonNullable<NullableString>;  // string
```

#### DeepPartial - 深度可选类型

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

**使用示例：**

```typescript
interface User {
  name: string;
  profile: {
    age: number;
    address: {
      city: string;
    };
  };
}

type PartialUser = DeepPartial<User>;
// {
//   name?: string;
//   profile?: {
//     age?: number;
//     address?: {
//       city?: string;
//     };
//   };
// }
```

#### Optional - 可选属性类型

```typescript
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

**使用示例：**

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

type UserWithoutEmail = Optional<User, 'email'>;
// { name: string; email?: string; age: number; }
```

#### Required - 必需属性类型

```typescript
type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
```

**使用示例：**

```typescript
interface User {
  name?: string;
  email?: string;
  age: number;
}

type UserWithNameEmail = Required<User, 'name' | 'email'>;
// { name: string; email: string; age: number; }
```

#### DateString - 日期字符串类型

```typescript
type DateString = string;  // ISO 8601 格式
```

#### DateRange - 日期范围类型

```typescript
interface DateRange {
  start: DateString;  // 开始日期
  end: DateString;    // 结束日期
}
```

#### FilterOptions - 过滤选项类型

```typescript
interface FilterOptions {
  dateRange?: DateRange;              // 日期范围（可选）
  qualityRating?: 1 | 2 | 3 | 4 | 5 | 6 | 7;  // 质量评分（可选）
  notes?: string;                      // 搜索关键词（可选）
}
```

#### SortOptions - 排序选项类型

```typescript
interface SortOptions {
  field: "occurredAt" | "qualityRating" | "createdAt";  // 排序字段
  direction: "asc" | "desc";                             // 排序方向
}
```

---

### 8. 常量类型

#### QUALITY_RATING - 质量评级常量

```typescript
const QUALITY_RATING = {
  VERY_POOR: 1,
  POOR: 2,
  AVERAGE: 3,
  FAIR: 4,
  GOOD: 5,
  VERY_GOOD: 6,
  EXCELLENT: 7,
} as const;
```

#### PAGINATION - 分页常量

```typescript
const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,   // 默认每页数量
  MAX_PAGE_SIZE: 100,      // 最大每页数量
  MIN_PAGE_SIZE: 1,        // 最小每页数量
} as const;
```

#### VALIDATION - 验证常量

```typescript
const VALIDATION = {
  NOTES_MAX_LENGTH: 500,                  // 备注最大长度
  DATE_FORMAT: "yyyy-MM-dd'T'HH:mm",       // 日期格式
} as const;
```

---

### 9. 类型别名

#### QualityRating - 质量评分类型别名

```typescript
type QualityRating = 1 | 2 | 3 | 4 | 5 | 6 | 7;
```

#### ApiError - API 错误类型别名

```typescript
type ApiError = string;
```

#### LoadingState - 加载状态类型别名

```typescript
type LoadingState = boolean;
```

#### SubmittingState - 提交状态类型别名

```typescript
type SubmittingState = boolean;
```

---

## 类型使用指南

### 导入类型

```typescript
// 导入单个类型
import { BowelRecord, FormData } from '@/types';

// 导入所有类型
import * as Types from '@/types';

// 导入接口
import type { User, Session } from '@/types';
```

### 类型断言

```typescript
// 类型断言
const record = data as BowelRecord;

// 类型守卫
function isBowelRecord(data: unknown): data is BowelRecord {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'qualityRating' in data
  );
}
```

### 泛型使用

```typescript
// 使用泛型 API 响应
const response: ApiResponse<BowelRecord> = await fetch('/api/records');

// 使用泛型分页响应
const paginatedResponse: PaginatedResponse<BowelRecord> = await fetch('/api/records?page=1');
```

---

## TypeScript 高级特性

### 1. 联合类型 (Union Types)

```typescript
type QualityRating = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Level = "page" | "component" | "section";
```

### 2. 字面量类型 (Literal Types)

```typescript
const QUALITY_RATING = {
  VERY_POOR: 1,
  POOR: 2,
  // ...
} as const;  // 使用 as const 创建只读字面量类型
```

### 3. 映射类型 (Mapped Types)

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### 4. 条件类型 (Conditional Types)

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

### 5. 工具类型 (Utility Types)

```typescript
// Partial - 所有属性变为可选
type PartialUser = Partial<User>;

// Required - 所有属性变为必需
type RequiredUser = Required<User>;

// Pick - 选取部分属性
type UserEmail = Pick<User, 'email'>;

// Omit - 排除部分属性
type UserWithoutId = Omit<User, 'id'>;

// Record - 创建对象类型
type QualityDistribution = Record<QualityRating, number>;
```

---

## 类型安全最佳实践

### 1. 避免使用 any

```typescript
// ❌ 不推荐
function processData(data: any) {
  return data.value;
}

// ✅ 推荐
function processData(data: { value: string }) {
  return data.value;
}
```

### 2. 使用类型守卫

```typescript
function isBowelRecord(data: unknown): data is BowelRecord {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    typeof data.id === 'string'
  );
}
```

### 3. 使用 readonly 修饰符

```typescript
interface ReadonlyRecord {
  readonly id: string;  // 只读属性
  readonly createdAt: string;
}
```

### 4. 使用 const 断言

```typescript
// ❌ 类型为 string[]
const options = ['red', 'green', 'blue'];

// ✅ 类型为 readonly ['red', 'green', 'blue']
const options = ['red', 'green', 'blue'] as const;
```

### 5. 使用泛型约束

```typescript
interface HasId {
  id: string;
}

function getById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
```

---

## 注意事项

1. **类型导出**：所有类型都应该从 `types/index.ts` 统一导出
2. **类型文档**：为复杂的类型添加注释说明
3. **类型复用**：优先使用现有的类型，避免重复定义
4. **类型安全**：避免使用 `any`，使用 `unknown` 代替
5. **类型检查**：使用 TypeScript 严格模式进行类型检查

## 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 高级类型](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [项目开发指南](../../AGENTS.md)
