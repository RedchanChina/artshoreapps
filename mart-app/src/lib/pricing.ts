/**
 * M·art 艺术商店阶梯定价纯函数（PRD 8.3）。
 *
 * 默认参数：frequency = 5（每售出 5 版涨一次价），increment = 8（每档涨幅 8%）。
 * 所有函数均为纯函数，无副作用，可直接用于 Server / Client。
 */

import type { TierName } from "@/data/types";

/**
 * 阶梯定价引擎（PRD 8.3）。
 * - tier = floor(onlineSoldCount / frequency)
 * - currentPrice = basePrice × (1 + increment / 100) ^ tier
 * - 保留两位小数
 */
export function computeTieredPrice(
  basePrice: number,
  onlineSoldCount: number,
  frequency: number = 5,
  increment: number = 8
): number {
  const tier = Math.floor(onlineSoldCount / frequency);
  const multiplier = Math.pow(1 + increment / 100, tier);
  return Math.round(basePrice * multiplier * 100) / 100;
}

/**
 * 计算下一档价格。
 * 即当前档位 + 1 后的价格：basePrice × (1 + increment / 100) ^ (tier + 1)。
 * 保留两位小数。
 */
export function computeNextTierPrice(
  basePrice: number,
  onlineSoldCount: number,
  frequency: number = 5,
  increment: number = 8
): number {
  const tier = Math.floor(onlineSoldCount / frequency);
  const nextTier = tier + 1;
  const multiplier = Math.pow(1 + increment / 100, nextTier);
  return Math.round(basePrice * multiplier * 100) / 100;
}

/**
 * 计算距离下次涨价还需售出的版数。
 * = (currentTier + 1) × frequency - onlineSoldCount
 */
export function computeEditionsUntilNextTier(
  onlineSoldCount: number,
  frequency: number = 5
): number {
  const currentTier = Math.floor(onlineSoldCount / frequency);
  return (currentTier + 1) * frequency - onlineSoldCount;
}
