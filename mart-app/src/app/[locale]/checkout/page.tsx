/**
 * 结账页（Phase 2 Task 4.1）。
 *
 * Server Component：setRequestLocale → 调用 getCart()，空购物车时
 * 带 locale 前缀 redirect 回 /cart → 调用 getCountries() → 交给
 * CheckoutClient 渲染表单 / 运费 / 支付 / 摘要。
 */
import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getCart } from "@/lib/cart/actions";
import { getCountries } from "@/lib/checkout/actions";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const items = await getCart();
  if (items.length === 0) {
    redirect(`/${locale}/cart`);
  }

  const countries = await getCountries();
  return <CheckoutClient initialItems={items} countries={countries} />;
}
