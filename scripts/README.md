# Scripts 目录文档

本目录包含用于用户管理和数据维护的脚本工具。这些脚本主要用于管理应用的用户账户、处理密码重置和查看用户信息等维护任务。

## 目录概述

所有脚本都是使用 TypeScript 编写的 Node.js 脚本，通过 Prisma ORM 与数据库交互。每个脚本都提供了命令行参数解析和友好的错误提示。

### 运行方式

所有脚本都应通过 `npm run` 命令运行，而不是直接使用 `node` 命令。这样可以确保正确的环境变量和依赖配置。

```bash
npm run <script-name> -- [参数]
```

注意：参数前的 `--` 是必需的，用于将 npm 参数与脚本参数分隔开。

---

## 脚本列表

### 1. delete-user.ts - 用户删除脚本

用于删除指定用户账户及其关联的排便记录。

#### 功能说明
- 通过邮箱或用户ID查找用户
- 自动删除用户的所有排便记录
- 安全保护：如果用户有记录，需要使用 `--force` 参数强制删除

#### 参数

| 参数 | 简写 | 说明 | 必需 |
|------|------|------|------|
| `--email` | `-e` | 用户邮箱地址 | 与 `--id` 二选一 |
| `--id` | `-i` | 用户ID（UUID） | 与 `--email` 二选一 |
| `--force` | `-f` | 强制删除（有记录的用户） | 可选 |
| `--help` | `-h` | 显示帮助信息 | 可选 |

#### 使用示例

```bash
# 查看帮助信息
npm run delete-user -- --help

# 通过邮箱删除无记录的用户
npm run delete-user -- --email test@example.com

# 通过用户ID删除无记录的用户
npm run delete-user -- --id 123e4567-e89b-12d3-a456-426614174000

# 强制删除有记录的用户
npm run delete-user -- --email test@example.com --force

# 强制删除有记录的用户（使用用户ID）
npm run delete-user -- --id 123e4567-e89b-12d3-a456-426614174000 --force
```

#### 返回信息

- **成功时**：显示被删除用户的邮箱、ID 以及删除的记录数量
- **失败时**：显示具体的错误原因

```bash
✅ 用户 test@example.com 已成功删除
📊 删除了 5 条记录
```

---

### 2. reset-password.ts - 密码重置脚本

用于重置指定用户的密码，支持自定义密码或自动生成随机密码。

#### 功能说明
- 通过邮箱或用户ID查找用户
- 支持设置自定义密码或自动生成10位随机密码
- 使用 better-auth 的账户管理系统
- 自动处理账户记录的创建和更新

#### 参数

| 参数 | 简写 | 说明 | 必需 |
|------|------|------|------|
| `--email` | `-e` | 用户邮箱地址 | 与 `--id` 二选一 |
| `--id` | `-i` | 用户ID（UUID） | 与 `--email` 二选一 |
| `--password` | `-p` | 新密码 | 可选（不提供则自动生成） |
| `--generate` | `-g` | 生成随机密码（默认行为） | 可选 |
| `--help` | `-h` | 显示帮助信息 | 可选 |

#### 使用示例

```bash
# 查看帮助信息
npm run reset-password -- --help

# 自动生成随机密码（通过邮箱）
npm run reset-password -- --email test@example.com

# 设置自定义密码
npm run reset-password -- --email test@example.com --password "newSecurePass123"

# 自动生成随机密码（通过用户ID）
npm run reset-password -- --id 123e4567-e89b-12d3-a456-426614174000

# 设置自定义密码（通过用户ID）
npm run reset-password -- --id 123e4567-e89b-12d3-a456-426614174000 --password "myPassword123"
```

#### 返回信息

- **成功时**：显示新密码（明文），请立即保存
- **失败时**：显示具体的错误原因

```bash
✅ 用户 test@example.com 的密码已重置
🔑 新密码: ABcDEfGhJk
⚠️  请安全保管新密码！
```

#### 安全提示
- 新密码以明文形式显示在终端中
- 请立即将密码安全地传达给用户
- 建议用户登录后立即修改密码

---

### 3. list-users.ts - 用户列表脚本

用于列出所有注册用户及其基本信息，支持多种输出格式。

#### 功能说明
- 获取所有注册用户的基本信息
- 统计每个用户的排便记录数量
- 显示用户最后登录时间（基于最新记录时间）
- 支持表格格式（默认）和 JSON 格式输出

#### 参数

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--format` | `-f` | 输出格式：`table` 或 `json` | `table` |
| `--limit` | `-l` | 限制返回用户数量 | `50` |
| `--help` | `-h` | 显示帮助信息 | - |

#### 使用示例

```bash
# 查看帮助信息
npm run list-users -- --help

# 显示所有用户（表格格式，最多50个）
npm run list-users

# 显示所有用户（JSON格式）
npm run list-users -- --format json

# 限制返回10个用户
npm run list-users -- --limit 10

# JSON格式，限制20个用户
npm run list-users -- --format json --limit 20
```

#### 表格格式输出示例

```bash
👥 用户列表:
================================================================================
ID           | 邮箱                      | 昵称           | 记录数 | 创建时间          
--------------------------------------------------------------------------------
123e4567-e89 | test@example.com          | 测试用户        |     25 | 2025-01-20 10:30
234f5678-f90 | user2@example.com         | 用户2           |     10 | 2025-01-19 15:45
================================================================================
总计: 2 个用户
```

#### JSON 格式输出示例

```json
{
  "success": true,
  "message": "找到 2 个用户",
  "users": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "test@example.com",
      "name": "测试用户",
      "createdAt": "2025-01-20T10:30:00.000Z",
      "recordsCount": 25,
      "lastLogin": "2025-01-20T10:35:00.000Z"
    },
    {
      "id": "234f5678-f90b-23e4-b567-537715285111",
      "email": "user2@example.com",
      "name": "用户2",
      "createdAt": "2025-01-19T15:45:00.000Z",
      "recordsCount": 10,
      "lastLogin": "2025-01-19T16:00:00.000Z"
    }
  ]
}
```

---

## 技术细节

### 依赖关系

所有脚本都依赖以下核心模块：
- `prisma`: 数据库 ORM 客户端（来自 `lib/db`）
- `auth`: better-auth 配置（来自 `lib/auth`）

### 数据库操作

每个脚本都遵循以下最佳实践：
- 使用 `try-catch` 块捕获和处理错误
- 在 `finally` 块中调用 `prisma.$disconnect()` 确保连接关闭
- 提供清晰的错误消息和成功/失败状态

### 用户查找策略

脚本支持两种用户查找方式：
1. **通过邮箱**：`WHERE email = 'user@example.com'`
2. **通过ID**：`WHERE id = 'uuid'`

两者只能使用其中一种，脚本会自动验证参数。

---

## 常见问题

### Q: 如何查看所有可用的脚本？
A: 运行任何脚本时使用 `--help` 或 `-h` 参数可以查看帮助信息。

### Q: 脚本执行失败怎么办？
A: 脚本会显示详细的错误信息，包括：
- 参数验证错误
- 用户不存在
- 数据库连接错误
- 权限问题

### Q: 删除用户可以恢复吗？
A: 不可以。删除操作是永久性的，建议在删除前使用 `list-users` 脚本确认用户信息。

### Q: 生成的随机密码安全性如何？
A: 生成的密码为10位，包含大小写字母和数字（排除易混淆字符如 I、l、1、O、0）。

### Q: JSON 格式的输出可以用于哪些场景？
A: JSON 格式输出适合：
- 日志分析和数据处理
- 集成到自动化脚本
- 导出用户数据
- API 调用返回值

---

## 脚本开发规范

### 新增脚本时的注意事项

1. **Shebang**: 始终使用 `#!/usr/bin/env node`
2. **参数解析**: 使用统一的参数解析模式
3. **错误处理**: 提供清晰的错误消息
4. **帮助信息**: 始终包含 `--help` 参数
5. **退出码**: 成功时使用 `0`，失败时使用 `1`
6. **类型定义**: 为所有函数和参数定义 TypeScript 接口
7. **数据库连接**: 确保在 finally 块中关闭连接

### 代码结构模板

```typescript
#!/usr/bin/env node

import { prisma } from "../lib/db";

interface Options {
  // 定义参数接口
}

interface Result {
  success: boolean;
  message: string;
  // 其他返回字段
}

async function mainFunction(options: Options): Promise<Result> {
  try {
    // 实现逻辑
    return { success: true, message: "成功" };
  } catch (error) {
    console.error("错误:", error);
    return { 
      success: false, 
      message: `失败: ${error instanceof Error ? error.message : "未知错误"}` 
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options: Options = {};
  
  // 解析参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--help':
      case '-h':
        console.log(`帮助信息...`);
        process.exit(0);
        break;
    }
  }
  
  const result = await mainFunction(options);
  
  if (result.success) {
    console.log(`✅ ${result.message}`);
    process.exit(0);
  } else {
    console.log(`❌ ${result.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

---

## 维护日志

- **2025-01-25**: 创建初始文档，包含三个核心脚本的完整说明

---

## 联系与支持

如有问题或需要添加新脚本，请参考本目录的开发规范，或联系开发团队。
