import type { OrderDetailData } from "./repository";

/**
 * 账户中心扩展类型定义（Phase 后续迭代）。
 *
 * 本文件仅声明新增的衍生类型，不重复 repository.ts 中已有的类型。
 * 已有类型（OrderListItem / OrderDetailData / AddressData / WishlistItem 等）
 * 仍以 repository.ts 为单一来源，actions.ts 通过 re-export 对外暴露。
 */

/** 订单状态类型 */
export type OrderStatus = "paid" | "shipped" | "delivered" | "refunded";

/** 证书信息（从 EditionNumber 查询） */
export interface EditionInfo {
  editionNumber: number;
  framingOption: string | null;
  channel: string;
  orderItemId: string;
}

/**
 * 扩展的订单详情（含物流 + 退款 + 证书信息）。
 *
 * 在现有 OrderDetailData 基础上扩展，新增 schema 中的 6 个可选字段
 * （logisticsCompany / trackingNumber / shippedAt / deliveredAt /
 * refundedAt / refundReason）以及订单状态和证书信息。
 * 所有新增字段均为可空，向后兼容已完成的订单。
 */
export interface OrderDetailFull extends OrderDetailData {
  // 订单状态
  status: OrderStatus;

  // 物流追踪字段
  logisticsCompany: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;

  // 退款字段
  refundedAt: string | null;
  refundReason: string | null;

  // 下单时间（ISO 字符串）
  createdAt: string;

  // 证书信息（对应 OrderItem 关联的 EditionNumber）
  editions: EditionInfo[];
}
