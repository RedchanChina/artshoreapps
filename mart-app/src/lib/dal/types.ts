/**
 * M·art 艺术商店数据访问层（DAL）接口定义。
 *
 * 仓储接口抽象数据来源，Phase 2 由 MockWorkRepository 等内存实现，
 * Phase 3 由 PrismaWorkRepository 等数据库实现替换，上层（Server Actions）无感知。
 */

import type { Work, Artist, Series, TierName, Currency } from "@/data/types";

/** 作品列表筛选条件。 */
export interface WorkFilters {
  category?: "photography" | "illustration" | "all";
  artistSlugs?: string[];
  seriesSlugs?: string[];
  tiers?: TierName[];
  includeSoldOut?: boolean;
}

/** 作品列表排序方式。 */
export type WorkSort = "latest" | "price-asc" | "price-desc" | "scarcity";

/** 分页参数。 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** 分页结果。 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 作品仓储接口。 */
export interface WorkRepository {
  listWorks(
    filters: WorkFilters,
    sort: WorkSort,
    pagination: PaginationParams,
    currency: Currency
  ): Promise<PaginatedResult<Work>>;
  getWorkBySlug(slug: string): Promise<Work | null>;
  getRelatedWorks(slug: string): Promise<{ sameSeries: Work[]; sameArtist: Work[] }>;
  getWorksByArtist(artistSlug: string): Promise<Work[]>;
  getWorksBySeries(artistSlug: string, seriesSlug: string): Promise<Work[]>;
}

/** 艺术家仓储接口。 */
export interface ArtistRepository {
  listArtists(sort: "name" | "workCount"): Promise<Artist[]>;
  getArtistBySlug(slug: string): Promise<Artist | null>;
}

/** 系列仓储接口。 */
export interface SeriesRepository {
  listSeriesByArtist(artistSlug: string): Promise<Series[]>;
  getSeriesBySlug(artistSlug: string, seriesSlug: string): Promise<Series | null>;
}
