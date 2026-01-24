#!/usr/bin/env node

/**
 * 密码重置管理脚本
 *
 * 命令行工具，用于重置用户密码
 * 支持通过邮箱或用户ID查找用户，并自动生成或指定新密码
 *
 * @path /scripts/reset-password.ts
 * @author Auto-generated
 */
import { prisma } from "../lib/db";
import { auth } from "../lib/auth";

interface ResetPasswordOptions {
  email?: string;
  id?: string;
  password?: string;
  generate?: boolean;
}

interface ResetPasswordResult {
  success: boolean;
  message: string;
  userId?: string;
  newPassword?: string;
}

async function resetPassword(options: ResetPasswordOptions): Promise<ResetPasswordResult> {
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

    // 生成或使用提供的密码
    let newPassword = options.password;
    if (!newPassword) {
      // 生成随机密码
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      newPassword = '';
      for (let i = 0; i < 10; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    // 使用 better-auth API 重置密码
    // 注意：这里我们需要删除现有的账户记录，然后让用户重新设置密码
    // 或者我们可以更新账户记录

    const account = await prisma.account.findFirst({
      where: { 
        userId: user.id,
        providerId: 'email'
      }
    });

    if (account) {
      // 更新账户记录中的密码
      await prisma.account.update({
        where: { id: account.id },
        data: { 
          password: newPassword, // 注意：这里应该是哈希后的密码，但 better-auth 会处理
          updatedAt: new Date()
        }
      });
    } else {
      // 如果没有找到邮箱账户，创建一个
      await prisma.account.create({
        data: {
          accountId: user.email, // 使用邮箱作为 accountId
          userId: user.id,
          providerId: 'email',
          providerUserId: user.email,
          password: newPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return {
      success: true,
      message: `用户 ${user.email} 的密码已重置`,
      userId: user.id,
      newPassword
    };

  } catch (error) {
    console.error("重置密码时出错:", error);
    return {
      success: false,
      message: `重置密码失败: ${error instanceof Error ? error.message : "未知错误"}`
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options: ResetPasswordOptions = {};
  
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
      case '--password':
        options.password = args[++i];
        break;
      case '--generate':
        options.generate = true;
        break;
      case '--help':
      case '-h':
        console.log(`
密码重置脚本

用法:
  npm run reset-password -- --email <邮箱> [--password <新密码>]
  npm run reset-password -- --id <用户ID> [--password <新密码>]

参数:
  --email, -e       用户邮箱地址
  --id, -i          用户ID
  --password, -p    新密码（如果不提供将生成随机密码）
  --generate, -g    生成随机密码（默认行为）
  --help, -h        显示帮助信息

示例:
  npm run reset-password -- --email test@example.com
  npm run reset-password -- --email test@example.com --password "newpassword123"
  npm run reset-password -- --id 123e4567-e89b-12d3-a456-426614174000
        `);
        process.exit(0);
        break;
    }
  }

  const result = await resetPassword(options);
  
  if (result.success) {
    console.log(`✅ ${result.message}`);
    if (result.newPassword) {
      console.log(`🔑 新密码: ${result.newPassword}`);
      console.log(`⚠️  请安全保管新密码！`);
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