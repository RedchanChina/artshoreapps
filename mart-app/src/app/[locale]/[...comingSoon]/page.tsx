/**
 * Catch-all 占位页：Phase 3/4 未构建路由统一显示"即将上线"。
 *
 * 所有未匹配到具体页面的路由（cart、account、faq、shipping、returns、store、search 等）
 * 均由此页面接管，避免用户看到 Next.js 默认 404。
 */
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";

interface ComingSoonPageProps {
  params: Promise<{ locale: string; comingSoon: string[] }>;
}

export default async function ComingSoonPage({ params }: ComingSoonPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("comingSoon");

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center pt-[120px] pb-20">
      <div className="mx-auto max-w-[480px] px-4 text-center">
        <h1 className="font-display text-[28px] font-light text-ink sm:text-[36px]">
          {t("title")}
        </h1>
        <p className="mt-4 text-[14px] leading-[1.7] text-gray-500">
          {t("description")}
        </p>
        <Link
          href={`/${locale}`}
          className="mt-8 inline-block border-b border-ink pb-[3px] text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-mart hover:border-brand hover:text-brand"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
