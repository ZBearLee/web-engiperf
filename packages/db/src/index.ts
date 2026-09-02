import { PrismaClient } from '@prisma/client';

// globalThis 单例：防止开发模式热重载时重复创建连接池导致连接泄漏
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 统一转发 Prisma Client 的类型和构造器，消费方只需 import '@web-engiperf/db'
export * from '@prisma/client';