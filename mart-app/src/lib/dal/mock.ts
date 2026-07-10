/**
 * M·art 艺术商店内存 Mock 仓储实现（Phase 2）。
 *
 * 内部引用 WORKS / ARTISTS / SERIES 常量与查询函数，实现 dal/types.ts 中的仓储接口。
 * 提供 applyFilters / applySort / paginate 内部工具，导出三个仓储单例：
 * workRepository / artistRepository / seriesRepository。
 *
 * Phase 3 将由 prisma.ts 中的实现替换，上层无需改动。
 */

import type { Work, Artist, Series, Currency } from "@/data/types";
import {
  WORKS,
  getWorkBySlug as findWorkBySlug,
  getRelatedWorks as findRelatedWorks,
  getWorksByArtist as findWorksByArtist,
  getWorksBySeries as findWorksBySeries,
} from "@/data/works";
import { ARTISTS, getArtistBySlug as findArtistBySlug } from "@/data/artists";
import { SERIES, getSeriesBySlug as findSeriesBySlug } from "@/data/series";
import type {
  WorkFilters,
  WorkSort,
  PaginationParams,
  PaginatedResult,
  WorkRepository,
  ArtistRepository,
  SeriesRepository,
} from "./types";

/**
 * 按 filters 筛选作品。
 * - category: "all" 或 undefined 时不限；否则精确匹配
 * - artistSlugs / seriesSlugs: 非空数组时取交集
 * - tiers: 作品只要存在任一档位 tierName 命中即保留
 * - includeSoldOut: false 时剔除 sold >= total 的售罄作品
 */
function applyFilters(works: Work[], filters: WorkFilters): Work[] {
  const { category, artistSlugs, seriesSlugs, tiers, includeSoldOut } = filters;
  return works.filter((w) => {
    if (category && category !== "all" && w.category !== category) {
      return false;
    }
    if (
      artistSlugs &&
      artistSlugs.length > 0 &&
      !artistSlugs.includes(w.artistSlug)
    ) {
      return false;
    }
    if (seriesSlugs && seriesSlugs.length > 0) {
      if (w.seriesSlug == null || !seriesSlugs.includes(w.seriesSlug)) {
        return false;
      }
    }
    if (tiers && tiers.length > 0) {
      const hasTier = w.editionTiers.some((t) => tiers.includes(t.tierName));
      if (!hasTier) return false;
    }
    if (!includeSoldOut && w.sold >= w.total) {
      return false;
    }
    return true;
  });
}

/** 按币种取作品展示价。 */
function priceOf(work: Work, currency: Currency): number {
  return currency === "CNY" ? work.priceCNY : work.priceUSD;
}

/**
 * 按 sort 排序作品（不修改原数组）。
 * - latest: creationYear 降序
 * - price-asc / price-desc: 按 currency 取 priceCNY/priceUSD
 * - scarcity: sold/total 升序（数值越小越靠前）
 */
function applySort(
  works: Work[],
  sort: WorkSort,
  currency: Currency
): Work[] {
  const sorted = [...works];
  switch (sort) {
    case "latest":
      sorted.sort((a, b) => b.creationYear - a.creationYear);
      break;
    case "price-asc":
      sorted.sort((a, b) => priceOf(a, currency) - priceOf(b, currency));
      break;
    case "price-desc":
      sorted.sort((a, b) => priceOf(b, currency) - priceOf(a, currency));
      break;
    case "scarcity":
      sorted.sort((a, b) => a.sold / a.total - b.sold / b.total);
      break;
  }
  return sorted;
}

/** slice 分页，totalPages = ceil(total / pageSize)。 */
function paginate<T>(
  items: T[],
  pagination: PaginationParams
): PaginatedResult<T> {
  const { page, pageSize } = pagination;
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  return { items: pageItems, total, page, pageSize, totalPages };
}

/** 作品 Mock 仓储。 */
class MockWorkRepository implements WorkRepository {
  async listWorks(
    filters: WorkFilters,
    sort: WorkSort,
    pagination: PaginationParams,
    currency: Currency
  ): Promise<PaginatedResult<Work>> {
    const filtered = applyFilters(WORKS, filters);
    const sorted = applySort(filtered, sort, currency);
    return paginate(sorted, pagination);
  }

  async getWorkBySlug(slug: string): Promise<Work | null> {
    return findWorkBySlug(slug) ?? null;
  }

  async getRelatedWorks(
    slug: string
  ): Promise<{ sameSeries: Work[]; sameArtist: Work[] }> {
    const work = findWorkBySlug(slug);
    if (!work) return { sameSeries: [], sameArtist: [] };
    return findRelatedWorks(work);
  }

  async getWorksByArtist(artistSlug: string): Promise<Work[]> {
    return findWorksByArtist(artistSlug);
  }

  async getWorksBySeries(
    artistSlug: string,
    seriesSlug: string
  ): Promise<Work[]> {
    return findWorksBySeries(artistSlug, seriesSlug);
  }
}

/** 艺术家 Mock 仓储。 */
class MockArtistRepository implements ArtistRepository {
  async listArtists(sort: "name" | "workCount"): Promise<Artist[]> {
    // 过滤无作品的艺术家（种子数据缺口，后续补充数据后移除过滤）
    const filtered = ARTISTS.filter((a) => a.workCount > 0);
    const sorted = [...filtered];
    if (sort === "name") {
      sorted.sort((a, b) => a.name.zh.localeCompare(b.name.zh));
    } else {
      sorted.sort((a, b) => b.workCount - a.workCount);
    }
    return sorted;
  }

  async getArtistBySlug(slug: string): Promise<Artist | null> {
    return findArtistBySlug(slug) ?? null;
  }
}

/** 系列 Mock 仓储。 */
class MockSeriesRepository implements SeriesRepository {
  async listSeriesByArtist(artistSlug: string): Promise<Series[]> {
    return SERIES.filter((s) => s.artistSlug === artistSlug);
  }

  async getSeriesBySlug(
    artistSlug: string,
    seriesSlug: string
  ): Promise<Series | null> {
    return findSeriesBySlug(artistSlug, seriesSlug) ?? null;
  }
}

/** 作品仓储单例。 */
export const workRepository: WorkRepository = new MockWorkRepository();

/** 艺术家仓储单例。 */
export const artistRepository: ArtistRepository = new MockArtistRepository();

/** 系列仓储单例。 */
export const seriesRepository: SeriesRepository = new MockSeriesRepository();
