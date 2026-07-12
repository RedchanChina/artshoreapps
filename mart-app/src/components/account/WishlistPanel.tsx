"use client";

/**
 * 我的收藏面板（Phase 2 Task 9.3）。
 *
 * Client Component：加载收藏列表 → 网格展示缩略图/标题/艺术家/价格 →
 * 点击「取消收藏」调用 Server Action 并乐观移除。空状态引导去逛逛。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { fetchWishlist, removeWishlistAction } from "@/lib/account/actions";
import type { WishlistItem } from "@/lib/account/repository";

interface WishlistPanelProps {
  userId: string;
}

export function WishlistPanel({ userId }: WishlistPanelProps) {
  const t = useTranslations("account.wishlist");
  const locale = useLocale() as "zh" | "en";
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    fetchWishlist().then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadWishlist();
  }, [userId]);

  const handleRemove = async (id: string) => {
    await removeWishlistAction(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-[14px] text-gray-400">
        Loading...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-[14px] text-gray-500">{t("empty")}</p>
        <Link
          href={`/${locale}/works`}
          className="inline-block border border-ink px-6 py-2.5 text-[13px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          {t("browseWorks")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="group">
          <Link href={`/${locale}/works/${item.workSlug}`} className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnail}
              alt={item.title[locale]}
              className="aspect-square w-full object-cover"
            />
            <div className="mt-2">
              <p className="text-[13px] font-medium text-ink">
                {item.title[locale]}
              </p>
              <p className="text-[12px] text-gray-500">
                {item.artistName[locale]}
              </p>
              <p className="text-[13px] text-ink">
                ¥{item.priceCNY} / ${item.priceUSD}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => handleRemove(item.id)}
            className="mt-2 text-[12px] uppercase tracking-[0.14em] text-gray-500 transition-colors hover:text-danger"
          >
            {t("remove")}
          </button>
        </div>
      ))}
    </div>
  );
}

export default WishlistPanel;
