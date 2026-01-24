# Prisma 数据库配置目录

本目录包含项目的 Prisma ORM 配置、数据库迁移和初始化脚本。

## 目录结构

```
prisma/
├── schema.prisma              # Prisma Schema 定义文件
├── init.sql                   # 数据库初始化脚本
├── migrations/                # 数据库迁移文件
│   ├── 20260123062812_init/   # 初始迁移
│   │   └── migration.sql      # 迁移 SQL 脚本
│   └── migration_lock.toml    # 迁移锁文件（不要手动编辑）
└── README.md                  # 本文档
```

## Schema 文件详解 (schema.prisma)

### 数据源配置

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- **provider**: 使用 PostgreSQL 数据库
- **url**: 从环境变量 `DATABASE_URL` 读取数据库连接字符串

### 生成器配置

```prisma
generator client {
  provider = "prisma-client-js"
}
```

- 生成 Prisma JavaScript/TypeScript 客户端

## 数据模型说明

### 1. User（用户表）

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false) @map("email_verified")
  name          String?
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  records       Record[]
  sessions      Session[]
  accounts      Account[]

  @@map("pooplet_user")
}
```

**字段说明:**

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| `id` | String | 用户唯一标识 | 主键，CUID 格式 |
| `email` | String | 用户邮箱 | 唯一索引 |
| `emailVerified` | Boolean | 邮箱是否已验证 | 默认 false |
| `name` | String? | 用户名称 | 可选 |
| `image` | String? | 用户头像 URL | 可选 |
| `createdAt` | DateTime | 创建时间 | 默认当前时间 |
| `updatedAt` | DateTime | 更新时间 | 自动更新 |

**关系:**
- `records`: 用户关联的排便记录（一对多）
- `sessions`: 用户的会话记录（一对多）
- `accounts`: 用户的账户关联（一对多，支持多种登录方式）

---

### 2. Record（排便记录表）

```prisma
model Record {
  id             String    @id @default(cuid())
  userId         String    @map("user_id")
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  occurredAt     DateTime  @map("occurred_at")
  qualityRating  Int       @map("quality_rating")
  notes          String?
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@index([userId(sort: Desc), occurredAt(sort: Desc)], name: "idx_pooplet_record_user_covering")
  @@index([occurredAt, qualityRating], name: "idx_pooplet_record_date_quality")
  @@index([userId, occurredAt], name: "idx_pooplet_record_daily_stats")
  @@map("pooplet_record")
}
```

**字段说明:**

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| `id` | String | 记录唯一标识 | 主键，CUID 格式 |
| `userId` | String | 用户 ID | 外键关联 User 表 |
| `user` | User | 关联的用户 | 关系字段 |
| `occurredAt` | DateTime | 排便发生时间 | - |
| `qualityRating` | Int | 质量评分（1-5） | 必填 |
| `notes` | String? | 备注 | 可选 |
| `createdAt` | DateTime | 创建时间 | 默认当前时间 |
| `updatedAt` | DateTime | 更新时间 | 自动更新 |

**关系:**
- `user`: 关联用户（多对一），用户删除时级联删除记录

---

### 3. Session（会话表）

```prisma
model Session {
  id           String    @id @default(cuid())
  userId       String    @map("user_id")
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String    @unique
  expiresAt    DateTime  @map("expires_at")
  ipAddress    String?   @map("ip_address")
  userAgent    String?   @map("user_agent")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  @@index([userId])
  @@index([token])
  @@map("pooplet_session")
}
```

**字段说明:**

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| `id` | String | 会话唯一标识 | 主键，CUID 格式 |
| `userId` | String | 用户 ID | 外键关联 User 表 |
| `user` | User | 关联的用户 | 关系字段 |
| `token` | String | 会话令牌 | 唯一索引 |
| `expiresAt` | DateTime | 过期时间 | - |
| `ipAddress` | String? | IP 地址 | 可选 |
| `userAgent` | String? | 用户代理（浏览器信息） | 可选 |
| `createdAt` | DateTime | 创建时间 | 默认当前时间 |
| `updatedAt` | DateTime | 更新时间 | 自动更新 |

**关系:**
- `user`: 关联用户（多对一），用户删除时级联删除会话

---

### 4. Account（账户表）

```prisma
model Account {
  id             String  @id @default(cuid())
  accountId      String  @map("account_id")
  userId         String  @map("user_id")
  user           User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  providerId     String  @map("provider_id")
  providerUserId String? @map("provider_user_id")
  password       String?
  accessToken    String? @map("access_token")
  refreshToken   String? @map("refresh_token")
  expiresAt      DateTime? @map("expires_at")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@unique([providerId, providerUserId], name: "provider_user_id_unique")
  @@index([userId])
  @@map("pooplet_account")
}
```

**字段说明:**

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| `id` | String | 账户唯一标识 | 主键，CUID 格式 |
| `accountId` | String | 账户 ID（用于 OAuth） | - |
| `userId` | String | 用户 ID | 外键关联 User 表 |
| `user` | User | 关联的用户 | 关系字段 |
| `providerId` | String | 提供商 ID（如 google, github） | - |
| `providerUserId` | String? | 提供商用户 ID | 可选 |
| `password` | String? | 密码哈希 | 可选（邮箱密码登录） |
| `accessToken` | String? | 访问令牌（OAuth） | 可选 |
| `refreshToken` | String? | 刷新令牌（OAuth） | 可选 |
| `expiresAt` | DateTime? | 令牌过期时间 | 可选 |
| `createdAt` | DateTime | 创建时间 | 默认当前时间 |
| `updatedAt` | DateTime | 更新时间 | 自动更新 |

**关系:**
- `user`: 关联用户（多对一），用户删除时级联删除账户

**唯一约束:**
- `providerId + providerUserId`: 同一提供商的用户 ID 必须唯一

---

## 索引优化说明

### Record 表索引

```sql
-- 1. 用户覆盖索引（用于获取用户记录列表）
@@index([userId(sort: Desc), occurredAt(sort: Desc)], name: "idx_pooplet_record_user_covering")

-- 2. 日期质量复合索引（用于统计分析）
@@index([occurredAt, qualityRating], name: "idx_pooplet_record_date_quality")

-- 3. 每日统计索引（用于生成每日统计数据）
@@index([userId, occurredAt], name: "idx_pooplet_record_daily_stats")
```

**使用场景:**

1. **idx_pooplet_record_user_covering**: 查询用户的排便记录，按时间降序排列
   ```typescript
   prisma.record.findMany({
     where: { userId },
     orderBy: { occurredAt: 'desc' }
   })
   ```

2. **idx_pooplet_record_date_quality**: 按日期和质量评分进行统计分析
   ```typescript
   prisma.record.findMany({
     where: { occurredAt: { gte: startDate, lte: endDate } },
     orderBy: { qualityRating: 'asc' }
   })
   ```

3. **idx_pooplet_record_daily_stats**: 生成每日统计数据
   ```typescript
   // 用于生成 pooplet_daily_stats 视图
   ```

### Session 表索引

```sql
@@index([userId])     -- 用于查找用户的所有活跃会话
@@index([token])      -- 用于通过令牌验证会话
```

### Account 表索引

```sql
@@index([userId])                                          -- 用于查找用户的所有关联账户
@@unique([providerId, providerUserId], name: "provider_user_id_unique")  -- 防止同一 OAuth 账户重复绑定
```

---

## 初始化脚本 (init.sql)

### UUIDv7 支持

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 UUIDv7 生成函数
CREATE OR REPLACE FUNCTION gen_uuidv7()
RETURNS TEXT AS $$
SELECT uuidv7();
$$ LANGUAGE plpgsql IMMUTABLE;
```

- 启用 UUIDv7 支持用于生成分布式友好的唯一 ID
- UUIDv7 具有时间排序特性，适合数据库索引优化

### 每日统计视图

```sql
CREATE OR REPLACE VIEW pooplet_daily_stats AS
SELECT
    user_id,
    DATE(occurred_at) as date,
    COUNT(*) as daily_count,
    AVG(quality_rating) as avg_quality,
    MIN(quality_rating) as min_quality,
    MAX(quality_rating) as max_quality
FROM pooplet_record
GROUP BY user_id, DATE(occurred_at);
```

**字段说明:**

| 字段 | 说明 |
|------|------|
| `user_id` | 用户 ID |
| `date` | 日期 |
| `daily_count` | 当日排便次数 |
| `avg_quality` | 平均质量评分 |
| `min_quality` | 最低质量评分 |
| `max_quality` | 最高质量评分 |

**使用示例:**

```sql
-- 查询某用户近 7 天的统计数据
SELECT * FROM pooplet_daily_stats
WHERE user_id = 'xxx' AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

---

## Prisma 命令使用指南

### 开发命令

```bash
# 生成 Prisma Client（修改 schema 后必须执行）
npx prisma generate

# 创建新迁移（基于 schema 变更）
npx prisma migrate dev --name migration_name

# 应用所有迁移（生产环境）
npx prisma migrate deploy

# 重置数据库（谨慎使用！删除所有数据）
npx prisma migrate reset

# 查看迁移状态
npx prisma migrate status

# 解决迁移冲突
npx prisma migrate resolve --applied "20260123062812_init"
```

### 数据库交互

```bash
# 打开 Prisma Studio（可视化数据库管理工具）
npx prisma studio

# 查看数据库结构
npx prisma db pull

# 格式化 schema 文件
npx prisma format
```

### 种子数据

```bash
# 运行种子脚本（需要在 package.json 中配置）
npm run db:seed

# 示例 package.json 配置:
# "prisma": {
#   "seed": "ts-node prisma/seed.ts"
# }
```

---

## 关联表关系图

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │
│ email       │
│ name        │
└─────┬───────┘
      │ 1
      │
      │ N
      ├─────────────────┬────────────────┬─────────────┐
      │                 │                │             │
      │ N               │ N              │ N           │ N
┌─────▼───────┐   ┌─────▼───────┐   ┌─────▼─────┐  ┌────▼─────┐
│   Record    │   │   Session   │   │  Account  │  │ Account  │
├─────────────┤   ├─────────────┤   ├───────────┤  │ (OAuth)  │
│ id (PK)     │   │ id (PK)     │   │ id (PK)   │  ├──────────┤
│ userId (FK) │   │ userId (FK) │   │ userId(FK)│  │ provider  │
│ occurredAt  │   │ token       │   │ providerId│  │ password │
│ qualityRating│  │ expiresAt   │   │ password  │  └──────────┘
└─────────────┘   └─────────────┘   └───────────┘
```

---

## 注意事项

1. **不要手动编辑 `migration_lock.toml`**: 该文件由 Prisma 自动管理
2. **迁移命名规范**: 使用描述性名称，如 `add_quality_rating_field`
3. **外键级联删除**: 所有关联表都设置了 `onDelete: Cascade`，删除用户会自动删除相关数据
4. **环境变量**: 确保 `.env` 文件包含正确的 `DATABASE_URL`
5. **生产环境**: 首次部署时使用 `npx prisma migrate deploy` 应用所有迁移

---

## 相关文档

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Schema 参考](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [迁移指南](https://www.prisma.io/docs/concepts/components/prisma-migrate)
