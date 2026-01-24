# 数据库依赖清单

本文档整理了Pooplet项目的完整数据库依赖结构。

## 核心依赖

### 📁 Prisma ORM
- **架构文件**: `prisma/schema.prisma`
- **迁移文件**: `prisma/migrations/20260123062812_init/migration.sql`
- **初始化脚本**: `prisma/init.sql`
- **客户端配置**: `lib/db.ts`

### 📊 表结构

#### pooplet_user (用户表)
```sql
CREATE TABLE "pooplet_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);
```

#### pooplet_record (排便记录表 - 核心业务表)
```sql
CREATE TABLE "pooplet_record" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "quality_rating" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);
```

#### pooplet_session (会话表)
```sql
CREATE TABLE "pooplet_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);
```

#### pooplet_account (账户表)
```sql
CREATE TABLE "pooplet_account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);
```

### 🔗 外键关系
- `pooplet_record.user_id` → `pooplet_user.id` (CASCADE)
- `pooplet_session.user_id` → `pooplet_user.id` (CASCADE)
- `pooplet_account.user_id` → `pooplet_user.id` (CASCADE)

### 📈 索引

#### 唯一索引
- `pooplet_user_email_key` - 邮箱唯一
- `pooplet_session_token_key` - 会话令牌唯一
- `pooplet_account_provider_id_provider_user_id_key` - 第三方登录唯一

#### 性能索引
- `idx_pooplet_record_user_covering` - 用户记录覆盖索引
- `idx_pooplet_record_date_quality` - 日期和质量统计
- `idx_pooplet_record_daily_stats` - 每日统计
- `pooplet_session_user_id_idx` - 会话查询优化
- `pooplet_account_user_id_idx` - 账户查询优化

## 🔧 配置文件

### Prisma Client (`lib/db.ts`)
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### 环境变量
```env
# Database Configuration
DB_NAME=pooplet_dev
DB_USER=pooplet
DB_PASSWORD=devpassword
DATABASE_URL="postgresql://pooplet:devpassword@postgres:5432/pooplet_dev?schema=public"
```

### Docker环境连接说明
在Docker环境中，数据库连接配置如下：
- **数据库地址**: `postgres` (Docker服务名)
- **端口**: 5432 (仅Docker内部网络)
- **安全性**: 数据库不对外暴露端口
- **连接字符串**: 使用服务名而非localhost

## 🚀 命令

### 开发命令
```bash
npm run db:generate    # 生成 Prisma 客户端
npm run db:migrate    # 运行迁移
npm run db:push       # 推送架构更改
npm run db:studio     # 数据库管理界面
```

### 迁移命令
```bash
# 创建新迁移
npx prisma migrate dev --name migration_name

# 部署迁移到生产环境
npx prisma migrate deploy

# 回滚迁移
npx prisma migrate reset
```

## 📝 使用示例

### 查询记录
```typescript
import { prisma } from '@/lib/db';

const records = await prisma.record.findMany({
  where: { userId: user.id },
  orderBy: { occurredAt: 'desc' },
  take: 10,
});
```

### 创建记录
```typescript
const record = await prisma.record.create({
  data: {
    userId: user.id,
    occurredAt: new Date(),
    qualityRating: 4,
    notes: '正常排便',
  },
});
```

## 🔒 安全特性

- **Row Level Security**: 通过 better-auth 实现用户数据隔离
- **Cascading Deletes**: 用户删除时，相关记录自动删除
- **Unique Constraints**: 防止数据重复
- **Timestamp Tracking**: 自动记录创建和更新时间

## 📦 依赖包

### 生产依赖
```json
{
  "@prisma/client": "^6.0.0",
  "better-auth": "^1.4.17"
}
```

### 开发依赖
```json
{
  "prisma": "^6.0.0"
}
```

## 🔄 版本控制

迁移文件已版本控制：
- `prisma/migrations/20260123062812_init/migration.sql`
- `prisma/migrations/migration_lock.toml`

## ⚠️ 注意事项

1. **备份策略**: 数据库文件存储在 `data/postgres/`
2. **迁移顺序**: 确保按时间戳顺序执行迁移
3. **环境变量**: 确保所有环境都配置正确的 `DATABASE_URL`
4. **连接池**: Prisma Client 自动管理连接池

## 🆘 故障排除

### 常见问题
1. **迁移失败**: 检查数据库连接和权限
2. **类型错误**: 运行 `npm run db:generate`
3. **连接超时**: 检查 `DATABASE_URL` 配置
4. **模式不匹配**: 运行 `npm run db:push` 同步

### 调试命令
```bash
# 查看迁移状态
npx prisma migrate status

# 生成客户端
npx prisma generate

# 验证架构
npx prisma db pull
```