"use client";

/**
 * 订单摘要（Phase 2 Task 4.6）。
 *
 * 商品列表（缩略图 + 标题 + 档位 + 版号 + 锁定价格）+ 商品小计 /
 * 运费 / 关税 / 合计 + 锁价提示 + 确认支付按钮。
 *
 * Client Component（需 useTranslations + formatPrice）。
 */
import { useTranslations } from "next-intl";
import type { Currency } from "@/data/types";
import type { CartItem } from "@/lib/cart/types";
import type { CheckoutSummary, DutyEstimate } from "@/lib/checkout/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface OrderSummaryProps {
  items: CartItem[];
  summary: CheckoutSummary | null;
  duty: DutyEstimate | null;
  currency: Currency;
  locale: "zh" | "en";
  shippingPending: boolean;
  canConfirm: boolean;
  submitting: boolean;
  disableReason?: string | null;
  onConfirm: () => void;
}

export function OrderSummary({
  items,
  summary,
  duty,
  currency,
  locale,
  shippingPending,
  canConfirm,
  submitting,
  disableReason,
  onConfirm,
}: OrderSummaryProps) {
  const t = useTranslations("checkout");
  const tOrder = useTranslations("order");

  const subtotal = summary
    ? currency === "CNY"
      ? summary.subtotalCNY
      : summary.subtotalUSD
    : items.reduce(
        (sum, i) =>
          sum + (currency === "CNY" ? i.lockedPriceCNY : i.lockedPriceUSD),
        0,
      );

  const shippingDisplay = shippingPending
    ? t("shippingOptions.pendingConfirmation")
    : summary
      ? formatPrice(
          currency === "CNY" ? summary.shippingCNY : summary.shippingUSD,
          currency,
        )
      : "—";

  const dutyDisplay = duty
    ? duty.exempt
      ? t("summary.dutyExempt")
      : formatPrice(
          currency === "CNY" ? duty.amountCNY : duty.amountUSD,
          currency,
        )
    : "—";

  const total = summary
    ? currency === "CNY"
      ? summary.totalCNY
      : summary.totalUSD
    : subtotal;

  return (
    <div className="border border-line bg-paper p-6">
      <h2 className="mb-5 text-[15px] font-medium text-ink">
        {t("summary.title")}
      </h2>

      {/* 商品列表 */}
      <ul className="space-y-4">
        {items.map((item) => {
          const price =
            currency === "CNY" ? item.lockedPriceCNY : item.lockedPriceUSD;
          const spec = [
            item.tierLabel[locale],
            item.framingLabel ? item.framingLabel[locale] : null,
            `#${item.editionNumber}`,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <li key={item.itemId} className="flex gap-3">
              <img
                src={item.thumbnail}
                alt={item.title[locale]}
                loading="lazy"
                decoding="async"
                className="h-16 w-16 flex-shrink-0 object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[14px] font-medium text-ink">
                  {item.title[locale]}
                </h3>
                <p className="mt-1 truncate text-[12px] text-gray-500">
                  {spec}
                </p>
              </div>
              <span className="flex-shrink-0 text-[14px] tabular-nums text-ink">
                {formatPrice(price, currency)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* 分隔线 */}
      <div className="my-5 border-t border-line" />

      <dl className="space-y-3">
        {/* 商品小计 */}
        <div className="flex items-center justify-between">
          <dt className="text-[15px] text-ink">{t("summary.subtotal")}</dt>
          <dd className="text-[15px] tabular-nums text-ink">
            {formatPrice(subtotal, currency)}
          </dd>
        </div>

        {/* 运费 */}
        <div className="flex items-center justify-between">
          <dt className="text-[15px] text-gray-700">{t("summary.shipping")}</dt>
          <dd
            className={cn(
              "text-[15px]",
              shippingPending ? "text-[#4A7C59]" : "tabular-nums text-gray-700",
            )}
          >
            {shippingDisplay}
          </dd>
        </div>

        {/* 关税 */}
        <div className="flex items-center justify-between">
          <dt className="text-[15px] text-gray-700">{t("summary.duty")}</dt>
          <dd
            className={cn(
              "text-[15px]",
              duty?.exempt
                ? "text-[#4A7C59]"
                : "tabular-nums text-gray-700",
            )}
          >
            {dutyDisplay}
          </dd>
        </div>
      </dl>

      {/* 分隔线 */}
      <div className="my-5 border-t border-line" />

      {/* 合计 */}
      <div className="flex items-end justify-between">
        <span className="text-[15px] text-ink">{t("summary.total")}</span>
        <span className="text-[20px] font-medium tabular-nums text-ink">
          {formatPrice(total, currency)}
        </span>
      </div>

      {/* 关税备注 */}
      {duty && !duty.exempt && (
        <p className="mt-1.5 text-[12px] text-gray-500">
          {t("summary.dutyNote")}
        </p>
      )}

      {/* 锁价提示 */}
      {items.length > 0 && (
        <p className="mt-1 text-[12px] text-[#4A7C59]">
          {t("summary.priceLocked")}
        </p>
      )}

      {/* 确认支付按钮 */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={!canConfirm || submitting}
        className={cn(
          "mt-6 flex items-center justify-center gap-2 w-full bg-ink py-3.5 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90",
          (!canConfirm || submitting) && "cursor-not-allowed opacity-40",
        )}
      >
        {submitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {tOrder("processing")}
          </>
        ) : (
          t("confirm", { amount: formatPrice(total, currency) })
        )}
      </button>
      {!canConfirm && disableReason && (
        <p className="mt-3 text-center text-[12px] text-gray-500">
          {disableReason}
        </p>
      )}
    </div>
  );
}

export default OrderSummary;
