"use client";

import { useTranslations } from "next-intl";

/**
 * 滚动提示：SCROLL 文字 + 渐变竖线。
 * - 文字 10px，letter-spacing 0.24em，半透明
 * - 居中定位：absolute left-1/2 -translate-x-1/2
 * - 竖线动画：渐变从上到下滚动（@keyframes scrollLine）
 * - 文案通过 next-intl useTranslations('hero') 获取
 */
export default function ScrollHint() {
  const t = useTranslations("hero");

  return (
    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2.5 lg:bottom-7">
      <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[rgba(250,250,247,0.55)]">
        {t("scrollHint")}
      </span>
      <span className="relative block h-8 w-px overflow-hidden">
        <span className="animate-scroll-line absolute inset-0 block bg-gradient-to-b from-[rgba(250,250,247,0.6)] to-transparent" />
      </span>
    </div>
  );
}
