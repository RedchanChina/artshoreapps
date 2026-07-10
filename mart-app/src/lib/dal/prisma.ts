/**
 * M·art 艺术商店 Prisma DAL 仓储实现（Phase 3）。
 *
 * 实现 dal/types.ts 中的三个仓储接口，使用 Prisma client 查询数据库，
 * 替换 Phase 2 的 mock.ts 内存实现。筛选/排序/分页逻辑与 mock 保持一致，
 * 上层（Server Actions）无需改动。
 */

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type {
  Work,
  Artist,
  Series,
  Exhibition,
  EditionTier,
  LocalizedText,
  TierName,
  Currency,
} from "@/data/types";
import type {
  WorkRepository,
  ArtistRepository,
  SeriesRepository,
  WorkFilters,
  WorkSort,
  PaginationParams,
  PaginatedResult,
} from "./types";

// ==================== 数据转换函数 ====================

/** Prisma Json 字段转 LocalizedText。 */
function toLocalized(json: unknown): LocalizedText {
  return json as LocalizedText;
}

/** Prisma Json 字段转 LocalizedText | undefined（兼容可选字段）。 */
function toLocalizedOrNull(json: unknown): LocalizedText | undefined {
  return json == null ? undefined : (json as LocalizedText);
}

type WorkWithTiers = Prisma.WorkGetPayload<{ include: { editionTiers: true } }>;
type ExhibitionRow = Prisma.ExhibitionGetPayload<Record<string, never>>;
type ArtistRow = Prisma.ArtistGetPayload<Record<string, never>>;
type SeriesRow = Prisma.SeriesGetPayload<Record<string, never>>;

/** Prisma EditionTier 记录转 domain EditionTier。 */
function toEditionTier(t: WorkWithTiers["editionTiers"][number]): EditionTier {
  return {
    id: t.id,
    workId: t.workId,
    workSlug: t.workSlug,
    tierName: t.tierName as TierName,
    tierLabel: toLocalized(t.tierLabel),
    physicalSize: t.physicalSize,
    framingType: t.framingType as EditionTier["framingType"],
    framingLabel: toLocalized(t.framingLabel),
    totalEditions: t.totalEditions,
    onlineEditions: t.onlineEditions,
    offlineEditions: t.offlineEditions,
    basePriceCNY: t.basePriceCNY,
    basePriceUSD: t.basePriceUSD,
    framingFeeCNY: t.framingFeeCNY,
    framingFeeUSD: t.framingFeeUSD,
    productionType: t.productionType as EditionTier["productionType"],
    productionDays: t.productionDays,
    onlineSoldCount: t.onlineSoldCount,
    offlineSoldCount: t.offlineSoldCount,
    status: t.status as EditionTier["status"],
  };
}

/** Prisma Work 记录（含 editionTiers）转 domain Work。 */
function toWork(w: WorkWithTiers): Work {
  return {
    id: w.id,
    slug: w.slug,
    category: w.category as Work["category"],
    artistSlug: w.artistSlug,
    artistName: toLocalized(w.artistName),
    seriesSlug: w.seriesSlug,
    seriesName: toLocalizedOrNull(w.seriesName),
    title: toLocalized(w.title),
    categoryLabel: toLocalized(w.categoryLabel),
    description: toLocalized(w.description),
    aspectRatio: w.aspectRatio as Work["aspectRatio"],
    creationYear: w.creationYear,
    printTechnology: toLocalized(w.printTechnology),
    paperType: toLocalized(w.paperType),
    artistNote: toLocalizedOrNull(w.artistNote),
    images: w.images,
    mainImage: w.mainImage,
    sceneImage: w.sceneImage,
    edition: toLocalized(w.edition),
    editionTiers: w.editionTiers.map(toEditionTier),
    priceCNY: w.priceCNY,
    priceUSD: w.priceUSD,
    sold: w.sold,
    total: w.total,
    status: w.status as Work["status"],
  };
}

/** Prisma Exhibition 记录转 domain Exhibition。 */
function toExhibition(e: ExhibitionRow): Exhibition {
  return {
    id: e.id,
    artistSlug: e.artistSlug,
    year: e.year,
    title: toLocalized(e.title),
    gallery: toLocalized(e.gallery),
    location: toLocalized(e.location),
    type: e.type as Exhibition["type"],
    sortOrder: e.sortOrder,
  };
}

/** 转换 Artist 基础字段（不含 series/standaloneWorks，用于列表页）。 */
function toArtistStub(a: ArtistRow): Artist {
  return {
    id: a.id,
    slug: a.slug,
    name: toLocalized(a.name),
    role: toLocalized(a.role),
    bio: toLocalized(a.bio),
    avatar: a.avatar,
    fullBio: toLocalizedOrNull(a.fullBio),
    workCount: a.workCount,
    seriesCount: a.seriesCount,
    series: [],
    standaloneWorks: [],
    birthYear: a.birthYear,
    birthPlace: toLocalizedOrNull(a.birthPlace),
    currentLocation: toLocalizedOrNull(a.currentLocation),
    statement: toLocalizedOrNull(a.statement),
    exhibitions: [],
  };
}

/** Prisma Series 记录转 domain Series（works 由外部传入）。 */
function toSeries(s: SeriesRow, works: Work[]): Series {
  return {
    id: s.id,
    slug: s.slug,
    artistSlug: s.artistSlug,
    artistName: toLocalized(s.artistName),
    name: toLocalized(s.name),
    coverImage: s.coverImage,
    description: toLocalizedOrNull(s.description),
    workCount: s.workCount,
    works,
  };
}

// ==================== 排序 / 分页工具（与 mock 行为一致） ====================

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

// ==================== PrismaWorkRepository ====================

/** 作品 Prisma 仓储。 */
class PrismaWorkRepository implements WorkRepository {
  async listWorks(
    filters: WorkFilters,
    sort: WorkSort,
    pagination: PaginationParams,
    currency: Currency
  ): Promise<PaginatedResult<Work>> {
    const { category, artistSlugs, seriesSlugs, tiers, includeSoldOut } =
      filters;

    // 构建 Prisma where：status/category/artistSlugs/seriesSlugs/tiers 可下推到 DB
    const where: Prisma.WorkWhereInput = { status: "published" };
    if (category && category !== "all") {
      where.category = category;
    }
    if (artistSlugs && artistSlugs.length > 0) {
      where.artistSlug = { in: artistSlugs };
    }
    if (seriesSlugs && seriesSlugs.length > 0) {
      where.seriesSlug = { in: seriesSlugs };
    }
    if (tiers && tiers.length > 0) {
      where.editionTiers = { some: { tierName: { in: tiers } } };
    }

    const works = await prisma.work.findMany({
      where,
      include: { editionTiers: true },
    });

    let domainWorks = works.map(toWork);

    // includeSoldOut：字段间比较（sold >= total）Prisma 不支持，在 JS 层过滤
    if (!includeSoldOut) {
      domainWorks = domainWorks.filter((w) => w.sold < w.total);
    }

    const sorted = applySort(domainWorks, sort, currency);
    return paginate(sorted, pagination);
  }

  async getWorkBySlug(slug: string): Promise<Work | null> {
    const work = await prisma.work.findUnique({
      where: { slug },
      include: { editionTiers: true },
    });
    return work ? toWork(work) : null;
  }

  async getRelatedWorks(
    slug: string
  ): Promise<{ sameSeries: Work[]; sameArtist: Work[] }> {
    const work = await prisma.work.findUnique({
      where: { slug },
      select: { slug: true, artistSlug: true, seriesSlug: true },
    });
    if (!work) return { sameSeries: [], sameArtist: [] };

    const [sameSeriesRaw, sameArtistRaw] = await Promise.all([
      work.seriesSlug != null
        ? prisma.work.findMany({
            where: {
              slug: { not: slug },
              artistSlug: work.artistSlug,
              seriesSlug: work.seriesSlug,
            },
            include: { editionTiers: true },
          })
        : Promise.resolve([]),
      prisma.work.findMany({
        where: {
          slug: { not: slug },
          artistSlug: work.artistSlug,
        },
        include: { editionTiers: true },
      }),
    ]);

    return {
      sameSeries: sameSeriesRaw.map(toWork),
      sameArtist: sameArtistRaw.map(toWork),
    };
  }

  async getWorksByArtist(artistSlug: string): Promise<Work[]> {
    const works = await prisma.work.findMany({
      where: { artistSlug },
      include: { editionTiers: true },
    });
    return works.map(toWork);
  }

  async getWorksBySeries(
    artistSlug: string,
    seriesSlug: string
  ): Promise<Work[]> {
    const works = await prisma.work.findMany({
      where: { artistSlug, seriesSlug },
      include: { editionTiers: true },
    });
    return works.map(toWork);
  }
}

// ==================== PrismaArtistRepository ====================

/** 艺术家 Prisma 仓储。 */
class PrismaArtistRepository implements ArtistRepository {
  async listArtists(sort: "name" | "workCount"): Promise<Artist[]> {
    // 过滤无作品的艺术家（与 mock 行为一致）
    const artists = await prisma.artist.findMany({
      where: { status: "published", workCount: { gt: 0 } },
    });

    const sorted = [...artists];
    if (sort === "name") {
      // Json 字段排序在 JS 层完成
      sorted.sort((a, b) =>
        toLocalized(a.name).zh.localeCompare(toLocalized(b.name).zh)
      );
    } else {
      sorted.sort((a, b) => b.workCount - a.workCount);
    }

    // 简化方案：列表页无需 series/standaloneWorks，返回空数组以满足类型
    return sorted.map(toArtistStub);
  }

  async getArtistBySlug(slug: string): Promise<Artist | null> {
    const artist = await prisma.artist.findUnique({
      where: { slug },
      include: { exhibitions: true, series: true },
    });
    if (!artist) return null;

    // 查询该艺术家的所有作品（含 editionTiers），用于组装 series.works 与 standaloneWorks
    const works = await prisma.work.findMany({
      where: { artistSlug: slug },
      include: { editionTiers: true },
    });
    const domainWorks = works.map(toWork);

    const standaloneWorks = domainWorks.filter((w) => w.seriesSlug == null);

    const series: Series[] = artist.series.map((s) =>
      toSeries(
        s,
        domainWorks.filter((w) => w.seriesSlug === s.slug)
      )
    );

    return {
      ...toArtistStub(artist),
      series,
      standaloneWorks,
      exhibitions: artist.exhibitions.map(toExhibition),
    };
  }
}

// ==================== PrismaSeriesRepository ====================

/** 系列 Prisma 仓储。 */
class PrismaSeriesRepository implements SeriesRepository {
  async listSeriesByArtist(artistSlug: string): Promise<Series[]> {
    const seriesList = await prisma.series.findMany({
      where: { artistSlug },
    });

    // 批量查询该艺术家的所有作品（含 editionTiers），按 seriesSlug 分组组装 works
    const works = await prisma.work.findMany({
      where: { artistSlug },
      include: { editionTiers: true },
    });
    const domainWorks = works.map(toWork);

    return seriesList.map((s) =>
      toSeries(
        s,
        domainWorks.filter((w) => w.seriesSlug === s.slug)
      )
    );
  }

  async getSeriesBySlug(
    artistSlug: string,
    seriesSlug: string
  ): Promise<Series | null> {
    const series = await prisma.series.findFirst({
      where: { slug: seriesSlug, artistSlug },
    });
    if (!series) return null;

    const works = await prisma.work.findMany({
      where: { seriesSlug },
      include: { editionTiers: true },
    });

    return toSeries(series, works.map(toWork));
  }
}

// ==================== 单例导出 ====================

/** 作品仓储单例。 */
export const workRepository: WorkRepository = new PrismaWorkRepository();

/** 艺术家仓储单例。 */
export const artistRepository: ArtistRepository = new PrismaArtistRepository();

/** 系列仓储单例。 */
export const seriesRepository: SeriesRepository = new PrismaSeriesRepository();
