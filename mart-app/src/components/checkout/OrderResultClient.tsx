"use client";

/**
 * 支付结果展示（P3.4 支付与订单阶段）。
 *
 * Client Component（需 useTranslations）。
 * - order 为 null：显示"订单未找到" + 返回首页按钮
 * - order 存在：支付成功标识 + 订单号 + 物流提示 + 商品清单 + 订单金额 + 收货地址 + 按钮区
 */
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import type { OrderResult } from "@/lib/order/types";

interface OrderResultClientProps {
  order: OrderResult | null;
  locale: "zh" | "en";
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M17 28.5L25 36L39 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OrderResultClient({ order, locale }: OrderResultClientProps) {
  const t = useTranslations("order");

  // 订单未找到
  if (!order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[800px] flex-col items-center justify-center px-4 py-20">
        <p className="text-[18px] text-gray-500">{t("orderNotFound")}</p>
        <Link
          href={`/${locale}`}
          className="mt-8 bg-ink px-8 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90"
        >
          {t("backToHome")}
        </Link>
      </div>
    );
  }

  const currency = order.currency;
  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-[800px] px-4 pb-16 pt-40 md:pt-48">
      {/* 1. 支付成功标识 */}
      <div className="flex flex-col items-center text-center">
        <CheckIcon className="text-ink" />
        <h1 className="mt-5 font-display text-[22px] font-light text-ink">
          {t("paymentSuccess")}
        </h1>
        {/* 2. 订单号 */}
        <p className="mt-2 text-[14px] tabular-nums text-gray-500">
          {t("orderNumber")}：{order.orderNumber}
        </p>
        {/* 3. 物流提示 */}
        <p className="mt-1 text-[13px] text-gray-500">{t("shippingNotice")}</p>
      </div>

      {/* 4. 商品清单 */}
      <section className="mt-10 border border-line bg-paper p-6">
        <h2 className="mb-5 text-[15px] font-medium text-ink">
          {t("orderItems")}
        </h2>
        <ul className="space-y-4">
          {order.items.map((item) => {
            const price =
              currency === "CNY" ? item.lockedPriceCNY : item.lockedPriceUSD;
            const spec = [
              item.tierLabel[locale],
              item.framingLabel ? item.framingLabel[locale] : null,
              `#${item.editionNumber}`,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={item.id} className="flex gap-3">
                <img
                  src={item.thumbnail}
                  alt={item.title[locale]}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 flex-shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[14px] font-medium text-ink">
                    {item.title[locale]}
                  </h3>
                  <p className="mt-1 truncate text-[12px] text-gray-500">
                    {spec}
                  </p>
                </div>
                <span className="flex-shrink-0 text-[14px] tabular-nums text-ink">
                  {formatPrice(price, currency)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 5. 订单金额明细 */}
      <section className="mt-6 border border-line bg-paper p-6">
        <h2 className="mb-5 text-[15px] font-medium text-ink">
          {t("orderSummary")}
        </h2>
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-[15px] text-ink">{t("subtotal")}</dt>
            <dd className="text-[15px] tabular-nums text-ink">
              {formatPrice(
                currency === "CNY" ? order.subtotalCNY : order.subtotalUSD,
                currency,
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[15px] text-gray-700">{t("shipping")}</dt>
            <dd className="text-[15px] tabular-nums text-gray-700">
              {formatPrice(
                currency === "CNY" ? order.shippingFeeCNY : order.shippingFeeUSD,
                currency,
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[15px] text-gray-700">{t("duty")}</dt>
            <dd className="text-[15px] tabular-nums text-gray-700">
              {formatPrice(
                currency === "CNY" ? order.dutyCNY : order.dutyUSD,
                currency,
              )}
            </dd>
          </div>
        </dl>
        <div className="my-5 border-t border-line" />
        <div className="flex items-end justify-between">
          <span className="text-[15px] text-ink">{t("total")}</span>
          <span className="text-[20px] font-medium tabular-nums text-ink">
            {formatPrice(
              currency === "CNY" ? order.totalCNY : order.totalUSD,
              currency,
            )}
          </span>
        </div>
        <p className="mt-3 text-[13px] text-gray-500">
          {t("paidAt")}：{formattedDate}
        </p>
      </section>

      {/* 6. 收货地址 */}
      <section className="mt-6 border border-line bg-paper p-6">
        <h2 className="mb-5 text-[15px] font-medium text-ink">
          {t("shippingAddress")}
        </h2>
        <div className="space-y-1 text-[14px] text-ink">
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.phone}</p>
          <p>
            {order.shippingAddress.state} {order.shippingAddress.city}
          </p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.zipCode}</p>
        </div>
      </section>

      {/* 7. 按钮区 */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/${locale}/works`}
          className="flex-1 bg-ink py-3.5 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90"
        >
          {t("continueShopping")}
        </Link>
        <Link
          href={`/${locale}`}
          className="flex-1 border border-ink py-3.5 text-center text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-mart hover:bg-ink hover:text-paper"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}

export default OrderResultClient;
