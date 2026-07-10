"use client";

/**
 * 作品图集查看器（work-detail 6.5）。
 *
 * - 主图区固定 1:1 正方形比例，shimmer 骨架 + 5s 超时兜底
 * - 桌面端缩略图列表（64×64），移动端小圆点指示器（6×6）
 * - 点击主图打开全屏 modal（点击 / ESC 关闭）
 * - 使用原生 <img>，loading="lazy"（首张 eager）
 *
 * Client Component（需切换/弹层状态）。
 */
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface GalleryViewerProps {
  images: string[];
  mainImage: string;
  alt: string;
}

export function GalleryViewer({
  images,
  mainImage,
  alt,
}: GalleryViewerProps) {
  const t = useTranslations("workDetail");
  const gallery = images.length > 0 ? images : [mainImage];
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const handleMobileScroll = () => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.max(0, Math.min(idx, gallery.length - 1)));
  };

  // 切换主图时重置加载状态 + 5s 超时兜底
  useEffect(() => {
    setLoaded(false);
    const timer = setTimeout(() => setLoaded(true), 5000);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  // ESC 关闭弹层
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const activeSrc = gallery[activeIndex] ?? mainImage;
  const numberedAlt = t("galleryAlt", {
    n: activeIndex + 1,
    total: gallery.length,
  });
  const mainAlt = alt || numberedAlt;

  return (
    <div>
      {/* 移动端主图区 - 横向滑动 */}
      <div
        ref={mobileScrollRef}
        className={cn(
          "flex snap-x snap-mandatory overflow-x-auto sm:hidden",
          "[&::-webkit-scrollbar]:hidden",
          "aspect-square"
        )}
        onScroll={handleMobileScroll}
        style={{ scrollbarWidth: "none" }}
      >
        {gallery.map((src, i) => (
          <div
            key={src + i}
            className="relative w-full flex-shrink-0 snap-start snap-always"
          >
            <img
              src={src}
              alt={`${alt} ${i + 1}/${gallery.length}`}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* 桌面端主图区 - 点击放大 */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={cn(
          "relative hidden w-full cursor-zoom-in overflow-hidden bg-mist sm:block",
          "aspect-square"
        )}
        aria-label={numberedAlt}
      >
        {!loaded && (
          <div
            aria-hidden="true"
            className="animate-shimmer pointer-events-none absolute inset-0 z-[1]"
          />
        )}
        <img
          src={activeSrc}
          alt={mainAlt}
          loading={activeIndex === 0 ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={cn(
            "relative z-[2] h-full w-full object-cover transition-opacity duration-500 ease-mart",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      </button>

      {/* 缩略图（桌面） */}
      <div className="mt-3 hidden gap-2 sm:flex">
        {gallery.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative h-16 w-16 overflow-hidden border transition-opacity duration-200 ease-mart",
              i === activeIndex
                ? "border-ink"
                : "border-line opacity-60 hover:opacity-100"
            )}
            aria-label={t("galleryAlt", { n: i + 1, total: gallery.length })}
            aria-current={i === activeIndex ? "true" : undefined}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* 圆点指示器（移动） */}
      <div className="mt-3 flex justify-center gap-2 sm:hidden">
        {gallery.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => {
              const el = mobileScrollRef.current;
              if (el) {
                el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
              }
              setActiveIndex(i);
            }}
            aria-label={t("galleryAlt", { n: i + 1, total: gallery.length })}
            aria-current={i === activeIndex ? "true" : undefined}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors duration-200 ease-mart",
              i === activeIndex ? "bg-ink" : "bg-mist"
            )}
          />
        ))}
      </div>

      {/* 全屏弹层 */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/95"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={numberedAlt}
        >
          <img
            src={activeSrc}
            alt={numberedAlt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default GalleryViewer;
