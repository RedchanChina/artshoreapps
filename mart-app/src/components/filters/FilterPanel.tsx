"use client";

import { FilterContent, type FilterContentProps } from "./FilterContent";
import { cn } from "@/lib/utils";

interface FilterPanelProps extends FilterContentProps {
  /** 侧边栏宽度（px），默认 240。 */
  width?: number;
  className?: string;
}

/**
 * 桌面端筛选侧边栏。
 *
 * 固定宽度（默认 240px）、sticky 定位（top 80px，避开 64px 导航栏 + 间距），
 * 背景 paper，复用 FilterContent。仅 lg 及以上断点显示，移动端隐藏。
 */
export function FilterPanel({ width = 240, className, ...contentProps }: FilterPanelProps) {
  return (
    <aside
      style={{ width }}
      className={cn("sticky top-[80px] hidden bg-paper lg:block", className)}
    >
      <FilterContent {...contentProps} />
    </aside>
  );
}

export default FilterPanel;
