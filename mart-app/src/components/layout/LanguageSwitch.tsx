"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type LangSwitchVariant = "light" | "dark" | "drawer";

interface LanguageSwitchProps {
  /** light：透明态导航栏；dark：固定态导航栏；drawer：移动端抽屉 */
  variant?: LangSwitchVariant;
  className?: string;
}

const OPTIONS = [
  { code: "zh", label: "中" },
  { code: "en", label: "EN" },
] as const;

/**
 * 语言切换：中 / EN。
 * - 当前 locale 来自 next-intl（URL 驱动，SSR 安全）
 * - 点击切换 URL locale 段（URL 为语言唯一来源）
 */
export function LanguageSwitch({
  variant = "dark",
  className,
}: LanguageSwitchProps) {
  const locale = useLocale() as "zh" | "en";
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (nextLocale: "zh" | "en") => {
    if (nextLocale === locale) return;
    const segments = pathname.split("/");
    if (segments[1] === "zh" || segments[1] === "en") {
      segments[1] = nextLocale;
      router.push(segments.join("/") || `/${nextLocale}`);
    } else {
      router.push(`/${nextLocale}`);
    }
  };

  const activeColor = variant === "dark" ? "text-ink" : "text-paper";
  const inactiveColor =
    variant === "dark"
      ? "text-gray-400 hover:text-ink"
      : "text-paper/50 hover:text-paper";
  const sepColor = variant === "dark" ? "text-gray-300" : "text-paper/35";

  const isDrawer = variant === "drawer";

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium uppercase",
        isDrawer
          ? "text-sm tracking-[0.1em]"
          : "text-[11px] tracking-[0.14em]",
        className
      )}
    >
      {OPTIONS.map((opt, idx) => {
        const isActive = locale === opt.code;
        return (
          <span key={opt.code} className="inline-flex items-center gap-1.5">
            {idx > 0 && (
              <span aria-hidden="true" className={cn("select-none", sepColor)}>
                /
              </span>
            )}
            <button
              type="button"
              onClick={() => switchTo(opt.code)}
              aria-pressed={isActive}
              className={cn(
                "px-0.5 py-1 transition-colors duration-200 ease-mart",
                isActive
                  ? cn(activeColor, "font-semibold border-b border-current")
                  : inactiveColor
              )}
            >
              {opt.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}

export default LanguageSwitch;
