"use client";

/**
 * 作品详情手风琴（work-detail 6.7）。
 *
 * 区块：作品描述（默认展开）/ 创作年份 / 印刷工艺 / 纸张类型 /
 * 艺术家寄语（可选，为空则不渲染）。
 *
 * - 桌面端（sm+）：所有区块默认展开，垂直堆叠
 * - 移动端：手风琴折叠，点击标题切换，ChevronDown 旋转 180°
 *
 * Client Component（需折叠状态）。
 */
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import type { Work } from "@/data/types";
import { cn } from "@/lib/utils";

interface WorkDetailsAccordionProps {
  work: Work;
  locale: "zh" | "en";
}

interface Section {
  key: string;
  titleKey: string;
  content: string;
}

export function WorkDetailsAccordion({ work, locale }: WorkDetailsAccordionProps) {
  const t = useTranslations("workDetail.workDetails");
  const [openKey, setOpenKey] = useState<string | null>("description");

  const sections: Section[] = [
    { key: "description", titleKey: "description", content: work.description[locale] },
    { key: "year", titleKey: "year", content: String(work.creationYear) },
    { key: "printCraft", titleKey: "printCraft", content: work.printTechnology[locale] },
    { key: "paperType", titleKey: "paperType", content: work.paperType[locale] },
  ];
  if (work.artistNote) {
    sections.push({
      key: "artistNote",
      titleKey: "artistNote",
      content: work.artistNote[locale],
    });
  }

  return (
    <section className="mt-12">
      <h2 className="mb-4 font-display text-[18px] font-light text-ink">
        {t("title")}
      </h2>
      <div className="divide-y divide-line">
        {sections.map((section) => {
          const isOpen = openKey === section.key;
          return (
            <div key={section.key}>
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : section.key)}
                className={cn(
                  "flex w-full items-center justify-between border-l-2 py-3 pl-4 pr-1 transition-colors duration-200 ease-mart",
                  isOpen ? "border-ink" : "border-line",
                  "sm:border-ink"
                )}
                aria-expanded={isOpen}
              >
                <span className="text-[14px] font-medium text-ink">
                  {t(section.titleKey)}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={cn(
                    "shrink-0 text-ink transition-transform duration-200 ease-mart sm:hidden",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "pl-4 pb-4 pt-1 text-[14px] leading-relaxed text-gray-700",
                  !isOpen && "hidden sm:block"
                )}
              >
                {section.content}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WorkDetailsAccordion;
