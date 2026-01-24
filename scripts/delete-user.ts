#!/usr/bin/env node

import { prisma } from "../lib/db";
import { auth } from "../lib/auth";

interface DeleteUserOptions {
  email?: string;
  id?: string;
  force?: boolean;
}

interface DeleteUserResult {
  success: boolean;
  message: string;
  userId?: string;
  recordsDeleted?: number;
}

async function deleteUser(options: DeleteUserOptions): Promise<DeleteUserResult> {
  try {
    // 验证参数
    if (!options.email && !options.id) {
      return {
        success: false,
        message: "请提供用户邮箱或ID。使用 --email <邮箱> 或 --id <用户ID>"
      };
    }

    // 查找用户
    let user;
    if (options.email) {
      user = await prisma.user.findUnique({
        where: { email: options.email }
      });
    } else if (options.id) {
      user = await prisma.user.findUnique({
        where: { id: options.id }
      });
    }

    if (!user) {
      return {
        success: false,
        message: "用户不存在"
      };
    }

    console.log(`找到用户: ${user.email} (${user.id})`);

    // 获取用户的记录数量
    const recordsCount = await prisma.record.count({
      where: { userId: user.id }
    });

    if (recordsCount > 0 && !options.force) {
      return {
        success: false,
        message: `用户有 ${recordsCount} 条记录。使用 --force 强制删除。`
      };
    }

    // 删除记录
    const deletedRecords = await prisma.record.deleteMany({
      where: { userId: user.id }
    });

    // 删除用户
    await prisma.user.delete({
      where: { id: user.id }
    });

    return {
      success: true,
      message: `用户 ${user.email} 已成功删除`,
      userId: user.id,
      recordsDeleted: deletedRecords.count
    };

  } catch (error) {
    console.error("删除用户时出错:", error);
    return {
      success: false,
      message: `删除用户失败: ${error instanceof Error ? error.message : "未知错误"}`
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options: DeleteUserOptions = {};
  
  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--email':
        options.email = args[++i];
        break;
      case '--id':
        options.id = args[++i];
        break;
      case '--force':
        options.force = true;
        break;
      case '--help':
      case '-h':
        console.log(`
用户删除脚本

用法:
  npm run delete-user -- --email <邮箱> [--force]
  npm run delete-user -- --id <用户ID> [--force]

参数:
  --email, -e     用户邮箱地址
  --id, -i        用户ID
  --force, -f     强制删除（有记录的用户）
  --help, -h      显示帮助信息

示例:
  npm run delete-user -- --email test@example.com
  npm run delete-user -- --id 123e4567-e89b-12d3-a456-426614174000 --force
        `);
        process.exit(0);
        break;
    }
  }

  const result = await deleteUser(options);
  
  if (result.success) {
    console.log(`✅ ${result.message}`);
    if (result.recordsDeleted !== undefined) {
      console.log(`📊 删除了 ${result.recordsDeleted} 条记录`);
    }
    process.exit(0);
  } else {
    console.log(`❌ ${result.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}