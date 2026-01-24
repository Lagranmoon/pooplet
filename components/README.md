# Components 概览

本目录包含所有 React 组件，分为基础 UI 组件和业务组件。

## 目录结构

```
components/
├── ui/              # 基础 UI 组件库
│   ├── button.tsx   # 按钮组件
│   ├── card.tsx     # 卡片组件
│   ├── label.tsx    # 标签组件
│   ├── badge.tsx    # 徽章组件
│   ├── table.tsx    # 表格组件
│   ├── input.tsx    # 输入框组件
│   ├── textarea.tsx # 文本域组件
│   └── form.tsx     # 表单组件
└── records/         # 业务组件
    ├── RecordForm.tsx  # 记录表单
    └── RecordList.tsx  # 记录列表
```

## 组件设计原则

### 1. 基础 UI 组件 (ui/)

**技术特点：**
- 使用 `React.forwardRef` 实现引用转发
- 使用 TypeScript 定义 Props 类型
- 支持 className 合并（通过 `cn()` 工具函数）
- 遵循无障碍访问标准
- 使用 Tailwind CSS 进行样式处理

**设计模式：**
- Compound Component 模式（如 Table 组件）
- Variant Props 模式（使用 class-variance-authority）
- Polymorphic Component 模式（支持 asChild 属性）

### 2. 业务组件 (records/)

**技术特点：**
- 使用 React Hooks（useState, useOptimistic）
- 乐观更新提升用户体验
- 与 Server Actions 集成
- 支持表单验证和数据提交
- 响应式设计（移动优先）

## 技术栈

- **React 18** - 使用最新 React 特性
- **TypeScript** - 完整类型安全
- **Tailwind CSS** - 原子化 CSS 框架
- **class-variance-authority** - 样式变体管理
- **Radix UI** - 无障碍组件库
- **date-fns** - 日期格式化

## 开发指南

### 创建新组件

1. 确定组件类型（UI 组件或业务组件）
2. 使用 TypeScript 定义 Props 接口
3. 使用 `React.forwardRef` 支持引用转发
4. 通过 `cn()` 函数合并样式类名
5. 添加 displayName 用于调试

### 使用现有组件

```typescript
// UI 组件
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// 业务组件
import { RecordForm } from "@/components/records/RecordForm";
import { RecordList } from "@/components/records/RecordList";
```

## 样式系统

### 主题变量

- `primary` - 主色调
- `secondary` - 次要色
- `destructive` - 危险操作色
- `muted` - 弱化文本
- `foreground` - 前景色
- `background` - 背景色

### 工具类

所有组件使用 Tailwind CSS 工具类，保持一致的视觉风格。

## 性能优化

- 使用 `React.memo` 进行组件记忆化
- 合理使用 `useCallback` 和 `useMemo`
- 乐观更新减少感知延迟
- 代码分割和懒加载

## 文档索引

- [UI 组件详细文档](./ui/README.md)
- [业务组件详细文档](./records/README.md)
