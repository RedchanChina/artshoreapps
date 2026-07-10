/**
 * M·art 艺术商店 Server Actions（Phase 2）。
 *
 * 通过仓储单例暴露数据查询能力给 Server Component / Client 调用。
 * Phase 3 切换仓储实现（mock → prisma）时，仅需修改 import 来源，函数签名不变。
 */

"use server";

import { workRepository, artistRepository, seriesRepository } from "./dal/prisma";
import type { WorkFilters, WorkSort, PaginationParams } from "./dal/types";
import type { Currency } from "@/data/types";

/** 查询作品列表（筛选 + 排序 + 分页）。 */
export async function fetchWorks(
  filters: WorkFilters,
  sort: WorkSort,
  pagination: PaginationParams,
  currency: Currency
) {
  return workRepository.listWorks(filters, sort, pagination, currency);
}

/** 按 slug 查询单件作品。 */
export async function fetchWorkBySlug(slug: string) {
  return workRepository.getWorkBySlug(slug);
}

/** 查询相关作品（同系列 + 同艺术家）。 */
export async function fetchRelatedWorks(slug: string) {
  return workRepository.getRelatedWorks(slug);
}

/** 查询某艺术家的全部作品。 */
export async function fetchWorksByArtist(artistSlug: string) {
  return workRepository.getWorksByArtist(artistSlug);
}

/** 查询某艺术家某系列下的全部作品。 */
export async function fetchWorksBySeries(
  artistSlug: string,
  seriesSlug: string
) {
  return workRepository.getWorksBySeries(artistSlug, seriesSlug);
}

/** 查询艺术家列表。 */
export async function fetchArtists(sort: "name" | "workCount") {
  return artistRepository.listArtists(sort);
}

/** 按 slug 查询单个艺术家。 */
export async function fetchArtistBySlug(slug: string) {
  return artistRepository.getArtistBySlug(slug);
}

/** 查询某艺术家的全部系列。 */
export async function fetchSeriesByArtist(artistSlug: string) {
  return seriesRepository.listSeriesByArtist(artistSlug);
}

/** 按艺术家 slug + 系列 slug 查询单个系列。 */
export async function fetchSeriesBySlug(
  artistSlug: string,
  seriesSlug: string
) {
  return seriesRepository.getSeriesBySlug(artistSlug, seriesSlug);
}
