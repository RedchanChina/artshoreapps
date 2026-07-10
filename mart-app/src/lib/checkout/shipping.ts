import type { CartItem } from "@/lib/cart/types";
import type { ShippingOption, ShippingCalculationResult } from "./types";
import {
  getRegionByCountryCode,
  getShippingMethodsByRegionCode,
  getAllTierCoefficients,
} from "./repository";
import type { LocalizedText } from "@/data/types";

/**
 * 运费计算引擎。
 * 运费 = baseFee × 最大尺寸系数 × 地区系数 + 其余件数 × 0.5 × baseFee
 * 巨幅（xlarge）→ pendingConfirmation = true
 */
export async function calculateShippingOptions(
  countryCode: string,
  items: CartItem[],
): Promise<ShippingCalculationResult> {
  // 1. 读取地区配置
  const region = await getRegionByCountryCode(countryCode);
  if (!region || !region.supported) {
    return {
      options: [],
      duty: { rate: 0, amountCNY: 0, amountUSD: 0, exempt: true },
      supported: false,
      reason: "UNSUPPORTED_REGION",
      subtotalCNY: 0,
      subtotalUSD: 0,
    };
  }

  // 2. 读取可用物流方案
  const methods = await getShippingMethodsByRegionCode(region.regionCode);
  if (methods.length === 0) {
    return {
      options: [],
      duty: { rate: 0, amountCNY: 0, amountUSD: 0, exempt: true },
      supported: false,
      reason: "NO_SHIPPING_METHOD",
      subtotalCNY: 0,
      subtotalUSD: 0,
    };
  }

  // 3. 读取尺寸系数
  const tierCoeffs = await getAllTierCoefficients();

  // 4. 从 cartItems 提取 tierName（需要从 tierId 反查，或直接从 CartItem 推断）
  // 注意：CartItem 不含 tierName，但 tierId 可以用于查询
  // 简化方案：从 tierLabel 推断，或直接查询 DB
  // 更好方案：在 CartItem 中添加 tierName 字段
  // 临时方案：查询 EditionTier 获取 tierName
  const { prisma } = await import("@/lib/db/prisma");
  const tierIds = items.map((i) => i.tierId);
  const tiers = await prisma.editionTier.findMany({
    where: { id: { in: tierIds } },
    select: { id: true, tierName: true },
  });
  const tierNameMap = new Map(tiers.map((t) => [t.id, t.tierName]));

  // 5. 计算每个 cartItem 的尺寸系数
  const itemCoeffs = items.map((item) => {
    const tierName = tierNameMap.get(item.tierId) ?? "small";
    return tierCoeffs.get(tierName) ?? 1.0;
  });

  // 6. 判断是否含巨幅
  const hasXlarge = items.some((item) => {
    const tierName = tierNameMap.get(item.tierId) ?? "small";
    return tierName === "xlarge";
  });

  // 7. 计算每个物流方案的运费
  const options: ShippingOption[] = methods.map((method) => {
    if (hasXlarge) {
      // 巨幅运费待确认
      return {
        methodCode: method.code,
        name: method.name as LocalizedText,
        estimatedDays: method.estimatedDays,
        feeCNY: 0,
        feeUSD: 0,
        pendingConfirmation: true,
      };
    }

    // 运费 = baseFee × 最大尺寸系数 × 地区系数 + 其余件数 × 0.5 × baseFee
    const maxCoeff = Math.max(...itemCoeffs);
    const restCount = items.length - 1;
    const baseFeeCNY = method.baseFeeCNY;
    const baseFeeUSD = method.baseFeeUSD;

    const feeCNY = Math.round(
      baseFeeCNY * maxCoeff * region.regionCoefficient +
        restCount * 0.5 * baseFeeCNY,
    );
    const feeUSD = Math.round(
      baseFeeUSD * maxCoeff * region.regionCoefficient +
        restCount * 0.5 * baseFeeUSD,
    );

    return {
      methodCode: method.code,
      name: method.name as LocalizedText,
      estimatedDays: method.estimatedDays,
      feeCNY,
      feeUSD,
      pendingConfirmation: false,
    };
  });

  return {
    options,
    duty: { rate: 0, amountCNY: 0, amountUSD: 0, exempt: true }, // duty 在 actions 中单独计算
    supported: true,
    subtotalCNY: 0, // 由 actions.ts 填充
    subtotalUSD: 0,
  };
}
