# 数据库设置文档

## 概述

此目录包含拉屎记录应用的数据库模式定义和设置脚本。所有脚本都是为 Supabase PostgreSQL 数据库设计的。

## 文件说明

### `setup.sql`
完整的数据库设置脚本，包含：
- 表结构创建
- 数据约束和验证规则
- 索引优化
- 触发器设置
- 行级安全策略 (RLS)
- 统计视图

**推荐使用此文件进行完整设置。**

### `schema.sql`
仅包含表结构、约束和索引的定义。

### `rls_policies.sql`
仅包含行级安全策略的定义。

### `seed_data.sql`
示例数据（仅用于开发和测试）。

## 使用方法

### 在 Supabase 控制台中执行

1. 登录到 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 "SQL Editor"
4. 复制 `setup.sql` 的内容并执行

### 使用 Supabase CLI

```bash
# 如果你使用 Supabase CLI
supabase db reset
supabase db push
```

### 手动执行顺序

如果需要分步执行：

1. 首先执行 `schema.sql` 创建表结构
2. 然后执行 `rls_policies.sql` 设置安全策略
3. 可选：执行 `seed_data.sql` 添加测试数据

## 表结构说明

### bowel_movements 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 记录唯一标识符 |
| user_id | UUID | FOREIGN KEY | 关联到 auth.users(id) |
| recorded_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 记录创建时间 |
| occurred_at | TIMESTAMPTZ | NOT NULL | 排便发生时间 |
| quality_rating | INTEGER | CHECK (1-7) | 质量评级（布里斯托分类法） |
| notes | TEXT | LENGTH <= 500 | 可选备注 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 记录创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 记录更新时间 |

### 约束说明

1. **质量评级约束**: `quality_rating` 必须在 1-7 之间（基于布里斯托大便分类法）
2. **时间约束**: `occurred_at` 不能是未来时间
3. **备注长度**: `notes` 最大 500 字符
4. **用户关联**: 每条记录必须关联到认证用户
5. **级联删除**: 用户删除时，相关记录自动删除

### 索引说明

- `idx_bowel_movements_user_id`: 用户查询优化
- `idx_bowel_movements_occurred_at`: 时间范围查询优化
- `idx_bowel_movements_user_occurred`: 用户时间复合查询优化
- `idx_bowel_movements_user_date_quality`: 统计查询优化

### RLS 策略

所有策略都确保用户只能访问自己的数据：

- **SELECT**: 用户只能查看自己的记录
- **INSERT**: 用户只能创建自己的记录
- **UPDATE**: 用户只能更新自己的记录
- **DELETE**: 用户只能删除自己的记录

## 数据验证规则

根据需求 5.1 和 5.2，系统实现以下验证：

1. **时间验证**: 
   - `occurred_at` 不能是未来时间
   - 时间格式必须正确

2. **质量评级验证**:
   - 必须是 1-7 之间的整数
   - 不能为空

3. **备注验证**:
   - 可选字段
   - 最大长度 500 字符

4. **用户关联验证**:
   - 必须关联到有效的认证用户
   - 通过 RLS 策略强制执行

## 触发器

- **update_updated_at**: 自动更新 `updated_at` 字段当记录被修改时

## 统计视图

`user_bowel_movement_stats` 视图提供按日期聚合的统计数据：
- 每日记录数量
- 平均质量评级
- 最小/最大质量评级

## 性能优化

1. **索引策略**: 为常见查询模式创建了复合索引
2. **约束优化**: 使用数据库约束而不是应用层验证
3. **视图缓存**: 统计视图可以被缓存以提高性能

## 安全考虑

1. **RLS 策略**: 确保数据隔离和用户隐私
2. **约束验证**: 防止无效数据进入数据库
3. **级联删除**: 确保数据一致性

## 故障排除

### 常见错误

1. **权限错误**: 确保用户已认证且 RLS 策略正确
2. **约束违反**: 检查输入数据是否符合约束条件
3. **外键错误**: 确保 user_id 存在于 auth.users 表中

### 调试查询

```sql
-- 检查表结构
\d bowel_movements

-- 检查约束
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'bowel_movements'::regclass;

-- 检查索引
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'bowel_movements';

-- 检查 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bowel_movements';
```