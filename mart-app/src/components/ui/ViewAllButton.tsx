import Link from "next/link";
import { cn } from "@/lib/utils";

interface ViewAllButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 实心「查看全部」按钮。
 * - 墨黑背景、纸白文字
 * - 11px / letter-spacing 0.24em / uppercase / padding 14px 32px
 * - hover 背景过渡至石灰（stone），300ms
 */
export function ViewAllButton({
  href,
  children,
  className,
}: ViewAllButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center bg-ink px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white transition-colors duration-300 ease-mart hover:bg-stone",
        className
      )}
    >
      {children}
    </Link>
  );
}

export default ViewAllButton;
