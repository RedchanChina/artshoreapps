import { prisma } from "@/lib/db/prisma";
import { computeTieredPrice } from "@/lib/pricing";
import { getCartItems, removeCartItem } from "./repository";
import { LOCK_DURATION_MS } from "./types";

type LockResult = {
  success: boolean;
  editionNumber?: number;
  lockedPriceCNY?: number;
  lockedPriceUSD?: number;
};

/**
 * 锁定版号：从线上版号池取最小可用编号，标记为 locked，记录锁定价格。
 * 使用 Prisma 事务保证原子性（乐观锁：WHERE status='available'）。
 */
export async function lockEditionNumber(
  tierId: string,
  cartId: string,
): Promise<LockResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 查询 EditionTier（含 basePriceCNY/USD + onlineSoldCount）
      const tier = await tx.editionTier.findUnique({
        where: { id: tierId },
        select: { basePriceCNY: true, basePriceUSD: true, onlineSoldCount: true },
      });
      if (!tier) throw new Error("TIER_NOT_FOUND");

      // 查找最小可用版号
      const editionNumber = await tx.editionNumber.findFirst({
        where: { tierId, status: "available", channel: "online" },
        orderBy: { number: "asc" },
      });
      if (!editionNumber) throw new Error("SOLD_OUT");

      // 尝试更新（乐观锁：WHERE status='available'）
      const updated = await tx.editionNumber.updateMany({
        where: { id: editionNumber.id, status: "available" },
        data: { status: "locked", lockedAt: new Date(), lockedByCartId: cartId },
      });
      if (updated.count === 0) throw new Error("CONFLICT");

      // 计算 lockedPrice = computeTieredPrice(basePrice, onlineSoldCount)
      const lockedPriceCNY = computeTieredPrice(
        tier.basePriceCNY,
        tier.onlineSoldCount,
      );
      const lockedPriceUSD = computeTieredPrice(
        tier.basePriceUSD,
        tier.onlineSoldCount,
      );

      return {
        editionNumber: editionNumber.number,
        lockedPriceCNY,
        lockedPriceUSD,
      };
    });

    return { success: true, ...result };
  } catch (err) {
    // SOLD_OUT / CONFLICT / TIER_NOT_FOUND 等均视为加购失败
    return { success: false };
  }
}

/**
 * 释放版号：将锁定状态恢复为 available。
 * 仅当 lockedByCartId 匹配且状态为 locked 时才释放，避免误释放他人锁定的版号。
 */
export async function releaseEditionNumber(
  tierId: string,
  editionNumber: number,
  cartId: string,
): Promise<void> {
  await prisma.editionNumber.updateMany({
    where: {
      tierId,
      number: editionNumber,
      channel: "online",
      lockedByCartId: cartId,
      status: "locked",
    },
    data: { status: "available", lockedAt: null, lockedByCartId: null },
  });
}

/**
 * 懒删除：检查购物车中各项的 expiresAt，过期则释放版号并移除购物车项。
 */
export async function checkAndReleaseExpired(cartId: string): Promise<void> {
  const items = await getCartItems(cartId);
  const now = Date.now();
  for (const item of items) {
    if (new Date(item.expiresAt).getTime() < now) {
      await releaseEditionNumber(item.tierId, item.editionNumber, cartId);
      await removeCartItem(cartId, item.itemId);
    }
  }
}

/** 计算过期时间（ISO 字符串） */
export function computeExpiresAt(lockedAt: Date): string {
  return new Date(lockedAt.getTime() + LOCK_DURATION_MS).toISOString();
}
