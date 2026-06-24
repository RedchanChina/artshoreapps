"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** 入场延迟（ms），用于同组元素错峰入场 */
  delay?: number;
}

/**
 * 通用滚动入场动画组件。
 * - 使用 IntersectionObserver 监听元素进入视口，触发阈值 10%
 * - 入场动画：淡入 + 上移 20px，800ms
 * - 尊重 prefers-reduced-motion：检测后直接显示，无动画
 * - 初始状态 opacity-0 translate-y-5，进入视口后 opacity-100 translate-y-0
 */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // 尊重 prefers-reduced-motion：直接显示，不观察
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-[800ms] ease-mart",
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

export default RevealOnScroll;
