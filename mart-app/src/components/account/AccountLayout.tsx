"use client";
/**
 * 账户中心布局（Phase 2 Task 5.2）。
 *
 * 左侧导航 + 右侧内容区；移动端导航横向滚动，桌面端纵向列表。
 * 切换 tab 通过 router.push 更新 ?tab= query，由 Server Component 重新解析。
 */
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { CountryOption } from "@/lib/checkout/types";
import { cn } from "@/lib/utils";
import { ProfilePanel } from "./ProfilePanel";
import { OrdersPanel } from "./OrdersPanel";
import { AddressesPanel } from "./AddressesPanel";
import { WishlistPanel } from "./WishlistPanel";

export type Tab = "profile" | "orders" | "addresses" | "wishlist";

export interface AccountUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

interface AccountLayoutProps {
  activeTab: Tab;
  user: AccountUser;
  /** 支持配送的国家列表（透传给 AddressesPanel） */
  supportedCountries: CountryOption[];
}

export function AccountLayout({
  activeTab,
  user,
  supportedCountries,
}: AccountLayoutProps) {
  const t = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: t("tabs.profile") },
    { id: "orders", label: t("tabs.orders") },
    { id: "addresses", label: t("tabs.addresses") },
    { id: "wishlist", label: t("tabs.wishlist") },
  ];

  const handleTabChange = (tab: Tab) => {
    router.push(`/${locale}/account?tab=${tab}`);
  };

  return (
    <div className="container mx-auto px-4 pt-[120px] pb-16 md:pt-[144px]">
      <h1 className="mb-8 font-display text-[22px] font-light text-ink">
        {t("title")}
      </h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
        {/* 左侧导航 */}
        <nav className="border-b border-line lg:border-b-0 lg:border-r lg:pr-8">
          <ul className="flex gap-4 overflow-x-auto lg:flex-col lg:gap-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "whitespace-nowrap py-2 text-[13px] uppercase tracking-[0.14em] transition-colors lg:block lg:px-3 lg:py-2.5",
                    activeTab === tab.id
                      ? "font-medium text-ink lg:bg-gray-50"
                      : "text-gray-500 hover:text-ink"
                  )}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* 右侧内容区 */}
        <div className="min-h-[400px]">
          {activeTab === "profile" && <ProfilePanel user={user} />}
          {activeTab === "orders" && <OrdersPanel userId={user.id} />}
          {activeTab === "addresses" && (
            <AddressesPanel
              userId={user.id}
              defaultEmail={user.email}
              supportedCountries={supportedCountries}
            />
          )}
          {activeTab === "wishlist" && <WishlistPanel userId={user.id} />}
        </div>
      </div>
    </div>
  );
}
