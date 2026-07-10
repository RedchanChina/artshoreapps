"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

type PageItem = number | "ellipsis";

/**
 * 计算分页页码序列：始终包含首尾页，当前页前后各 2 页，超出用省略号。
 */
function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: PageItem[] = [1];
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);
  if (start > 2) items.push("ellipsis");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

/**
 * 分页导航：受控页码切换。
 * - 上一页 / 下一页箭头按钮，当前页高亮 bg-ink text-paper
 * - 页码窗口：当前页前后各 2 页，超出用 ... 省略
 * - 仅桌面端显示（移动端使用无限滚动）
 * - 点击页码后滚动到页面顶部
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const t = useTranslations("pagination");

  if (totalPages <= 1) return null;

  const items = getPageItems(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    onPageChange(page);
    window.scrollTo({ top: 0 });
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "mt-12 hidden items-center justify-center gap-2 sm:flex",
        className
      )}
    >
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrev}
        aria-label={t("prev")}
        className={cn(
          "flex h-8 w-8 items-center justify-center text-gray-700 transition-colors duration-200 ease-mart hover:bg-gray-100",
          !hasPrev && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>

      {items.map((item, index) => {
        if (item === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center text-[13px] text-gray-500"
            >
              ...
            </span>
          );
        }
        const isActive = item === currentPage;
        return (
          <button
            key={item}
            type="button"
            onClick={() => handlePageChange(item)}
            aria-label={t("page", { n: item })}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-8 w-8 items-center justify-center text-[13px] transition-colors duration-200 ease-mart",
              isActive ? "bg-ink text-paper" : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNext}
        aria-label={t("next")}
        className={cn(
          "flex h-8 w-8 items-center justify-center text-gray-700 transition-colors duration-200 ease-mart hover:bg-gray-100",
          !hasNext && "opacity-40"
        )}
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </nav>
  );
}

export default Pagination;
