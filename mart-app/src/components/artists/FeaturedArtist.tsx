import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import type { FeaturedArtist as FeaturedArtistType } from "@/data/artists";

interface FeaturedArtistProps {
  featured: FeaturedArtistType;
}

/**
 * 精选艺术家区：圆形头像 + 艺术家名 + 身份标签 + 简介 + 「查看艺术家」CTA。
 * - 桌面端三栏布局（220px / 1fr / auto），gap 48px，items-center
 * - 移动端单列堆叠居中
 * - 头像 180px 圆形，grayscale(30%) contrast(0.95) 滤镜
 * - CTA hover：箭头右移 4px，文字变陶土色
 */
export function FeaturedArtist({ featured }: FeaturedArtistProps) {
  const t = useTranslations("artist");
  const locale = useLocale() as "zh" | "en";

  return (
    <div className="grid grid-cols-1 justify-items-center gap-8 px-4 py-12 text-center md:grid-cols-[220px_1fr_auto] md:items-center md:justify-items-start md:gap-12 md:px-10 md:py-20 md:text-left">
      {/* 左栏：圆形头像 */}
      <div className="h-[180px] w-[180px] overflow-hidden rounded-full bg-gray-100">
        <img
          src={featured.avatar}
          alt={featured.name[locale]}
          width={180}
          height={180}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover grayscale-[0.3] contrast-[0.95]"
        />
      </div>

      {/* 中栏：小标题 / 艺术家名 / 身份标签 / 简介 */}
      <div className="max-w-[480px]">
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <span aria-hidden="true" className="inline-block h-px w-4 bg-brand" />
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-gray-500">
            {t("featuredTitle")}
          </span>
        </div>

        <h2 className="mt-4 font-display text-[clamp(22px,2.6vw,32px)] font-light leading-[1.25] tracking-[-0.02em] text-ink">
          {featured.name[locale]}
        </h2>

        <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-gray-500">
          {featured.role[locale]}
        </p>

        <p className="mt-4 text-[14px] leading-[1.7] text-gray-700">
          {featured.fullBio[locale]}
        </p>
      </div>

      {/* 右栏：「查看艺术家」CTA */}
      <Link
        href={`/${locale}/artists/${featured.id}`}
        className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-ink transition-colors duration-300 ease-mart hover:text-brand"
      >
        {t("viewArtist")}
        <ArrowRight
          size={14}
          strokeWidth={1.5}
          className="transition-transform duration-300 ease-mart group-hover:translate-x-1"
        />
      </Link>
    </div>
  );
}

export default FeaturedArtist;
