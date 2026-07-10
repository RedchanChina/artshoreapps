-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "shippingMethodCode" TEXT NOT NULL,
    "shippingMethodName" JSONB NOT NULL,
    "shippingFeeCNY" INTEGER NOT NULL,
    "shippingFeeUSD" INTEGER NOT NULL,
    "dutyCNY" INTEGER NOT NULL,
    "dutyUSD" INTEGER NOT NULL,
    "subtotalCNY" INTEGER NOT NULL,
    "subtotalUSD" INTEGER NOT NULL,
    "totalCNY" INTEGER NOT NULL,
    "totalUSD" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "workSlug" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "editionNumber" INTEGER NOT NULL,
    "tierLabel" JSONB NOT NULL,
    "framingLabel" JSONB,
    "title" JSONB NOT NULL,
    "artistName" JSONB NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "lockedPriceCNY" INTEGER NOT NULL,
    "lockedPriceUSD" INTEGER NOT NULL,
    "productionType" TEXT NOT NULL,
    "productionDays" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userEmail_idx" ON "Order"("userEmail");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_workSlug_idx" ON "OrderItem"("workSlug");

-- CreateIndex
CREATE INDEX "OrderItem_tierId_idx" ON "OrderItem"("tierId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
