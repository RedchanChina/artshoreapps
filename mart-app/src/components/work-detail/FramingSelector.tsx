"use client";

/**
 * 装裱方式选择器（work-detail 6.2）。
 *
 * 仅在选中档位为 small 时由父组件渲染。两个选项横向排列：
 * 手拎袋版（bag）/ 铝框版（aluminum-frame）。
 * 铝框版附加 +fee（framingFeeCNY / framingFeeUSD）。
 *
 * Client Component。
 */
import { useTranslations } from "next-intl";
import type { Currency, EditionTier, FramingOption } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface FramingSelectorProps {
  /** 当前选中的 tier（父组件仅当 tier.tierName === "small" 时渲染） */
  tier: EditionTier;
  selectedFraming: FramingOption;
  onChange: (framing: FramingOption) => void;
  currency: Currency;
}

interface FramingOptionItem {
  value: FramingOption;
  label: string;
  feeLabel?: string;
}

export function FramingSelector({
  tier,
  selectedFraming,
  onChange,
  currency,
}: FramingSelectorProps) {
  const t = useTranslations("workDetail.framing");
  const fee = currency === "CNY" ? tier.framingFeeCNY : tier.framingFeeUSD;

  const options: FramingOptionItem[] = [
    { value: "bag", label: t("bag") },
    {
      value: "aluminum-frame",
      label: t("aluminum"),
      feeLabel: fee > 0 ? `+${formatPrice(fee, currency)}` : undefined,
    },
  ];

  return (
    <div>
      <p className="mb-3 text-[12px] uppercase tracking-[0.1em] text-gray-500">
        {t("label")}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const selected = option.value === selectedFraming;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "relative border border-solid px-5 py-2 text-left transition-colors duration-200 ease-mart",
                selected
                  ? "border-ink bg-ink text-paper"
                  : "border-ink bg-paper text-ink"
              )}
            >
              {selected && (
                <Check size={16} strokeWidth={2} className="absolute right-3 top-2 text-paper" />
              )}
              <div className="text-[13px] font-medium">
                {option.label}
              </div>
              {option.feeLabel && (
                <div className="mt-1 text-[12px] tabular-nums opacity-70">
                  {option.feeLabel}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FramingSelector;
