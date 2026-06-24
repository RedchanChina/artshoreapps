"use client";

import { useCallback, useEffect, useState } from "react";
import { HERO_SLIDES } from "@/data/hero";
import HeroSlide from "./HeroSlide";
import HeroContent from "./HeroContent";
import HeroControls from "./HeroControls";
import ScrollHint from "./ScrollHint";

const AUTOPLAY_MS = 6000;

/**
 * Hero 全屏轮播：100vh，石灰背景，overflow hidden。
 * - 自动播放 6s/张，鼠标悬停暂停，移开恢复
 * - 渲染所有 slides，仅激活当前帧（用于过渡动画）
 * - 切换 slide 时重置计时器（依赖 current 自然重置）
 */
export default function HeroCarousel() {
  const total = HERO_SLIDES.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
    },
    [total]
  );

  // 自动播放：暂停时不计时；current 变化时重置计时器
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      setCurrent((c) => (c + 1) % total);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [current, paused, total]);

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-stone"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="精选推荐"
    >
      {/* 所有 slides 始终挂载，仅激活当前帧 */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, i) => (
          <HeroSlide
            key={slide.id}
            slide={slide}
            active={i === current}
            priority={i === 0}
          />
        ))}
      </div>

      {/* 当前帧文案：以 slide.id 为 key，切换时重新触发入场动画 */}
      <HeroContent key={HERO_SLIDES[current].id} slide={HERO_SLIDES[current]} />

      <HeroControls current={current} total={total} onSelect={goTo} />

      <ScrollHint />
    </section>
  );
}
