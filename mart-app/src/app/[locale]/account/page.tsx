/**
 * 账户中心页（Phase 2 Task 5.1）。
 *
 * Server Component：校验 locale → setRequestLocale → 调用 auth() 取 session，
 * 未登录则带 locale 前缀 redirect 到登录页（callbackUrl 指向 /account）→
 * 解析 tab query（profile/orders/addresses/wishlist，默认 profile）→
 * 交给 AccountLayout 渲染左侧导航 + 右侧内容区。
 *
 * 注意：middleware 已对 /account 做未登录拦截，此处的 auth() 为二次保障。
 */
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound, redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth/auth";
import { getCountries } from "@/lib/checkout/actions";
import { AccountLayout, type AccountUser } from "@/components/account/AccountLayout";

type Tab = "profile" | "orders" | "addresses" | "wishlist";

interface AccountPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function AccountPage({
  params,
  searchParams,
}: AccountPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/account`);
  }

  const { tab } = await searchParams;
  const activeTab: Tab =
    tab === "orders" || tab === "addresses" || tab === "wishlist"
      ? tab
      : "profile";

  // session.user.id 已通过 authConfig callbacks.jwt/session 回填
  const user: AccountUser = {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };

  // 支持配送的国家列表（透传给 AddressesPanel 供下拉选择）
  const supportedCountries = await getCountries();

  return (
    <AccountLayout
      activeTab={activeTab}
      user={user}
      supportedCountries={supportedCountries}
    />
  );
}
