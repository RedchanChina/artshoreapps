"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Artist } from "@/data/artists";
import { cn } from "@/lib/utils";

interface ArtistGridCardProps {
  artist: Artist;
  className?: string;
}

/**
 * 列表页网格卡片：圆形头像 + 姓名 + 作品数量。
 * - 整卡为 next/link，跳转至艺术家详情页
 * - 头像 160px 圆形，grayscale(20%) contrast(0.95) → hover 恢复
 * - hover：头像 scale(1.05) 400ms ease-mart
 * - 垂直布局 flex-col items-center gap-3
 */
export function ArtistGridCard({ artist, className }: ArtistGridCardProps) {
  const t = useTranslations("artistList");
  const locale = useLocale() as "zh" | "en";

  return (
    <Link
      href={`/${locale}/artists/${artist.slug}`}
      className={cn(
        "group flex flex-col items-center gap-3 text-center",
        className,
      )}
    >
      <div className="overflow-hidden rounded-full bg-gray-100 transition-transform duration-[400ms] ease-mart group-hover:scale-105">
        <Image
          src={artist.avatar}
          alt={artist.name[locale]}
          width={160}
          height={160}
          className="h-40 w-40 object-cover grayscale-[0.2] contrast-[0.95] transition-all duration-[400ms] ease-mart group-hover:grayscale-0 group-hover:contrast-100"
        />
      </div>

      <p className="font-display text-[15px] font-normal tracking-[-0.01em] text-ink">
        {artist.name[locale]}
      </p>

      <p className="text-[12px] text-gray-500">
        {t("workCount", { count: artist.workCount })}
      </p>
    </Link>
  );
}

export default ArtistGridCard;
