/**
 * 阶梯定价区（work-detail 6.4）。
 *
 * 展示当前阶梯价格（大字）、下一档价格、涨价规则；
 * 当距离下次涨价 ≤ 5 版时显示紧迫提示（text-danger）。
 *
 * Client Component（由 WorkDetailClient 渲染），调用 @/lib/pricing 纯函数计算阶梯价。
 */
import { useTranslations } from "next-intl";
import type { Currency, EditionTier, FramingOption } from "@/data/types";
import {
  computeEditionsUntilNextTier,
  computeNextTierPrice,
  computeTieredPrice,
} from "@/lib/pricing";
import { formatPrice } from "@/lib/format";

interface TieredPricingProps {
  tier: EditionTier;
  currency: Currency;
  selectedFraming?: FramingOption;
}

export function TieredPricing({ tier, currency, selectedFraming }: TieredPricingProps) {
  const t = useTranslations("workDetail.tieredPricing");
  const basePrice = currency === "CNY" ? tier.basePriceCNY : tier.basePriceUSD;

  // 装裱费（仅 small 档 + 铝框版时计算）
  const framingFee =
    selectedFraming === "aluminum-frame" && tier.tierName === "small"
      ? currency === "CNY"
        ? tier.framingFeeCNY
        : tier.framingFeeUSD
      : 0;

  const currentPrice = computeTieredPrice(basePrice, tier.onlineSoldCount) + framingFee;
  const nextPrice = computeNextTierPrice(basePrice, tier.onlineSoldCount) + framingFee;
  const editionsUntilNextTier = computeEditionsUntilNextTier(tier.onlineSoldCount);
  const urgent = editionsUntilNextTier <= 5;

  return (
    <div className="bg-gray-100 p-6">
      <div className="text-[28px] font-medium tabular-nums text-ink">
        <span className="sr-only">{t("currentPrice")}: </span>
        {formatPrice(currentPrice, currency)}
      </div>
      <div className="mt-1 text-[14px] text-gray-500">
        {t("nextTierPrice")} {formatPrice(nextPrice, currency)}
      </div>
      <div className="mt-2 text-[12px] text-gray-500">{t("rule")}</div>
      {urgent && (
        <div className="mt-2 text-[12px] text-danger">
          {t("raiseAfter", {
            n: editionsUntilNextTier,
            price: formatPrice(nextPrice, currency),
          })}
        </div>
      )}
    </div>
  );
}

export default TieredPricing;
