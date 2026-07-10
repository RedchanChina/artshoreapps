"use client";

/**
 * 关于艺术家区块（作品详情页底部）。
 *
 * 在 WorkDetailsAccordion 之后、RelatedWorks 之前展示艺术家简介，
 * 引导用户前往艺术家详情页。双列排版：左正方形头像 + 右文字介绍
 * （标题/role/简介/查看作品链接/关注按钮，参照 Tappan Collective）。
 *
 * Client Component。
 */
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { LocalizedText } from "@/data/types";
import { cn } from "@/lib/utils";

interface AboutArtistProps {
  artistSlug: string;
  artistName: LocalizedText;
  bio: LocalizedText; // 优先 fullBio，回退 bio
  role: LocalizedText;
  avatar: string;
  locale: "zh" | "en";
}

export function AboutArtist({
  artistSlug,
  artistName,
  bio,
  role,
  avatar,
  locale,
}: AboutArtistProps) {
  const t = useTranslations("workDetail.aboutArtist");

  const [toast, setToast] = useState<string | null>(null);

  // toast 3 秒后自动清除（参照 WorkDetailClient 模式）
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <section className="border-t border-line pt-12 mt-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* 左：正方形大头像 */}
        <div className="aspect-square w-full overflow-hidden bg-gray-100">
          <img
            src={avatar}
            alt={artistName[locale]}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>

        {/* 右：文字介绍 */}
        <div>
          <span className="text-[12px] uppercase tracking-[0.2em] text-gray-500">
            {t("eyebrow")}
          </span>

          <h2 className="mt-4 font-display text-[clamp(22px,2.6vw,32px)] font-light leading-[1.25] tracking-[-0.02em] text-ink">
            {artistName[locale]}
          </h2>

          <p className="mt-3 text-[12px] text-gray-500">{role[locale]}</p>

          <p className="mt-4 text-[14px] leading-[1.7] text-gray-700 max-w-[600px]">
            {bio[locale]}
          </p>

          <div className="mt-6 flex flex-col items-start gap-3">
            <Link
              href={`/${locale}/artists/${artistSlug}`}
              className={cn(
                "inline-flex items-center gap-2",
                "text-[13px] font-medium text-ink",
                "transition-colors duration-200 ease-mart hover:text-brand",
              )}
            >
              {t("viewAllWorks")}
              <span aria-hidden="true">→</span>
            </Link>
            <button
              type="button"
              onClick={() => setToast(t("followComingSoon"))}
              className="text-[13px] font-medium text-gray-500 transition-colors duration-200 ease-mart hover:text-ink"
            >
              + {t("follow", { name: artistName[locale] })}
            </button>
          </div>
        </div>
      </div>

      {/* toast */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 bg-ink px-6 py-3 text-sm text-paper transition-opacity duration-300 ease-mart",
          toast ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        role="status"
        aria-live="polite"
      >
        {toast ?? ""}
      </div>
    </section>
  );
}

export default AboutArtist;
