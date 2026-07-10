/**
 * 作品列表页（Phase 2 Task 9.1）。
 *
 * Server Component：解析 URL searchParams → 调用 fetchWorks 取数 →
 * 将 Work[] 转为 Product[] + 构建 FilterOptions → 传递给 WorksBrowseClient。
 *
 * MVP 策略：所有筛选/排序/分页/品类变更由 Client Component 通过 router.push
 * 更新 URL，本 Server Component 读取新 searchParams 后重新取数并渲染。
 */
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";
import { fetchWorks } from "@/lib/actions";
import { toLegacyProduct } from "@/data/works";
import { ARTISTS } from "@/data/artists";
import { SERIES } from "@/data/series";
import type { TierName, Currency } from "@/data/types";
import type {
  FilterOptions,
  FilterValues,
} from "@/components/filters/FilterContent";
import type { SortOption } from "@/components/filters/SortDropdown";
import { WorksBrowseClient } from "./_components/WorksBrowseClient";

const PAGE_SIZE = 24;
const VALID_TIERS: TierName[] = ["small", "medium", "large", "xlarge"];

type Category = "all" | "photography" | "illustration";

type SearchParams = Record<string, string | string[] | undefined>;

/** 将 searchParams 中的数组型参数解析为 string[]。 */
function parseArrayParam(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 解析尺寸档位参数，过滤掉无效值。 */
function parseTiers(value: string | string[] | undefined): TierName[] {
  return parseArrayParam(value).filter((t): t is TierName =>
    VALID_TIERS.includes(t as TierName),
  );
}

/** 解析品类参数。 */
function parseCategory(value: string | string[] | undefined): Category {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "photography" || raw === "illustration") return raw;
  return "all";
}

/** 解析排序参数。 */
function parseSort(value: string | string[] | undefined): SortOption {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "price-asc" || raw === "price-desc" || raw === "scarcity")
    return raw;
  return "latest";
}

/** 解析页码参数。 */
function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export default async function WorksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const search = await searchParams;
  const category = parseCategory(search.category);
  const artistSlugs = parseArrayParam(search.artists);
  const seriesSlugs = parseArrayParam(search.series);
  const tiers = parseTiers(search.tiers);
  const sort = parseSort(search.sort);
  const page = parsePage(search.page);

  const cookieStore = await cookies();
  const currency = (cookieStore.get("mart-currency")?.value as Currency) || "CNY";

  const result = await fetchWorks(
    {
      category,
      artistSlugs,
      seriesSlugs,
      tiers,
      includeSoldOut: true,
    },
    sort,
    { page, pageSize: PAGE_SIZE },
    currency,
  );

  const products = result.items.map(toLegacyProduct);

  const filterOptions: FilterOptions = {
    artists: ARTISTS.map((a) => ({ slug: a.slug, name: a.name })),
    series: SERIES.map((s) => ({
      slug: s.slug,
      name: s.name,
      artistSlug: s.artistSlug,
    })),
    tiers: VALID_TIERS,
  };

  const filters: FilterValues = { artists: artistSlugs, series: seriesSlugs, tiers };

  return (
    <WorksBrowseClient
      products={products}
      total={result.total}
      currentPage={result.page}
      totalPages={result.totalPages}
      filterOptions={filterOptions}
      filters={filters}
      sort={sort}
      category={category}
      locale={locale}
    />
  );
}
