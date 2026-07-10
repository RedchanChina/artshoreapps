"use client";

/**
 * 艺术家声明区块（艺术家详情页）。
 *
 * 在 ArtistProfileCard 之后、系列列表之前展示艺术家声明长文本。
 * 仅当 artist.statement 有值时由父组件渲染。
 * 左侧 brand 色竖线引文装饰。
 *
 * Client Component。
 */
import { useTranslations } from "next-intl";
import type { LocalizedText } from "@/data/types";
import { cn } from "@/lib/utils";

interface ArtistStatementProps {
  statement: LocalizedText;
  locale: "zh" | "en";
  className?: string;
}

export function ArtistStatement({
  statement,
  locale,
  className,
}: ArtistStatementProps) {
  const t = useTranslations("artistDetail");

  return (
    <section className={cn("mt-20", className)}>
      <h2 className="mb-8 font-display text-[22px] font-light text-ink sm:text-[28px]">
        {t("statement")}
      </h2>
      <div className="border-l-2 border-brand pl-6">
        <p className="max-w-[680px] text-[15px] leading-[1.8] text-gray-700">
          {statement[locale]}
        </p>
      </div>
    </section>
  );
}

export default ArtistStatement;
