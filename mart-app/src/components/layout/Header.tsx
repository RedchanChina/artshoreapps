"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { CurrencySwitch } from "./CurrencySwitch";
import { MobileDrawer } from "./MobileDrawer";
import { CartBadge } from "./CartBadge";
import { cn } from "@/lib/utils";

/**
 * 顶部导航栏：透明 / 固定双态切换。
 * - scrollY ≤ 20px：透明态（文字白色、Logo 反白）
 * - scrollY > 20px：固定态（纸白背景、文字墨黑、Logo 黑色、底边线）
 */
export function Header() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth.header");
  const locale = useLocale();
  const pathname = usePathname();
  const { status } = useSession();
  const isHomepage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const variant = !isHomepage || scrolled ? "dark" : "light";

  const navLinks = [
    { href: `/${locale}/works`, label: t("works") },
    { href: `/${locale}/artists`, label: t("artists") },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-8 z-[200] h-[52px] border-b border-transparent transition-[background-color,color,border-color,box-shadow] duration-[350ms] ease-mart sm:h-16",
        (!isHomepage || scrolled)
          ? "border-line bg-paper text-ink shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "bg-transparent text-paper"
      )}
    >
      <div className="container grid h-full grid-cols-[auto_1fr_auto] items-center gap-4 sm:gap-8">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          aria-label="M·art"
          className="ml-[10px] justify-self-start"
        >
          <Logo variant={variant} className="h-[24px] sm:h-[30px]" />
        </Link>

        {/* 桌面端导航链接 */}
        <nav
          aria-label={t("works")}
          className="hidden justify-self-center sm:flex sm:gap-10"
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-1.5 text-[13px] font-medium uppercase tracking-[0.14em]"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-mart group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* 功能图标 + 切换器 */}
        <div className="-mr-1.5 flex items-center justify-self-end gap-4 sm:-mr-[15px] sm:gap-[22px]">
          <Link
            href={`/${locale}/search`}
            aria-label={t("search")}
            className="inline-flex h-8 w-8 items-center justify-center"
          >
            <Search size={18} strokeWidth={1.4} />
          </Link>

          {status === "loading" && (
            <div className="inline-flex h-8 w-8 items-center justify-center">
              <User size={18} strokeWidth={1.4} className="opacity-40" />
            </div>
          )}

          {status === "unauthenticated" && (
            <Link
              href={`/${locale}/auth/login`}
              aria-label={tAuth("login")}
              className="inline-flex h-8 items-center justify-center px-1 text-[13px] font-medium uppercase tracking-[0.14em]"
            >
              {tAuth("login")}
            </Link>
          )}

          {status === "authenticated" && (
            <Link
              href={`/${locale}/account`}
              aria-label={t("account")}
              className="inline-flex h-8 w-8 items-center justify-center"
            >
              <User size={18} strokeWidth={1.4} />
            </Link>
          )}

          <Link
            href={`/${locale}/cart`}
            aria-label={t("cart")}
            className="relative inline-flex h-8 w-8 items-center justify-center"
          >
            <ShoppingBag size={18} strokeWidth={1.4} />
            <CartBadge />
          </Link>

          <div className="hidden sm:inline-flex">
            <LanguageSwitch variant={variant} />
          </div>

          <div className="hidden sm:inline-flex">
            <CurrencySwitch variant={variant} />
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-8 w-8 items-center justify-center sm:hidden"
          >
            <Menu size={20} strokeWidth={1.4} />
          </button>
        </div>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}

export default Header;
