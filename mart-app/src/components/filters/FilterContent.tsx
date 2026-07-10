"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { LocalizedText, TierName } from "@/data/types";
import { cn } from "@/lib/utils";

/** 筛选项可选项集合。 */
export interface FilterOptions {
  artists: Array<{ slug: string; name: LocalizedText }>;
  /**
   * 系列可携带 artistSlug 以支持按已选艺术家动态过滤。
   * 该字段可选，保证与原始接口形态向后兼容。
   */
  series: Array<{ slug: string; name: LocalizedText; artistSlug?: string }>;
  tiers: TierName[];
}

/** 当前筛选值。 */
export interface FilterValues {
  artists: string[];
  series: string[];
  tiers: TierName[];
}

/** FilterContent 共享属性。 */
export interface FilterContentProps {
  options: FilterOptions;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClear: () => void;
}

/** TierName → filters 命名空间文案 key 映射。 */
const TIER_LABEL_KEY: Record<
  TierName,
  "tierSmall" | "tierMedium" | "tierLarge" | "tierExtraLarge"
> = {
  small: "tierSmall",
  medium: "tierMedium",
  large: "tierLarge",
  xlarge: "tierExtraLarge",
};

/**
 * 共享筛选内容组件（受控）。
 *
 * 渲染艺术家 / 系列 / 尺寸档位三组多选筛选项，供桌面侧边栏与移动抽屉复用。
 * 系列列表会根据已选艺术家动态过滤；取消选中艺术家时同步移除其名下系列，
 * 避免产生不可见的幽灵筛选。
 */
export function FilterContent({ options, values, onChange, onClear }: FilterContentProps) {
  const t = useTranslations("filters");
  const locale = useLocale() as "zh" | "en";

  /** 按 locale 取本地化文本。 */
  const localized = (text: LocalizedText): string => text[locale];

  /** 系列 slug → artistSlug 映射，用于取消艺术家时清理关联系列。 */
  const seriesArtistMap = new Map<string, string | undefined>();
  for (const item of options.series) {
    seriesArtistMap.set(item.slug, item.artistSlug);
  }

  /** 已选艺术家时仅显示其名下系列，否则显示全部。 */
  const visibleSeries =
    values.artists.length > 0
      ? options.series.filter(
          (item) => !item.artistSlug || values.artists.includes(item.artistSlug),
        )
      : options.series;

  const toggleArtist = (slug: string) => {
    const isSelected = values.artists.includes(slug);
    const artists = isSelected
      ? values.artists.filter((s) => s !== slug)
      : [...values.artists, slug];
    // 取消选中艺术家时，移除该艺术家名下的系列选择
    const series = isSelected
      ? values.series.filter((sid) => seriesArtistMap.get(sid) !== slug)
      : values.series;
    onChange({ ...values, artists, series });
  };

  const toggleSeries = (slug: string) => {
    const series = values.series.includes(slug)
      ? values.series.filter((s) => s !== slug)
      : [...values.series, slug];
    onChange({ ...values, series });
  };

  const toggleTier = (tier: TierName) => {
    const tiers = values.tiers.includes(tier)
      ? values.tiers.filter((x) => x !== tier)
      : [...values.tiers, tier];
    onChange({ ...values, tiers });
  };

  return (
    <div>
      {/* 区段标题 + 清除全部 */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink">
          {t("title")}
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-[13px] text-gray-500 transition-colors duration-200 ease-mart hover:text-ink"
        >
          {t("reset")}
        </button>
      </div>

      <FilterGroup title={t("artist")}>
        {options.artists.map((artist) => (
          <FilterCheckbox
            key={artist.slug}
            checked={values.artists.includes(artist.slug)}
            label={localized(artist.name)}
            onToggle={() => toggleArtist(artist.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t("series")}>
        {visibleSeries.map((item) => (
          <FilterCheckbox
            key={item.slug}
            checked={values.series.includes(item.slug)}
            label={localized(item.name)}
            onToggle={() => toggleSeries(item.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={t("sizeTier")}>
        {options.tiers.map((tier) => (
          <FilterCheckbox
            key={tier}
            checked={values.tiers.includes(tier)}
            label={t(TIER_LABEL_KEY[tier])}
            onToggle={() => toggleTier(tier)}
          />
        ))}
      </FilterGroup>
    </div>
  );
}

/** 单组筛选：标题 + 选项列表。 */
function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ink">
        {title}
      </h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

/** 多选项 checkbox：选中时文字 text-ink、方框 border-brand bg-brand。 */
function FilterCheckbox({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center border transition-colors duration-200 ease-mart",
          checked ? "border-brand bg-brand" : "border-gray-300 bg-white",
        )}
      >
        {checked && <Check size={12} strokeWidth={2.5} className="text-paper" />}
      </span>
      <span
        className={cn(
          "text-[13px] transition-colors duration-200 ease-mart",
          checked ? "text-ink" : "text-gray-700",
        )}
      >
        {label}
      </span>
    </label>
  );
}

export default FilterContent;
