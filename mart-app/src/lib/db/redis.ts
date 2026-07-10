/**
 * M·art 艺术商店 Redis client 单例。
 *
 * 使用 ioredis 连接 Redis，为 Phase 3.2 购物车锁价做准备。
 * 在开发环境下将 client 挂载到 globalThis，复用单例。
 */
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
