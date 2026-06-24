"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  /** 轨道间距（px），默认 24 */
  gap?: number;
  /** 单次箭头点击滚动距离（px），默认 400 */
  scrollAmount?: number;
}

/**
 * 通用横向滑动区。
 * - 左右圆形箭头按钮（桌面 40×40 / 移动 32×32），到达边界时隐藏
 * - 右侧渐变遮罩（48px，hover 64px），到达右边界时消失
 * - 支持鼠标拖拽与触摸滑动
 */
export function HorizontalScroll({
  children,
  className,
  gap = 24,
  scrollAmount = 400,
}: HorizontalScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [hovered, setHovered] = useState(false);
  const drag = useRef({ down: false, startX: 0, scrollLeft: 0, moved: false });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({
      left: dir * scrollAmount,
      behavior: "smooth",
    });
  };

  const onDown = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    drag.current = {
      down: true,
      startX: clientX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const onMove = (clientX: number) => {
    const el = trackRef.current;
    const ds = drag.current;
    if (!el || !ds.down) return;
    const x = clientX - el.offsetLeft;
    const walk = (x - ds.startX) * 1.2;
    if (Math.abs(walk) > 4) ds.moved = true;
    el.scrollLeft = ds.scrollLeft - walk;
  };

  const onUp = () => {
    drag.current.down = false;
  };

  // 拖拽后释放若发生过位移，拦截子元素的点击事件（避免误触发 Link 跳转）
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div
      className={cn("group/scroll relative overflow-hidden", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={trackRef}
        onClickCapture={onClickCapture}
        className="flex cursor-grab touch-pan-x touch-pan-y overflow-x-auto px-4 pb-6 pt-2 active:cursor-grabbing md:px-7 lg:px-10 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/[0.08] group-hover/scroll:[&::-webkit-scrollbar-thumb]:bg-black/20"
        style={{ gap: `${gap}px`, scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.08) transparent" }}
        onMouseDown={(e) => onDown(e.pageX)}
        onMouseMove={(e) => onMove(e.pageX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
      >
        {children}
      </div>

      {/* 左箭头 */}
      <button
        type="button"
        aria-label="向左滚动"
        onClick={() => scrollBy(-1)}
        className={cn(
          "absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] transition-all duration-300 ease-mart hover:bg-paper hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:left-3 sm:h-10 sm:w-10",
          !canLeft && "pointer-events-none opacity-0"
        )}
      >
        <ChevronLeft size={20} strokeWidth={1.5} className="text-ink" />
      </button>

      {/* 右箭头 */}
      <button
        type="button"
        aria-label="向右滚动"
        onClick={() => scrollBy(1)}
        className={cn(
          "absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] transition-all duration-300 ease-mart hover:bg-paper hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:right-3 sm:h-10 sm:w-10",
          !canRight && "pointer-events-none opacity-0"
        )}
      >
        <ChevronRight size={20} strokeWidth={1.5} className="text-ink" />
      </button>

      {/* 右侧渐变遮罩 */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-0 right-0 top-0 z-[2] transition-all duration-300 ease-mart",
          !canRight && "opacity-0"
        )}
        style={{
          width: hovered ? 64 : 48,
          background: hovered
            ? "linear-gradient(90deg, transparent, rgba(250,250,247,0.98))"
            : "linear-gradient(90deg, transparent, rgba(250,250,247,0.9))",
        }}
      />
    </div>
  );
}

export default HorizontalScroll;
