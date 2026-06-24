"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { CurrencySwitch } from "./CurrencySwitch";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 移动端抽屉：从右侧滑入的全屏深色抽屉。
 * 开关状态由 Header 通过 props 传入。打开时锁定页面滚动，ESC 可关闭。
 */
export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const t = useTranslations("nav");
  const locale = useLocale();

  // ESC 关闭 + 锁定滚动
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const navItems = [
    { href: `/${locale}/works`, label: t("works") },
    { href: `/${locale}/artists`, label: t("artists") },
    { href: `/${locale}/cart`, label: t("cart") },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label="Menu"
      className={cn(
        "fixed inset-0 z-[400] flex flex-col bg-ink p-7 pb-10 transition-transform duration-[400ms] ease-mart",
        open ? "translate-x-0" : "pointer-events-none translate-x-full"
      )}
    >
      <div className="mb-12 flex items-center justify-between">
        <Link href={`/${locale}`} aria-label="M·art" onClick={onClose}>
          <Logo variant="light" className="h-[28px]" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-8 w-8 items-center justify-center text-paper"
        >
          <X size={24} strokeWidth={1.4} />
        </button>
      </div>

      <nav className="flex flex-col">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="border-b border-white/[0.12] py-3.5 font-display text-[22px] font-light tracking-[-0.01em] text-paper"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 flex items-center gap-2 border-t border-white/[0.15] pt-6">
        <LanguageSwitch variant="drawer" />
      </div>

      <div className="mt-5">
        <CurrencySwitch variant="drawer" />
      </div>
    </div>
  );
}

export default MobileDrawer;
