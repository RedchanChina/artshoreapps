/**
 * 订单详情页（Phase 2 Task 5.2）。
 *
 * Server Component：校验 locale → setRequestLocale → 调用 auth() 取 session，
 * 未登录则带 callbackUrl redirect 到登录页 → 调用 getOrderDetail（按 userId 隔离），
 * 未找到 notFound → 将订单数据 + 订单号传给 OrderDetailClient 渲染。
 *
 * 注意：middleware 已对 /account 做未登录拦截，此处的 auth() 为二次保障。
 */
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound, redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth/auth";
import { getOrderDetail } from "@/lib/account/repository";
import { OrderDetailClient } from "@/components/account/OrderDetailClient";

interface OrderDetailPageProps {
  params: Promise<{ locale: string; orderNumber: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { locale, orderNumber } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(
      `/${locale}/auth/login?callbackUrl=/${locale}/account/orders/${orderNumber}`,
    );
  }

  const order = await getOrderDetail(orderNumber, session.user.id);
  if (!order) notFound();

  return <OrderDetailClient order={order} orderNumber={orderNumber} />;
}
