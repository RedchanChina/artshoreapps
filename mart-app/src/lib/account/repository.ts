import { prisma } from "@/lib/db/prisma";
import type { LocalizedText } from "@/data/types";
import type { OrderDetailFull, OrderStatus } from "./types";

// ==================== Types ====================

export interface WishlistItem {
  id: string;
  workSlug: string;
  createdAt: string;
  title: LocalizedText;
  artistName: LocalizedText;
  thumbnail: string;
  priceCNY: number;
  priceUSD: number;
}

export interface OrderListItem {
  orderNumber: string;
  firstThumbnail: string | null;
  createdAt: string;
  currency: string;
  totalCNY: number;
  totalUSD: number;
  status: string;
}

export interface OrderDetailItem {
  id: string;
  thumbnail: string;
  title: LocalizedText;
  artistName: LocalizedText;
  editionNumber: number;
  tierLabel: LocalizedText;
  lockedPriceCNY: number;
  lockedPriceUSD: number;
}

export interface OrderDetailData {
  currency: string;
  subtotalCNY: number;
  subtotalUSD: number;
  shippingCNY: number;
  shippingUSD: number;
  dutyCNY: number;
  dutyUSD: number;
  totalCNY: number;
  totalUSD: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: OrderDetailItem[];
}

export interface AddressData {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  countryCode: string;
  state: string;
  city: string;
  address: string;
  zipCode: string;
  isDefault: boolean;
}

interface AddressInput {
  fullName: string;
  phone: string;
  email: string | null;
  countryCode: string;
  state: string;
  city: string;
  address: string;
  zipCode: string;
}

// ==================== Orders ====================

/** 获取用户订单列表（按下单时间倒序，含首张缩略图） */
export async function getOrders(userId: string): Promise<OrderListItem[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: { thumbnail: true },
        take: 1,
        orderBy: { id: "asc" },
      },
    },
  });

  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    firstThumbnail: o.items[0]?.thumbnail ?? null,
    createdAt: o.createdAt.toISOString(),
    currency: o.currency,
    totalCNY: o.totalCNY,
    totalUSD: o.totalUSD,
    status: o.status,
  }));
}

/** 获取订单详情（含 OrderItem，按 userId 隔离） */
export async function getOrderDetail(
  orderNumber: string,
  userId: string,
): Promise<OrderDetailFull | null> {
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId },
    include: { items: true },
  });

  if (!order) return null;

  // 查询关联的 EditionNumber（通过 orderItemId 字符串引用）
  const orderItemIds = order.items.map((item) => item.id);
  const editions = await prisma.editionNumber.findMany({
    where: { orderItemId: { in: orderItemIds } },
    select: {
      number: true,
      framingOption: true,
      channel: true,
      orderItemId: true,
    },
  });

  const shippingAddress = order.shippingAddress as unknown as {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };

  return {
    // 现有字段（保持 OrderDetailData 结构）
    currency: order.currency,
    subtotalCNY: order.subtotalCNY,
    subtotalUSD: order.subtotalUSD,
    shippingCNY: order.shippingFeeCNY,
    shippingUSD: order.shippingFeeUSD,
    dutyCNY: order.dutyCNY,
    dutyUSD: order.dutyUSD,
    totalCNY: order.totalCNY,
    totalUSD: order.totalUSD,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
    },
    items: order.items.map((item) => ({
      id: item.id,
      thumbnail: item.thumbnail,
      title: item.title as unknown as LocalizedText,
      artistName: item.artistName as unknown as LocalizedText,
      editionNumber: item.editionNumber,
      tierLabel: item.tierLabel as unknown as LocalizedText,
      lockedPriceCNY: item.lockedPriceCNY,
      lockedPriceUSD: item.lockedPriceUSD,
    })),
    // 新增字段（来自 OrderDetailFull）
    status: order.status as OrderStatus,
    logisticsCompany: order.logisticsCompany,
    trackingNumber: order.trackingNumber,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    refundedAt: order.refundedAt?.toISOString() ?? null,
    refundReason: order.refundReason,
    createdAt: order.createdAt.toISOString(),
    editions: editions.map((e) => ({
      editionNumber: e.number,
      framingOption: e.framingOption,
      channel: e.channel,
      // 查询已按 orderItemId: { in: orderItemIds } 过滤，此处必非 null
      orderItemId: e.orderItemId!,
    })),
  };
}

// ==================== 物流 / 收货 / 退款 ====================

/** 管理端发货：更新订单为已发货状态 */
export async function shipOrder(
  orderNumber: string,
  userId: string,
  logisticsCompany: string,
  trackingNumber: string,
): Promise<{ success: boolean; error?: string }> {
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId },
    select: { id: true, status: true, items: { select: { id: true } } },
  });
  if (!order) return { success: false, error: "NOT_FOUND" };
  if (order.status !== "paid") return { success: false, error: "INVALID_STATUS" };

  const now = new Date();
  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "shipped",
        shippedAt: now,
        logisticsCompany,
        trackingNumber,
      },
    }),
    // 更新关联的 EditionNumber 状态
    prisma.editionNumber.updateMany({
      where: { orderItemId: { in: order.items.map((i) => i.id) } },
      data: { status: "shipped", shippedAt: now },
    }),
  ]);

  return { success: true };
}

/** 用户确认收货：status=shipped → delivered */
export async function confirmDelivery(
  orderNumber: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId },
    select: { id: true, status: true, items: { select: { id: true } } },
  });
  if (!order) return { success: false, error: "NOT_FOUND" };
  if (order.status !== "shipped") return { success: false, error: "INVALID_STATUS" };

  const now = new Date();
  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "delivered", deliveredAt: now },
    }),
    prisma.editionNumber.updateMany({
      where: { orderItemId: { in: order.items.map((i) => i.id) } },
      data: { status: "delivered", deliveredAt: now },
    }),
  ]);

  return { success: true };
}

/** 用户申请退款：status=paid → refunded + 版号释放 */
export async function requestRefund(
  orderNumber: string,
  userId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId },
    select: { id: true, status: true, items: { select: { id: true } } },
  });
  if (!order) return { success: false, error: "NOT_FOUND" };
  if (order.status !== "paid") return { success: false, error: "INVALID_STATUS" };

  const now = new Date();
  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "refunded",
        refundedAt: now,
        refundReason: reason,
      },
    }),
    // 释放版号：sold → available + 清除 soldAt/orderItemId
    prisma.editionNumber.updateMany({
      where: { orderItemId: { in: order.items.map((i) => i.id) } },
      data: {
        status: "available",
        soldAt: null,
        orderItemId: null,
      },
    }),
  ]);

  return { success: true };
}

// ==================== Addresses ====================

/** 获取用户地址列表（默认地址置顶） */
export async function getAddresses(userId: string): Promise<AddressData[]> {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return addresses.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    email: a.email,
    countryCode: a.countryCode,
    state: a.state,
    city: a.city,
    address: a.address,
    zipCode: a.zipCode,
    isDefault: a.isDefault,
  }));
}

/** 新增地址 */
export async function createAddress(
  userId: string,
  data: AddressInput,
): Promise<void> {
  await prisma.address.create({
    data: { userId, ...data },
  });
}

/** 更新地址（按 userId 隔离） */
export async function updateAddress(
  id: string,
  userId: string,
  data: AddressInput,
): Promise<void> {
  await prisma.address.update({
    where: { id, userId },
    data,
  });
}

/** 删除地址（按 userId 隔离） */
export async function deleteAddress(id: string, userId: string): Promise<void> {
  await prisma.address.delete({
    where: { id, userId },
  });
}

/** 设为默认地址（事务：先清除旧默认，再设置新默认） */
export async function setDefaultAddress(
  id: string,
  userId: string,
): Promise<void> {
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id, userId },
      data: { isDefault: true },
    }),
  ]);
}

// ==================== Profile ====================

/** 获取用户密码哈希（用于修改密码时校验当前密码） */
export async function getUserPasswordHash(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  return user?.passwordHash ?? null;
}

/** 更新用户昵称（name） */
export async function updateUserName(
  userId: string,
  nickname: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { name: nickname },
  });
}

/** 更新用户头像 URL */
export async function updateUserAvatar(
  userId: string,
  avatarUrl: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { image: avatarUrl },
  });
}

/** 更新用户密码哈希 */
export async function updateUserPassword(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

// ==================== Wishlist ====================

/**
 * 获取用户收藏列表（按收藏时间倒序）。
 * Wishlist 模型仅存储 workSlug（无 work 关联），需二次查询 Work 表。
 * Work.artistName 为 denormalized Json 字段（与 cart/actions.ts 一致）。
 */
export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const wishlists = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (wishlists.length === 0) return [];

  const workSlugs = wishlists.map((w) => w.workSlug);
  const works = await prisma.work.findMany({
    where: { slug: { in: workSlugs } },
    select: {
      slug: true,
      title: true,
      artistName: true,
      mainImage: true,
      priceCNY: true,
      priceUSD: true,
    },
  });

  const workMap = new Map(works.map((w) => [w.slug, w]));

  return wishlists
    .map((w) => {
      const work = workMap.get(w.workSlug);
      if (!work) return null;
      return {
        id: w.id,
        workSlug: w.workSlug,
        createdAt: w.createdAt.toISOString(),
        title: work.title as unknown as LocalizedText,
        artistName: work.artistName as unknown as LocalizedText,
        thumbnail: work.mainImage,
        priceCNY: work.priceCNY,
        priceUSD: work.priceUSD,
      };
    })
    .filter((item): item is WishlistItem => item !== null);
}

/** 检查某作品是否已被用户收藏 */
export async function isWishlisted(
  workSlug: string,
  userId: string,
): Promise<boolean> {
  const count = await prisma.wishlist.count({
    where: { workSlug, userId },
  });
  return count > 0;
}

/**
 * 切换收藏状态。
 * 依赖 Wishlist 的 @@unique([userId, workSlug]) 复合唯一约束
 * （Prisma 生成的 where key 为 userId_workSlug）。
 * 返回 true=已收藏 / false=已取消收藏。
 */
export async function toggleWishlist(
  workSlug: string,
  userId: string,
): Promise<boolean> {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_workSlug: { userId, workSlug } },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id },
    });
    return false; // 已取消收藏
  }

  await prisma.wishlist.create({
    data: { userId, workSlug },
  });
  return true; // 已收藏
}

/** 移除单条收藏（带 userId 校验，防止越权删除他人收藏） */
export async function removeWishlistItem(
  id: string,
  userId: string,
): Promise<void> {
  await prisma.wishlist.delete({
    where: { id, userId },
  });
}

// ==================== Delete Account ====================

/**
 * 删除用户账户（级联删除关联数据）。
 * Prisma schema 中 Order/Address/Wishlist 的 userId 均配置了 onDelete: Cascade，
 * 删除 User 时会自动删除其关联的订单、地址、收藏。
 */
export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
  });
}
