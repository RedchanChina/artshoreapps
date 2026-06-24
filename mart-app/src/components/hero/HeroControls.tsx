"use client";

import { cn } from "@/lib/utils";

interface HeroControlsProps {
  current: number;
  total: number;
  onSelect: (index: number) => void;
}

/**
 * Hero 控件：圆点指示器 + 帧计数器。
 * - 圆点为 28×1px 横线，激活态白色，非激活半透明
 * - 点击圆点切换 slide（父组件负责重置自动播放）
 * - 计数器 01/04 格式，tabular-nums
 * - 桌面端定位右下，移动端居中底部
 */
export default function HeroControls({
  current,
  total,
  onSelect,
}: HeroControlsProps) {
  return (
    <div className="absolute bottom-[88px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-3.5 lg:bottom-[110px] lg:left-auto lg:right-12 lg:translate-x-0 lg:gap-5">
      <div className="flex items-center gap-3">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`第 ${i + 1} 帧`}
            aria-current={i === current}
            className={cn(
              "h-px w-5 transition-colors duration-[400ms] ease-mart lg:w-7",
              i === current ? "bg-paper" : "bg-[rgba(250,250,247,0.35)]"
            )}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[rgba(250,250,247,0.75)] tabular-nums">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}
