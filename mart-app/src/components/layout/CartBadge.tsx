"use client";

import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart/actions";
import { useCartUI } from "@/store/useCartUI";

/**
 * 购物车角标（客户端组件）。
 *
 * SSG 时显示 0（或隐藏），客户端 hydrate 后从 Redis 读取真实数量。
 * 监听 useCartUI.version 变化：加购/移除成功后 bump() 触发角标刷新。
 */
export function CartBadge() {
  const [count, setCount] = useState(0);
  const version = useCartUI((s) => s.version);

  useEffect(() => {
    getCartCount().then(setCount);
  }, [version]);

  if (count === 0) return null;

  return (
    <span className="absolute right-[-2px] top-0 inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-brand px-[3px] text-[9px] font-medium leading-[14px] text-white">
      {count}
    </span>
  );
}
