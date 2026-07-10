"use client";

/**
 * 悬浮购买栏（作品详情页交互优化）。
 *
 * 当作品大图区（#work-gallery）滚出视口时，在导航栏下方显示
 * 缩略图 + 标题/艺术家 + 起步价 + 加入购物车按钮。
 * 使用 IntersectionObserver 监听，参照 RevealOnScroll 模式。
 *
 * Client Component（需 IntersectionObserver + useCartUI + useSettings）。
 */
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Work } from "@/data/types";
import { useSettings } from "@/store/useSettings";
import { useCartUI } from "@/store/useCartUI";
import { addItem } from "@/lib/cart/actions";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface StickyPurchaseBarProps {
  work: Work;
  locale: "zh" | "en";
}

export function StickyPurchaseBar({ work, locale }: StickyPurchaseBarProps) {
  const t = useTranslations("workDetail");
  const currency = useSettings((s) => s.currency);
  const openCart = useCartUI((s) => s.open);
  const bumpCart = useCartUI((s) => s.bump);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 首个非售罄档位（UI 原型：不与 WorkDetailClient 选中状态同步）
  const defaultTier = useMemo(
    () =>
      work.editionTiers.find((tier) => tier.status !== "sold_out") ??
      work.editionTiers[0],
    [work.editionTiers],
  );

  const soldOut = defaultTier.status === "sold_out";
  const basePrice =
    currency === "CNY" ? defaultTier.basePriceCNY : defaultTier.basePriceUSD;

  // toast 3 秒后自动清除
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // IntersectionObserver：gallery 滚出视口时显示
  useEffect(() => {
    const gallery = document.getElementById("work-gallery");
    if (!gallery) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 仅当 gallery 向上滚出有效视口时显示（排除尚未滚到的初始态）
        const scrolledPast =
          !entry.isIntersecting && entry.boundingClientRect.top < 96;
        setVisible(scrolledPast);
      },
      { rootMargin: "-96px 0px 0px 0px", threshold: 0 },
    );

    observer.observe(gallery);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = async () => {
    if (soldOut) return;
    const result = await addItem(work.slug, defaultTier.id);
    if (result.success) {
      bumpCart();
      openCart();
    } else if (result.error === "SOLD_OUT") {
      setToast(t("buttons.soldOut"));
    } else if (result.error === "ALREADY_IN_CART") {
      setToast(t("alreadyInCart"));
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-[84px] z-[150] border-b border-line bg-paper/95 backdrop-blur-sm transition-transform duration-300 ease-mart sm:top-[96px]",
        visible
          ? "translate-y-0"
          : "-translate-y-full pointer-events-none",
      )}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 md:px-7 lg:px-10">
        {/* 缩略图 40x40 */}
        <img
          src={work.mainImage}
          alt={work.title[locale]}
          loading="lazy"
          decoding="async"
          className="h-10 w-10 flex-shrink-0 object-cover"
        />

        {/* 标题 + 艺术家 */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-ink">
            {work.title[locale]}
          </p>
          <p className="truncate text-[12px] text-gray-500">
            {work.artistName[locale]}
          </p>
        </div>

        {/* 价格 */}
        <div className="flex flex-shrink-0 items-baseline gap-1">
          <span className="text-[14px] font-medium tabular-nums text-ink">
            {formatPrice(basePrice, currency)}
          </span>
          <span className="text-[12px] text-gray-500">{t("stickyBar.from")}</span>
        </div>

        {/* 加入购物车 */}
        <button
          type="button"
          disabled={soldOut}
          onClick={handleAddToCart}
          className={cn(
            "flex-shrink-0 bg-ink px-5 py-2 text-[12px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90",
            soldOut && "cursor-not-allowed opacity-50",
          )}
        >
          {soldOut ? t("buttons.soldOut") : t("buttons.addToCart")}
        </button>
      </div>

      {/* toast */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 bg-ink px-6 py-3 text-sm text-paper transition-opacity duration-300 ease-mart",
          toast ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        role="status"
        aria-live="polite"
      >
        {toast ?? ""}
      </div>
    </div>
  );
}

export default StickyPurchaseBar;
