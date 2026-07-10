/**
 * 版号追踪器（work-detail 6.3）。
 *
 * 进度条 + 三段文字：线上已售 / 剩余 / 全球限量。
 * 当线上剩余 < 30% 时进入紧迫态：文字与进度条变 text-danger / bg-danger，
 * 并以 "仅剩 N 版" 替代 "剩余 N 版"。
 *
 * Client Component（由 WorkDetailClient 渲染）。
 */
import { useTranslations } from "next-intl";
import type { EditionTier } from "@/data/types";

interface EditionTrackerProps {
  tier: EditionTier;
}

export function EditionTracker({ tier }: EditionTrackerProps) {
  const t = useTranslations("workDetail.editionTracker");
  const { onlineSoldCount, onlineEditions, totalEditions } = tier;

  const remaining = Math.max(0, onlineEditions - onlineSoldCount);
  const progress =
    onlineEditions > 0
      ? Math.min(100, (onlineSoldCount / onlineEditions) * 100)
      : 0;
  const urgent = onlineEditions > 0 && remaining / onlineEditions < 0.3;

  const textColor = urgent ? "text-danger" : "text-gray-500";
  const fillColor = urgent ? "bg-danger" : "bg-ink";

  return (
    <div>
      <div
        className="relative h-px w-full overflow-hidden bg-mist"
        role="progressbar"
        aria-label={t("onlineSold", { sold: onlineSoldCount, total: onlineEditions })}
        aria-valuenow={onlineSoldCount}
        aria-valuemin={0}
        aria-valuemax={onlineEditions}
      >
        <div
          className={`absolute left-0 top-0 h-full ${fillColor} transition-[width] duration-[600ms] ease-mart`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={`mt-3 flex flex-wrap gap-4 text-[12px] ${textColor}`}>
        <span>
          {t("onlineSold", { sold: onlineSoldCount, total: onlineEditions })}
        </span>
        <span>
          {urgent
            ? t("onlyLeft", { count: remaining })
            : t("remaining", { count: remaining })}
        </span>
        <span>{t("globalLimited", { total: totalEditions })}</span>
      </div>
    </div>
  );
}

export default EditionTracker;
