"use client";

/**
 * 购物车商品列表（Phase 2 Task 4.3 / 4.6）。
 *
 * 桌面端：每行展示缩略图（80×80）+ 标题/艺术家 + 档位/装裱/版号 + 锁定价格 + 移除。
 * 移动端：卡片式（缩略图在左，信息在右，移除按钮在右上角）。
 * 过期商品：灰色背景 + 「已过期」标签 + 「请重新加购」提示，整体置灰。
 *
 * Client Component（需 useTranslations + 交互回调）。
 */
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import type { Currency } from "@/data/types";
import type { CartItem } from "@/lib/cart/types";
import { isExpired } from "@/lib/cart/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CartListProps {
  items: CartItem[];
  currency: Currency;
  locale: "zh" | "en";
  onRemove: (itemId: string) => void;
}

/** 取当前币种的锁定价格。 */
function lockedPrice(item: CartItem, currency: Currency): number {
  return currency === "CNY" ? item.lockedPriceCNY : item.lockedPriceUSD;
}

export function CartList({ items, currency, locale, onRemove }: CartListProps) {
  const t = useTranslations("cart");

  return (
    <div>
      {items.map((item) => {
        const expired = isExpired(item);
        const price = lockedPrice(item, currency);
        const editionLabel = t("item.edition", { number: item.editionNumber });
        const spec = [
          item.tierLabel[locale],
          item.framingLabel ? item.framingLabel[locale] : null,
          editionLabel,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <div
            key={item.itemId}
            className={cn(
              "flex gap-4 border-b border-line py-5 md:gap-6",
              expired && "bg-gray-50",
            )}
          >
            {/* 缩略图 80×80 */}
            <img
              src={item.thumbnail}
              alt={item.title[locale]}
              loading="lazy"
              decoding="async"
              className={cn(
                "h-20 w-20 flex-shrink-0 object-cover",
                expired && "opacity-50",
              )}
            />

            {/* 信息区 */}
            <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
              {/* 左：标题 + 规格 */}
              <div className="min-w-0 flex-1">
                <h3
                  className={cn(
                    "truncate text-[15px] font-medium",
                    expired ? "text-gray-500" : "text-ink",
                  )}
                >
                  {item.title[locale]}
                </h3>
                <p
                  className={cn(
                    "mt-1 truncate text-[12px]",
                    expired ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  {item.artistName[locale]}
                </p>

                {expired ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[12px] font-medium text-danger">
                      {t("item.expired")}
                    </span>
                    <span className="text-[12px] text-gray-500">
                      {t("item.reAdd")}
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] text-gray-500">{spec}</p>
                )}

                {/* 移动端价格 */}
                <p
                  className={cn(
                    "mt-3 text-[15px] font-medium tabular-nums md:hidden",
                    expired ? "text-gray-400" : "text-ink",
                  )}
                >
                  {formatPrice(price, currency)}
                </p>
              </div>

              {/* 右：桌面端价格 + 移除按钮 */}
              <div className="flex flex-col items-end gap-3">
                <span
                  className={cn(
                    "hidden text-[15px] font-medium tabular-nums md:block",
                    expired ? "text-gray-400" : "text-ink",
                  )}
                >
                  {formatPrice(price, currency)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.itemId)}
                  aria-label={t("item.remove")}
                  className="flex items-center gap-1 text-[12px] text-gray-500 transition-colors duration-200 ease-mart hover:text-danger"
                >
                  <Trash2 size={14} strokeWidth={1.4} />
                  <span className="hidden sm:inline">{t("item.remove")}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CartList;
