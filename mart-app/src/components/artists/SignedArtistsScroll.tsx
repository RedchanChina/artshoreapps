"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { HorizontalScroll } from "@/components/ui/HorizontalScroll";
import { ArtistCard } from "./ArtistCard";
import { SIGNED_ARTISTS } from "@/data/artists";

/**
 * 签约艺术家横向滑动区。
 * - 区块标题（陶土色短横线前缀）+ 「查看全部」链接（右侧）
 * - 复用 HorizontalScroll 组件包裹 ArtistCard 列表
 * - 水平内边距由 HorizontalScroll 内部管理（40px 桌面 / 16px 移动）
 */
export function SignedArtistsScroll() {
  const t = useTranslations("artist");
  const locale = useLocale();

  return (
    <div>
      {/* 标题 */}
      <div className="my-8 flex flex-col items-center px-4 md:px-7 lg:px-10">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-px w-4 bg-brand" />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.24em] text-gray-500">
            {t("signedTitle")}
          </h2>
        </div>
      </div>

      {/* 横向滑动卡片列表 */}
      <HorizontalScroll gap={32}>
        {SIGNED_ARTISTS.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </HorizontalScroll>

      {/* 查看全部 */}
      <div className="mt-8 flex justify-center">
        <Link
          href={`/${locale}/artists`}
          className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-ink transition-colors duration-300 ease-mart hover:text-brand"
        >
          {t("viewAll")}
          <ArrowRight
            size={14}
            strokeWidth={1.5}
            className="transition-transform duration-300 ease-mart group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}

export default SignedArtistsScroll;
