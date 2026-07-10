"use client";

/**
 * 空购物车状态（Phase 2 Task 4.5）。
 *
 * 居中布局：购物袋图标（ShoppingBag，48px，stroke-width 1）+ 文案 + 去逛逛按钮。
 * 参照 design.md 6.6 规格。
 *
 * Client Component（需 useTranslations + useLocale）。
 */
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";

export function EmptyCart() {
  const t = useTranslations("cart");
  const locale = useLocale() as "zh" | "en";

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 pt-20 md:px-7 lg:px-10">
      <ShoppingBag size={48} strokeWidth={1} className="text-gray-400" />
      <p className="mt-6 text-[18px] text-gray-500">{t("empty")}</p>
      <Link
        href={`/${locale}/works`}
        className="mt-8 bg-ink px-8 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90"
      >
        {t("goShopping")}
      </Link>
    </div>
  );
}

export default EmptyCart;
