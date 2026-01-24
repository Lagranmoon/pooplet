# Types 目录说明

## 目录作用

`types` 目录是项目的类型定义中心，集中管理所有 TypeScript 类型和接口定义。该目录为前端和后端提供统一的类型安全，确保代码的类型一致性和可维护性。

## 文件结构

```
types/
├── index.ts              # 核心类型定义
├── api-types.ts          # API 相关类型
├── api-responses.ts      # API 响应类型
└── next-env.d.ts         # Next.js 环境类型声明
```

## 类型定义说明

### 1. 核心类型（index.ts）

#### User
用户数据类型，包含用户的基本信息。

```typescript
export type User = {
  id: string;              // 用户唯一标识
  email: string;           // 用户邮箱
  emailVerified: boolean;  // 邮箱是否已验证
  name?: string;           // 用户名称（可选）
  image?: string;          // 用户头像 URL（可选）
  createdAt: string;       // 创建时间
  updatedAt: string;       // 更新时间
};
```

**使用场景：** 用户信息展示、用户资料管理、认证系统中的用户对象。

#### Record
排便记录数据类型，是核心业务数据模型。

```typescript
export type Record = {
  id: string;              // 记录唯一标识
  userId: string;          // 所属用户 ID
  occurredAt: string;      // 发生时间
  qualityRating: number;   // 质量评分（1-5）
  notes?: string;          // 备注（可选）
  createdAt: string;       // 创建时间
  updatedAt: string;       // 更新时间
};
```

**使用场景：** 排便记录的增删改查、统计计算、历史记录展示。

#### Session
用户会话类型，用于管理用户登录状态。

```typescript
export type Session = {
  id: string;              // 会话唯一标识
  userId: string;          // 所属用户 ID
  expiresAt: string;       // 过期时间
  ipAddress?: string;      // IP 地址（可选）
  userAgent?: string;      // 用户代理（可选）
  createdAt: string;       // 创建时间
  updatedAt: string;       // 更新时间
};
```

**使用场景：** 用户认证、会话管理、权限验证。

#### Account
第三方账户类型，用于 OAuth 登录集成。

```typescript
export type Account = {
  id: string;              // 账户唯一标识
  accountId: string;       // 提供商账户 ID
  userId: string;          // 所属用户 ID
  providerId: string;      // 提供商 ID（如 google、github）
  providerUserId: string;  // 提供商用户 ID
  accessToken?: string;    // 访问令牌（可选）
  refreshToken?: string;   // 刷新令牌（可选）
  expiresAt?: string;     // 令牌过期时间（可选）
  createdAt: string;       // 创建时间
  updatedAt: string;       // 更新时间
};
```

**使用场景：** 第三方登录（Google、GitHub 等）、令牌管理、账户关联。

#### ApiResponse\<T\>
通用 API 响应类型，为所有 API 路由提供一致的响应格式。

```typescript
export type ApiResponse<T = unknown> = {
  success: boolean;        // 请求是否成功
  data?: T;               // 响应数据（泛型）
  error?: string;         // 错误信息
  message?: string;       // 额外消息
};
```

**使用场景：** 所有 API 路由的返回值、错误处理、前端状态管理。

#### CreateRecordRequest / UpdateRecordRequest
创建和更新记录的请求类型。

```typescript
export type CreateRecordRequest = {
  occurredAt: string;      // 发生时间
  qualityRating: number;   // 质量评分
  notes?: string;          // 备注
};

export type UpdateRecordRequest = Partial<CreateRecordRequest>;
```

**使用场景：** 表单验证、API 请求参数、数据校验。

### 2. API 类型（api-types.ts）

#### RecordRow
数据库记录行类型，使用 snake_case 命名（数据库规范）。

```typescript
export interface RecordRow {
  id: string;
  user_id: string;
  occurred_at: string;
  quality_rating: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}
```

**使用场景：** 数据库查询结果、数据库映射、数据层与 API 层的数据转换。

#### DailyStats
每日统计数据类型。

```typescript
export interface DailyStats {
  date: string;           // 日期
  count: number;          // 记录次数
  avgQuality: number;     // 平均质量
  minQuality: number;     // 最低质量
  maxQuality: number;     // 最高质量
};
```

**使用场景：** 每日统计展示、趋势图表、数据分析。

#### UserStats
用户统计数据类型。

```typescript
export interface UserStats {
  totalRecords: number;         // 总记录数
  avgDailyCount: number;        // 平均每日记录数
  mostCommonQuality: number;    // 最常见质量评分
  streakDays: number;           // 连续记录天数
  lastRecordAt: string;         // 最后记录时间
  firstRecordAt: string;        // 首次记录时间
};
```

**使用场景：** 用户概览页面、健康数据分析、成就系统。

#### RecordsQueryParams
记录查询参数类型。

```typescript
export interface RecordsQueryParams {
  page?: number;              // 页码
  limit?: number;             // 每页数量
  startDate?: string;         // 开始日期
  endDate?: string;           // 结束日期
  orderBy?: string;           // 排序字段
  order?: 'asc' | 'desc';     // 排序方向
};
```

**使用场景：** 列表查询、数据筛选、分页请求。

#### PaginationResponse
分页响应类型。

```typescript
export interface PaginationResponse {
  records: RecordRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**使用场景：** 分页列表展示、无限滚动加载、数据分页处理。

### 3. API 响应类型（api-responses.ts）

#### Pagination
分页信息类型（与 api-types.ts 中的 pagination 结构相同）。

```typescript
export interface Pagination {
  page: number;           // 当前页码
  limit: number;          // 每页数量
  total: number;          // 总记录数
  totalPages: number;     // 总页数
  hasNext: boolean;       // 是否有下一页
  hasPrev: boolean;       // 是否有上一页
};
```

**使用场景：** 分页 UI 渲染、导航控制、数据加载状态。

#### RecordsResponse
记录列表响应类型。

```typescript
export interface RecordsResponse {
  records: unknown[];
  pagination: Pagination;
};
```

**使用场景：** 记录列表 API 响应、前端数据绑定。

#### OverviewStats
概览统计类型（与 api-types.ts 中的 UserStats 结构相同）。

```typescript
export interface OverviewStats {
  totalRecords: number;
  avgDailyCount: number;
  mostCommonQuality: number;
  streakDays: number;
  lastRecordAt: string;
  firstRecordAt: string;
};
```

**使用场景：** 首页概览、数据统计展示、KPI 显示。

## 类型命名规范

### 命名风格

- **类型定义：** 使用 `type` 关键字
  ```typescript
  export type User = { ... };
  export type Record = { ... };
  ```

- **接口定义：** 使用 `interface` 关键字
  ```typescript
  export interface Pagination { ... };
  export interface DailyStats { ... };
  ```

### 命名约定

- **普通类型/接口：** PascalCase
  ```typescript
  User, Record, Session, Pagination, DailyStats
  ```

- **请求/响应类型：** 动作 + 数据 + 类型
  ```typescript
  CreateRecordRequest, UpdateRecordRequest, RecordsResponse
  ```

- **泛型参数：** 单个大写字母
  ```typescript
  ApiResponse<T>, Array<T>, Promise<T>
  ```

- **数据库类型：** snake_case（与数据库字段一致）
  ```typescript
  RecordRow, user_id, created_at
  ```

## 类型安全的重要性

### 1. 编译时错误检测

TypeScript 在编译阶段就能发现类型错误，而不是在运行时崩溃。

```typescript
// 错误会在编译时被捕获
const record: Record = {
  id: '123',
  userId: '456',
  occurredAt: '2024-01-01',
  qualityRating: 'high', // 错误：类型 'string' 不能赋值给类型 'number'
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};
```

### 2. IDE 智能提示

类型定义为 IDE 提供完整的代码补全和类型提示。

```typescript
const record: Record = {
  id: '123',
  userId: '456',
  // IDE 会自动提示可用的字段和类型
};
```

### 3. 重构安全性

修改类型定义时，TypeScript 会自动标记所有需要更新的代码位置。

```typescript
// 修改类型后，所有使用该类型的地方都会提示错误
export type Record = {
  id: string;
  userId: string;
  occurredAt: string;
  qualityRating: number;
  notes?: string;
  newField?: string; // 新增字段
  createdAt: string;
  updatedAt: string;
};
```

### 4. 文档作用

类型定义本身就是最好的文档，清晰说明了数据结构和约束。

```typescript
// 不需要额外的文档，类型定义已经说明了所有信息
export type CreateRecordRequest = {
  occurredAt: string;      // 必填：发生时间
  qualityRating: number;   // 必填：质量评分（1-5）
  notes?: string;          // 可选：备注
};
```

### 5. 团队协作

类型定义作为团队成员之间的契约，确保前后端数据格式一致。

```typescript
// 前端和后端都使用相同的类型定义
import type { CreateRecordRequest } from '@/types';

// 后端 API 路由
export async function POST(request: Request) {
  const data: CreateRecordRequest = await request.json();
  // ...
}

// 前端请求
const data: CreateRecordRequest = {
  occurredAt: '2024-01-01',
  qualityRating: 5,
};
await fetch('/api/records', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

## 最佳实践

### 1. 使用类型而非 any

避免使用 `any`，始终定义明确的类型。

```typescript
// ❌ 不好
const data: any = await fetch('/api/records');

// ✅ 好
const data: ApiResponse<Record[]> = await fetch('/api/records');
```

### 2. 使用泛型提高复用性

对于通用类型，使用泛型参数提高复用性。

```typescript
// 通用 API 响应类型
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// 使用
type RecordsResponse = ApiResponse<Record[]>;
type UserResponse = ApiResponse<User>;
```

### 3. 使用 Partial 处理可选更新

使用 `Partial` 工具类型处理部分更新场景。

```typescript
// 创建请求（所有字段必填）
export type CreateRecordRequest = {
  occurredAt: string;
  qualityRating: number;
  notes?: string;
};

// 更新请求（所有字段可选）
export type UpdateRecordRequest = Partial<CreateRecordRequest>;
```

### 4. 导出和导入类型

使用 `type` 关键字明确表示这是类型导入。

```typescript
// 导出
export type { User, Record, ApiResponse };

// 导入
import type { User, Record, ApiResponse } from '@/types';
```

### 5. 保持类型定义简洁

避免在类型定义中包含业务逻辑，只描述数据结构。

```typescript
// ❌ 不好：包含业务逻辑
export type Record = {
  id: string;
  isValid: () => boolean;  // 不应该在类型中定义方法
};

// ✅ 好：只描述数据结构
export type Record = {
  id: string;
  userId: string;
  occurredAt: string;
  qualityRating: number;
};
```

## 扩展指南

### 添加新类型

1. 在合适的文件中添加类型定义
2. 导出类型以便其他模块使用
3. 在 index.ts 中重新导出（如果是核心类型）
4. 编写相应的测试用例

### 类型示例

```typescript
// 1. 在 api-types.ts 中添加新类型
export interface HealthMetric {
  id: string;
  userId: string;
  metricType: 'weight' | 'height' | 'blood_pressure';
  value: number;
  unit: string;
  recordedAt: string;
}

// 2. 在 index.ts 中导出
export type { HealthMetric } from './api-types';

// 3. 在其他文件中使用
import type { HealthMetric } from '@/types';
```

## 相关资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Next.js TypeScript 指南](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Prisma TypeScript 支持](https://www.prisma.io/docs/concepts/components/prisma-client/typescript)
