"use client";

import { useEffect, useState } from "react";
import type { HeroSlide as HeroSlideType } from "@/data/hero";
import { cn } from "@/lib/utils";

interface HeroSlideProps {
  slide: HeroSlideType;
  active: boolean;
  priority?: boolean;
}

/**
 * Hero 单帧：绝对定位背景图 + 暗色渐变遮罩。
 * - 激活时链式播放：模糊淡入（1.2s）→ Ken Burns 缓慢放大（8s）
 * - 5s 超时保护，防止图片加载失败导致长时间空白
 * - 使用原生 img 标签，避免 next/image 配置复杂性
 */
export default function HeroSlide({
  slide,
  active,
  priority = false,
}: HeroSlideProps) {
  const [loaded, setLoaded] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  // 超时保护：5s 后强制显示，防止图片加载失败导致空白
  useEffect(() => {
    const timer = setTimeout(() => setForceShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const shown = loaded || forceShow;

  // active 时链式播放：先模糊淡入（1.2s），再 Ken Burns 缓慢放大（8s）
  // keyframes 定义在 globals.css，由 animation-fill-mode forwards 衔接
  const animation = active && shown
    ? "heroBlurIn 1.2s ease-out forwards, heroKenBurns 8s ease-out 1.2s forwards"
    : undefined;

  return (
    <div
      className={cn(
        "absolute inset-0 bg-stone transition-opacity duration-[1400ms] ease-mart",
        active ? "z-10 opacity-100" : "z-0 opacity-0"
      )}
      aria-hidden={!active}
    >
      <img
        src={slide.image}
        alt=""
        width={1920}
        height={1080}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        style={{
          opacity: shown ? 1 : 0,
          animation,
        }}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* 暗色渐变遮罩：从底部到顶部 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}
