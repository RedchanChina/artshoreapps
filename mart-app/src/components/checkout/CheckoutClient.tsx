"use client";

/**
 * 结账客户端容器（Phase 2 Task 4.2）。
 *
 * 接收 Server Component 传入的 initialItems 与 countries，管理收货地址 /
 * 配送方式 / 支付方式 / 运费选项 / 关税 / 摘要 state：
 * - 监听 countryCode 变化 → 调用 calculateShipping（一次性返回 options + duty + subtotal）
 * - 选择配送方式时客户端本地计算摘要（零延迟，无需再调用 Server Action）
 * - 渲染 ShippingForm / ShippingOptions / PaymentSelector / OrderSummary
 *
 * 桌面端：左右分栏（1fr 表单 / 400px 摘要）；移动端：上下堆叠。
 *
 * Client Component（需 useSettings + useTranslations + useLocale）。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { calculateShipping } from "@/lib/checkout/actions";
import { createOrder } from "@/lib/order/actions";
import type {
  CountryOption,
  DutyEstimate,
  ShippingAddress,
  ShippingOption,
} from "@/lib/checkout/types";
import type { CreateOrderInput } from "@/lib/order/types";
import type { CartItem } from "@/lib/cart/types";
import type { Currency } from "@/data/types";
import { useSettings } from "@/store/useSettings";
import { cn } from "@/lib/utils";
import { ShippingForm, validateShippingAddress } from "./ShippingForm";
import { ShippingOptions } from "./ShippingOptions";
import { PaymentSelector, type PaymentMethod } from "./PaymentSelector";
import { OrderSummary } from "./OrderSummary";

interface CheckoutClientProps {
  initialItems: CartItem[];
  countries: CountryOption[];
}

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  email: "",
  countryCode: "",
  state: "",
  city: "",
  address: "",
  zipCode: "",
};

export function CheckoutClient({ initialItems, countries }: CheckoutClientProps) {
  const t = useTranslations("checkout");
  const tOrder = useTranslations("order");
  const locale = useLocale() as "zh" | "en";
  const router = useRouter();
  const currency = useSettings((s) => s.currency);

  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress>(EMPTY_ADDRESS);
  const [selectedMethodCode, setSelectedMethodCode] = useState<string | null>(
    null,
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("stripe");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [duty, setDuty] = useState<DutyEstimate | null>(null);
  const [supported, setSupported] = useState<boolean>(true);
  const [shippingLoading, setShippingLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 缓存 calculateShipping 返回的小计（避免重复调用 Server Action）
  const [subtotal, setSubtotal] = useState<{ cny: number; usd: number }>({
    cny: 0,
    usd: 0,
  });

  // countryCode 变化 → 重新计算运费选项与关税（一次性获取所有数据）
  useEffect(() => {
    const code = shippingAddress.countryCode;
    if (!code) {
      setShippingOptions([]);
      setDuty(null);
      setSupported(true);
      setSelectedMethodCode(null);
      setSubtotal({ cny: 0, usd: 0 });
      return;
    }
    let cancelled = false;
    setShippingLoading(true);
    calculateShipping(code).then((result) => {
      if (cancelled) return;
      setShippingOptions(result.options);
      setDuty(result.duty);
      setSupported(result.supported);
      setSubtotal({ cny: result.subtotalCNY, usd: result.subtotalUSD });
      // 切换国家时重置选择
      setSelectedMethodCode(null);
      // 仅一个非待确认选项时自动选中
      const selectable = result.options.filter((o) => !o.pendingConfirmation);
      if (selectable.length === 1) {
        setSelectedMethodCode(selectable[0].methodCode);
      }
      setShippingLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [shippingAddress.countryCode]);

  // toast 3 秒后自动清除
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleAddressChange = useCallback(
    (patch: Partial<ShippingAddress>) => {
      setShippingAddress((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  // 客户端本地计算摘要（零延迟，无需调用 Server Action）
  const summary = useMemo(() => {
    if (shippingAddress.countryCode === "" || initialItems.length === 0) {
      return null;
    }

    const subtotalCNY = subtotal.cny;
    const subtotalUSD = subtotal.usd;

    // 查找选中配送方式的运费
    let shippingCNY = 0;
    let shippingUSD = 0;
    const selectedOption = shippingOptions.find(
      (o) => o.methodCode === selectedMethodCode,
    );
    if (selectedOption && !selectedOption.pendingConfirmation) {
      shippingCNY = selectedOption.feeCNY;
      shippingUSD = selectedOption.feeUSD;
    }

    // 关税
    const dutyCNY = duty?.amountCNY ?? 0;
    const dutyUSD = duty?.amountUSD ?? 0;

    return {
      items: initialItems,
      subtotalCNY,
      subtotalUSD,
      shippingCNY,
      shippingUSD,
      dutyCNY,
      dutyUSD,
      totalCNY: subtotalCNY + shippingCNY + dutyCNY,
      totalUSD: subtotalUSD + shippingUSD + dutyUSD,
      currency: currency as Currency,
    };
  }, [
    shippingAddress.countryCode,
    initialItems,
    subtotal.cny,
    subtotal.usd,
    shippingOptions,
    selectedMethodCode,
    duty,
    currency,
  ]);

  const isFormValid = validateShippingAddress(shippingAddress);
  const selectedOption = shippingOptions.find(
    (o) => o.methodCode === selectedMethodCode,
  );
  const shippingPending = selectedOption?.pendingConfirmation ?? false;
  const canConfirm =
    isFormValid &&
    supported &&
    !!summary &&
    !shippingPending &&
    !!selectedMethodCode;

  const disableReason: string | null = canConfirm
    ? null
    : !isFormValid
      ? t("reasonIncomplete")
      : !supported
        ? t("reasonShippingPending")
        : !summary
          ? t("reasonIncomplete")
          : shippingPending
            ? t("reasonShippingPending")
            : !selectedMethodCode
              ? t("reasonSelectShipping")
              : null;

  const handleConfirm = useCallback(async () => {
    if (submitting) return; // 防重复提交

    // 组装 CreateOrderInput
    const selectedOption = shippingOptions.find(
      (o) => o.methodCode === selectedMethodCode,
    );
    if (!summary || !selectedOption || !selectedMethodCode) return;

    const input: CreateOrderInput = {
      shippingAddress,
      shippingMethodCode: selectedMethodCode,
      shippingMethodName: selectedOption.name,
      shippingFeeCNY: selectedOption.feeCNY,
      shippingFeeUSD: selectedOption.feeUSD,
      duty: duty ?? { rate: 0, amountCNY: 0, amountUSD: 0, exempt: true },
      subtotalCNY: summary.subtotalCNY,
      subtotalUSD: summary.subtotalUSD,
      totalCNY: summary.totalCNY,
      totalUSD: summary.totalUSD,
      currency,
      paymentMethod: selectedPayment,
    };

    setSubmitting(true);
    try {
      const result = await createOrder(input);
      if (result.success && result.orderNumber) {
        router.push(`/${locale}/checkout/result?order=${result.orderNumber}`);
      } else {
        // 根据错误类型显示对应 toast
        const errorKey = result.error ?? "UNKNOWN_ERROR";
        const toastMessage =
          errorKey === "VERSION_UNAVAILABLE"
            ? tOrder("errorVersionUnavailable")
            : errorKey === "EMPTY_CART"
              ? tOrder("errorEmptyCart")
              : errorKey === "VERSION_EXPIRED"
                ? tOrder("errorVersionExpired")
                : tOrder("errorUnknown");
        setToast(toastMessage);
      }
    } catch {
      setToast(tOrder("errorUnknown"));
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    shippingOptions,
    selectedMethodCode,
    summary,
    duty,
    currency,
    selectedPayment,
    shippingAddress,
    locale,
    router,
    tOrder,
  ]);

  return (
    <div className="container mx-auto px-4 pb-16 pt-20 md:px-7 lg:px-10">
      <h1 className="mb-8 font-display text-[22px] font-light tracking-[-0.01em] text-ink">
        {t("title")}
      </h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {/* 左：表单区 */}
        <div className="space-y-10">
          <ShippingForm
            address={shippingAddress}
            countries={countries}
            onChange={handleAddressChange}
          />
          <ShippingOptions
            options={shippingOptions}
            selectedMethodCode={selectedMethodCode}
            supported={supported}
            hasCountry={!!shippingAddress.countryCode}
            loading={shippingLoading}
            currency={currency}
            locale={locale}
            onSelect={setSelectedMethodCode}
          />
          <PaymentSelector
            selected={selectedPayment}
            onSelect={setSelectedPayment}
          />
        </div>

        {/* 右：订单摘要 */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            items={initialItems}
            summary={summary}
            duty={duty}
            currency={currency}
            locale={locale}
            shippingPending={shippingPending}
            canConfirm={canConfirm}
            submitting={submitting}
            disableReason={disableReason}
            onConfirm={handleConfirm}
          />
        </div>
      </div>

      {/* toast */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 bg-ink px-6 py-3 text-sm text-paper transition-opacity duration-300 ease-mart",
          toast ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        role="status"
        aria-live="polite"
      >
        {toast ?? ""}
      </div>
    </div>
  );
}

export default CheckoutClient;
