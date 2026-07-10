"use client";

/**
 * 支付方式选择器（Phase 2 Task 4.5）。
 *
 * 4 个选项：Stripe / PayPal / 支付宝 / 微信支付。每项含图标 +
 * 名称 + 描述。选中项 border-ink 高亮，默认 border-line。垂直列表。
 *
 * Client Component（需 useTranslations）。
 */
import { useTranslations } from "next-intl";
import { CreditCard, Wallet, Smartphone, QrCode } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "stripe" | "paypal" | "alipay" | "wechat";

interface PaymentSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

interface PaymentOptionDef {
  id: PaymentMethod;
  nameKey: "stripe" | "paypal" | "alipay" | "wechat";
  descKey: "stripeDesc" | "paypalDesc" | "alipayDesc" | "wechatDesc";
  Icon: LucideIcon;
}

const OPTIONS: PaymentOptionDef[] = [
  { id: "stripe", nameKey: "stripe", descKey: "stripeDesc", Icon: CreditCard },
  { id: "paypal", nameKey: "paypal", descKey: "paypalDesc", Icon: Wallet },
  { id: "alipay", nameKey: "alipay", descKey: "alipayDesc", Icon: Smartphone },
  { id: "wechat", nameKey: "wechat", descKey: "wechatDesc", Icon: QrCode },
];

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  const t = useTranslations("checkout.payment");

  return (
    <section>
      <h2 className="mb-6 text-[15px] font-medium text-ink">{t("title")}</h2>
      <div className="space-y-3">
        {OPTIONS.map(({ id, nameKey, descKey, Icon }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-pressed={isSelected}
              className={cn(
                "flex w-full items-center gap-4 border-2 px-4 py-4 text-left transition-colors duration-200 ease-mart",
                isSelected
                  ? "border-ink bg-gray-100/50"
                  : "border-line hover:border-ink/50",
              )}
            >
              <Icon
                size={24}
                strokeWidth={1.4}
                className="flex-shrink-0 text-ink"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] text-ink">{t(nameKey)}</p>
                <p className="mt-0.5 text-[12px] text-gray-500">
                  {t(descKey)}
                </p>
              </div>
              {/* 选中标识：实心圆点 */}
              <span
                className={cn(
                  "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                  isSelected
                    ? "border-ink bg-ink"
                    : "border-gray-300 bg-paper",
                )}
                aria-hidden="true"
              >
                {isSelected && (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-[10px] w-[10px]"
                    fill="none"
                    stroke="#FAFAF7"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 6L5 8.5L9.5 3.5" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default PaymentSelector;
