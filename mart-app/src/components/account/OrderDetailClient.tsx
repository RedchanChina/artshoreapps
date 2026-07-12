"use client";

/**
 * 订单详情客户端组件。
 *
 * 展示订单完整信息：状态时间线、物流追踪、商品列表 + 证书信息、
 * 金额明细、收货信息，并根据订单状态提供「确认收货 / 申请退款」操作。
 * 操作完成后调用 router.refresh() 刷新服务端数据。
 */
import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { confirmDelivery, requestRefund } from "@/lib/account/actions";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { EditionInfo, OrderDetailFull } from "@/lib/account/types";

interface OrderDetailClientProps {
  order: OrderDetailFull;
  /** 订单号（actions 需要，OrderDetailFull 未包含） */
  orderNumber: string;
}

// 时间线节点
interface TimelineNode {
  key: string;
  labelKey: string;
  date: string | null;
  reached: boolean;
  isCurrent: boolean;
}

/** 根据订单状态生成时间线节点 */
function buildTimeline(order: OrderDetailFull): TimelineNode[] {
  const { status, createdAt, shippedAt, deliveredAt, refundedAt } = order;
  // 本流程下单即支付，已支付时间 = 下单时间
  const paidAt = createdAt;

  if (status === "refunded") {
    return [
      { key: "placed", labelKey: "timelineOrderPlaced", date: createdAt, reached: true, isCurrent: false },
      { key: "paid", labelKey: "timelinePaid", date: paidAt, reached: true, isCurrent: false },
      { key: "refunded", labelKey: "timelineRefunded", date: refundedAt, reached: true, isCurrent: true },
    ];
  }

  const shippedReached = status === "shipped" || status === "delivered";
  const deliveredReached = status === "delivered";

  return [
    { key: "placed", labelKey: "timelineOrderPlaced", date: createdAt, reached: true, isCurrent: status === "paid" },
    { key: "paid", labelKey: "timelinePaid", date: paidAt, reached: true, isCurrent: status === "paid" },
    { key: "shipped", labelKey: "timelineShipped", date: shippedAt, reached: shippedReached, isCurrent: status === "shipped" },
    { key: "delivered", labelKey: "timelineDelivered", date: deliveredAt, reached: deliveredReached, isCurrent: status === "delivered" },
  ];
}

/** 根据物流商生成追踪链接：顺丰 / DHL / 其他默认搜索 */
function getTrackingUrl(company: string, trackingNumber: string): string {
  const c = company.toLowerCase();
  if (c.includes("顺丰") || c.includes("sf")) {
    return `https://www.sf-express.com/sf-service-website/cn/sc/dynamic/express/${trackingNumber}`;
  }
  if (c.includes("dhl")) {
    return `https://www.dhl.com/cn-zh/home/tracking.html?tracking-id=${trackingNumber}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${company} ${trackingNumber}`)}`;
}

export function OrderDetailClient({ order, orderNumber }: OrderDetailClientProps) {
  const t = useTranslations("account.orders");
  const locale = useLocale() as "zh" | "en";
  const router = useRouter();

  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = order.currency as "CNY" | "USD";
  const isCNY = currency === "CNY";
  const timeline = buildTimeline(order);

  // 按 orderItemId 分组证书信息
  const editionsByItem = useMemo(() => {
    const map = new Map<string, EditionInfo[]>();
    for (const ed of order.editions) {
      const list = map.get(ed.orderItemId) ?? [];
      list.push(ed);
      map.set(ed.orderItemId, list);
    }
    return map;
  }, [order.editions]);

  // 物流状态：已发货 / 已签收 才显示物流信息
  const isShipped = order.status === "shipped" || order.status === "delivered";
  const hasTracking =
    isShipped && !!order.logisticsCompany && !!order.trackingNumber;

  /** 格式化日期时间 */
  const formatDate = (iso: string | null): string | null => {
    if (!iso) return null;
    return new Date(iso).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /** 装裱方式映射：tote_bag → 手提袋 / aluminum_frame → 铝合金框 */
  const framingLabel = (option: string | null): string => {
    if (option === "tote_bag") return t("framingToteBag");
    if (option === "aluminum_frame") return t("framingAluminumFrame");
    return option ?? "-";
  };

  /** 渠道映射：online → 线上 / offline → 线下 */
  const channelLabel = (channel: string): string => {
    if (channel === "online") return t("channelOnline");
    if (channel === "offline") return t("channelOffline");
    return channel;
  };

  // 确认收货：shipped → delivered
  const handleConfirmDelivery = async () => {
    setSubmitting(true);
    setError(null);
    const res = await confirmDelivery(orderNumber);
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? "ERROR");
      return;
    }
    setConfirmingDelivery(false);
    router.refresh();
  };

  // 申请退款：paid → refunded
  const handleRequestRefund = async () => {
    if (!refundReason.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await requestRefund(orderNumber, refundReason.trim());
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? "ERROR");
      return;
    }
    setShowRefundForm(false);
    setRefundReason("");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-[800px] px-4 pb-16 pt-40 md:pt-48">
      {/* a) 顶部：返回按钮 + 标题 */}
      <Link
        href={`/${locale}/account?tab=orders`}
        className="text-[13px] uppercase tracking-[0.14em] text-gray-500 transition-colors hover:text-ink"
      >
        ← {t("backToOrders")}
      </Link>
      <h1 className="mt-3 font-display text-[22px] font-light text-ink">
        {t("orderDetail")}
      </h1>
      <p className="mt-1 text-[12px] uppercase tracking-[0.14em] tabular-nums text-gray-500">
        {orderNumber}
      </p>

      {/* b) 状态时间线 */}
      <section className="mt-8 border border-line bg-paper p-6">
        <div className="flex items-start">
          {timeline.map((node, i) => (
            <Fragment key={node.key}>
              {i > 0 && (
                <div
                  className={cn(
                    "mt-3 h-px flex-1",
                    timeline[i - 1].reached && node.reached
                      ? "bg-ink"
                      : "bg-line",
                  )}
                />
              )}
              <div className="flex min-w-[5rem] flex-col items-center">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2",
                    node.reached ? "border-ink bg-ink" : "border-line bg-paper",
                    node.isCurrent && "ring-2 ring-ink ring-offset-2",
                  )}
                >
                  {node.reached && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      aria-hidden="true"
                      className="text-paper"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-[12px]",
                    node.reached ? "text-ink" : "text-gray-400",
                  )}
                >
                  {t(node.labelKey)}
                </span>
                {node.date && (
                  <span className="mt-1 text-[11px] tabular-nums text-gray-500">
                    {formatDate(node.date)}
                  </span>
                )}
              </div>
            </Fragment>
          ))}
        </div>
      </section>

      {/* c) 物流追踪 */}
      <section className="mt-6 border border-line bg-paper p-6">
        <h2 className="mb-4 text-[12px] uppercase tracking-[0.14em] text-gray-500">
          {t("logistics")}
        </h2>
        {hasTracking ? (
          <div className="space-y-2 text-[14px] text-ink">
            <p>{order.logisticsCompany}</p>
            <p className="tabular-nums">
              {t("trackingNumber")}：{order.trackingNumber}
            </p>
            <a
              href={getTrackingUrl(order.logisticsCompany!, order.trackingNumber!)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-b border-ink text-[13px] uppercase tracking-[0.14em] text-ink"
            >
              {t("trackShipment")} →
            </a>
          </div>
        ) : order.status === "paid" ? (
          <p className="text-[14px] text-gray-500">{t("pendingShipment")}</p>
        ) : (
          <p className="text-[14px] text-gray-500">—</p>
        )}
      </section>

      {/* d) 商品列表 + 证书信息 */}
      <section className="mt-6 border border-line bg-paper p-6">
        <h2 className="mb-5 text-[12px] uppercase tracking-[0.14em] text-gray-500">
          {t("items")}
        </h2>
        <ul className="space-y-4">
          {order.items.map((item) => {
            const price = isCNY ? item.lockedPriceCNY : item.lockedPriceUSD;
            const spec = [item.tierLabel[locale], `#${item.editionNumber}`]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={item.id} className="flex flex-col gap-2">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt={item.title[locale]}
                    loading="lazy"
                    className="h-16 w-16 flex-shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-medium text-ink">
                      {item.title[locale]}
                    </h3>
                    <p className="mt-1 truncate text-[12px] text-gray-500">
                      {item.artistName[locale]}
                    </p>
                    <p className="mt-1 truncate text-[12px] text-gray-500">
                      {spec}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-[14px] tabular-nums text-ink">
                    {formatPrice(price, currency)}
                  </span>
                </div>
                {/* 该作品关联的证书信息 */}
                {(editionsByItem.get(item.id) ?? []).map((ed, idx) => (
                  <div
                    key={`${ed.editionNumber}-${idx}`}
                    className="ml-[76px] flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[12px] text-gray-500"
                  >
                    <span>
                      {t("certificate")}：
                      <span className="tabular-nums text-ink">#{ed.editionNumber}</span>
                    </span>
                    <span>
                      {t("framing")}：{framingLabel(ed.framingOption)}
                    </span>
                    <span>
                      {t("channel")}：{channelLabel(ed.channel)}
                    </span>
                  </div>
                ))}
              </li>
            );
          })}
        </ul>
      </section>

      {/* e) 金额明细 */}
      <section className="mt-6 border border-line bg-paper p-6">
        <h2 className="mb-5 text-[12px] uppercase tracking-[0.14em] text-gray-500">
          {t("grandTotal")}
        </h2>
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-[14px] text-ink">{t("subtotal")}</dt>
            <dd className="text-[14px] tabular-nums text-ink">
              {formatPrice(isCNY ? order.subtotalCNY : order.subtotalUSD, currency)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[14px] text-gray-700">{t("shipping")}</dt>
            <dd className="text-[14px] tabular-nums text-gray-700">
              {formatPrice(isCNY ? order.shippingCNY : order.shippingUSD, currency)}
            </dd>
          </div>
          {(isCNY ? order.dutyCNY : order.dutyUSD) > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-[14px] text-gray-700">{t("duty")}</dt>
              <dd className="text-[14px] tabular-nums text-gray-700">
                {formatPrice(isCNY ? order.dutyCNY : order.dutyUSD, currency)}
              </dd>
            </div>
          )}
        </dl>
        <div className="my-5 border-t border-line" />
        <div className="flex items-end justify-between">
          <span className="text-[14px] text-ink">{t("grandTotal")}</span>
          <span className="text-[20px] font-medium tabular-nums text-ink">
            {formatPrice(isCNY ? order.totalCNY : order.totalUSD, currency)}
          </span>
        </div>
      </section>

      {/* f) 收货信息 */}
      <section className="mt-6 border border-line bg-paper p-6">
        <h2 className="mb-4 text-[12px] uppercase tracking-[0.14em] text-gray-500">
          {t("shippingAddress")}
        </h2>
        <div className="space-y-1 text-[14px] text-ink">
          <p>{order.shippingAddress.fullName}</p>
          <p className="tabular-nums">{order.shippingAddress.phone}</p>
          <p>{order.shippingAddress.address}</p>
          <p>
            {order.shippingAddress.city} {order.shippingAddress.state}
          </p>
          <p className="tabular-nums">{order.shippingAddress.zipCode}</p>
        </div>
      </section>

      {/* g) 操作按钮 */}
      {order.status === "shipped" && (
        <div className="mt-8">
          {confirmingDelivery ? (
            <div className="border border-line bg-paper p-6">
              <p className="text-[14px] text-ink">{t("confirmDeliveryPrompt")}</p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirmDelivery}
                  disabled={submitting}
                  className="bg-ink px-6 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper disabled:opacity-50"
                >
                  {t("confirmDelivery")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingDelivery(false);
                    setError(null);
                  }}
                  disabled={submitting}
                  className="border border-line px-6 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-ink disabled:opacity-50"
                >
                  {t("cancelRefund")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelivery(true)}
              className="bg-ink px-8 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper"
            >
              {t("confirmDelivery")}
            </button>
          )}
        </div>
      )}

      {order.status === "paid" && (
        <div className="mt-8">
          {showRefundForm ? (
            <div className="border border-line bg-paper p-6">
              <label className="text-[12px] uppercase tracking-[0.14em] text-gray-500">
                {t("refundReason")}
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder={t("refundReasonPlaceholder")}
                rows={3}
                className="mt-2 w-full border border-line px-4 py-3 text-[14px] text-ink outline-none focus:border-ink"
              />
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleRequestRefund}
                  disabled={submitting || !refundReason.trim()}
                  className="bg-danger px-6 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-danger/90 disabled:opacity-50"
                >
                  {t("confirmRefund")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRefundForm(false);
                    setRefundReason("");
                    setError(null);
                  }}
                  disabled={submitting}
                  className="border border-line px-6 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-ink disabled:opacity-50"
                >
                  {t("cancelRefund")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowRefundForm(true)}
              className="inline-flex items-center gap-2 bg-danger px-8 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-danger/90"
            >
              <RotateCcw size={14} strokeWidth={1.5} />
              {t("requestRefund")}
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-[13px] text-danger">{error}</p>}
    </div>
  );
}

export default OrderDetailClient;
