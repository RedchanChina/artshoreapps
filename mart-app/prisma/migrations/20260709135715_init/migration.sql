-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "artistSlug" TEXT NOT NULL,
    "artistName" JSONB NOT NULL,
    "seriesSlug" TEXT,
    "seriesName" JSONB,
    "title" JSONB NOT NULL,
    "categoryLabel" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "creationYear" INTEGER NOT NULL,
    "printTechnology" JSONB NOT NULL,
    "paperType" JSONB NOT NULL,
    "artistNote" JSONB,
    "images" TEXT[],
    "mainImage" TEXT NOT NULL,
    "sceneImage" TEXT NOT NULL,
    "edition" JSONB NOT NULL,
    "priceCNY" INTEGER NOT NULL,
    "priceUSD" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditionTier" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "workSlug" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "tierLabel" JSONB NOT NULL,
    "physicalSize" TEXT NOT NULL,
    "framingType" TEXT NOT NULL,
    "framingLabel" JSONB NOT NULL,
    "totalEditions" INTEGER NOT NULL,
    "onlineEditions" INTEGER NOT NULL,
    "offlineEditions" INTEGER NOT NULL,
    "basePriceCNY" INTEGER NOT NULL,
    "basePriceUSD" INTEGER NOT NULL,
    "framingFeeCNY" INTEGER NOT NULL,
    "framingFeeUSD" INTEGER NOT NULL,
    "productionType" TEXT NOT NULL,
    "productionDays" INTEGER NOT NULL,
    "onlineSoldCount" INTEGER NOT NULL,
    "offlineSoldCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditionTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditionNumber" (
    "id" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "framingOption" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockedByCartId" TEXT,
    "soldAt" TIMESTAMP(3),
    "orderItemId" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditionNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "role" JSONB NOT NULL,
    "bio" JSONB NOT NULL,
    "avatar" TEXT NOT NULL,
    "fullBio" JSONB,
    "birthYear" INTEGER,
    "birthPlace" JSONB,
    "currentLocation" JSONB,
    "statement" JSONB,
    "workCount" INTEGER NOT NULL DEFAULT 0,
    "seriesCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exhibition" (
    "id" TEXT NOT NULL,
    "artistSlug" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" JSONB NOT NULL,
    "gallery" JSONB NOT NULL,
    "location" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Exhibition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "artistSlug" TEXT NOT NULL,
    "artistName" JSONB NOT NULL,
    "name" JSONB NOT NULL,
    "coverImage" TEXT NOT NULL,
    "description" JSONB,
    "workCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Work_slug_key" ON "Work"("slug");

-- CreateIndex
CREATE INDEX "Work_artistSlug_idx" ON "Work"("artistSlug");

-- CreateIndex
CREATE INDEX "Work_seriesSlug_idx" ON "Work"("seriesSlug");

-- CreateIndex
CREATE INDEX "Work_category_idx" ON "Work"("category");

-- CreateIndex
CREATE INDEX "EditionTier_workId_idx" ON "EditionTier"("workId");

-- CreateIndex
CREATE INDEX "EditionTier_workSlug_idx" ON "EditionTier"("workSlug");

-- CreateIndex
CREATE INDEX "EditionTier_tierName_idx" ON "EditionTier"("tierName");

-- CreateIndex
CREATE INDEX "EditionNumber_tierId_idx" ON "EditionNumber"("tierId");

-- CreateIndex
CREATE INDEX "EditionNumber_status_idx" ON "EditionNumber"("status");

-- CreateIndex
CREATE INDEX "EditionNumber_channel_idx" ON "EditionNumber"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "EditionNumber_tierId_number_channel_key" ON "EditionNumber"("tierId", "number", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_slug_key" ON "Artist"("slug");

-- CreateIndex
CREATE INDEX "Exhibition_artistSlug_idx" ON "Exhibition"("artistSlug");

-- CreateIndex
CREATE INDEX "Exhibition_year_idx" ON "Exhibition"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Series_slug_key" ON "Series"("slug");

-- CreateIndex
CREATE INDEX "Series_artistSlug_idx" ON "Series"("artistSlug");

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_artistSlug_fkey" FOREIGN KEY ("artistSlug") REFERENCES "Artist"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditionTier" ADD CONSTRAINT "EditionTier_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditionNumber" ADD CONSTRAINT "EditionNumber_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "EditionTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exhibition" ADD CONSTRAINT "Exhibition_artistSlug_fkey" FOREIGN KEY ("artistSlug") REFERENCES "Artist"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_artistSlug_fkey" FOREIGN KEY ("artistSlug") REFERENCES "Artist"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
