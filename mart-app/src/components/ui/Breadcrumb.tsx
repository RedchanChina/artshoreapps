"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * 面包屑导航：渲染层级路径，末项为当前页。
 * - 有 href 的项渲染为 next/link，路径前自动拼接 locale
 * - 末项（无 href）为当前页，text-gray-500 不可点击
 * - 桌面端可见（sm:block），移动端隐藏（由 BackButton 替代）
 * - items 的 label 由父组件传入（父组件负责 i18n 翻译）
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const locale = useLocale() as "zh" | "en";

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-8 hidden sm:block", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 text-[12px]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-2">
              {item.href ? (
                <Link
                  href={`/${locale}${item.href}`}
                  className="text-gray-700 transition-colors duration-200 ease-mart hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-gray-500"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-gray-300">
                  {">"}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
