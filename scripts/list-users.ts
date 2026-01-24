#!/usr/bin/env node

import { prisma } from "../lib/db";

interface ListUsersOptions {
  format?: 'table' | 'json';
  limit?: number;
}

interface ListUsersResult {
  success: boolean;
  message: string;
  users?: Array<{
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
    recordsCount: number;
    lastLogin?: Date;
  }>;
}

async function listUsers(options: ListUsersOptions): Promise<ListUsersResult> {
  try {
    const users = await prisma.user.findMany({
      include: {
        records: {
          select: {
            id: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: options.limit || 50
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      recordsCount: user.records.length,
      lastLogin: user.records.length > 0 ? user.records[0].createdAt : undefined
    }));

    if (options.format === 'json') {
      return {
        success: true,
        message: `找到 ${users.length} 个用户`,
        users: formattedUsers
      };
    }

    // 表格格式输出
    console.log('\n👥 用户列表:');
    console.log('='.repeat(80));
    console.log(`${'ID'.slice(0, 12)} | ${'邮箱'.slice(0, 25)} | ${'昵称'.slice(0, 15)} | ${'记录数'.slice(0, 6)} | ${'创建时间'.slice(0, 16)}`);
    console.log('-'.repeat(80));
    
    for (const user of formattedUsers) {
      const id = user.id.slice(0, 12);
      const email = user.email.slice(0, 25);
      const name = (user.name || '-').slice(0, 15);
      const recordsCount = user.recordsCount.toString().padStart(6, ' ');
      const createdAt = user.createdAt.toISOString().slice(0, 16).replace('T', ' ');
      
      console.log(`${id} | ${email} | ${name} | ${recordsCount} | ${createdAt}`);
    }
    
    console.log('='.repeat(80));
    console.log(`总计: ${users.length} 个用户`);

    return {
      success: true,
      message: `找到 ${users.length} 个用户`
    };

  } catch (error) {
    console.error("获取用户列表时出错:", error);
    return {
      success: false,
      message: `获取用户列表失败: ${error instanceof Error ? error.message : "未知错误"}`
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options: ListUsersOptions = {};
  
  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--format':
      case '-f':
        const format = args[++i];
        if (format === 'json' || format === 'table') {
          options.format = format;
        }
        break;
      case '--limit':
      case '-l':
        options.limit = parseInt(args[++i]) || 50;
        break;
      case '--help':
      case '-h':
        console.log(`
用户列表脚本

用法:
  npm run list-users [--format <format>] [--limit <number>]

参数:
  --format, -f     输出格式: table (默认) 或 json
  --limit, -l     限制返回用户数量 (默认: 50)
  --help, -h       显示帮助信息

示例:
  npm run list-users
  npm run list-users --format json
  npm run list-users --limit 10
        `);
        process.exit(0);
    }
  }

  const result = await listUsers(options);
  
  if (!result.success) {
    console.log(`❌ ${result.message}`);
    process.exit(1);
  }

  if (options.format === 'json' && result.users) {
    console.log(JSON.stringify(result, null, 2));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}