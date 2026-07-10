/**
 * 支付结果页（P3.4 支付与订单阶段）。
 *
 * Server Component：读取 URL searchParams 中的 `order` 参数。
 * - 无订单号 → 重定向到 /works
 * - 查询订单 → 交给 OrderResultClient 渲染
 * - 订单未找到 → 传 null 给客户端组件，由其显示"订单未找到"
 */
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getOrderByNumber } from "@/lib/order/repository";
import { OrderResultClient } from "@/components/checkout/OrderResultClient";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutResultPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const { order: orderNumber } = await searchParams;

  // 无订单号 → 重定向到 /works
  if (!orderNumber) {
    redirect(`/${locale}/works`);
  }

  // 查询订单
  const order = await getOrderByNumber(orderNumber);

  // 订单未找到 → 传 null 给客户端组件，由其显示"订单未找到"
  return <OrderResultClient order={order} locale={locale as "zh" | "en"} />;
}
