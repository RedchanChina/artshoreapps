import type { ShippingAddress, DutyEstimate } from "@/lib/checkout/types";
import type { Currency, LocalizedText } from "@/data/types";

/** createOrder 输入 */
export interface CreateOrderInput {
  shippingAddress: ShippingAddress;
  shippingMethodCode: string;
  shippingMethodName: LocalizedText;
  shippingFeeCNY: number;
  shippingFeeUSD: number;
  duty: DutyEstimate;
  subtotalCNY: number;
  subtotalUSD: number;
  totalCNY: number;
  totalUSD: number;
  currency: Currency;
  paymentMethod: string; // stripe / paypal / alipay / wechat
  userId?: string; // 登录用户关联，游客为 undefined
  saveAddressToBook?: boolean; // 是否保存地址到地址簿（Task 3 使用）
}

/** createOrder 结果 */
export interface CreateOrderResult {
  success: boolean;
  orderNumber?: string;
  error?: "VERSION_EXPIRED" | "VERSION_UNAVAILABLE" | "EMPTY_CART" | "UNKNOWN_ERROR";
}

/** 订单项结果（用于支付结果页展示） */
export interface OrderResultItem {
  id: string;
  workSlug: string;
  tierId: string;
  editionNumber: number;
  tierLabel: LocalizedText;
  framingLabel: LocalizedText | null;
  title: LocalizedText;
  artistName: LocalizedText;
  thumbnail: string;
  lockedPriceCNY: number;
  lockedPriceUSD: number;
  productionType: string;
  productionDays: number;
}

/** 订单结果（用于支付结果页展示） */
export interface OrderResult {
  orderNumber: string;
  userEmail: string;
  shippingAddress: ShippingAddress;
  shippingMethodCode: string;
  shippingMethodName: LocalizedText;
  shippingFeeCNY: number;
  shippingFeeUSD: number;
  dutyCNY: number;
  dutyUSD: number;
  subtotalCNY: number;
  subtotalUSD: number;
  totalCNY: number;
  totalUSD: number;
  currency: Currency;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: OrderResultItem[];
}
