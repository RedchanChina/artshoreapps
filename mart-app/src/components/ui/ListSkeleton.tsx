import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  count?: number;
  columns?: { desktop: number; tablet: number; mobile: number };
  showFilter?: boolean;
  className?: string;
}

const COLUMN_CLASSES: Record<
  number,
  { mobile: string; tablet: string; desktop: string }
> = {
  1: { mobile: "grid-cols-1", tablet: "sm:grid-cols-1", desktop: "lg:grid-cols-1" },
  2: { mobile: "grid-cols-2", tablet: "sm:grid-cols-2", desktop: "lg:grid-cols-2" },
  3: { mobile: "grid-cols-3", tablet: "sm:grid-cols-3", desktop: "lg:grid-cols-3" },
  4: { mobile: "grid-cols-4", tablet: "sm:grid-cols-4", desktop: "lg:grid-cols-4" },
  5: { mobile: "grid-cols-5", tablet: "sm:grid-cols-5", desktop: "lg:grid-cols-5" },
  6: { mobile: "grid-cols-6", tablet: "sm:grid-cols-6", desktop: "lg:grid-cols-6" },
};

/**
 * 列表骨架屏：作品列表加载占位。
 * - 渲染 count 个骨架卡片（正方形图片 + 文字行）
 * - 桌面端左侧渲染筛选侧边栏骨架（240px 宽，3 组筛选占位）
 * - 网格响应式：移动 2 列 / 平板 3 列 / 桌面 4 列（可通过 columns 自定义）
 * - 使用 animate-shimmer 微光动效
 */
export function ListSkeleton({
  count = 12,
  columns = { desktop: 4, tablet: 3, mobile: 2 },
  showFilter = true,
  className,
}: ListSkeletonProps) {
  const mobile = COLUMN_CLASSES[columns.mobile]?.mobile ?? "grid-cols-2";
  const tablet = COLUMN_CLASSES[columns.tablet]?.tablet ?? "sm:grid-cols-3";
  const desktop = COLUMN_CLASSES[columns.desktop]?.desktop ?? "lg:grid-cols-4";

  return (
    <div className={cn("flex gap-6", className)}>
      {showFilter && (
        <aside className="hidden w-[240px] flex-shrink-0 lg:block">
          <FilterGroupSkeleton />
          <FilterGroupSkeleton />
          <FilterGroupSkeleton />
        </aside>
      )}
      <div
        className={cn(
          "grid flex-1 gap-3 sm:gap-4 lg:gap-6",
          mobile,
          tablet,
          desktop
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2px] bg-gray-200">
        <div
          aria-hidden="true"
          className="animate-shimmer pointer-events-none absolute inset-0"
        />
      </div>
      <div className="pt-3.5">
        <div className="relative h-3 w-2/3 overflow-hidden rounded-[2px] bg-gray-200">
          <div
            aria-hidden="true"
            className="animate-shimmer pointer-events-none absolute inset-0"
          />
        </div>
        <div className="relative mt-2 h-3 w-1/2 overflow-hidden rounded-[2px] bg-gray-200">
          <div
            aria-hidden="true"
            className="animate-shimmer pointer-events-none absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
}

function FilterGroupSkeleton() {
  return (
    <div className="mb-6 last:mb-0">
      <div className="relative mb-3 h-3 w-20 overflow-hidden rounded-[2px] bg-gray-200">
        <div
          aria-hidden="true"
          className="animate-shimmer pointer-events-none absolute inset-0"
        />
      </div>
      <div className="space-y-2">
        <div className="relative h-3 w-full overflow-hidden rounded-[2px] bg-gray-200">
          <div
            aria-hidden="true"
            className="animate-shimmer pointer-events-none absolute inset-0"
          />
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-[2px] bg-gray-200">
          <div
            aria-hidden="true"
            className="animate-shimmer pointer-events-none absolute inset-0"
          />
        </div>
        <div className="relative h-3 w-3/4 overflow-hidden rounded-[2px] bg-gray-200">
          <div
            aria-hidden="true"
            className="animate-shimmer pointer-events-none absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
}

export default ListSkeleton;
