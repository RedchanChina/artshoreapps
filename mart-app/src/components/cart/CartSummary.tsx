"use client";

/**
 * 购物车价格摘要（Phase 2 Task 4.4）。
 *
 * 参照 design.md 6.6 规格：商品小计 / 运费预估 / 关税预估 / 合计 /
 * 币种标注 / 锁价提示 / 去结账按钮。小计仅累计未过期商品。
 *
 * Client Component（需 useTranslations + useLocale + formatPrice）。
 */
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Currency } from "@/data/types";
import type { CartItem } from "@/lib/cart/types";
import { isExpired } from "@/lib/cart/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CartSummaryProps {
  items: CartItem[];
  currency: Currency;
  locale: "zh" | "en";
}

export function CartSummary({ items, currency, locale }: CartSummaryProps) {
  const t = useTranslations("cart");
  // 仅未过期商品计入小计
  const validItems = items.filter((item) => !isExpired(item));
  const subtotal = validItems.reduce((sum, item) => {
    return sum + (currency === "CNY" ? item.lockedPriceCNY : item.lockedPriceUSD);
  }, 0);
  const hasValidItems = validItems.length > 0;

  return (
    <div className="border border-line bg-paper p-6">
      <dl className="space-y-3">
        {/* 商品小计 */}
        <div className="flex items-center justify-between">
          <dt className="text-[15px] text-ink">{t("summary.subtotal")}</dt>
          <dd className="text-[15px] tabular-nums text-ink">
            {formatPrice(subtotal, currency)}
          </dd>
        </div>

        {/* 运费预估 */}
        <div className="flex items-center justify-between">
          <dt className="text-[15px] text-gray-700">{t("summary.shipping")}</dt>
          <dd className="text-[15px] text-gray-700">
            {t("summary.shippingHint")}
          </dd>
        </div>

        {/* 关税预估 */}
        <div className="flex items-center justify-between">
          <dt className="text-[15px] text-gray-700">{t("summary.duty")}</dt>
          <dd className="text-[15px] text-gray-700">
            {t("summary.dutyHint")}
          </dd>
        </div>
      </dl>

      {/* 分隔线 */}
      <div className="my-5 border-t border-line" />

      {/* 合计 */}
      <div className="flex items-end justify-between">
        <span className="text-[15px] text-ink">{t("summary.total")}</span>
        <span className="text-[20px] font-medium tabular-nums text-ink">
          {formatPrice(subtotal, currency)}
        </span>
      </div>

      {/* 币种标注 */}
      <p className="mt-1.5 text-[12px] text-gray-500">
        {t("summary.currencyNote")}
      </p>

      {/* 锁价提示 */}
      {hasValidItems && (
        <p className="mt-1 text-[12px] text-[#4A7C59]">
          {t("summary.priceLocked")}
        </p>
      )}

      {/* 去结账按钮 */}
      <Link
        href={`/${locale}/checkout`}
        aria-disabled={!hasValidItems}
        className={cn(
          "mt-6 block w-full bg-ink py-3.5 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90",
          !hasValidItems && "pointer-events-none opacity-40",
        )}
      >
        {t("checkout")}
      </Link>
    </div>
  );
}

export default CartSummary;
