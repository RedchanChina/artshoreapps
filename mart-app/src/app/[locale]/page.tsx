import { setRequestLocale } from "next-intl/server";
import HeroCarousel from "@/components/hero/HeroCarousel";
import { TabSection } from "@/components/products/TabSection";
import { FeaturedArtist } from "@/components/artists/FeaturedArtist";
import { SignedArtistsScroll } from "@/components/artists/SignedArtistsScroll";
import Newsletter from "@/components/layout/Newsletter";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { featuredArtist } from "@/data/artists";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      {/* Hero 全屏轮播 */}
      <HeroCarousel />

      {/* Tab 类别切换区（摄影 / 插画） */}
      <RevealOnScroll>
        <TabSection />
      </RevealOnScroll>

      {/* 精选艺术家 */}
      <RevealOnScroll>
        <section>
          <div className="mx-auto h-px w-[80vw] bg-line" />
          <div className="mx-auto max-w-[1200px]">
            <FeaturedArtist featured={featuredArtist} />
          </div>
        </section>
      </RevealOnScroll>

      {/* 签约艺术家横向滑动区 */}
      <RevealOnScroll>
        <section className="pt-10 pb-20">
          <SignedArtistsScroll />
        </section>
      </RevealOnScroll>

      {/* 深色订阅区 */}
      <RevealOnScroll>
        <Newsletter />
      </RevealOnScroll>
    </main>
  );
}
