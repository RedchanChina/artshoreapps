"use server";

import { getCart } from "@/lib/cart/actions";
import { getSupportedCountries } from "./repository";
import { calculateShippingOptions } from "./shipping";
import { calculateDuty } from "./duty";
import type {
  ShippingCalculationResult,
  DutyEstimate,
  CountryOption,
} from "./types";

/**
 * 计算运费和关税 + 商品小计。
 * 一次性返回所有客户端计算摘要所需的数据，避免客户端再调用 Server Action。
 */
export async function calculateShipping(
  countryCode: string,
): Promise<ShippingCalculationResult & { duty: DutyEstimate }> {
  const items = await getCart();
  if (items.length === 0) {
    return {
      options: [],
      duty: { rate: 0, amountCNY: 0, amountUSD: 0, exempt: true },
      supported: false,
      reason: "EMPTY_CART",
      subtotalCNY: 0,
      subtotalUSD: 0,
    };
  }

  // 商品小计（锁价快照）
  const subtotalCNY = items.reduce((sum, i) => sum + i.lockedPriceCNY, 0);
  const subtotalUSD = items.reduce((sum, i) => sum + i.lockedPriceUSD, 0);

  // 计算运费
  const shippingResult = await calculateShippingOptions(countryCode, items);

  // 计算关税
  const duty = await calculateDuty(countryCode, subtotalCNY, subtotalUSD);

  // 填充 subtotal（shipping.ts 内无法访问 cartItems 价格）
  return {
    ...shippingResult,
    duty,
    subtotalCNY,
    subtotalUSD,
  };
}

/**
 * 返回 supported=true 的国家列表，供表单下拉用。
 */
export async function getCountries(): Promise<CountryOption[]> {
  return await getSupportedCountries();
}
