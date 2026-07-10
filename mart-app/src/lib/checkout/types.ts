import type { LocalizedText, Currency } from "@/data/types";
import type { CartItem } from "@/lib/cart/types";

/** 收货地址 */
export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  countryCode: string;
  state: string;
  city: string;
  address: string;
  zipCode: string;
}

/** 运费选项 */
export interface ShippingOption {
  methodCode: string;
  name: LocalizedText;
  estimatedDays: string;
  feeCNY: number;
  feeUSD: number;
  /** 巨幅运费待确认时为 true */
  pendingConfirmation: boolean;
}

/** 关税预估 */
export interface DutyEstimate {
  rate: number;
  amountCNY: number;
  amountUSD: number;
  /** 是否免税（无 DutyConfig 或 active=false） */
  exempt: boolean;
}

/** 运费计算结果 */
export interface ShippingCalculationResult {
  options: ShippingOption[];
  duty: DutyEstimate;
  supported: boolean;
  /** 不可达原因（如 supported=false 时） */
  reason?: string;
  /** 商品小计（CNY/USD，供客户端本地计算摘要用） */
  subtotalCNY: number;
  subtotalUSD: number;
}

/** 结账摘要 */
export interface CheckoutSummary {
  items: CartItem[];
  subtotalCNY: number;
  subtotalUSD: number;
  shippingCNY: number;
  shippingUSD: number;
  dutyCNY: number;
  dutyUSD: number;
  totalCNY: number;
  totalUSD: number;
  currency: Currency;
}

/** 国家选项（表单下拉用） */
export interface CountryOption {
  countryCode: string;
  countryName: LocalizedText;
}
