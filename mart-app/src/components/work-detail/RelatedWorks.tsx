/**
 * 相关推荐（work-detail 6.8）。
 *
 * 两组横向滚动：
 * 1. 同系列作品（仅当 currentWork.seriesSlug 存在且 sameSeries 非空时渲染）
 * 2. 同艺术家作品（仅当 sameArtist 非空时渲染）
 *
 * 使用 toLegacyProduct 将 Work 转为 Product 传给 ProductCard（scroll variant）。
 *
 * Server Component（子组件 HorizontalScroll / ProductCard 自带交互）。
 */
import { useTranslations } from "next-intl";
import type { Work } from "@/data/types";
import { toLegacyProduct } from "@/data/works";
import { HorizontalScroll } from "@/components/ui/HorizontalScroll";
import { ProductCard } from "@/components/products/ProductCard";

interface RelatedWorksProps {
  currentWork: Work;
  sameSeries: Work[];
  sameArtist: Work[];
}

export function RelatedWorks({
  currentWork,
  sameSeries,
  sameArtist,
}: RelatedWorksProps) {
  const t = useTranslations("workDetail.relatedWorks");
  const showSeries = sameSeries.length > 0 && currentWork.seriesSlug != null;
  const showArtist = sameArtist.length > 0;

  if (!showSeries && !showArtist) return null;

  return (
    <div>
      {showSeries && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-[18px] font-light text-ink">
            {t("sameSeries")}
          </h2>
          <HorizontalScroll gap={24}>
            {sameSeries.map((work, i) => (
              <ProductCard
                key={work.id}
                product={toLegacyProduct(work)}
                index={i}
                variant="scroll"
              />
            ))}
          </HorizontalScroll>
        </section>
      )}
      {showArtist && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-[18px] font-light text-ink">
            {t("sameArtist")}
          </h2>
          <HorizontalScroll gap={24}>
            {sameArtist.map((work, i) => (
              <ProductCard
                key={work.id}
                product={toLegacyProduct(work)}
                index={i}
                variant="scroll"
              />
            ))}
          </HorizontalScroll>
        </section>
      )}
    </div>
  );
}

export default RelatedWorks;
