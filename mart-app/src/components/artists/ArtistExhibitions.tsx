"use client";

/**
 * 展览历史区块（艺术家详情页底部）。
 *
 * 在独立作品之后展示艺术家展览历史，按年份倒序排列。
 * 仅当 artist.exhibitions 为非空数组时由父组件渲染。
 * 每行：年份 | 展名+画廊地点 | 类型标签（个展/群展）。
 *
 * Client Component。
 */
import { useTranslations } from "next-intl";
import type { Exhibition } from "@/data/types";
import { cn } from "@/lib/utils";

interface ArtistExhibitionsProps {
  exhibitions: Exhibition[];
  locale: "zh" | "en";
  className?: string;
}

export function ArtistExhibitions({
  exhibitions,
  locale,
  className,
}: ArtistExhibitionsProps) {
  const t = useTranslations("artistDetail");

  const sorted = [...exhibitions].sort(
    (a, b) => b.year - a.year || a.sortOrder - b.sortOrder,
  );

  return (
    <section className={cn("mt-20", className)}>
      <h2 className="mb-8 font-display text-[22px] font-light text-ink sm:text-[28px]">
        {t("exhibitions")}
      </h2>

      <div className="divide-y divide-line">
        {sorted.map((exhibition) => (
          <div
            key={exhibition.id}
            className="grid grid-cols-2 items-baseline gap-6 py-4 md:grid-cols-[60px_1fr_auto]"
          >
            <span className="text-[14px] tabular-nums text-gray-500">
              {exhibition.year}
            </span>

            <div className="min-w-0">
              <p className="text-[14px] font-medium text-ink">
                {exhibition.title[locale]}
              </p>
              <p className="mt-1 text-[13px] text-gray-500">
                {exhibition.gallery[locale]} · {exhibition.location[locale]}
              </p>
            </div>

            <span
              className={cn(
                "px-2 py-1 text-[11px] uppercase tracking-wider text-gray-500",
                exhibition.type === "solo"
                  ? "bg-gray-100"
                  : "border border-line",
              )}
            >
              {t(
                exhibition.type === "solo"
                  ? "exhibitionType.solo"
                  : "exhibitionType.group",
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ArtistExhibitions;
