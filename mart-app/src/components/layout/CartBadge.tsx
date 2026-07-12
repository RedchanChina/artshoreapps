"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCartCount } from "@/lib/cart/actions";
import { useCartUI } from "@/store/useCartUI";

/**
 * 购物车角标（客户端组件）。
 *
 * 多触发源实时同步：
 * - useCartUI.version 变化（加购/移除/结算）
 * - usePathname 变化（跨页客户端导航）
 * - visibilitychange 事件（切回标签页/恢复窗口）
 * - 首次 mount 自动读取
 */
export function CartBadge() {
  const [count, setCount] = useState(0);
  const version = useCartUI((s) => s.version);
  const pathname = usePathname();

  // version + pathname 变化时刷新
  useEffect(() => {
    getCartCount().then(setCount);
  }, [version, pathname]);

  // 页面从隐藏切回可见时刷新（覆盖多标签页、切回页面场景）
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        getCartCount().then(setCount);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute right-[-2px] top-0 inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-brand px-[3px] text-[9px] font-medium leading-[14px] text-white">
      {count}
    </span>
  );
}
