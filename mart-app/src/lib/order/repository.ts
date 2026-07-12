import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { getCartItems, clearCart } from "@/lib/cart/repository";
import type { CreateOrderInput, OrderResult } from "./types";
import type { ShippingAddress } from "@/lib/checkout/types";
import type { Currency, LocalizedText } from "@/data/types";

/** 生成订单号 MA{YYYYMMDD}{6位随机数字} */
function generateOrderNumber(): string {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `MA${ymd}${random}`;
}

/**
 * 创建订单事务：
 * 1. 读取 Redis 购物车
 * 2. 创建 Order + OrderItem
 * 3. 版号 status: locked → sold（乐观锁 updateMany WHERE status='locked' AND lockedByCartId={cartId}）
 * 4. 清空购物车
 *
 * @throws {Error} message 为 "VERSION_UNAVAILABLE" 或 "EMPTY_CART"
 */
export async function createOrder(
  cartId: string,
  input: CreateOrderInput,
): Promise<string> {
  // 1. 读取购物车
  const items = await getCartItems(cartId);
  if (items.length === 0) {
    throw new Error("EMPTY_CART");
  }

  const orderNumber = generateOrderNumber();

  // 在事务前查询所有 tier 的 productionType 和 productionDays
  const tierIds = [...new Set(items.map((i) => i.tierId))];
  const tiers = await prisma.editionTier.findMany({
    where: { id: { in: tierIds } },
    select: { id: true, productionType: true, productionDays: true },
  });
  const tierMap = new Map(tiers.map((t) => [t.id, t]));

  // 2-3. 事务：创建订单 + 版号变更
  await prisma.$transaction(async (tx) => {
    // 创建 Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userEmail: input.shippingAddress.email,
        userId: input.userId ?? null, // 登录用户关联，游客为 null
        shippingAddress: input.shippingAddress as unknown as Prisma.InputJsonValue,
        shippingMethodCode: input.shippingMethodCode,
        shippingMethodName: input.shippingMethodName as unknown as Prisma.InputJsonValue,
        shippingFeeCNY: input.shippingFeeCNY,
        shippingFeeUSD: input.shippingFeeUSD,
        dutyCNY: input.duty.amountCNY,
        dutyUSD: input.duty.amountUSD,
        subtotalCNY: input.subtotalCNY,
        subtotalUSD: input.subtotalUSD,
        totalCNY: input.totalCNY,
        totalUSD: input.totalUSD,
        currency: input.currency,
        paymentMethod: input.paymentMethod,
        status: "paid",
      },
    });

    // 为每个购物车项创建 OrderItem + 变更版号
    for (const item of items) {
      const tier = tierMap.get(item.tierId);

      // 创建 OrderItem
      const orderItem = await tx.orderItem.create({
        data: {
          orderId: order.id,
          workSlug: item.workSlug,
          tierId: item.tierId,
          editionNumber: item.editionNumber,
          tierLabel: item.tierLabel as unknown as Prisma.InputJsonValue,
          framingLabel: item.framingLabel
            ? (item.framingLabel as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          title: item.title as unknown as Prisma.InputJsonValue,
          artistName: item.artistName as unknown as Prisma.InputJsonValue,
          thumbnail: item.thumbnail,
          lockedPriceCNY: item.lockedPriceCNY,
          lockedPriceUSD: item.lockedPriceUSD,
          productionType: tier?.productionType ?? "on_demand",
          productionDays: tier?.productionDays ?? 7,
        },
      });

      // 版号 locked → sold（乐观锁：WHERE status='locked' AND lockedByCartId={cartId}）
      const result = await tx.editionNumber.updateMany({
        where: {
          tierId: item.tierId,
          number: item.editionNumber,
          channel: "online",
          status: "locked",
          lockedByCartId: cartId,
        },
        data: {
          status: "sold",
          soldAt: new Date(),
          orderItemId: orderItem.id,
        },
      });

      if (result.count === 0) {
        // 版号已不是 locked 状态（过期或被抢购）
        throw new Error("VERSION_UNAVAILABLE");
      }
    }
  });

  // 4. 清空购物车（事务外，即使失败订单已创建）
  await clearCart(cartId);

  return orderNumber;
}

/** 按订单号查询订单 + 关联 OrderItem */
export async function getOrderByNumber(
  orderNumber: string,
): Promise<OrderResult | null> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    userEmail: order.userEmail,
    shippingAddress: order.shippingAddress as unknown as ShippingAddress,
    shippingMethodCode: order.shippingMethodCode,
    shippingMethodName: order.shippingMethodName as unknown as LocalizedText,
    shippingFeeCNY: order.shippingFeeCNY,
    shippingFeeUSD: order.shippingFeeUSD,
    dutyCNY: order.dutyCNY,
    dutyUSD: order.dutyUSD,
    subtotalCNY: order.subtotalCNY,
    subtotalUSD: order.subtotalUSD,
    totalCNY: order.totalCNY,
    totalUSD: order.totalUSD,
    currency: order.currency as Currency,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      workSlug: item.workSlug,
      tierId: item.tierId,
      editionNumber: item.editionNumber,
      tierLabel: item.tierLabel as unknown as LocalizedText,
      framingLabel: item.framingLabel as unknown as LocalizedText | null,
      title: item.title as unknown as LocalizedText,
      artistName: item.artistName as unknown as LocalizedText,
      thumbnail: item.thumbnail,
      lockedPriceCNY: item.lockedPriceCNY,
      lockedPriceUSD: item.lockedPriceUSD,
      productionType: item.productionType,
      productionDays: item.productionDays,
    })),
  };
}
