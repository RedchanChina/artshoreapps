"use client";

/**
 * 配送方式列表（Phase 2 Task 4.4）。
 *
 * 每项展示物流商名称 + 时效 + 费用。巨幅（pendingConfirmation=true）
 * 显示「运费待确认」。选中项 border-ink 高亮，默认 border-line。
 *
 * Client Component（需 useTranslations + formatPrice）。
 */
import { useTranslations } from "next-intl";
import type { Currency } from "@/data/types";
import type { ShippingOption } from "@/lib/checkout/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ShippingOptionsProps {
  options: ShippingOption[];
  selectedMethodCode: string | null;
  supported: boolean;
  hasCountry: boolean;
  loading?: boolean;
  currency: Currency;
  locale: "zh" | "en";
  onSelect: (methodCode: string) => void;
}

export function ShippingOptions({
  options,
  selectedMethodCode,
  supported,
  hasCountry,
  loading = false,
  currency,
  locale,
  onSelect,
}: ShippingOptionsProps) {
  const t = useTranslations("checkout.shippingOptions");

  return (
    <section>
      <h2 className="mb-6 flex items-center gap-2 text-[15px] font-medium text-ink">
        {t("title")}
        {loading && (
          <span
            className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-[1.5px] border-gray-300 border-t-ink"
            aria-hidden="true"
          />
        )}
      </h2>

      {!hasCountry ? (
        <p className="text-[14px] text-gray-500">{t("selectCountry")}</p>
      ) : loading ? (
        <p className="text-[14px] text-gray-500">{t("loading")}</p>
      ) : !supported ? (
        <p className="text-[14px] text-danger">{t("unsupported")}</p>
      ) : options.length === 0 ? (
        <p className="text-[14px] text-gray-500">{t("selectCountry")}</p>
      ) : (
        <div className="space-y-3">
          {options.map((option) => {
            const selected = option.methodCode === selectedMethodCode;
            const fee =
              currency === "CNY" ? option.feeCNY : option.feeUSD;
            return (
              <button
                key={option.methodCode}
                type="button"
                onClick={() => onSelect(option.methodCode)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center justify-between border-2 px-4 py-3 text-left transition-colors duration-200 ease-mart",
                  selected
                    ? "border-ink bg-gray-100/50"
                    : "border-line hover:border-ink/50",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] text-ink">
                    {option.name[locale]}
                  </p>
                  <p className="mt-1 text-[12px] text-gray-500">
                    {t("estimatedDays", { days: option.estimatedDays })}
                  </p>
                </div>
                <div className="ml-4 flex flex-shrink-0 items-center gap-3">
                  {option.pendingConfirmation ? (
                    <span className="text-[13px] text-[#4A7C59]">
                      {t("pendingConfirmation")}
                    </span>
                  ) : (
                    <span className="text-[15px] tabular-nums text-ink">
                      {formatPrice(fee, currency)}
                    </span>
                  )}
                  {/* 选中标识：实心圆点 */}
                  <span
                    className={cn(
                      "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                      selected
                        ? "border-ink bg-ink"
                        : "border-gray-300 bg-paper",
                    )}
                    aria-hidden="true"
                  >
                    {selected && (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-[10px] w-[10px]"
                        fill="none"
                        stroke="#FAFAF7"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2.5 6L5 8.5L9.5 3.5" />
                      </svg>
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ShippingOptions;
