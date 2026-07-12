"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { fetchOrders } from "@/lib/account/actions";
import type { OrderListItem } from "@/lib/account/repository";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/useClickOutside";

interface OrdersPanelProps {
  userId: string;
}

// 订单状态徽章样式映射
const STATUS_STYLES: Record<string, string> = {
  paid: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  refunded: "bg-red-100 text-red-800",
};

// 订单状态 i18n key 映射
const STATUS_I18N: Record<string, string> = {
  paid: "statusPaid",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  refunded: "statusRefunded",
};

// 状态筛选选项（value + i18n key）
const STATUS_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "all", labelKey: "allStatus" },
  { value: "paid", labelKey: "statusPaid" },
  { value: "shipped", labelKey: "statusShipped" },
  { value: "delivered", labelKey: "statusDelivered" },
  { value: "refunded", labelKey: "statusRefunded" },
];

export function OrdersPanel({ userId }: OrdersPanelProps) {
  const t = useTranslations("account.orders");
  const locale = useLocale() as "zh" | "en";
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  // 状态筛选：all / paid / shipped / delivered / refunded
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [userId]);

  // 点击外部 / ESC 关闭下拉
  useClickOutside(wrapRef, () => setOpen(false), open);

  // 客户端按状态筛选
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  // 当前选中项
  const currentOption =
    STATUS_OPTIONS.find((o) => o.value === statusFilter) ?? STATUS_OPTIONS[0];

  if (loading) {
    return (
      <div className="py-8 text-center text-[14px] text-gray-400">Loading...</div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-[14px] text-gray-500">{t("empty")}</p>
        <Link
          href={`/${locale}/works`}
          className="inline-block border border-ink px-6 py-2.5 text-[13px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          {t("browseWorks")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 状态筛选 */}
      <div className="flex items-center justify-end">
        <div
          ref={wrapRef}
          role="group"
          aria-label="Status filter"
          className="relative inline-flex"
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="inline-flex items-center gap-1 text-[11px] font-medium tracking-[0.14em] text-ink transition-colors duration-200 ease-mart"
          >
            <span>{t(currentOption.labelKey)}</span>
            <ChevronDown
              size={12}
              strokeWidth={1.2}
              className={cn(
                "transition-transform duration-200 ease-mart",
                open && "rotate-180",
                "text-gray-500",
              )}
            />
          </button>
          {open && (
            <ul
              role="listbox"
              className="absolute right-0 top-full z-50 mt-2 min-w-[120px] border border-line bg-paper py-1 shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
            >
              {STATUS_OPTIONS.map((opt) => {
                const isActive = opt.value === statusFilter;
                return (
                  <li key={opt.value} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center px-3 py-1.5 text-left text-[11px] font-medium tracking-[0.14em] transition-colors duration-200 ease-mart",
                        isActive
                          ? "bg-gray-100 text-ink"
                          : "text-gray-700 hover:bg-gray-100 hover:text-ink",
                      )}
                    >
                      {t(opt.labelKey)}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-12 text-center text-[14px] text-gray-400">
          {t("empty")}
        </div>
      ) : (
        filteredOrders.map((order) => (
          <Link
            key={order.orderNumber}
            href={`/${locale}/account/orders/${order.orderNumber}`}
            className="block border border-line transition-colors hover:bg-gray-50"
          >
            {/* 订单头部 */}
            <div className="flex w-full items-center justify-between px-4 py-4 text-left">
              <div className="flex items-center gap-4">
                {order.firstThumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.firstThumbnail}
                    alt=""
                    className="h-12 w-12 object-cover"
                  />
                )}
                <div>
                  <p className="text-[14px] font-medium text-ink">
                    {order.orderNumber}
                  </p>
                  <p className="text-[12px] text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString(
                      locale === "zh" ? "zh-CN" : "en-US",
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-medium text-ink">
                  {order.currency === "CNY" ? "¥" : "$"}
                  {order.currency === "CNY" ? order.totalCNY : order.totalUSD}
                </p>
                {/* 状态徽章 */}
                <span
                  className={cn(
                    "mt-1 inline-block px-2 py-0.5 text-[11px] font-medium",
                    STATUS_STYLES[order.status] ?? "",
                  )}
                >
                  {t(STATUS_I18N[order.status] ?? "statusPaid")}
                </span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

export default OrdersPanel;
