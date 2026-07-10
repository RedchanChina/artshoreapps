import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Artist } from "@/data/artists";
import { cn } from "@/lib/utils";

interface ArtistProfileCardProps {
  artist: Artist;
  className?: string;
}

/**
 * 艺术家详情页顶部信息展示区（严格参照 Tappan Collective 排版）。
 * - 桌面端左右分栏：左 4:5 竖版头像，右文字
 * - 标题组（name + role + 元信息）居中对齐，简介正文左对齐（"对齐断裂"设计语言）
 * - 元信息合并一行：b. {year}, {place} · {basedIn} {location}
 * - 简介优先 fullBio，回退 bio
 */
export function ArtistProfileCard({ artist, className }: ArtistProfileCardProps) {
  const t = useTranslations("artistDetail");
  const locale = useLocale() as "zh" | "en";

  // 元信息合并：b. {year}, {place} · {basedIn} {location}
  const hasBirth = artist.birthYear || artist.birthPlace;
  const hasLocation = artist.currentLocation;
  const hasMeta = hasBirth || hasLocation;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16",
        className,
      )}
    >
      {/* 左：4:5 竖版头像（满栏高度，min-h 兜底） */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 lg:min-h-[500px]">
        <Image
          src={artist.avatar}
          alt={artist.name[locale]}
          fill
          sizes="50vw"
          className="h-full w-full object-cover"
        />
      </div>

      {/* 右：文字（标题组居中 + 正文左对齐） */}
      <div className="flex flex-col">
        {/* 标题组 — 居中对齐 */}
        <div className="text-center">
          <h2 className="font-display text-[clamp(22px,2.6vw,32px)] font-light leading-[1.25] tracking-[-0.02em] text-ink">
            {artist.name[locale]}
          </h2>

          <p className="mt-3 text-[12px] uppercase tracking-[0.2em] text-gray-500">
            {artist.role[locale]}
          </p>

          {hasMeta && (
            <p className="mt-2 text-[12px] text-gray-400">
              {artist.birthYear ? `b. ${artist.birthYear}` : null}
              {artist.birthYear && artist.birthPlace ? ", " : null}
              {artist.birthPlace && artist.birthPlace[locale]}
              {hasBirth && hasLocation && " · "}
              {artist.currentLocation && `${t("basedIn")} ${artist.currentLocation[locale]}`}
            </p>
          )}
        </div>

        {/* 简介正文 — 左对齐，与标题组拉开间距 */}
        <div className="mt-12">
          <p className="text-[14px] leading-[1.7] text-gray-700">
            {(artist.fullBio ?? artist.bio)[locale]}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ArtistProfileCard;
