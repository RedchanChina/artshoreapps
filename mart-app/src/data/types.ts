/**
 * M·art 艺术商店 Phase 2 数据模型类型定义。
 *
 * 所有接口标注 `@prisma ModelName` 以便 Phase 3 无缝接入 Prisma schema。
 * 多语言字段统一使用 `LocalizedText`，zh/en 均不得为空字符串。
 */

export type LocalizedText = { zh: string; en: string };
export type TierName = "small" | "medium" | "large" | "xlarge";
export type FramingOption = "bag" | "aluminum-frame";
export type Currency = "CNY" | "USD";
export type AspectRatio = "1:1" | "3:2" | "4:3";

/** @prisma Work */
export interface Work {
  id: string;
  slug: string;
  category: "photography" | "illustration";
  artistSlug: string;
  artistName: LocalizedText;
  seriesSlug?: string | null;
  seriesName?: LocalizedText | null;
  title: LocalizedText;
  categoryLabel: LocalizedText;
  description: LocalizedText;
  aspectRatio: AspectRatio;
  creationYear: number;
  printTechnology: LocalizedText;
  paperType: LocalizedText;
  artistNote?: LocalizedText | null;
  images: string[];
  mainImage: string;
  sceneImage: string;
  edition: LocalizedText;
  editionTiers: EditionTier[];
  priceCNY: number;
  priceUSD: number;
  sold: number;
  total: number;
  status: "draft" | "published" | "archived";
}

/** @prisma EditionTier */
export interface EditionTier {
  id: string;
  workId: string;
  workSlug: string;
  tierName: TierName;
  tierLabel: LocalizedText;
  physicalSize: string;
  framingType: "tote_bag" | "aluminum_frame" | "acrylic_sandwich";
  framingLabel: LocalizedText;
  totalEditions: number;
  onlineEditions: number;
  offlineEditions: number;
  basePriceCNY: number;
  basePriceUSD: number;
  framingFeeCNY: number;
  framingFeeUSD: number;
  productionType: "stocked" | "on_demand";
  productionDays: number;
  onlineSoldCount: number;
  offlineSoldCount: number;
  status: "active" | "sold_out";
}

/** @prisma EditionNumber */
export interface EditionNumber {
  id: string;
  tierId: string;
  channel: "online" | "offline";
  number: number;
  status: "available" | "locked" | "sold" | "shipped" | "delivered";
  framingOption?: "tote_bag" | "aluminum_frame" | null;
  lockedAt?: string | null;
  lockedByCartId?: string | null;
  soldAt?: string | null;
  orderItemId?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

/** @prisma Series */
export interface Series {
  id: string;
  slug: string;
  artistSlug: string;
  artistName: LocalizedText;
  name: LocalizedText;
  coverImage: string;
  description?: LocalizedText | null;
  workCount: number;
  works: Work[];
}

/** @prisma ArtistExhibition */
export interface Exhibition {
  id: string;
  artistSlug: string;
  year: number;
  title: LocalizedText;
  gallery: LocalizedText;
  location: LocalizedText;
  type: "solo" | "group";
  sortOrder: number;
}

/** @prisma Artist */
export interface Artist {
  id: string;
  slug: string;
  name: LocalizedText;
  role: LocalizedText;
  bio: LocalizedText;
  avatar: string;
  fullBio?: LocalizedText;
  workCount: number;
  seriesCount: number;
  series: Series[];
  standaloneWorks: Work[];
  // Phase 2 增强字段（全部可选，向后兼容）
  birthYear?: number | null;
  birthPlace?: LocalizedText | null;
  currentLocation?: LocalizedText | null;
  statement?: LocalizedText | null;
  exhibitions?: Exhibition[];
}

/** 精选艺术家（Phase 1 已有，保留向后兼容） */
export interface FeaturedArtist extends Artist {
  fullBio: LocalizedText;
}

/**
 * Phase 1 兼容接口：列表页 / 首页卡片使用的扁平作品结构。
 */
export interface Product {
  id: string;
  category: "photography" | "illustration";
  artist: LocalizedText;
  title: LocalizedText;
  categoryLabel: LocalizedText;
  edition: LocalizedText;
  priceCNY: number;
  priceUSD: number;
  sold: number;
  total: number;
  mainImage: string;
  sceneImage: string;
}
