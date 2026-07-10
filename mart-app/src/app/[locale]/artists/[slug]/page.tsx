import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchArtistBySlug } from "@/lib/actions";
import { ARTISTS } from "@/data/artists";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BackButton } from "@/components/ui/BackButton";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ArtistProfileCard } from "@/components/artists/ArtistProfileCard";
import { ArtistStatement } from "@/components/artists/ArtistStatement";
import { ArtistExhibitions } from "@/components/artists/ArtistExhibitions";
import { SeriesCard } from "@/components/artists/SeriesCard";
import { ProductCard } from "@/components/products/ProductCard";
import { toLegacyProduct } from "@/data/works";
import { toLocale } from "@/lib/utils";

export async function generateStaticParams() {
  return ARTISTS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const artist = await fetchArtistBySlug(slug);
  if (!artist) return {};
  const loc = toLocale(locale);
  return {
    title: `${artist.name[loc]} — M·art`,
    description: artist.bio[loc],
  };
}

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const artist = await fetchArtistBySlug(slug);
  if (!artist) notFound();

  const t = await getTranslations();
  const loc = toLocale(locale);

  return (
    <main className="pt-[120px] pb-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-7 md:px-10">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), href: "/" },
            { label: t("breadcrumb.artists"), href: "/artists" },
            { label: artist.name[loc] },
          ]}
        />
        <BackButton fallbackHref={`/${locale}/artists`} />

        {/* 艺术家信息卡 */}
        <RevealOnScroll>
          <ArtistProfileCard artist={artist} />
        </RevealOnScroll>

        {/* 艺术家声明 */}
        {artist.statement && (
          <RevealOnScroll>
            <ArtistStatement statement={artist.statement} locale={loc} />
          </RevealOnScroll>
        )}

        {/* 系列列表 */}
        {artist.series.length > 0 && (
          <RevealOnScroll>
            <section className="mt-20">
              <h2 className="mb-8 font-display text-[22px] font-light text-ink sm:text-[28px]">
                {t("artistDetail.series")}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                {artist.series.map((s) => (
                  <SeriesCard key={s.slug} series={s} />
                ))}
              </div>
            </section>
          </RevealOnScroll>
        )}

        {/* 独立作品 */}
        {artist.standaloneWorks.length > 0 && (
          <RevealOnScroll>
            <section className="mt-20">
              <h2 className="mb-8 font-display text-[22px] font-light text-ink sm:text-[28px]">
                {t("artistDetail.standaloneWorks")}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                {artist.standaloneWorks.map((work, i) => (
                  <ProductCard
                    key={work.id}
                    product={toLegacyProduct(work)}
                    index={i}
                    variant="grid"
                  />
                ))}
              </div>
            </section>
          </RevealOnScroll>
        )}

        {/* 展览历史 */}
        {artist.exhibitions && artist.exhibitions.length > 0 && (
          <RevealOnScroll>
            <ArtistExhibitions exhibitions={artist.exhibitions} locale={loc} />
          </RevealOnScroll>
        )}
      </div>
    </main>
  );
}
