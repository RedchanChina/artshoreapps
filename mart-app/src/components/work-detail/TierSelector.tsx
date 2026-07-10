"use client";

/**
 * 尺寸档位选择器（work-detail 6.1）。
 *
 * 桌面端 4 卡片横向（grid-cols-4），移动端单列垂直堆叠条状。
 * 每个档位：档位名 + 物理尺寸（不显示价格）。
 * 售罄档位灰显且不可选，桌面端卡片底部显示 Sold Out。
 *
 * 已渲染标题（tier.label），由组件自身控制。
 *
 * Client Component。
 */
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { EditionTier } from "@/data/types";
import { cn } from "@/lib/utils";

interface TierSelectorProps {
  tiers: EditionTier[];
  selectedTierId: string;
  onChange: (tierId: string) => void;
  locale: "zh" | "en";
}

export function TierSelector({
  tiers,
  selectedTierId,
  onChange,
  locale,
}: TierSelectorProps) {
  const t = useTranslations("workDetail");

  return (
    <div>
      <p className="mb-3 text-[12px] uppercase tracking-[0.1em] text-gray-500">
        {t("tier.label")}
      </p>

      {/* 移动端：垂直堆叠条状 */}
      <div className="flex flex-col gap-3 sm:hidden">
        {tiers.map((tier) => {
          const soldOut = tier.status === "sold_out";
          const selected = tier.id === selectedTierId;
          return (
            <button
              key={tier.id}
              type="button"
              disabled={soldOut}
              onClick={() => { if (!soldOut) onChange(tier.id); }}
              className={cn(
                "relative border border-solid px-5 py-2 text-left transition-colors duration-200 ease-mart",
                selected && !soldOut
                  ? "border-ink bg-ink text-paper"
                  : "border-ink bg-paper text-ink",
                soldOut && "cursor-not-allowed opacity-50"
              )}
            >
              {selected && !soldOut && (
                <Check size={16} strokeWidth={2} className="absolute right-3 top-2 text-paper" />
              )}
              <div className="flex items-baseline gap-4">
                <span className="text-[13px] font-medium">
                  {tier.tierLabel[locale]}
                </span>
                <span className="text-[12px] opacity-70">
                  {soldOut ? t("buttons.soldOut") : tier.physicalSize}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 桌面端：4 列卡片 */}
      <div className="hidden gap-3 sm:grid sm:grid-cols-4">
        {tiers.map((tier) => {
          const soldOut = tier.status === "sold_out";
          const selected = tier.id === selectedTierId;
          return (
            <button
              key={tier.id}
              type="button"
              disabled={soldOut}
              onClick={() => { if (!soldOut) onChange(tier.id); }}
              className={cn(
                "relative border border-solid px-5 py-4 text-left transition-colors duration-200 ease-mart",
                selected && !soldOut
                  ? "border-ink bg-ink text-paper"
                  : "border-ink bg-paper text-ink",
                soldOut && "cursor-not-allowed opacity-50"
              )}
            >
              {selected && !soldOut && (
                <Check size={16} strokeWidth={2} className="absolute right-3 top-3 text-paper" />
              )}
              <div className="text-[13px] font-medium">
                {tier.tierLabel[locale]}
              </div>
              <div className="mt-1 text-[12px] opacity-70">
                {tier.physicalSize}
              </div>
              {soldOut && (
                <div className="mt-2 text-[12px] tabular-nums">
                  {t("buttons.soldOut")}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TierSelector;
