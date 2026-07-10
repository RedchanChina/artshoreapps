"use server";

import { prisma } from "@/lib/db/prisma";
import type { FramingOption, LocalizedText } from "@/data/types";
import { getCartId, readCartId } from "./cookie";
import {
  getCartItems,
  setCartItem,
  removeCartItem,
  hasCartItem,
  getCartCount as getCartCountRepo,
} from "./repository";
import {
  lockEditionNumber,
  releaseEditionNumber,
  checkAndReleaseExpired,
  computeExpiresAt,
} from "./locking";
import type { AddItemResult, CartItem } from "./types";

/** 将 DB framingType 映射为 FramingOption */
function toFramingOption(framingType: string): FramingOption | undefined {
  switch (framingType) {
    case "tote_bag":
      return "bag";
    case "aluminum_frame":
      return "aluminum-frame";
    default:
      return undefined;
  }
}

/**
 * 加购：锁定版号并写入购物车。
 * - 若 itemId 已存在返回 ALREADY_IN_CART
 * - 若无可用版号返回 SOLD_OUT
 */
export async function addItem(
  workSlug: string,
  tierId: string,
): Promise<AddItemResult> {
  try {
    const cartId = await getCartId();
    const itemId = `${workSlug}:${tierId}`;

    // 1. 检查是否已在购物车
    if (await hasCartItem(cartId, itemId)) {
      return { success: false, error: "ALREADY_IN_CART" };
    }

    // 2. 查询 EditionTier（含 Work 关联，获取 title/artistName/thumbnail）
    const tier = await prisma.editionTier.findUnique({
      where: { id: tierId },
      include: {
        work: {
          select: { slug: true, title: true, artistName: true, mainImage: true },
        },
      },
    });
    if (!tier || !tier.work || tier.work.slug !== workSlug) {
      return { success: false, error: "UNKNOWN_ERROR" };
    }

    // 3. 锁定版号
    const lock = await lockEditionNumber(tierId, cartId);
    if (
      !lock.success ||
      lock.editionNumber == null ||
      lock.lockedPriceCNY == null ||
      lock.lockedPriceUSD == null
    ) {
      return { success: false, error: "SOLD_OUT" };
    }

    // 4. 构建 CartItem 并写入 Redis
    const now = new Date();
    const cartItem: CartItem = {
      itemId,
      workSlug,
      tierId,
      title: tier.work.title as LocalizedText,
      artistName: tier.work.artistName as LocalizedText,
      tierLabel: tier.tierLabel as LocalizedText,
      framingOption: toFramingOption(tier.framingType),
      framingLabel: tier.framingLabel as LocalizedText,
      editionNumber: lock.editionNumber,
      lockedPriceCNY: lock.lockedPriceCNY,
      lockedPriceUSD: lock.lockedPriceUSD,
      thumbnail: tier.work.mainImage,
      lockedAt: now.toISOString(),
      expiresAt: computeExpiresAt(now),
    };

    await setCartItem(cartId, cartItem);
    return { success: true, cartItem };
  } catch {
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}

/**
 * 移除购物车项：释放版号并从 Redis 删除。
 */
export async function removeItem(
  itemId: string,
): Promise<{ success: boolean }> {
  const cartId = await getCartId();
  const items = await getCartItems(cartId);
  const target = items.find((i) => i.itemId === itemId);
  if (target) {
    await releaseEditionNumber(target.tierId, target.editionNumber, cartId);
    await removeCartItem(cartId, itemId);
  }
  return { success: true };
}

/**
 * 获取购物车：懒删除过期项后返回剩余项。
 * 使用只读 cartId（Server Component 可安全调用，无 cookie 时返回空数组）。
 */
export async function getCart(): Promise<CartItem[]> {
  const cartId = await readCartId();
  if (!cartId) return [];
  await checkAndReleaseExpired(cartId);
  return await getCartItems(cartId);
}

/**
 * 获取购物车项数量。
 * 使用只读 cartId（Server Component 可安全调用，无 cookie 时返回 0）。
 */
export async function getCartCount(): Promise<number> {
  const cartId = await readCartId();
  if (!cartId) return 0;
  return await getCartCountRepo(cartId);
}
