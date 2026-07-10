import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Series } from "@/data/types";
import { cn } from "@/lib/utils";

interface SeriesCardProps {
  series: Series;
  className?: string;
}

/**
 * 系列卡片：封面图 + 系列名 + 作品数量。
 * - 整卡为 next/link，跳转至系列详情页
 * - 封面图 aspect-[4/3]，rounded-[2px] object-cover
 * - hover：封面图 scale(1.03) 400ms ease-mart
 * - 系列名 16px font-display font-light text-ink
 */
export function SeriesCard({ series, className }: SeriesCardProps) {
  const t = useTranslations("seriesDetail");
  const locale = useLocale() as "zh" | "en";

  return (
    <Link
      href={`/${locale}/artists/${series.artistSlug}/series/${series.slug}`}
      className={cn("group block", className)}
    >
      <div className="overflow-hidden rounded-[2px]">
        <Image
          src={series.coverImage}
          alt={series.name[locale]}
          width={400}
          height={300}
          className="aspect-[4/3] w-full object-cover transition-transform duration-[400ms] ease-mart group-hover:scale-[1.03]"
        />
      </div>

      <p className="mt-3 font-display text-[16px] font-light text-ink">
        {series.name[locale]}
      </p>

      <p className="mt-1 text-[12px] text-gray-500">
        {t("workCount", { count: series.workCount })}
      </p>
    </Link>
  );
}

export default SeriesCard;
