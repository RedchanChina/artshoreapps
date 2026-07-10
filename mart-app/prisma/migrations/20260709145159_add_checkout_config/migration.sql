-- CreateTable
CREATE TABLE "ShippingRegion" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" JSONB NOT NULL,
    "regionCode" TEXT NOT NULL,
    "regionCoefficient" DOUBLE PRECISION NOT NULL,
    "supported" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "regionCode" TEXT NOT NULL,
    "estimatedDays" TEXT NOT NULL,
    "baseFeeCNY" INTEGER NOT NULL,
    "baseFeeUSD" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TierShippingCoefficient" (
    "id" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TierShippingCoefficient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutyConfig" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DutyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRegion_countryCode_key" ON "ShippingRegion"("countryCode");

-- CreateIndex
CREATE INDEX "ShippingRegion_regionCode_idx" ON "ShippingRegion"("regionCode");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingMethod_code_key" ON "ShippingMethod"("code");

-- CreateIndex
CREATE INDEX "ShippingMethod_regionCode_idx" ON "ShippingMethod"("regionCode");

-- CreateIndex
CREATE INDEX "ShippingMethod_active_idx" ON "ShippingMethod"("active");

-- CreateIndex
CREATE UNIQUE INDEX "TierShippingCoefficient_tierName_key" ON "TierShippingCoefficient"("tierName");

-- CreateIndex
CREATE UNIQUE INDEX "DutyConfig_countryCode_key" ON "DutyConfig"("countryCode");
