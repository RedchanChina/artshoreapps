"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { FilterContent, type FilterContentProps } from "./FilterContent";
import { cn } from "@/lib/utils";

interface FilterDrawerProps extends FilterContentProps {
  open: boolean;
  onClose: () => void;
  /** 应用当前筛选后的结果数量，用于底部按钮文案。 */
  resultCount?: number;
}

/**
 * 移动端筛选抽屉：从底部滑入的底部表单。
 *
 * 高度 85vh，顶部圆角 12px（rounded-t-xl），背景 paper；遮罩 bg-ink/40 点击关闭。
 * 打开时锁定背景滚动并支持 ESC 关闭，复用 FilterContent 作为滚动区内容。
 * 仅移动端显示（lg:hidden）。
 */
export function FilterDrawer({ open, onClose, resultCount, ...contentProps }: FilterDrawerProps) {
  const t = useTranslations("filters");

  // ESC 关闭 + 锁定背景滚动
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label={t("drawerTitle")}
      className={cn("fixed inset-0 z-[400] lg:hidden", open ? "" : "pointer-events-none")}
    >
      {/* 背景遮罩 */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity duration-[400ms] ease-mart",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* 抽屉面板 */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex h-[85vh] flex-col rounded-t-xl bg-paper transition-transform duration-[400ms] ease-mart",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* 头部：标题 + 关闭按钮 */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-medium text-ink">{t("drawerTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="flex h-8 w-8 items-center justify-center text-ink"
          >
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>

        {/* 滚动区：复用 FilterContent */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FilterContent {...contentProps} />
        </div>

        {/* 底部确认：查看 N 件作品 */}
        <div className="border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-ink py-3.5 text-[13px] font-medium text-paper transition-colors duration-200 ease-mart hover:bg-stone"
          >
            {t("viewResults", { count: resultCount ?? 0 })}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterDrawer;
