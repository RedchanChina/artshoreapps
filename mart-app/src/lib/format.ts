/**
 * M·art 艺术商店价格与版数进度格式化工具。
 *
 * - CNY：¥1,280（千分位逗号，无小数）
 * - USD：$95.99（千分位逗号，两位小数）
 */

import type { Currency } from "@/data/types";

/**
 * 价格格式化。
 * - CNY: ¥1,280（千分位逗号无小数）
 * - USD: $95.99（两位小数）
 */
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "CNY") {
    const formatted = Math.round(amount).toLocaleString("en-US");
    return `¥${formatted}`;
  }
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${formatted}`;
}


