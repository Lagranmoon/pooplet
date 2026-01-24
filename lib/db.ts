/**
 * Prisma 数据库客户端实例
 *
 * 创建并导出 Prisma 客户端单例，用于与 PostgreSQL 数据库交互
 * 在开发环境中启用查询日志记录，生产环境中避免重复创建实例
 *
 * @path /lib/db.ts
 * @author Auto-generated
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

