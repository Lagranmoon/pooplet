# UI 组件库文档

## 目录概述

`components/ui/` 目录包含可复用的 UI 组件，用于构建用户界面。这些组件遵循 React 最佳实践，使用 TypeScript 确保类型安全，并使用 Tailwind CSS 进行样式设计。

## 文件列表

| 文件名 | 功能说明 |
|--------|----------|
| `confirm-dialog.tsx` | 确认对话框组件，用于危险操作的二次确认 |
| `error-boundary.tsx` | 错误边界组件，捕获和处理 React 组件错误 |

## 组件详细说明

### 1. ConfirmDialog 组件

**文件路径：** `confirm-dialog.tsx`

**功能：**
提供确认对话框 UI，用于在执行危险操作（如删除）前要求用户确认。

**技术特点：**
- 使用条件渲染控制对话框显示
- 提供遮罩层和对话框主体
- 支持自定义确认和取消按钮文本
- 响应式设计，适配移动端

**Props 类型定义：**

```typescript
interface ConfirmDialogProps {
  open: boolean;                    // 对话框是否显示
  title: string;                    // 对话框标题
  description: string;              // 对话框描述
  onConfirm: () => void;            // 确认按钮点击事件
  onCancel: () => void;             // 取消按钮点击事件
  confirmText?: string;             // 确认按钮文本（默认"确认"）
  cancelText?: string;              // 取消按钮文本（默认"取消"）
  children?: ReactNode;             // 自定义内容
}
```

**使用示例：**

```typescript
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = () => {
    setShowDialog(true);
  };

  const handleConfirm = () => {
    // 执行删除操作
    console.log('已确认删除');
    setShowDialog(false);
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <div>
      <button onClick={handleDelete}>删除记录</button>

      <ConfirmDialog
        open={showDialog}
        title="确认删除"
        description="此操作无法撤销，确定要删除这条记录吗？"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="确定删除"
        cancelText="取消"
      />
    </div>
  );
}
```

**设计特点：**
- 遮罩层：半透明黑色背景 + 背景模糊效果 (`bg-black/50 backdrop-blur-sm`)
- 对话框：圆角设计，阴影效果，居中显示
- 图标：使用红色警告图标提示用户注意
- 按钮：取消按钮（灰色），确认按钮（红色）
- 响应式：最大宽度限制，移动端适配

### 2. ErrorBoundary 组件

**文件路径：** `error-boundary.tsx`

**功能：**
错误边界组件，用于捕获 React 组件树中的 JavaScript 错误，记录错误，并显示备用 UI。

**技术特点：**
- 使用类组件实现（Error Boundary 只能是类组件）
- 支持三种错误级别：page（页面）、component（组件）、section（区块）
- 在开发环境下显示详细错误信息
- 支持自定义备用 UI
- 提供重试机制

**Props 类型定义：**

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;                                    // 子组件
  fallback?: React.ReactNode;                                  // 自定义备用 UI
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void; // 错误回调函数
  level?: "page" | "component" | "section";                    // 错误显示级别
}

interface ErrorBoundaryState {
  hasError: boolean;              // 是否有错误
  error?: Error;                  // 错误对象
  errorInfo?: React.ErrorInfo;    // 错误信息
}
```

**使用示例：**

```typescript
import { ErrorBoundary } from '@/components/ui/error-boundary';

function MyPage() {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        console.error('页面错误:', error);
        // 上报错误到日志服务
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}

// 使用自定义备用 UI
function MyComponent() {
  return (
    <ErrorBoundary
      fallback={<div>组件加载失败，请刷新页面</div>}
      level="component"
    >
      <ChildComponent />
    </ErrorBoundary>
  );
}
```

**错误级别说明：**

| 级别 | 用途 | 样式 |
|------|------|------|
| `page` | 整个页面的错误 | 全屏错误页面，提供重试和返回首页按钮 |
| `component` | 单个组件的错误 | 卡片样式，显示错误信息和重试按钮 |
| `section` | 页面区块的错误 | 小卡片样式，简洁的错误提示 |

**开发模式特性：**
- 在 `process.env.NODE_ENV === 'development'` 时
- 显示详细的错误堆栈信息
- 显示组件堆栈信息
- 使用控制台分组输出 (`console.group`)

**实现方法：**
- `getDerivedStateFromError()` - 派生错误状态
- `componentDidCatch()` - 捕获错误并记录
- `render()` - 根据错误状态渲染相应 UI

## 依赖说明

### 外部依赖
- `react` - React 核心库
- `@/components/ui/button` - 按钮组件（在 ErrorBoundary 中使用）

### 技术栈
- React Class Components
- TypeScript
- Tailwind CSS
- React Error Boundaries API

## 样式系统

所有组件使用 Tailwind CSS 工具类进行样式设计，遵循以下设计原则：

### 颜色系统
- 主色调：slate（灰色系）
- 警告色：red（红色）
- 成功色：emerald（绿色）
- 信息色：amber（琥珀色）

### 圆角系统
- 圆角：`rounded-xl`, `rounded-2xl`
- 按钮圆角：`rounded-full`

### 阴影系统
- 按钮阴影：`shadow-md`, `shadow-xl`
- 对话框阴影：`shadow-2xl`

### 间距系统
- 内边距：`p-4`, `p-6`, `p-8`
- 外边距：`m-4`, `mb-4`, `mb-6`, `mb-8`

### 过渡效果
- 过渡时间：`transition-all duration-200`
- 悬停效果：`hover:scale-105`, `hover:shadow-xl`
- 点击效果：`active:scale-95`

## 设计模式

### 1. 条件渲染
```typescript
if (!open) return null;  // ConfirmDialog
if (this.state.hasError) { /* 显示错误 UI */ }  // ErrorBoundary
```

### 2. 组合模式
```typescript
// 支持子组件的自定义渲染
<ConfirmDialog>
  <CustomContent />
</ConfirmDialog>

<ErrorBoundary>
  <ChildComponent />
</ErrorBoundary>
```

### 3. 受控组件
```typescript
// 通过 Props 控制组件状态
<ConfirmDialog
  open={showDialog}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

## 性能优化

### 1. 条件渲染优化
- 在 ConfirmDialog 中，使用 `if (!open) return null;` 避免不必要的渲染

### 2. 错误边界隔离
- 使用 Error Boundary 隔离不同组件的错误，避免整个应用崩溃

### 3. 事件处理优化
- 所有的事件处理函数都使用箭头函数或 bind 绑定 this

## 可访问性

### 语义化 HTML
- 使用 `<button>` 元素而不是 `<div>` + onClick
- 使用 `<details>` 和 `<summary>` 元素

### 键盘导航
- 所有交互元素都支持键盘操作
- 确认和取消按钮可以通过 Tab 键导航

### 视觉反馈
- 悬停状态：改变颜色或添加阴影
- 聚焦状态：添加焦点环 (`focus-visible:ring-2`)

## 测试建议

### ConfirmDialog 组件测试
- 测试对话框的显示和隐藏
- 测试确认和取消按钮的点击事件
- 测试自定义按钮文本的显示
- 测试遮罩层的点击事件

### ErrorBoundary 组件测试
- 测试错误捕获功能
- 测试不同错误级别的 UI 显示
- 测试重试功能
- 测试自定义备用 UI
- 测试错误回调函数

## 扩展指南

### 添加新的 UI 组件
1. 在 `components/ui/` 目录下创建新文件
2. 使用 TypeScript 定义 Props 类型
3. 使用 Tailwind CSS 设计样式
4. 添加组件文档和使用示例
5. 导出组件供其他模块使用

### 组件命名约定
- 文件名：kebab-case (例如：`confirm-dialog.tsx`)
- 组件名：PascalCase (例如：`ConfirmDialog`)
- Props 接口：`[ComponentName]Props` (例如：`ConfirmDialogProps`)

### 组件模板
```typescript
"use client";

import type { ReactNode } from "react";

interface ComponentNameProps {
  // 定义 Props
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  return (
    <div className="...">
      {/* 组件内容 */}
    </div>
  );
}
```

## 最佳实践

1. **类型安全**：始终为组件 Props 定义明确的 TypeScript 类型
2. **默认值**：为可选 Props 提供合理的默认值
3. **性能优化**：避免在组件内部定义函数（使用 useCallback）
4. **错误处理**：使用 Error Boundary 包裹可能出错的组件
5. **样式隔离**：使用 Tailwind CSS 的工具类，避免自定义 CSS
6. **文档完善**：为每个组件提供详细的使用文档和示例
7. **可访问性**：确保组件符合 WCAG 可访问性标准
