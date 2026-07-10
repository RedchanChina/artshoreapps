import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchSeriesBySlug } from "@/lib/actions";
import { ARTISTS } from "@/data/artists";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BackButton } from "@/components/ui/BackButton";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ProductCard } from "@/components/products/ProductCard";
import { toLegacyProduct } from "@/data/works";
import { toLocale } from "@/lib/utils";

export async function generateStaticParams() {
  const params: { slug: string; seriesSlug: string }[] = [];
  for (const artist of ARTISTS) {
    for (const series of artist.series) {
      params.push({ slug: artist.slug, seriesSlug: series.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; seriesSlug: string }>;
}): Promise<Metadata> {
  const { locale, slug, seriesSlug } = await params;
  const series = await fetchSeriesBySlug(slug, seriesSlug);
  if (!series) return {};
  const loc = toLocale(locale);
  return {
    title: `${series.name[loc]} — M·art`,
  };
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; seriesSlug: string }>;
}) {
  const { locale, slug, seriesSlug } = await params;
  setRequestLocale(locale);

  const series = await fetchSeriesBySlug(slug, seriesSlug);
  if (!series) notFound();

  const t = await getTranslations();
  const loc = toLocale(locale);

  return (
    <main className="pt-[120px] pb-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-7 md:px-10">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), href: "/" },
            { label: t("breadcrumb.artists"), href: "/artists" },
            { label: series.artistName[loc], href: `/artists/${slug}` },
            { label: series.name[loc] },
          ]}
        />
        <BackButton fallbackHref={`/${locale}/artists/${slug}`} />

        {/* 系列信息 */}
        <header className="mb-12">
          <h1 className="font-display text-[28px] font-light text-ink sm:text-[36px]">
            {series.name[loc]}
          </h1>
          {series.description && (
            <p className="mt-4 max-w-[640px] text-[14px] leading-[1.7] text-gray-700">
              {series.description[loc]}
            </p>
          )}
          <p className="mt-3 text-[13px] text-gray-500">
            {t("seriesDetail.workCount", { count: series.workCount })}
          </p>
        </header>

        {/* 作品网格 */}
        {series.works.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[14px] text-gray-500">{t("filters.noResult")}</p>
          </div>
        ) : (
          <RevealOnScroll>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {series.works.map((work, i) => (
                <ProductCard
                  key={work.id}
                  product={toLegacyProduct(work)}
                  index={i}
                  variant="grid"
                />
              ))}
            </div>
          </RevealOnScroll>
        )}
      </div>
    </main>
  );
}
