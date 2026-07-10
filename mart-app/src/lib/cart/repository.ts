import { redis } from "@/lib/db/redis";
import type { CartItem } from "./types";

const CART_PREFIX = "cart:";

function cartKey(cartId: string): string {
  return `${CART_PREFIX}${cartId}`;
}

/** 读取购物车所有项 */
export async function getCartItems(cartId: string): Promise<CartItem[]> {
  const raw = await redis.hgetall(cartKey(cartId));
  return Object.values(raw).map((v) => JSON.parse(v as string) as CartItem);
}

/** 添加/更新购物车项 */
export async function setCartItem(cartId: string, item: CartItem): Promise<void> {
  await redis.hset(cartKey(cartId), item.itemId, JSON.stringify(item));
}

/** 移除购物车项 */
export async function removeCartItem(cartId: string, itemId: string): Promise<void> {
  await redis.hdel(cartKey(cartId), itemId);
}

/** 获取购物车项数量 */
export async function getCartCount(cartId: string): Promise<number> {
  return await redis.hlen(cartKey(cartId));
}

/** 检查 itemId 是否已存在 */
export async function hasCartItem(cartId: string, itemId: string): Promise<boolean> {
  const exists = await redis.hexists(cartKey(cartId), itemId);
  return exists === 1;
}

/** 清空购物车 */
export async function clearCart(cartId: string): Promise<void> {
  await redis.del(cartKey(cartId));
}
