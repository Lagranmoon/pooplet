# 排便跟踪器开发指南

本文档为 AI 代理在此 Next.js + React + TypeScript + Prisma 项目中工作提供全面的指导。

## 构建、代码检查和测试命令

### 开发
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建

### 代码检查
- `npm run lint` - 对所有文件运行 ESLint（TypeScript + React 规则）

### 测试
- `npm run test` - 以监视模式运行测试
- `npm run test:run` - 运行一次测试（CI 模式）
- `npm run test:ui` - 使用 UI 界面运行测试
- `npm run test:rls` - 测试 RLS 策略
- **单文件测试:** `npm run test filename.test.ts`
- **单测试方法:** `npm run test -- --reporter=verbose filename.test.ts -t "test name"`

## 代码风格指南

### 导入指南
```typescript
// 外部库优先（按字母顺序）
import { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';

// 内部导入（相对路径）
import { auth } from '@/lib/auth';
import type { Record } from '@prisma/client';
```

### 文件组织
```
src/
├── components/     # 可复用 UI 组件
├── contexts/       # React 上下文
├── hooks/         # 自定义 React hooks
├── pages/         # 路由页面组件
├── services/      # API 和业务逻辑
├── types/         # TypeScript 类型定义
└── test/          # 测试文件和工具
```

### 命名约定

**文件 & 组件:**
- React 组件使用 PascalCase: `RecordForm.tsx`
- 工具函数和 hooks 使用 camelCase: `useAuth.ts`
- 服务文件使用 snake_case: `recordService.ts`

**变量 & 函数:**
- 变量和函数使用 camelCase
- 类型和接口使用 PascalCase
- 常量使用 UPPER_CASE

**接口 & 类型:**
```typescript
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export type UseAuthReturn = AuthState & AuthActions;

export interface BowelMovementRecord {
  id: string;
  user_id: string;
}
```

### React 模式

**Hooks:**
```typescript
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const signOut = useCallback(async () => {
    // 实现
  }, []);

  return { ...state, signOut };
};
```

**组件结构:**
```typescript
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  return (
    <div className="container">
      <h1>{title}</h1>
    </div>
  );
};

export default MyComponent;
```

### 错误处理

**服务层:**
```typescript
async createRecord(data: CreateRecordRequest): Promise<ApiResponse<Record>> {
  try {
    const result = await prisma.record.create({
      data: {
        userId: data.userId,
        occurredAt: data.occurredAt,
        qualityRating: data.qualityRating,
        notes: data.notes,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '数据库错误' };
  }
}
```

**React 组件:**
```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (data: FormData) => {
  try {
    setError(null);
    await submitData(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : '未知错误');
  }
};
```

### 数据库 & 认证

**Prisma ORM:**
- 所有数据库访问应通过 Prisma Client
- 用户只能访问自己的记录
- 使用 `npm run db:migrate` 运行迁移

**数据库类型:**
```typescript
import { prisma } from '@/lib/prisma';
import type { Record } from '@prisma/client';

const records = await prisma.record.findMany({
  where: { userId: user.id },
  orderBy: { occurredAt: 'desc' },
});
```

**better-auth:**
- 使用 better-auth 进行用户认证
- 会话自动管理
- 认证路由应在 `app/api/auth/...` 中创建

### 测试标准

**测试结构:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('正确渲染', () => {
    render(<MyComponent title="Test" onSubmit={jest.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### 样式指南

**Tailwind CSS:**
- 所有样式使用工具类
- 除非必要，不使用自定义 CSS
- 移动优先的响应式设计

```tsx
const Card: React.FC<Props> = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-4">
    <div className="space-y-4">
      {children}
    </div>
  </div>
);
```

### 配置

**关键文件:**
- `tsconfig.json` - TypeScript 项目引用
- `eslint.config.js` - ESLint 扁平配置
- `vitest.config.ts` - 测试配置
- `tailwind.config.js` - Tailwind CSS 设置

### 安全最佳实践

**环境变量:**
- 绝不对 `.env` 文件进行提交
- 使用 `.env.example` 作为模板

**认证:**
- 在数据访问前始终检查用户认证
- 使用 better-auth 进行认证和会话管理

### 开发工作流

1. **提交前:** 运行 `npm run lint` 和 `npm run test:run`
2. **代码审查:** 确保所有测试通过
3. **性能:** 监控包大小和加载时间
4. **可访问性:** 使用语义 HTML 和 ARIA 标签

### 关键依赖

- React 18 + TypeScript
- Next.js 14 全栈框架
- Prisma 数据库 ORM
- better-auth 认证
- Tailwind CSS 样式
- Vitest 测试