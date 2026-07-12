/**
 * 作品详情页（Phase 2 Task 9.2）。
 *
 * Server Component：setRequestLocale → fetchWorkBySlug（notFound 兜底）→
 * fetchRelatedWorks → 桌面端 55/45 左右分栏组装 GalleryViewer + WorkDetailClient，
 * 下方 WorkDetailsAccordion + RelatedWorks。
 *
 * generateStaticParams 按 WORKS 全量预渲染，generateMetadata 返回作品标题/描述。
 */
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { fetchWorkBySlug, fetchRelatedWorks, fetchArtistBySlug } from "@/lib/actions";
import { checkWishlisted } from "@/lib/account/actions";
import { toLocale } from "@/lib/utils";
import { WORKS } from "@/data/works";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BackButton } from "@/components/ui/BackButton";
import { AboutArtist } from "@/components/work-detail/AboutArtist";
import { GalleryViewer } from "@/components/work-detail/GalleryViewer";
import { WorkDetailClient } from "@/components/work-detail/WorkDetailClient";
import { WorkDetailsAccordion } from "@/components/work-detail/WorkDetailsAccordion";
import { RelatedWorks } from "@/components/work-detail/RelatedWorks";
import { StickyPurchaseBar } from "@/components/work-detail/StickyPurchaseBar";
import { CartDrawer } from "@/components/work-detail/CartDrawer";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** 预渲染所有作品 slug（locale 由父级 layout generateStaticParams 提供）。 */
export function generateStaticParams() {
  return WORKS.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const work = await fetchWorkBySlug(slug);
  if (!work) return {};
  const loc = toLocale(locale);
  return {
    title: work.title[loc],
    description: work.description[loc],
  };
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const loc = toLocale(locale);

  const work = await fetchWorkBySlug(slug);
  if (!work) {
    notFound();
  }

  const { sameSeries, sameArtist } = await fetchRelatedWorks(slug);

  const artist = await fetchArtistBySlug(work.artistSlug);

  const isFavorited = await checkWishlisted(work.slug);

  const t = await getTranslations("breadcrumb");

  const breadcrumbItems = [
    { label: t("home"), href: "/" },
    { label: t("works"), href: "/works" },
    {
      label: work.categoryLabel[loc],
      href: `/works?category=${work.category}`,
    },
    { label: work.artistName[loc], href: `/artists/${work.artistSlug}` },
    ...(work.seriesSlug && work.seriesName
      ? [
          {
            label: work.seriesName[loc],
            href: `/artists/${work.artistSlug}/series/${work.seriesSlug}`,
          },
        ]
      : []),
    { label: work.title[loc] },
  ];

  return (
    <main className="pt-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-7 lg:px-10">
        <Breadcrumb items={breadcrumbItems} />
        <BackButton fallbackHref={`/${locale}/works`} />

        {/* 桌面端 55/45 左右分栏，移动端上下堆叠 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[55fr_45fr] lg:gap-12">
          {/* 左：图集 */}
          <div id="work-gallery">
            <GalleryViewer
              key={work.slug}
              images={work.images}
              mainImage={work.mainImage}
              alt={work.title[loc]}
            />
          </div>

          {/* 右：作品信息 */}
          <div>
            <WorkDetailClient key={work.slug} work={work} locale={loc} isWishlisted={isFavorited} />
          </div>
        </div>

        {/* 作品详情手风琴 */}
        <WorkDetailsAccordion key={work.slug} work={work} locale={loc} />

        {/* 关于艺术家 */}
        {artist && (
          <RevealOnScroll>
            <AboutArtist
              artistSlug={artist.slug}
              artistName={artist.name}
              bio={artist.fullBio ?? artist.bio}
              role={artist.role}
              avatar={artist.avatar}
              locale={loc}
            />
          </RevealOnScroll>
        )}
      </div>

      {/* 相关推荐 */}
      <RevealOnScroll>
        <div className="mx-auto max-w-[1200px] px-4 md:px-7 lg:px-10">
          <RelatedWorks
            currentWork={work}
            sameSeries={sameSeries}
            sameArtist={sameArtist}
          />
        </div>
      </RevealOnScroll>

      {/* 悬浮购买栏：大图滚出视口时显示 */}
      <StickyPurchaseBar key={work.slug} work={work} locale={loc} />

      {/* 购物车滑出面板：加入购物车时触发 */}
      <CartDrawer locale={loc} />
    </main>
  );
}
