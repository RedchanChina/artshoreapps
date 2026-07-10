import type { FramingOption, LocalizedText } from "@/data/types";

/** 购物车项（存储在 Redis Hash 中） */
export interface CartItem {
  /** itemId = `{workSlug}:{tierId}` */
  itemId: string;
  workSlug: string;
  tierId: string;
  title: LocalizedText;
  artistName: LocalizedText;
  tierLabel: LocalizedText;
  framingOption?: FramingOption;
  framingLabel?: LocalizedText;
  /** 锁定的版号编号 */
  editionNumber: number;
  /** 锁定价格（加购时的阶梯价格快照） */
  lockedPriceCNY: number;
  lockedPriceUSD: number;
  thumbnail: string;
  /** 锁定时间（ISO 字符串） */
  lockedAt: string;
  /** 过期时间（ISO 字符串，lockedAt + 15min） */
  expiresAt: string;
}

/** 加购结果 */
export interface AddItemResult {
  success: boolean;
  error?: "SOLD_OUT" | "ALREADY_IN_CART" | "UNKNOWN_ERROR";
  cartItem?: CartItem;
}

/** 锁定有效期（毫秒） */
export const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 分钟

/** 判断购物车项是否已过期（超过锁价有效期） */
export function isExpired(item: CartItem): boolean {
  return new Date(item.expiresAt).getTime() < Date.now();
}
