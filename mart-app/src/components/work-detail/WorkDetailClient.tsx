"use client";

/**
 * 作品详情信息区客户端容器（work-detail 6.9）。
 *
 * 管理选中档位 / 装裱方式 / toast 状态，组装信息列（45%）：
 * 品类标签 → 标题 → 艺术家/系列 → TierSelector → FramingSelector
 * → EditionTracker → TieredPricing → 操作按钮 → TrustInfo。
 *
 * 图集 / 作品详情手风琴 / 相关推荐由页面层分别渲染，不在本组件内。
 *
 * Client Component。
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import type { FramingOption, Work } from "@/data/types";
import { useSettings } from "@/store/useSettings";
import { useCartUI } from "@/store/useCartUI";
import { addItem } from "@/lib/cart/actions";
import { toggleWishlistAction } from "@/lib/account/actions";
import { cn } from "@/lib/utils";
import { TierSelector } from "./TierSelector";
import { FramingSelector } from "./FramingSelector";
import { EditionTracker } from "./EditionTracker";
import { TieredPricing } from "./TieredPricing";
import { TrustInfo } from "./TrustInfo";

interface WorkDetailClientProps {
  work: Work;
  locale: "zh" | "en";
  isWishlisted: boolean;
}

export function WorkDetailClient({
  work,
  locale,
  isWishlisted,
}: WorkDetailClientProps) {
  const t = useTranslations("workDetail");
  const currency = useSettings((s) => s.currency);
  const openCart = useCartUI((s) => s.open);
  const bumpCart = useCartUI((s) => s.bump);
  const router = useRouter();

  // 默认选中第一个非售罄档位；若全部售罄则回退到第一档
  const initialTierId = useMemo(() => {
    const firstActive = work.editionTiers.find(
      (tier) => tier.status !== "sold_out"
    );
    return (firstActive ?? work.editionTiers[0]).id;
  }, [work.editionTiers]);

  const [selectedTierId, setSelectedTierId] = useState<string>(initialTierId);
  const [selectedFraming, setSelectedFraming] = useState<FramingOption>("bag");
  const [favorited, setFavorited] = useState<boolean>(isWishlisted);
  const [toast, setToast] = useState<string | null>(null);

  const tier =
    work.editionTiers.find((x) => x.id === selectedTierId) ??
    work.editionTiers[0];
  const soldOut = tier.status === "sold_out";

  // toast 3 秒后自动清除
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleTierChange = (tierId: string) => {
    setSelectedTierId(tierId);
    const next = work.editionTiers.find((x) => x.id === tierId);
    // 切换到 small 档时重置装裱为 bag
    if (next?.tierName === "small") {
      setSelectedFraming("bag");
    }
  };

  const handleAddToCart = async () => {
    if (soldOut) return;
    const result = await addItem(work.slug, tier.id);
    if (result.success) {
      bumpCart();
      openCart();
    } else if (result.error === "SOLD_OUT") {
      setToast(t("buttons.soldOut"));
    } else if (result.error === "ALREADY_IN_CART") {
      setToast(t("alreadyInCart"));
    }
  };

  const handleBuyNow = async () => {
    if (soldOut) return;
    const result = await addItem(work.slug, tier.id);
    if (result.success) {
      router.push(`/${locale}/checkout`);
    } else if (result.error === "SOLD_OUT") {
      setToast(t("buttons.soldOut"));
    } else if (result.error === "ALREADY_IN_CART") {
      // 已在购物车，仍跳转结账页
      router.push(`/${locale}/checkout`);
    } else {
      setToast(t("alreadyInCart"));
    }
  };

  // 收藏切换：乐观更新，失败回滚
  const handleToggleWishlist = async () => {
    const next = !favorited;
    setFavorited(next);
    const result = await toggleWishlistAction(work.slug);
    if (!result.success) {
      // 未登录，回滚
      setFavorited(!next);
      setToast(t("wishlist.loginRequired"));
      return;
    }
    setToast(
      result.wishlisted ? t("wishlist.added") : t("wishlist.removed")
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. 品类标签 */}
      <p className="text-[12px] uppercase tracking-[0.2em] text-gray-500">
        {work.categoryLabel[locale]}
      </p>

      {/* 2. 作品标题 + 收藏按钮 */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-[22px] font-light text-ink sm:text-[28px]">
          {work.title[locale]}
        </h1>
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={favorited ? t("wishlist.remove") : t("wishlist.add")}
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center border border-line transition-colors duration-200 ease-mart hover:bg-ink/5"
        >
          <Heart
            size={20}
            strokeWidth={1.5}
            className={cn(
              "transition-colors",
              favorited ? "fill-ink text-ink" : "fill-none text-ink"
            )}
          />
        </button>
      </div>

      {/* 3. 艺术家 + 系列（链接到艺术家页） */}
      <Link
        href={`/${locale}/artists/${work.artistSlug}`}
        className="text-[13px] text-gray-700 transition-colors duration-200 ease-mart hover:text-ink"
      >
        {work.artistName[locale]}
        {work.seriesSlug && work.seriesName
          ? ` · ${work.seriesName[locale]}`
          : ""}
      </Link>

      {/* 4. 作品比例 */}
      <p className="text-[12px] text-gray-500">
        {t("aspectRatio", { ratio: work.aspectRatio })}
      </p>

      {/* 5. 尺寸档位选择器 */}
      <TierSelector
        tiers={work.editionTiers}
        selectedTierId={selectedTierId}
        onChange={handleTierChange}
        locale={locale}
      />

      {/* 6. 装裱方式选择器（仅 small 档） */}
      {tier.tierName === "small" && (
        <FramingSelector
          tier={tier}
          selectedFraming={selectedFraming}
          onChange={setSelectedFraming}
          currency={currency}
        />
      )}

      {/* 7. 版号追踪器 */}
      <EditionTracker tier={tier} />

      {/* 8. 阶梯定价 */}
      <TieredPricing
        tier={tier}
        currency={currency}
        selectedFraming={tier.tierName === "small" ? selectedFraming : undefined}
      />

      {/* 9. 操作按钮：移动端立即购买在上，桌面端加入购物车在左 */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={soldOut}
          onClick={handleAddToCart}
          className={cn(
            "order-2 bg-ink px-6 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90 sm:order-1",
            soldOut && "cursor-not-allowed opacity-50"
          )}
        >
          {soldOut ? t("buttons.soldOut") : t("buttons.addToCart")}
        </button>
        <button
          type="button"
          disabled={soldOut}
          onClick={handleBuyNow}
          className={cn(
            "order-1 bg-ink px-6 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90 sm:order-2",
            soldOut && "cursor-not-allowed opacity-50"
          )}
        >
          {soldOut ? t("buttons.soldOut") : t("buttons.buyNow")}
        </button>
      </div>

      {/* 10. 信任信息 */}
      <TrustInfo productionDays={tier.productionDays} />

      {/* toast */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 bg-ink px-6 py-3 text-sm text-paper transition-opacity duration-300 ease-mart",
          toast ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        role="status"
        aria-live="polite"
      >
        {toast ?? ""}
      </div>
    </div>
  );
}

export default WorkDetailClient;
