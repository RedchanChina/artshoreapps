"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSettings } from "@/store/useSettings";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** 卡片在列表中的索引，前 4 张 eager 加载 */
  index?: number;
  /** 卡片布局变体：'scroll' 横向滑动固定宽度（默认），'grid' 网格自适应宽度 */
  variant?: "scroll" | "grid";
}

/**
 * 产品卡片：主图（hover 切换场景图）+ 身份信息 + 版号进度条。
 * - 主图加载时显示 shimmer 骨架，加载完成后淡入
 * - 场景图首次 hover 时才加载（lazy）
 * - 售罄作品（sold >= total）：艺术家名砖红色 + 售罄标签
 * - 不展示阶梯定价信息
 */
export function ProductCard({ product, index = 0, variant = "scroll" }: ProductCardProps) {
  const t = useTranslations("product");
  const locale = useLocale() as "zh" | "en";
  const currency = useSettings((s) => s.currency);

  const [mainLoaded, setMainLoaded] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);
  const [imageToggled, setImageToggled] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const eager = index < 4;

  const soldOut = product.sold >= product.total;
  const progress = Math.min(100, (product.sold / product.total) * 100);

  const priceText =
    currency === "CNY"
      ? `¥${product.priceCNY.toLocaleString()}`
      : `$${product.priceUSD.toFixed(2)}`;

  // 5s 超时兜底
  useEffect(() => {
    const timer = setTimeout(() => setMainLoaded(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // 检测触摸设备（移动端），SSR 安全：客户端挂载后更新
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(pointer: coarse)");
    setIsTouchDevice(mql.matches);
  }, []);

  const editionLabel = soldOut ? t("soldOut") : product.edition[locale];
  const progressLabel = t("editionProgress", {
    sold: product.sold,
    total: product.total,
  });

  // 移动端点击图片区域切换主图/场景图，桌面端不做处理（保持 hover 行为）
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTouchDevice) return;
    e.preventDefault();
    e.stopPropagation();
    setHasHovered(true);
    setImageToggled((prev) => !prev);
  };

  return (
    <Link
      href={`/${locale}/works/${product.id}`}
      className={cn(
        "group/card block cursor-pointer",
        variant === "scroll"
          ? "w-[240px] flex-shrink-0 sm:w-[280px]"
          : "w-full",
        soldOut && "opacity-60"
      )}
      onMouseEnter={() => setHasHovered(true)}
    >
      {/* 图片区 */}
      <div
        className={cn(
          "relative overflow-hidden rounded-[2px] bg-mist",
          "aspect-square",
        )}
        onClick={handleImageClick}
      >
        {/* shimmer 骨架 */}
        {!mainLoaded && (
          <div
            aria-hidden="true"
            className="animate-shimmer pointer-events-none absolute inset-0 z-[1]"
          />
        )}

        {/* 主图 */}
        <Image
          src={product.mainImage}
          alt={product.title[locale]}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={eager}
          onLoad={() => setMainLoaded(true)}
          onError={() => setMainLoaded(true)}
          className={cn(
            "z-[2] object-cover transition-opacity duration-500 ease-mart",
            mainLoaded ? "opacity-100" : "opacity-0",
            // 桌面端 hover 淡出
            !isTouchDevice && "group-hover/card:opacity-0",
            // 移动端 toggle 淡出
            isTouchDevice && imageToggled && "opacity-0"
          )}
        />

        {/* 场景图（首次 hover 时 lazy 加载） */}
        {hasHovered && (
          <Image
            src={product.sceneImage}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            onLoad={() => setSceneLoaded(true)}
            onError={() => setSceneLoaded(true)}
            className={cn(
              "z-[2] object-cover transition-all duration-500 ease-mart",
              sceneLoaded ? "" : "opacity-0",
              // 桌面端 hover 淡入
              !isTouchDevice &&
                sceneLoaded &&
                "opacity-0 group-hover/card:scale-[1.03] group-hover/card:opacity-100",
              // 移动端 toggle 淡入
              isTouchDevice &&
                (imageToggled ? "scale-[1.03] opacity-100" : "opacity-0")
            )}
          />
        )}

        {/* 售罄标签 */}
        {soldOut && (
          <span className="absolute left-3.5 top-3.5 z-[3] bg-ink px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white">
            {t("soldOut")}
          </span>
        )}
      </div>

      {/* 身份信息 */}
      <div className="pt-3.5">
        {/* 艺术家名 */}
        <p
          className={cn(
            "mb-1.5 truncate text-[12px] font-medium uppercase tracking-[0.2em]",
            soldOut ? "text-danger" : "text-gray-700"
          )}
        >
          {product.artist[locale]}
        </p>

        {/* 作品标题 */}
        <h3 className="mb-2 truncate font-display text-[16px] font-light leading-[1.35] tracking-[-0.01em] text-ink">
          {product.title[locale]}
        </h3>

        {/* 品类标签 + 版次信息 */}
        <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
          <span className="text-[11px] uppercase tracking-[0.1em] text-gray-500">
            {product.categoryLabel[locale]}
          </span>
          <span aria-hidden="true" className="text-gray-300">
            ·
          </span>
          <span className="text-[11px] tracking-[0.06em] text-gray-500">
            {editionLabel}
          </span>
        </div>

        {/* 价格 */}
        <div className="mt-1">
          <span className="text-[14px] font-medium tabular-nums text-ink">
            {priceText}
          </span>
        </div>

        {/* 版号进度条 */}
        <div
          className="relative mt-3 h-px overflow-hidden bg-mist"
          role="progressbar"
          aria-label={progressLabel}
          aria-valuenow={product.sold}
          aria-valuemin={0}
          aria-valuemax={product.total}
        >
          <div
            className="absolute left-0 top-0 h-full bg-ink transition-[width] duration-[600ms] ease-mart"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
