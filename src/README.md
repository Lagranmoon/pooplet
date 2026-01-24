# src 目录说明文档

## 目录概述

`src` 目录是项目的源代码目录，包含了前端应用的核心代码和类型定义。该目录按照功能模块进行组织，便于维护和扩展。

## 目录结构

```
src/
├── components/     # React 组件
│   └── ui/        # UI 组件库
├── hooks/         # 自定义 React Hooks
├── types/         # TypeScript 类型定义
└── examples/      # 示例代码
```

## 子目录说明

### components/ui/
UI 组件库目录，包含可复用的 React 组件。

**主要组件：**
- `confirm-dialog.tsx` - 确认对话框组件
- `error-boundary.tsx` - 错误边界组件

**技术特点：**
- 使用 "use client" 指令，标记为客户端组件
- 使用 TypeScript 进行类型检查
- 使用 Tailwind CSS 进行样式设计
- 遵循 React 最佳实践

**详细文档：** [components/ui/README.md](./components/ui/README.md)

### hooks/
自定义 React Hooks 目录，封装可复用的状态逻辑和副作用。

**主要 Hooks：**
- `useRecords()` - 排便记录管理
- `useFormData()` - 表单数据管理
- `useAuth()` - 用户认证管理
- `useDebounce()` - 防抖功能
- `useLocalStorage()` - 本地存储

**技术特点：**
- 使用 React Hooks API (useState, useEffect, useCallback, useMemo)
- 提供优化的性能表现
- 包含完整的状态管理逻辑
- 提供工具函数集合

**详细文档：** [hooks/README.md](./hooks/README.md)

### types/
TypeScript 类型定义目录，包含项目的所有类型定义。

**主要类型：**
- 认证相关类型 (User, Session, Account)
- 业务相关类型 (BowelRecord, QualityOption)
- API 响应类型 (ApiResponse, PaginationMeta)
- 组件 Props 类型
- Hooks 返回类型
- 状态管理类型

**技术特点：**
- 使用 TypeScript 高级类型特性
- 提供完整的类型安全
- 导出常量类型和工具类型
- 支持泛型和类型推导

**详细文档：** [types/README.md](./types/README.md)

### examples/
示例代码目录，用于演示组件和 Hook 的使用方法。

## 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式系统
- **Next.js 14** - 应用框架（客户端部分）

## 代码组织原则

### 组件设计
- 使用函数组件 + Hooks
- 组件 Props 明确定义类型
- 单一职责原则
- 可复用性优先

### Hooks 设计
- 封装可复用逻辑
- 提供清晰的返回类型
- 优化性能（useCallback, useMemo）
- 避免副作用污染

### 类型定义
- 集中管理所有类型
- 使用 TypeScript 高级特性
- 提供类型常量和工具类型
- 支持泛型使用

## 依赖说明

### 核心依赖
- `react` - UI 框架
- `react-dom` - DOM 渲染

### 类型依赖
- `@types/react` - React 类型定义
- `@types/react-dom` - React DOM 类型定义

### 样式依赖
- `tailwindcss` - CSS 框架

### 工具依赖
- `class-variance-authority` - 组件变体管理
- `@radix-ui/react-slot` - Radix UI 组件库

## 开发指南

### 添加新组件
1. 在 `src/components/ui/` 目录下创建组件文件
2. 使用 TypeScript 定义 Props 类型
3. 遵循现有的代码风格和命名约定
4. 导出组件供其他模块使用

### 添加新 Hook
1. 在 `src/hooks/` 目录下创建 Hook 文件
2. 定义清晰的输入和输出类型
3. 使用 React Hooks API 实现逻辑
4. 提供完整的文档注释

### 添加新类型
1. 在 `src/types/index.ts` 中添加类型定义
2. 按照类别组织类型（认证、业务、API、组件等）
3. 使用 TypeScript 高级特性提高类型安全性
4. 导出类型供其他模块使用

## 注意事项

1. **客户端组件**：所有 `src` 目录下的组件和 Hooks 都需要在文件顶部添加 `"use client";` 指令
2. **类型安全**：确保所有函数和组件都有明确的类型定义
3. **性能优化**：合理使用 `useCallback` 和 `useMemo` 避免不必要的重渲染
4. **错误处理**：使用 Error Boundary 组件捕获和处理错误
5. **代码规范**：遵循项目的代码风格和命名约定

## 相关资源

- [项目主文档](../../README.md)
- [AGENTS.md](../../AGENTS.md) - 开发者指南
- [API 路由文档](../app/api/README.md)
