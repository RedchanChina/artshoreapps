"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSettings } from "@/store/useSettings";
import { cn } from "@/lib/utils";

export type CurrencySwitchVariant = "light" | "dark" | "drawer";

interface CurrencySwitchProps {
  /** light：透明态导航栏；dark：固定态导航栏；drawer：移动端抽屉 */
  variant?: CurrencySwitchVariant;
  className?: string;
}

type CurrencyCode = "CNY" | "USD";

const OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "CNY", label: "¥ CNY" },
  { code: "USD", label: "$ USD" },
];

/**
 * 币种切换：自定义下拉，仅 CNY / USD。
 * 连接 useSettings store 的 currency。
 */
export function CurrencySwitch({
  variant = "dark",
  className,
}: CurrencySwitchProps) {
  const currency = useSettings((s) => s.currency);
  const setCurrency = useSettings((s) => s.setCurrency);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  // 同步 currency 到 cookie，供 Server Component 读取
  useEffect(() => {
    document.cookie = `mart-currency=${currency}; path=/; max-age=31536000; samesite=lax`;
  }, [currency]);

  // 手动 rehydrate（skipHydration: true 阻止自动读取 localStorage，需在客户端手动触发）
  useEffect(() => {
    useSettings.persist.rehydrate();
  }, []);

  const isDrawer = variant === "drawer";
  const triggerColor =
    variant === "dark" ? "text-ink" : "text-paper";
  const chevronColor =
    variant === "dark" ? "text-gray-500" : "text-paper/70";

  const current = OPTIONS.find((o) => o.code === currency) ?? OPTIONS[0];

  return (
    <div
      ref={wrapRef}
      role="group"
      aria-label="Currency"
      className={cn("relative inline-flex", className)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1 font-medium transition-colors duration-200 ease-mart",
          isDrawer
            ? "text-sm tracking-[0.06em]"
            : "text-[11px] tracking-[0.14em]",
          triggerColor
        )}
      >
        <span className="tabular-nums">{current.label}</span>
        <ChevronDown
          size={12}
          strokeWidth={1.2}
          className={cn(
            "transition-transform duration-200 ease-mart",
            open && "rotate-180",
            chevronColor
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 min-w-[96px] border border-line bg-paper py-1 shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
        >
          {OPTIONS.map((opt) => {
            const isActive = opt.code === currency;
            return (
              <li key={opt.code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setCurrency(opt.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-1.5 text-left text-[11px] font-medium tracking-[0.14em] transition-colors duration-200 ease-mart",
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

export default CurrencySwitch;
