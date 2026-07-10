"use client";

/**
 * 作品列表页客户端容器（Phase 2 Task 9.1 辅助组件）。
 *
 * 接收 Server Component 传递的初始数据（作品列表 / 筛选选项 / 当前状态），
 * 通过 router.push 更新 URL searchParams 驱动 Server Component 重新取数，
 * 实现筛选 / 排序 / 分页 / 品类切换的 URL 同步（MVP 简化策略）。
 *
 * 渲染：面包屑 + 返回按钮 + 页标题 + 品类标签栏 + 工具栏
 *       + 桌面筛选侧边栏 + 作品网格 + 分页 + 移动筛选抽屉。
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import type { Product } from "@/data/products";
import type {
  FilterOptions,
  FilterValues,
} from "@/components/filters/FilterContent";
import type { SortOption } from "@/components/filters/SortDropdown";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BackButton } from "@/components/ui/BackButton";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { FilterDrawer } from "@/components/filters/FilterDrawer";
import { SortDropdown } from "@/components/filters/SortDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/utils";

type Category = "all" | "photography" | "illustration";

interface WorksBrowseClientProps {
  products: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
  filterOptions: FilterOptions;
  filters: FilterValues;
  sort: SortOption;
  category: Category;
  locale: "zh" | "en";
}

const EMPTY_FILTERS: FilterValues = { artists: [], series: [], tiers: [] };

export function WorksBrowseClient({
  products,
  total,
  currentPage,
  totalPages,
  filterOptions,
  filters,
  sort,
  category,
  locale,
}: WorksBrowseClientProps) {
  const tFilters = useTranslations("filters");
  const tBreadcrumb = useTranslations("breadcrumb");
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  /** 构建 URL 并跳转（不自动滚动，分页由 Pagination 组件控制滚动）。 */
  const navigate = (
    nextCategory: Category,
    nextFilters: FilterValues,
    nextSort: SortOption,
    nextPage: number,
  ): void => {
    const params = new URLSearchParams();
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (nextFilters.artists.length > 0)
      params.set("artists", nextFilters.artists.join(","));
    if (nextFilters.series.length > 0)
      params.set("series", nextFilters.series.join(","));
    if (nextFilters.tiers.length > 0)
      params.set("tiers", nextFilters.tiers.join(","));
    if (nextSort !== "latest") params.set("sort", nextSort);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/${locale}/works?${qs}` : `/${locale}/works`, {
        scroll: false,
      });
    });
  };

  const handleCategoryChange = (next: Category) => {
    navigate(next, EMPTY_FILTERS, sort, 1);
  };

  const handleFiltersChange = (next: FilterValues) => {
    navigate(category, next, sort, 1);
  };

  const handleFiltersClear = () => {
    navigate(category, EMPTY_FILTERS, sort, 1);
  };

  const handleSortChange = (next: SortOption) => {
    navigate(category, filters, next, 1);
  };

  const handlePageChange = (page: number) => {
    navigate(category, filters, sort, page);
  };

  const categories: Array<{ key: Category; label: string }> = [
    { key: "all", label: tFilters("all") },
    { key: "photography", label: tFilters("photography") },
    { key: "illustration", label: tFilters("illustration") },
  ];

  return (
    <main className="pt-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-7 lg:px-10">
        <Breadcrumb
          items={[
            { label: tBreadcrumb("home"), href: "/" },
            { label: tBreadcrumb("works") },
          ]}
        />
        <BackButton fallbackHref={`/${locale}/works`} />

        {/* 页面标题 */}
        <h1 className="mb-8 font-display text-[28px] font-light text-ink sm:text-[36px]">
          {tBreadcrumb("works")}
        </h1>

        {/* 品类标签栏 */}
        <div className="mb-8">
          <div
            role="tablist"
            className="flex items-center gap-[26px] border-b border-line sm:gap-[58px]"
          >
            {categories.map((cat) => {
              const isActive = category === cat.key;
              return (
                <button
                  key={cat.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={cn(
                    "group relative pb-3.5 text-[16px] font-normal uppercase tracking-[0.14em] transition-colors duration-300 ease-mart sm:text-[25px] sm:tracking-[0.24em]",
                    isActive ? "text-ink" : "text-gray-500 hover:text-ink",
                  )}
                >
                  {cat.label}
                  <span
                    className={cn(
                      "absolute bottom-[-1px] left-0 h-[1.5px] w-full bg-ink transition-opacity duration-300 ease-mart",
                      isActive
                        ? "opacity-100"
                        : "opacity-25 group-hover:opacity-60",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 工具栏：移动筛选按钮 + 结果数 + 排序 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 border border-line px-4 py-2 text-[13px] font-medium text-ink transition-colors duration-200 ease-mart hover:bg-gray-100 lg:hidden"
            >
              <SlidersHorizontal size={14} strokeWidth={1.5} />
              {tFilters("button")}
            </button>
            <span className={cn("text-[13px] text-gray-500 tabular-nums", isPending && "opacity-50")}>
              {tFilters("resultCount", { count: total })}
            </span>
            {isPending && (
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-ink"
              />
            )}
          </div>
          <SortDropdown value={sort} onChange={handleSortChange} />
        </div>

        {/* 主体：筛选侧边栏 + 作品网格 / 空状态 */}
        <div className="flex gap-6">
          <FilterPanel
            options={filterOptions}
            values={filters}
            onChange={handleFiltersChange}
            onClear={handleFiltersClear}
          />
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-[14px] text-gray-500">
                  {tFilters("noResult")}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                  {products.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i}
                      variant="grid"
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 移动端筛选抽屉 */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        resultCount={total}
        options={filterOptions}
        values={filters}
        onChange={handleFiltersChange}
        onClear={handleFiltersClear}
      />
    </main>
  );
}

export default WorksBrowseClient;
