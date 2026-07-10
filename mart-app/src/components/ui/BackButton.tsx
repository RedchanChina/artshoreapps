"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

/**
 * 返回按钮：移动端导航返回。
 * - 提供 fallbackHref 时 router.push(fallbackHref)，否则 router.back()
 * - 仅移动端显示（sm:hidden），桌面端由 Breadcrumb 替代
 * - 点击区域最小 44×44px，满足触控可达性
 * - 默认文案取自 common.back，可通过 label prop 覆盖
 */
export function BackButton({ fallbackHref, label, className }: BackButtonProps) {
  const router = useRouter();
  const t = useTranslations("common");

  const handleClick = () => {
    if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  };

  const displayLabel = label ?? t("back");

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={displayLabel}
      className={cn(
        "mb-4 inline-flex min-h-[44px] items-center gap-1 sm:hidden",
        className
      )}
    >
      <ChevronLeft size={16} strokeWidth={1.5} className="text-gray-700" />
      <span className="text-[13px] text-gray-700">{displayLabel}</span>
    </button>
  );
}

export default BackButton;
