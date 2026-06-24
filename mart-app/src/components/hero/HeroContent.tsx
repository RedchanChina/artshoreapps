"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { HeroSlide as HeroSlideType } from "@/data/hero";
import { cn } from "@/lib/utils";

interface HeroContentProps {
  slide: HeroSlideType;
}

/**
 * Hero 文案层：标签 / 主标题 / 副标题 / CTA。
 * - 通过 useLocale 读取当前语言（URL 驱动，SSR 安全），展示对应语言内容
 * - 文字入场动画：active 时淡入上移（CSS transition，分层延迟）
 * - 始终居中定位（参考 .hero__content: text-align:center; max-width:800px; margin:0 auto）
 * 标题含 <br/> 换行，来自受信数据源，使用 dangerouslySetInnerHTML 渲染
 */
export default function HeroContent({ slide }: HeroContentProps) {
  const locale = useLocale() as "zh" | "en";
  const [entered, setEntered] = useState(false);

  // 挂载后下一帧触发入场，确保初始隐藏态先绘制以触发 transition
  // 父组件以 key={slide.id} 挂载，切换 slide 时重新触发
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const tag = slide.tag[locale];
  const title = slide.title[locale];
  const subtitle = slide.subtitle[locale];
  const cta = slide.cta[locale];

  const base = "transition-all duration-700 ease-mart";
  const hidden = "translate-y-4 opacity-0";
  const visible = "translate-y-0 opacity-100";

  return (
    <div className="absolute bottom-0 left-0 z-20 w-full px-5 pb-40 text-center sm:px-10 lg:pb-[110px]">
      <div className="mx-auto max-w-[800px]">
        {/* 标签 */}
        <p
          className={cn(base, entered ? visible : hidden)}
          style={{ transitionDelay: entered ? "200ms" : "0ms" }}
        >
          <span className="text-[12px] font-medium uppercase tracking-[0.24em] text-[rgba(250,250,247,0.6)]">
            {tag}
          </span>
        </p>

        {/* 主标题 */}
        <h2
          className={cn(
            "mt-4 font-display text-white",
            base,
            entered ? visible : hidden
          )}
          style={{
            fontSize: "clamp(32px, 4vw, 56px)",
            fontWeight: 200,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            transitionDelay: entered ? "350ms" : "0ms",
          }}
          dangerouslySetInnerHTML={{ __html: title }}
        />

        {/* 副标题 */}
        <p
          className={cn("mt-3.5", base, entered ? visible : hidden)}
          style={{
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(250,250,247,0.78)",
            whiteSpace: "nowrap",
            transitionDelay: entered ? "500ms" : "0ms",
          }}
        >
          {subtitle}
        </p>

        {/* CTA 链接：link-arrow 样式 */}
        <Link
          href={`/${locale}${slide.ctaLink}`}
          className={cn(
            "group mt-9 inline-flex items-center gap-2.5 border-b border-[rgba(250,250,247,0.7)] pb-1 text-[12px] font-medium uppercase tracking-[0.24em] text-paper transition-all duration-300 ease-mart hover:gap-4 hover:border-paper",
            base,
            entered ? visible : hidden
          )}
          style={{ transitionDelay: entered ? "650ms" : "0ms" }}
        >
          {cta}
          <span className="transition-transform duration-300 ease-mart">→</span>
        </Link>
      </div>
    </div>
  );
}
