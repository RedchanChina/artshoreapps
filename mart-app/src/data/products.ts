/**
 * M·art 艺术商店作品数据 — Phase 1 兼容入口。
 *
 * 保留 Phase 1 导出（Product / PRODUCTS / PHOTOGRAPHY_PRODUCTS /
 * ILLUSTRATION_PRODUCTS）以维持首页与 ProductCard 编译不报错（H6）。
 *
 * Phase 2 数据源为 works.ts 中的 WORKS 常量，PRODUCTS 通过 toLegacyProduct
 * 适配函数从 WORKS 映射而来。作品 / 系列查询函数在此 re-export，便于
 * 调用方统一从 @/data/products 引入。
 */

export type { Product, Work, EditionTier, EditionNumber, Series } from "./types";

import { WORKS, toLegacyProduct } from "./works";
import type { Product } from "./types";

// re-export 作品数据与查询函数（统一入口）
export {
  WORKS,
  toLegacyProduct,
  getWorkBySlug,
  getWorksByArtist,
  getWorksBySeries,
  getRelatedWorks,
} from "./works";

// re-export 系列查询函数
export { getSeriesBySlug } from "./series";

// ==================== Phase 1 兼容导出 ====================

/** Phase 1 扁平作品列表（由 WORKS 适配而来）。 */
export const PRODUCTS: Product[] = WORKS.map(toLegacyProduct);

/** 摄影类作品（Phase 1 兼容）。 */
export const PHOTOGRAPHY_PRODUCTS: Product[] = PRODUCTS.filter(
  (p) => p.category === "photography"
);

/** 插画类作品（Phase 1 兼容）。 */
export const ILLUSTRATION_PRODUCTS: Product[] = PRODUCTS.filter(
  (p) => p.category === "illustration"
);
