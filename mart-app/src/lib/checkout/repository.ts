import { prisma } from "@/lib/db/prisma";
import type { LocalizedText } from "@/data/types";

/** 读取所有支持配送的国家 */
export async function getSupportedCountries() {
  const regions = await prisma.shippingRegion.findMany({
    where: { supported: true },
    orderBy: { countryName: "asc" },
  });
  return regions.map((r) => ({
    countryCode: r.countryCode,
    countryName: r.countryName as LocalizedText,
  }));
}

/** 根据 countryCode 读取地区配置 */
export async function getRegionByCountryCode(countryCode: string) {
  return await prisma.shippingRegion.findUnique({
    where: { countryCode },
  });
}

/** 根据 regionCode 读取可用物流方案 */
export async function getShippingMethodsByRegionCode(regionCode: string) {
  return await prisma.shippingMethod.findMany({
    where: { regionCode, active: true },
    orderBy: { baseFeeCNY: "asc" },
  });
}

/** 读取所有尺寸系数 */
export async function getAllTierCoefficients() {
  const coeffs = await prisma.tierShippingCoefficient.findMany();
  return new Map(coeffs.map((c) => [c.tierName, c.coefficient]));
}

/** 根据 countryCode 读取关税配置 */
export async function getDutyConfig(countryCode: string) {
  return await prisma.dutyConfig.findUnique({
    where: { countryCode },
  });
}
