"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "latest" | "price-asc" | "price-desc" | "scarcity";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options?: Array<{ value: SortOption; label: string }>;
  className?: string;
}

const DEFAULT_OPTION_VALUES: SortOption[] = [
  "latest",
  "price-asc",
  "price-desc",
  "scarcity",
];

/** SortOption 值（kebab-case）到 i18n key（camelCase）的映射 */
const SORT_I18N_KEY: Record<SortOption, string> = {
  latest: "latest",
  "price-asc": "priceAsc",
  "price-desc": "priceDesc",
  scarcity: "scarcity",
};

/**
 * 排序下拉：列表页排序切换。
 * - 参照 CurrencySwitch 下拉模式：点击触发器切换、外部点击 / ESC 关闭
 * - 面板绝对定位 right-0，避免溢出
 * - 未传 options 时使用 sort 命名空间默认文案
 */
export function SortDropdown({
  value,
  onChange,
  options,
  className,
}: SortDropdownProps) {
  const t = useTranslations("sort");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const resolvedOptions =
    options ??
    DEFAULT_OPTION_VALUES.map((v) => ({ value: v, label: t(SORT_I18N_KEY[v]) }));

  // 点击外部 / ESC 关闭
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

  const current =
    resolvedOptions.find((o) => o.value === value) ?? resolvedOptions[0];

  return (
    <div ref={wrapRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-[13px] font-medium tracking-[0.14em] text-gray-700 transition-colors duration-200 ease-mart hover:text-ink"
      >
        <span className="whitespace-nowrap">{current?.label}</span>
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
          {resolvedOptions.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
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
  );
}

export default SortDropdown;
