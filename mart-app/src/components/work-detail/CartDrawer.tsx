"use client";

/**
 * 购物车滑出面板（作品详情页交互优化）。
 *
 * 从右侧滑出，展示当前 Redis 购物车内的全部行项：
 * 缩略图 + 标题 + 艺术家 + 档位 + 锁定价格 + 小计 + 操作按钮。
 * 参照 MobileDrawer 模式：ESC 关闭、背景点击关闭、滚动锁定。
 *
 * Client Component（需 useCartUI + useSettings + useTranslations + getCart Server Action）。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useCartUI } from "@/store/useCartUI";
import { useSettings } from "@/store/useSettings";
import { formatPrice } from "@/lib/format";
import { getCart } from "@/lib/cart/actions";
import type { CartItem } from "@/lib/cart/types";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  locale: "zh" | "en";
}

export function CartDrawer({ locale }: CartDrawerProps) {
  const t = useTranslations("workDetail.cartDrawer");
  const tFraming = useTranslations("workDetail.framing");
  const currency = useSettings((s) => s.currency);
  const { isOpen, close } = useCartUI();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ESC 关闭 + 滚动锁定（参照 MobileDrawer 模式）
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close]);

  // 卸载时关闭抽屉，防止跨页面导航后残留
  useEffect(() => {
    return () => {
      close();
    };
  }, [close]);

  // drawer 打开时从 Redis 加载购物车列表
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    getCart()
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // 小计：所有行项 lockedPrice 之和（按当前币种）
  const subtotal = items.reduce((sum, item) => {
    const price = currency === "CNY" ? item.lockedPriceCNY : item.lockedPriceUSD;
    return sum + price;
  }, 0);

  const isEmpty = !loading && items.length === 0;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={cn(
          "fixed inset-0 z-[400] bg-ink/40 transition-opacity duration-300 ease-mart",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* 滑出面板 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        className={cn(
          "fixed right-0 top-0 bottom-0 z-[410] flex w-full max-w-[420px] flex-col bg-paper transition-transform duration-[400ms] ease-mart",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-[16px] font-light text-ink">
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="flex h-8 w-8 items-center justify-center text-ink transition-colors duration-200 ease-mart hover:text-brand"
          >
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>

        {isEmpty ? (
          /* 空购物车状态 */
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <p className="text-[14px] text-gray-500">{t("empty")}</p>
            <Link
              href={`/${locale}/works`}
              onClick={close}
              className="mt-6 inline-block border border-ink px-6 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-mart hover:bg-ink hover:text-paper"
            >
              {t("browse")}
            </Link>
          </div>
        ) : (
          <>
            {/* 行项列表 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => {
                  const price =
                    currency === "CNY"
                      ? item.lockedPriceCNY
                      : item.lockedPriceUSD;
                  return (
                    <li key={item.itemId} className="flex gap-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title[locale]}
                        loading="lazy"
                        decoding="async"
                        className="h-20 w-20 flex-shrink-0 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-ink">
                          {item.title[locale]}
                        </p>
                        <p className="mt-1 text-[12px] text-gray-500">
                          {item.artistName[locale]}
                        </p>
                        <p className="mt-2 text-[12px] text-gray-500">
                          {item.tierLabel[locale]}
                          {item.framingOption
                            ? ` · ${tFraming(
                                item.framingOption === "aluminum-frame"
                                  ? "aluminum"
                                  : "bag",
                              )}`
                            : ""}
                        </p>
                        <p className="mt-2 text-[14px] font-medium tabular-nums text-ink">
                          {formatPrice(price, currency)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 底部：小计 + 按钮 */}
            <div className="border-t border-line px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[13px] text-gray-500">
                  {t("subtotal")}
                </span>
                <span className="text-[16px] font-medium tabular-nums text-ink">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <Link
                href={`/${locale}/checkout`}
                onClick={close}
                className="mb-2 block w-full bg-ink py-3 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90"
              >
                {t("checkout")}
              </Link>
              <Link
                href={`/${locale}/cart`}
                onClick={close}
                className="block w-full border border-ink py-3 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-mart hover:bg-ink hover:text-paper"
              >
                {t("viewBag")}
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
