"use client";

import { useTranslations } from "next-intl";

/**
 * 顶部公告条：32px 高，深色背景，跑马灯从右向左无限循环（32s/轮）。
 * 内容复制两份拼接，translateX(0 → -50%) 实现无缝循环。
 * 每条公告以 64px 右外边距均匀间隔，保证拼接处间距一致。
 */
export function AnnouncementBar() {
  const t = useTranslations("announcement");
  const items = t.raw("items") as string[];

  const renderItem = (text: string, key: string) => (
    <span
      key={key}
      className="mr-16 inline-flex items-center gap-2.5 text-[11px] font-normal uppercase tracking-[0.14em] text-paper/[0.82]"
    >
      <span
        aria-hidden="true"
        className="block h-[3px] w-[3px] rounded-full bg-paper/50"
      />
      {text}
    </span>
  );

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="fixed inset-x-0 top-0 z-[300] flex h-8 items-center overflow-hidden bg-ink"
    >
      <div className="animate-marquee flex w-max whitespace-nowrap">
        {items.map((text, i) => renderItem(text, `a-${i}`))}
        {items.map((text, i) => renderItem(text, `b-${i}`))}
      </div>
    </div>
  );
}

export default AnnouncementBar;
