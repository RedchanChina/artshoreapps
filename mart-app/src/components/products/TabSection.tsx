"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HorizontalScroll } from "@/components/ui/HorizontalScroll";
import { ViewAllButton } from "@/components/ui/ViewAllButton";
import { ProductCard } from "./ProductCard";
import {
  PHOTOGRAPHY_PRODUCTS,
  ILLUSTRATION_PRODUCTS,
  type Product,
} from "@/data/products";
import { cn } from "@/lib/utils";

type TabKey = "photography" | "illustration";

interface TabConfig {
  key: TabKey;
  label: string;
  products: Product[];
  href: string;
}

/**
 * Tab 类别切换区：摄影 / 插画。
 * - Tab 按钮激活态：墨黑 + 1.5px 下划线
 * - 非激活态：灰岩色，hover 变墨黑
 * - 面板切换淡入动画（translateY 16px → 0，500ms）
 * - 每个 Tab 下渲染 HorizontalScroll + ProductCard 列表
 * - 底部「查看全部」实心按钮
 */
export function TabSection() {
  const t = useTranslations("tabs");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<TabKey>("photography");

  const tabs: TabConfig[] = [
    {
      key: "photography",
      label: t("photography"),
      products: PHOTOGRAPHY_PRODUCTS,
      href: `/${locale}/works?category=photography`,
    },
    {
      key: "illustration",
      label: t("illustration"),
      products: ILLUSTRATION_PRODUCTS,
      href: `/${locale}/works?category=illustration`,
    },
  ];

  const active = tabs.find((tab) => tab.key === activeTab)!;

  return (
    <section className="pt-16 pb-12 md:pt-20 md:pb-16">
      {/* Tab 头部 */}
      <div className="mx-auto max-w-[1200px] px-4 md:px-7 lg:px-10">
        <div
          role="tablist"
          className="flex items-center justify-center gap-[26px] pb-5 sm:gap-[58px]"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "group relative pb-3.5 text-[16px] font-normal uppercase tracking-[0.14em] transition-colors duration-300 ease-mart sm:text-[25px] sm:tracking-[0.24em]",
                  isActive ? "text-ink" : "text-gray-500 hover:text-ink"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "absolute bottom-0 left-0 h-[1.5px] w-full bg-ink transition-opacity duration-300 ease-mart",
                    isActive ? "opacity-100" : "opacity-25 group-hover:opacity-60"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto h-px w-[80vw] bg-line" />

      {/* Tab 面板（key 变更触发淡入动画） */}
      <div key={activeTab} role="tabpanel" className="animate-tab-fade-in pt-10">
        <HorizontalScroll>
          {active.products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </HorizontalScroll>

        {/* 查看全部 */}
        <div className="mx-auto flex max-w-[1200px] justify-center px-4 pt-12 md:px-7 lg:px-10">
          <ViewAllButton href={active.href}>{t("viewAll")}</ViewAllButton>
        </div>
      </div>
    </section>
  );
}

export default TabSection;
