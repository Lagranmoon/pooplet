# React Hooks 文档

## 目录概述

`hooks/` 目录包含自定义 React Hooks，用于封装可复用的状态逻辑和副作用。这些 Hooks 提供了统一的数据访问、表单管理、认证等功能。

## 文件列表

| 文件名 | 功能说明 |
|--------|----------|
| `useDashboard.ts` | 仪表板相关的 Hooks 集合 |

## Hooks 详细说明

### 1. useRecords Hook

**功能：**
管理排便记录的 CRUD 操作，包括获取记录、添加记录、删除记录等。

**技术特点：**
- 使用 `useState` 管理记录列表状态
- 使用 `useCallback` 优化事件处理函数
- 使用 `useMemo` 缓存计算结果
- 提供加载状态和错误处理

**返回类型：**

```typescript
interface UseRecordsReturn {
  records: BowelRecord[];           // 所有记录
  loading: boolean;                 // 加载状态
  error: string | null;              // 错误信息
  fetchRecords: (params?: { page?: number; limit?: number }) => Promise<void>;
  addRecord: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  deleteRecord: (id: string) => Promise<{ success: boolean; error?: string }>;
  todayRecords: BowelRecord[];       // 今天的记录（缓存）
  sortedRecords: BowelRecord[];      // 排序后的记录（缓存）
  setError: (error: string | null) => void;  // 设置错误
}
```

**使用示例：**

```typescript
import { useRecords } from '@/hooks/useDashboard';

function MyComponent() {
  const {
    records,
    loading,
    error,
    fetchRecords,
    addRecord,
    deleteRecord,
    todayRecords,
    sortedRecords,
  } = useRecords();

  // 获取记录
  useEffect(() => {
    fetchRecords({ page: 1, limit: 20 });
  }, []);

  // 添加记录
  const handleAdd = async () => {
    const result = await addRecord({
      occurredAt: '2024-01-25T10:30',
      qualityRating: 5,
      notes: '今天的状态不错',
    });

    if (!result.success) {
      console.error('添加失败:', result.error);
    }
  };

  // 删除记录
  const handleDelete = async (id: string) => {
    const result = await deleteRecord(id);
    if (!result.success) {
      console.error('删除失败:', result.error);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h2>记录列表 ({sortedRecords.length})</h2>
      <h3>今天的记录 ({todayRecords.length})</h3>
      {sortedRecords.map(record => (
        <div key={record.id}>
          {record.qualityRating} - {record.occurredAt}
          <button onClick={() => handleDelete(record.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}
```

**实现细节：**

#### fetchRecords
- 接受分页参数 `page` 和 `limit`
- 调用 `/api/records` API
- 自动处理加载状态和错误状态
- 更新 `records` 状态

#### addRecord
- 接受表单数据 `FormData`
- 将日期转换为 ISO 8601 格式
- 调用 `/api/records` API（POST 方法）
- 成功后将新记录添加到列表开头（乐观更新）

#### deleteRecord
- 接受记录 ID
- 调用 `/api/records/{id}` API（DELETE 方法）
- 成功后从列表中移除记录

#### 缓存计算
- `todayRecords`：过滤出今天的记录
- `sortedRecords`：按时间倒序排列

---

### 2. useFormData Hook

**功能：**
管理表单数据的状态和提交流程。

**技术特点：**
- 使用 `useState` 管理表单状态
- 使用 `useCallback` 优化事件处理函数
- 提供表单重置和显示/隐藏功能
- 支持异步提交处理

**返回类型：**

```typescript
interface UseFormDataReturn {
  formData: FormData;                                    // 表单数据
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;  // 设置表单数据
  isSubmitting: boolean;                                 // 提交状态
  showForm: boolean;                                     // 表单显示状态
  toggleForm: () => void;                                // 切换表单显示
  handleSubmit: (e: React.FormEvent, onSubmit: (data: FormData) => Promise<ApiResponse>) => Promise<ApiResponse>;
  resetForm: () => void;                                 // 重置表单
  setIsSubmitting: (value: boolean) => void;             // 设置提交状态
  setShowForm: (value: boolean) => void;                 // 设置表单显示状态
}
```

**使用示例：**

```typescript
import { useFormData, useRecords } from '@/hooks/useDashboard';

function RecordForm() {
  const {
    formData,
    setFormData,
    isSubmitting,
    showForm,
    toggleForm,
    handleSubmit,
  } = useFormData();

  const { addRecord } = useRecords();

  const onSubmit = async (data: FormData) => {
    return await addRecord(data);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, onSubmit);
  };

  if (!showForm) {
    return <button onClick={toggleForm}>添加记录</button>;
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <input
        type="datetime-local"
        value={formData.occurredAt}
        onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
      />
      <input
        type="number"
        min="1"
        max="7"
        value={formData.qualityRating}
        onChange={(e) => setFormData({ ...formData, qualityRating: Number(e.target.value) })}
      />
      <textarea
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '保存'}
      </button>
      <button type="button" onClick={toggleForm}>取消</button>
    </form>
  );
}
```

**实现细节：**

#### 初始化表单
- 默认值为当前时间（ISO 8601 格式）
- 默认质量评分为 4
- 默认备注为空字符串

#### resetForm
- 重置表单数据到默认值
- 在取消或提交成功后调用

#### toggleForm
- 切换表单显示/隐藏
- 关闭表单时自动重置数据

#### handleSubmit
- 阻止表单默认提交行为
- 设置提交状态为 true
- 调用提交函数
- 成功后关闭表单并重置
- 无论成功失败都会重置提交状态

---

### 3. useAuth Hook

**功能：**
管理用户认证状态，提供登录状态检查和会话管理。

**技术特点：**
- 使用 `useState` 管理会话状态
- 使用 `useEffect` 在组件挂载时检查认证状态
- 使用 `useMemo` 缓存认证状态计算结果
- 兼容 better-auth 接口

**返回类型：**

```typescript
interface UseAuthReturn {
  data: {
    session: any;              // 会话对象
    isPending: boolean;        // 加载状态
  };
  isPending: boolean;          // 加载状态
  isAuthenticated: boolean;    // 是否已认证
}
```

**使用示例：**

```typescript
import { useAuth } from '@/hooks/useDashboard';

function ProtectedPage() {
  const { data, isPending, isAuthenticated } = useAuth();

  if (isPending) {
    return <div>检查认证状态...</div>;
  }

  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <h1>欢迎, {data.session.user.email}</h1>
      {/* 受保护的内容 */}
    </div>
  );
}
```

**实现细节：**

#### 会话检查
- 在组件挂载时自动检查认证状态
- 调用认证 API 获取当前会话
- 更新会话状态和加载状态

#### 认证状态计算
- `isAuthenticated` = `!isPending && !!session`
- 仅在加载完成且存在会话时返回 true

**注意：**
当前实现为模拟实现，实际应用中应该集成真正的认证 API。

---

### 4. useDebounce Hook

**功能：**
提供防抖功能，延迟执行函数或更新值，常用于搜索框输入优化。

**技术特点：**
- 使用 `useState` 管理防抖后的值
- 使用 `useEffect` 设置定时器
- 使用泛型支持任意类型
- 清理函数取消之前的定时器

**类型定义：**

```typescript
function useDebounce<T>(value: T, delay: number): T
```

**使用示例：**

```typescript
import { useDebounce } from '@/hooks/useDashboard';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 使用防抖后的搜索词进行搜索
  useEffect(() => {
    if (debouncedSearchTerm) {
      console.log('搜索:', debouncedSearchTerm);
      // 执行搜索 API 调用
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

**实现细节：**

#### 防抖原理
- 设置定时器，延迟 `delay` 毫秒后更新值
- 如果在延迟期间 `value` 再次变化，取消之前的定时器
- 返回防抖后的值

#### 清理函数
- 在组件卸载或 effect 重新执行时
- 清除之前的定时器，避免内存泄漏

---

### 5. useLocalStorage Hook

**功能：**
在浏览器 localStorage 中持久化数据，提供类似 useState 的 API。

**技术特点：**
- 使用 `useState` 管理存储的值
- 支持泛型，可存储任意类型
- 自动序列化和反序列化 JSON
- 错误处理机制

**类型定义：**

```typescript
function useLocalStorage<T>(key: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void]
```

**使用示例：**

```typescript
import { useLocalStorage } from '@/hooks/useDashboard';

function SettingsPage() {
  // 存储简单值
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  // 存储对象
  const [settings, setSettings] = useLocalStorage('settings', {
    fontSize: 16,
    language: 'zh-CN',
    notifications: true,
  });

  const handleThemeChange = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleUpdateSettings = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: prev.fontSize + 2,
    }));
  };

  return (
    <div>
      <p>当前主题: {theme}</p>
      <button onClick={handleThemeChange}>切换主题</button>

      <p>字体大小: {settings.fontSize}</p>
      <button onClick={handleUpdateSettings}>增大字体</button>
    </div>
  );
}
```

**实现细节：**

#### 初始化
- 从 localStorage 读取值
- 如果不存在或读取失败，使用初始值
- 服务端渲染时直接返回初始值（typeof window === 'undefined'）

#### 更新值
- 支持直接设置值或使用函数更新
- 自动序列化为 JSON 并存储到 localStorage
- 使用 try-catch 捕获存储错误

#### 返回值
- 返回元组 `[value, setValue]`，与 useState API 一致

---

### 6. 工具函数集合

**对象：** `utils`

**功能：**
提供日期格式化、质量信息获取、今日判断等工具函数。

#### formatTime
格式化时间字符串为 HH:mm 格式。

```typescript
utils.formatTime('2024-01-25T10:30:00Z'); // "10:30"
```

#### formatDate
格式化日期字符串为完整日期格式。

```typescript
utils.formatDate('2024-01-25T10:30:00Z'); // "2024年1月25日"
```

#### formatDateTime
格式化日期时间字符串为完整格式。

```typescript
utils.formatDateTime('2024-01-25T10:30:00Z'); // "2024年1月25日 10:30"
```

#### getQualityInfo
根据评分获取质量选项信息。

```typescript
utils.getQualityInfo(5);
// { value: 5, label: "良好", color: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" }
```

#### isToday
判断日期是否为今天。

```typescript
utils.isToday('2024-01-25T10:30:00Z'); // true（如果今天是2024年1月25日）
```

#### generateId
生成唯一 ID。

```typescript
utils.generateId(); // "lw1a2b3c4d5e"
```

**使用示例：**

```typescript
import { utils } from '@/hooks/useDashboard';

function RecordList({ records }) {
  return (
    <div>
      {records.map(record => {
        const qualityInfo = utils.getQualityInfo(record.qualityRating);
        const isToday = utils.isToday(record.occurredAt);

        return (
          <div key={record.id}>
            <span className={qualityInfo.text}>{qualityInfo.label}</span>
            <time>{utils.formatDateTime(record.occurredAt)}</time>
            {isToday && <span className="badge">今天</span>}
          </div>
        );
      })}
    </div>
  );
}
```

---

### 7. 质量选项配置

**对象：** `qualityOptions` 和 `qualityOptionsMap`

**功能：**
定义排便质量评级的选项和映射。

**质量选项：**

| 值 | 标签 | 颜色 | 背景 | 文字 |
|----|------|------|------|------|
| 1 | 很差 | red | red-50 | red-700 |
| 2 | 较差 | orange | orange-50 | orange-700 |
| 3 | 一般 | yellow | yellow-50 | yellow-700 |
| 4 | 还好 | lime | lime-50 | lime-700 |
| 5 | 良好 | emerald | emerald-50 | emerald-700 |
| 6 | 很好 | teal | teal-50 | teal-700 |
| 7 | 完美 | cyan | cyan-50 | cyan-700 |

**使用示例：**

```typescript
import { qualityOptions, qualityOptionsMap } from '@/hooks/useDashboard';

// 遍历所有选项
function QualitySelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {qualityOptions.map(option => (
        <button
          key={option.value}
          className={`${option.color} ${value === option.value ? 'ring-2 ring-offset-2' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// 使用映射获取选项
function QualityBadge({ rating }) {
  const option = qualityOptionsMap[rating];
  return (
    <span className={`${option.bg} ${option.text} px-2 py-1 rounded`}>
      {option.label}
    </span>
  );
}
```

---

## 依赖说明

### React Hooks API
- `useState` - 状态管理
- `useEffect` - 副作用处理
- `useCallback` - 函数记忆化
- `useMemo` - 值记忆化

### 外部依赖
- `react` - React 核心库

## 性能优化建议

### 1. 使用 useCallback
对于传递给子组件的函数，使用 `useCallback` 避免不必要的重渲染。

```typescript
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependency]);
```

### 2. 使用 useMemo
对于复杂的计算，使用 `useMemo` 缓存结果。

```typescript
const sortedRecords = useMemo(() => {
  return [...records].sort((a, b) => /* 排序逻辑 */);
}, [records]);
```

### 3. 避免闭包陷阱
在 useEffect 中使用最新的状态值时，需要正确处理依赖。

```typescript
// ✅ 正确：使用函数式更新
setCount(prev => prev + 1);

// ❌ 错误：依赖旧值
setCount(count + 1);  // 需要将 count 加入依赖
```

## 最佳实践

1. **单一职责**：每个 Hook 只负责一个功能领域
2. **明确的返回类型**：为所有 Hook 定义返回类型
3. **合理的默认值**：为状态提供合理的初始值
4. **错误处理**：在异步操作中提供错误处理
5. **清理副作用**：在 useEffect 中返回清理函数
6. **避免过度优化**：只在必要时使用 useCallback 和 useMemo
7. **文档完善**：为每个 Hook 提供详细的使用文档和示例

## 测试建议

### Hook 测试工具
推荐使用 `@testing-library/react-hooks` 进行 Hook 测试。

### 测试要点
- 初始状态是否正确
- 函数调用是否正确更新状态
- 副作用是否正确触发
- 错误处理是否正确
- 清理函数是否正确执行

## 扩展指南

### 创建新 Hook
1. 在 `hooks/` 目录下创建新文件
2. 使用 `use` 前缀命名（例如：`useUserData`）
3. 定义清晰的输入和输出类型
4. 使用 React Hooks API 实现逻辑
5. 添加文档和使用示例
6. 导出 Hook 供其他模块使用

### Hook 模板
```typescript
import { useState, useEffect, useCallback, useMemo } from "react";

export interface UseHookNameReturn {
  // 定义返回类型
}

export function useHookName(param: Type): UseHookNameReturn {
  const [state, setState] = useState<Type>(initialValue);

  useEffect(() => {
    // 副作用逻辑
  }, [dependencies]);

  const action = useCallback(() => {
    // 事件处理
  }, [dependencies]);

  const computedValue = useMemo(() => {
    // 计算逻辑
    return result;
  }, [dependencies]);

  return {
    state,
    action,
    computedValue,
  };
}
```

## 注意事项

1. **客户端组件**：所有 Hook 都需要在客户端组件中使用（文件顶部添加 `"use client"`）
2. **类型安全**：确保所有函数和状态都有明确的类型定义
3. **依赖管理**：正确设置 useEffect、useCallback 和 useMemo 的依赖数组
4. **错误处理**：在异步操作中提供错误处理机制
5. **性能考虑**：合理使用 useCallback 和 useMemo，避免过度优化
