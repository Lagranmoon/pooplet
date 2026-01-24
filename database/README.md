# 数据库设置文档

## 概述

此目录包含拉屎记录应用的数据库模式定义和设置脚本。项目使用 Prisma ORM 管理数据库，数据存储在 PostgreSQL 数据库中，认证使用 better-auth 实现。

## 技术栈

- **ORM**: Prisma
- **数据库**: PostgreSQL
- **认证**: better-auth
- **迁移**: Prisma Migrate

## 数据模型

### User 表 (`pooplet_user`)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (CUID) | PRIMARY KEY | 用户唯一标识符 |
| email | String | UNIQUE | 用户邮箱 |
| emailVerified | Boolean | DEFAULT false | 邮箱是否已验证 |
| name | String? | OPTIONAL | 用户名称 |
| image | String? | OPTIONAL | 用户头像 |
| createdAt | DateTime | DEFAULT NOW() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

### Record 表 (`pooplet_record`)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (CUID) | PRIMARY KEY | 记录唯一标识符 |
| userId | String | FOREIGN KEY | 关联到 pooplet_user(id) |
| occurredAt | DateTime | NOT NULL | 排便发生时间 |
| qualityRating | Int | NOT NULL | 质量评级（1-7） |
| notes | String? | OPTIONAL | 备注信息 |
| createdAt | DateTime | DEFAULT NOW() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

### Session 表 (`pooplet_session`)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (CUID) | PRIMARY KEY | 会话唯一标识符 |
| userId | String | FOREIGN KEY | 关联到 pooplet_user(id) |
| token | String | UNIQUE | 会话令牌 |
| expiresAt | DateTime | NOT NULL | 过期时间 |
| ipAddress | String? | OPTIONAL | IP 地址 |
| userAgent | String? | OPTIONAL | 用户代理 |
| createdAt | DateTime | DEFAULT NOW() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

### Account 表 (`pooplet_account`)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (CUID) | PRIMARY KEY | 账户唯一标识符 |
| accountId | String | NOT NULL | 第三方账户 ID |
| userId | String | FOREIGN KEY | 关联到 pooplet_user(id) |
| providerId | String | NOT NULL | 提供商 ID |
| providerUserId | String? | OPTIONAL | 提供商用户 ID |
| password | String? | OPTIONAL | 密码哈希 |
| accessToken | String? | OPTIONAL | 访问令牌 |
| refreshToken | String? | OPTIONAL | 刷新令牌 |
| expiresAt | DateTime? | OPTIONAL | 令牌过期时间 |
| createdAt | DateTime | DEFAULT NOW() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

## 索引

为优化查询性能，定义了以下索引：

1. **idx_pooplet_record_user_covering**: [userId, occurredAt] - 用户记录查询
2. **idx_pooplet_record_date_quality**: [occurredAt, qualityRating] - 统计查询
3. **idx_pooplet_record_daily_stats**: [userId, occurredAt] - 每日统计
4. **Session 索引**: userId, token - 会话查询优化
5. **Account 索引**: userId, [providerId, providerUserId] - 账户关联查询

## 数据验证规则

### 应用层验证

通过 Prisma Schema 和 Zod 实现数据验证：

1. **时间验证**: 
   - `occurred_at` 不能是未来时间
   - 时间格式必须正确

2. **质量评级验证**:
   - 必须是 1-7 之间的整数
   - 不能为空

3. **备注验证**:
   - 可选字段
   - 建议最大长度 500 字符

4. **用户关联验证**:
   - 必须关联到有效的认证用户
   - 通过外键约束强制执行

### 数据库约束

- **PRIMARY KEY**: 确保每条记录有唯一标识
- **UNIQUE**: 确保邮箱、令牌等字段唯一性
- **NOT NULL**: 必填字段约束
- **FOREIGN KEY**: 确保引用完整性
- **CASCADE DELETE**: 用户删除时，相关记录自动删除

## 使用方法

### 环境配置

创建 `.env` 文件并配置数据库连接：

```bash
# Database Configuration
DB_NAME=pooplet
DB_USER=pooplet
DB_PASSWORD=your_secure_password
DATABASE_URL="postgresql://pooplet:your_secure_password@localhost:5432/pooplet?schema=public"
```

### 数据库迁移

```bash
# 创建迁移
npm run db:migrate

# 应用迁移
npm run db:push

# 生成 Prisma Client
npm run db:generate

# 打开数据库管理界面
npm run db:studio
```

### 数据库种子

```bash
npm run db:seed
```

## 认证系统

项目使用 better-auth 提供完整的认证功能：

- 用户注册和登录
- 会话管理
- 密码加密
- 第三方登录（可选）
- 邮箱验证（可选）

## 性能优化

1. **索引策略**: 为常见查询模式创建了复合索引
2. **查询优化**: 使用 Prisma 的查询优化功能
3. **连接池**: 数据库连接池管理
4. **懒加载**: 按需加载关联数据

## 安全考虑

1. **外键约束**: 确保数据完整性
2. **级联删除**: 确保数据一致性
3. **密码加密**: 使用 bcrypt 加密密码
4. **会话管理**: 安全的会话令牌和过期机制
5. **CSRF 保护**: better-auth 内置 CSRF 保护

## 故障排除

### 常见错误

1. **连接错误**: 检查 `DATABASE_URL` 配置是否正确
2. **约束违反**: 检查输入数据是否符合约束条件
3. **外键错误**: 确保 userId 存在于 User 表中
4. **迁移冲突**: 解决迁移冲突或重置数据库

### 调试查询

```bash
# 查看数据库状态
npm run db:studio

# 重新生成 Prisma Client
npm run db:generate

# 重置数据库（开发环境）
npx prisma migrate reset

# 格式化 Schema
npx prisma format
```

### 查询示例

```typescript
// 获取用户所有记录
const records = await prisma.record.findMany({
  where: { userId },
  orderBy: { occurredAt: 'desc' }
});

// 统计每日记录数
const dailyStats = await prisma.record.groupBy({
  by: ['occurredAt'],
  where: { userId },
  _count: true
});
```
