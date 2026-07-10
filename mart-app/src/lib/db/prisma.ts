/**
 * M·art 艺术商店 Prisma client 单例。
 *
 * 避免 Next.js 热重载时创建多个数据库连接。
 * 在开发环境下将 client 挂载到 globalThis，复用单例。
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
