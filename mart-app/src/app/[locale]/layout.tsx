import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProviders } from "@/components/auth/AuthProviders";
import "@/app/globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("desc"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <head>
        <link rel="preconnect" href="https://trae-api-cn.mchost.guru" />
        <link rel="dns-prefetch" href="https://trae-api-cn.mchost.guru" />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProviders>
            <AnnouncementBar />
            <Header />
            {children}
            <Footer />
          </AuthProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
