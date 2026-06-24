"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import type { Artist } from "@/data/artists";

interface ArtistCardProps {
  artist: Artist;
}

/**
 * 签约艺术家卡片：圆形头像 + 姓名 + 身份标签。
 * - 卡片宽度固定 160px（w-40），flex-shrink-0
 * - 头像 w-32 h-32 圆形，grayscale(20%) contrast(0.95) 滤镜
 * - hover：头像容器放大 1.05 倍 + 阴影，灰度/对比度滤镜恢复，过渡 400ms
 * - 阴影仅加在头像容器上（非整张卡片）
 */
export function ArtistCard({ artist }: ArtistCardProps) {
  const locale = useLocale() as "zh" | "en";

  return (
    <Link
      href={`/${locale}/artists/${artist.id}`}
      className="group/card flex w-40 flex-shrink-0 flex-col items-center text-center"
    >
      <div className="mb-4 overflow-hidden rounded-full bg-gray-100 transition-transform duration-[400ms] ease-mart group-hover/card:scale-105 group-hover/card:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <img
          src={artist.avatar}
          alt={artist.name[locale]}
          width={128}
          height={128}
          loading="lazy"
          decoding="async"
          className="h-32 w-32 object-cover grayscale-[0.2] contrast-[0.95] transition-all duration-[400ms] ease-mart group-hover/card:grayscale-0 group-hover/card:contrast-100"
        />
      </div>

      <p className="font-display text-[15px] font-normal tracking-[-0.01em] text-ink">
        {artist.name[locale]}
      </p>

      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-gray-400">
        {artist.role[locale]}
      </p>
    </Link>
  );
}

export default ArtistCard;
