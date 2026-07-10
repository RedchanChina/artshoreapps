"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import type { Artist } from "@/data/artists";
import { ArtistGridCard } from "@/components/artists/ArtistGridCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BackButton } from "@/components/ui/BackButton";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { cn } from "@/lib/utils";

type ArtistSort = "name" | "workCount";

interface Props {
  artists: Artist[];
  initialSort: ArtistSort;
  locale: string;
}

export function ArtistsBrowseClient({ artists, initialSort, locale }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [sort, setSort] = useState<ArtistSort>(initialSort);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // name 排序需 locale 上下文，由客户端负责；workCount 排序由服务端完成
  const loc = locale as "zh" | "en";
  const sorted =
    sort === "name"
      ? [...artists].sort((a, b) => a.name[loc].localeCompare(b.name[loc], loc))
      : artists;

  const handleSortChange = (next: ArtistSort) => {
    setSort(next);
    setOpen(false);
    router.push(`/${locale}/artists?sort=${next}`, { scroll: false });
  };

  const options: { value: ArtistSort; label: string }[] = [
    { value: "workCount", label: t("artistList.sortBy.workCount") },
    { value: "name", label: t("artistList.sortBy.name") },
  ];
  const current = options.find((o) => o.value === sort) ?? options[0];

  return (
    <main className="pt-[120px] pb-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-7 md:px-10">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), href: "/" },
            { label: t("breadcrumb.artists") },
          ]}
        />
        <BackButton fallbackHref={`/${locale}`} />

        <div className="mb-12 flex items-center justify-between">
          <h1 className="font-display text-[28px] font-light text-ink sm:text-[36px]">
            {t("artistList.title")}
          </h1>
          <div ref={wrapRef} className="relative inline-flex">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-[13px] font-medium tracking-[0.14em] text-gray-700 transition-colors duration-200 ease-mart hover:text-ink"
            >
              <span className="whitespace-nowrap">{current.label}</span>
              <ChevronDown
                size={12}
                strokeWidth={1.2}
                className={cn(
                  "text-gray-500 transition-transform duration-200 ease-mart",
                  open && "rotate-180"
                )}
              />
            </button>
            {open && (
              <ul
                role="listbox"
                className="absolute right-0 top-full z-50 mt-2 min-w-[160px] border border-line bg-paper py-1 shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
              >
                {options.map((opt) => {
                  const isActive = opt.value === sort;
                  return (
                    <li key={opt.value} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSortChange(opt.value)}
                        className={cn(
                          "flex w-full items-center whitespace-nowrap px-3 py-1.5 text-left text-[13px] font-medium tracking-[0.14em] transition-colors duration-200 ease-mart",
                          isActive
                            ? "bg-gray-100 text-ink"
                            : "text-gray-700 hover:bg-gray-100 hover:text-ink"
                        )}
                      >
                        {opt.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <RevealOnScroll>
          {sorted.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <p className="text-[14px] text-gray-500">
                {t("filters.noResult")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
              {sorted.map((artist) => (
                <ArtistGridCard key={artist.slug} artist={artist} />
              ))}
            </div>
          )}
        </RevealOnScroll>
      </div>
    </main>
  );
}
