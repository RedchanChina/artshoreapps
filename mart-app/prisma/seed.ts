/**
 * M·art 艺术商店 Prisma Seed 脚本。
 *
 * 导入顺序（外键依赖）：
 *   1. Artist + Exhibition（Artist 为根，Exhibition 通过 artistSlug 关联）
 *   2. Series（通过 artistSlug 关联 Artist）
 *   3. Work + EditionTier（Work 通过 artistSlug/seriesSlug 关联，EditionTier 通过 workId 关联）
 *   4. EditionNumber（通过 tierId 关联 EditionTier）
 *
 * 幂等性：所有写入使用 upsert；EditionNumber 先 deleteMany 再 createMany。
 *
 * 运行：`pnpm prisma db seed` 或 `pnpm tsx prisma/seed.ts`
 */
import { prisma } from "../src/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { WORKS } from "../src/data/works";
import { ARTISTS } from "../src/data/artists";
import { SERIES } from "../src/data/series";

async function main() {
  // ---------------------------------------------------------------
  // 1. Artist + Exhibition
  // ---------------------------------------------------------------
  console.log("Seeding artists & exhibitions...");
  for (const artist of ARTISTS) {
    // 注意：Artist 类型的 `series` / `standaloneWorks` 为运行时计算字段，不存 DB。
    const artistData = {
      name: artist.name,
      role: artist.role,
      bio: artist.bio,
      avatar: artist.avatar,
      fullBio: artist.fullBio ?? Prisma.JsonNull,
      birthYear: artist.birthYear ?? null,
      birthPlace: artist.birthPlace ?? Prisma.JsonNull,
      currentLocation: artist.currentLocation ?? Prisma.JsonNull,
      statement: artist.statement ?? Prisma.JsonNull,
      workCount: artist.workCount,
      seriesCount: artist.seriesCount,
    };

    await prisma.artist.upsert({
      where: { slug: artist.slug },
      create: { slug: artist.slug, ...artistData },
      update: artistData,
    });

    if (artist.exhibitions && artist.exhibitions.length > 0) {
      for (const ex of artist.exhibitions) {
        const exData = {
          artistSlug: ex.artistSlug,
          year: ex.year,
          title: ex.title,
          gallery: ex.gallery,
          location: ex.location,
          type: ex.type,
          sortOrder: ex.sortOrder,
        };

        await prisma.exhibition.upsert({
          where: { id: ex.id },
          create: { id: ex.id, ...exData },
          update: exData,
        });
      }
    }
  }

  // ---------------------------------------------------------------
  // 2. Series
  // ---------------------------------------------------------------
  console.log("Seeding series...");
  for (const series of SERIES) {
    // workCount 先置 0，后续可重新计算。
    const seriesData = {
      artistSlug: series.artistSlug,
      artistName: series.artistName,
      name: series.name,
      coverImage: series.coverImage,
      description: series.description ?? Prisma.JsonNull,
      workCount: 0,
    };

    await prisma.series.upsert({
      where: { slug: series.slug },
      create: { slug: series.slug, ...seriesData },
      update: seriesData,
    });
  }

  // ---------------------------------------------------------------
  // 3. Work + EditionTier
  // ---------------------------------------------------------------
  console.log("Seeding works & edition tiers...");
  for (const work of WORKS) {
    const workData = {
      category: work.category,
      artistSlug: work.artistSlug,
      artistName: work.artistName,
      seriesSlug: work.seriesSlug ?? null,
      seriesName: work.seriesName ?? Prisma.JsonNull,
      title: work.title,
      categoryLabel: work.categoryLabel,
      description: work.description,
      aspectRatio: work.aspectRatio,
      creationYear: work.creationYear,
      printTechnology: work.printTechnology,
      paperType: work.paperType,
      artistNote: work.artistNote ?? Prisma.JsonNull,
      images: work.images,
      mainImage: work.mainImage,
      sceneImage: work.sceneImage,
      edition: work.edition,
      priceCNY: work.priceCNY,
      priceUSD: work.priceUSD,
      sold: work.sold,
      total: work.total,
      status: work.status,
    };

    // Work.id 由 Prisma 自动生成 cuid；slug 作为业务标识。
    const createdWork = await prisma.work.upsert({
      where: { slug: work.slug },
      create: { slug: work.slug, ...workData },
      update: workData,
    });

    for (const tier of work.editionTiers) {
      // EditionTier.id 保持 mock data 中的固定值（types.ts 中为固定字符串）。
      // workId 使用 DB 中真实的 Work id（自动生成），workSlug 保持业务标识。
      const tierData = {
        workId: createdWork.id,
        workSlug: createdWork.slug,
        tierName: tier.tierName,
        tierLabel: tier.tierLabel,
        physicalSize: tier.physicalSize,
        framingType: tier.framingType,
        framingLabel: tier.framingLabel,
        totalEditions: tier.totalEditions,
        onlineEditions: tier.onlineEditions,
        offlineEditions: tier.offlineEditions,
        basePriceCNY: tier.basePriceCNY,
        basePriceUSD: tier.basePriceUSD,
        framingFeeCNY: tier.framingFeeCNY,
        framingFeeUSD: tier.framingFeeUSD,
        productionType: tier.productionType,
        productionDays: tier.productionDays,
        onlineSoldCount: tier.onlineSoldCount,
        offlineSoldCount: tier.offlineSoldCount,
        status: tier.status,
      };

      await prisma.editionTier.upsert({
        where: { id: tier.id },
        create: { id: tier.id, ...tierData },
        update: tierData,
      });

      // ---------------------------------------------------------------
      // 4. EditionNumber 初始化
      // ---------------------------------------------------------------
      // 先清空该 tier 下所有旧版号（含模拟售出的 seed 数据），确保重复运行幂等。
      await prisma.editionNumber.deleteMany({ where: { tierId: tier.id } });

      const numbers: {
        tierId: string;
        channel: string;
        number: number;
        status: string;
      }[] = [];

      // online 渠道：1..onlineEditions，前 onlineSoldCount 个设为 sold（模拟已售）。
      for (let n = 1; n <= tier.onlineEditions; n++) {
        numbers.push({
          tierId: tier.id,
          channel: "online",
          number: n,
          status: n <= tier.onlineSoldCount ? "sold" : "available",
        });
      }

      // offline 渠道：1..offlineEditions，前 offlineSoldCount 个设为 sold（模拟已售）。
      for (let n = 1; n <= tier.offlineEditions; n++) {
        numbers.push({
          tierId: tier.id,
          channel: "offline",
          number: n,
          status: n <= tier.offlineSoldCount ? "sold" : "available",
        });
      }

      if (numbers.length > 0) {
        await prisma.editionNumber.createMany({ data: numbers });
      }
    }
  }

  // ---------------------------------------------------------------
  // 5. Checkout Config（运费/关税配置）
  // ---------------------------------------------------------------
  console.log("Seeding checkout config (shipping & duty)...");

  // 5.1 ShippingRegion
  const shippingRegions = [
    { countryCode: "CN", countryName: { zh: "中国大陆", en: "China" }, regionCode: "cn", regionCoefficient: 1.0, supported: true },
    { countryCode: "HK", countryName: { zh: "中国香港", en: "Hong Kong" }, regionCode: "hmt", regionCoefficient: 1.2, supported: true },
    { countryCode: "MO", countryName: { zh: "中国澳门", en: "Macao" }, regionCode: "hmt", regionCoefficient: 1.2, supported: true },
    { countryCode: "TW", countryName: { zh: "中国台湾", en: "Taiwan" }, regionCode: "hmt", regionCoefficient: 1.2, supported: true },
    { countryCode: "JP", countryName: { zh: "日本", en: "Japan" }, regionCode: "asia", regionCoefficient: 1.5, supported: true },
    { countryCode: "KR", countryName: { zh: "韩国", en: "South Korea" }, regionCode: "asia", regionCoefficient: 1.5, supported: true },
    { countryCode: "US", countryName: { zh: "美国", en: "United States" }, regionCode: "na", regionCoefficient: 2.0, supported: true },
    { countryCode: "CA", countryName: { zh: "加拿大", en: "Canada" }, regionCode: "na", regionCoefficient: 2.0, supported: true },
    { countryCode: "GB", countryName: { zh: "英国", en: "United Kingdom" }, regionCode: "eu", regionCoefficient: 2.2, supported: true },
    { countryCode: "FR", countryName: { zh: "法国", en: "France" }, regionCode: "eu", regionCoefficient: 2.2, supported: true },
    { countryCode: "DE", countryName: { zh: "德国", en: "Germany" }, regionCode: "eu", regionCoefficient: 2.2, supported: true },
    { countryCode: "AU", countryName: { zh: "澳大利亚", en: "Australia" }, regionCode: "other", regionCoefficient: 2.5, supported: true },
    { countryCode: "SG", countryName: { zh: "新加坡", en: "Singapore" }, regionCode: "asia", regionCoefficient: 1.5, supported: true },
  ];

  for (const region of shippingRegions) {
    await prisma.shippingRegion.upsert({
      where: { countryCode: region.countryCode },
      create: region,
      update: {
        countryName: region.countryName,
        regionCode: region.regionCode,
        regionCoefficient: region.regionCoefficient,
        supported: region.supported,
      },
    });
  }

  // 5.2 ShippingMethod
  const shippingMethods = [
    // 中国大陆
    { code: "sf-standard", name: { zh: "顺丰速运（标准）", en: "SF Express (Standard)" }, regionCode: "cn", estimatedDays: "3-5", baseFeeCNY: 80, baseFeeUSD: 12, active: true },
    { code: "sf-express", name: { zh: "顺丰速运（特快）", en: "SF Express (Express)" }, regionCode: "cn", estimatedDays: "1-3", baseFeeCNY: 120, baseFeeUSD: 18, active: true },
    // 港澳台
    { code: "sf-hmt", name: { zh: "顺丰速运（港澳台）", en: "SF Express (HMT)" }, regionCode: "hmt", estimatedDays: "5-7", baseFeeCNY: 150, baseFeeUSD: 22, active: true },
    // 亚洲
    { code: "ems-asia", name: { zh: "EMS（亚洲）", en: "EMS (Asia)" }, regionCode: "asia", estimatedDays: "7-14", baseFeeCNY: 200, baseFeeUSD: 30, active: true },
    // 北美
    { code: "dhl-na", name: { zh: "DHL（北美）", en: "DHL (North America)" }, regionCode: "na", estimatedDays: "5-10", baseFeeCNY: 350, baseFeeUSD: 50, active: true },
    // 欧洲
    { code: "dhl-eu", name: { zh: "DHL（欧洲）", en: "DHL (Europe)" }, regionCode: "eu", estimatedDays: "7-14", baseFeeCNY: 400, baseFeeUSD: 60, active: true },
    // 其他
    { code: "dhl-global", name: { zh: "DHL（全球）", en: "DHL (Global)" }, regionCode: "other", estimatedDays: "10-21", baseFeeCNY: 450, baseFeeUSD: 65, active: true },
  ];

  for (const method of shippingMethods) {
    await prisma.shippingMethod.upsert({
      where: { code: method.code },
      create: method,
      update: {
        name: method.name,
        regionCode: method.regionCode,
        estimatedDays: method.estimatedDays,
        baseFeeCNY: method.baseFeeCNY,
        baseFeeUSD: method.baseFeeUSD,
        active: method.active,
      },
    });
  }

  // 5.3 TierShippingCoefficient
  const tierCoefficients = [
    { tierName: "small", coefficient: 1.0 },
    { tierName: "medium", coefficient: 1.3 },
    { tierName: "large", coefficient: 1.8 },
    { tierName: "xlarge", coefficient: 2.5 },
  ];

  for (const tc of tierCoefficients) {
    await prisma.tierShippingCoefficient.upsert({
      where: { tierName: tc.tierName },
      create: tc,
      update: { coefficient: tc.coefficient },
    });
  }

  // 5.4 DutyConfig
  const dutyConfigs = [
    { countryCode: "US", rate: 0.003456, active: true }, // MPF 0.3456%
  ];

  for (const duty of dutyConfigs) {
    await prisma.dutyConfig.upsert({
      where: { countryCode: duty.countryCode },
      create: duty,
      update: { rate: duty.rate, active: duty.active },
    });
  }

  console.log("Checkout config seeded successfully.");

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
