"use client";

/**
 * 购物车客户端容器（Phase 2 Task 4.2）。
 *
 * 接收 Server Component 传入的 initialItems，管理本地 items state 与 currency，
 * 渲染 CartList + CartSummary 或 EmptyCart。移除商品时乐观更新 state 并调用
 * removeItem Server Action（释放版号 + 删除 Redis 项）。
 *
 * Client Component（需 useSettings + useTranslations + useLocale）。
 */
import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { removeItem } from "@/lib/cart/actions";
import type { CartItem } from "@/lib/cart/types";
import { useSettings } from "@/store/useSettings";
import { useCartUI } from "@/store/useCartUI";
import { CartList } from "./CartList";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";

interface CartClientProps {
  initialItems: CartItem[];
}

export function CartClient({ initialItems }: CartClientProps) {
  const t = useTranslations("cart");
  const locale = useLocale() as "zh" | "en";
  const currency = useSettings((s) => s.currency);
  const bumpCart = useCartUI((s) => s.bump);
  const [items, setItems] = useState<CartItem[]>(initialItems);

  /** 乐观移除：先从 state 删除，再调用 Server Action 释放版号。 */
  const handleRemove = useCallback(async (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.itemId !== itemId));
    await removeItem(itemId);
    bumpCart();
  }, [bumpCart]);

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 pb-16 pt-20 md:px-7 lg:px-10">
      <h1 className="mb-8 font-display text-[22px] font-light tracking-[-0.01em] text-ink">
        {t("title")}
      </h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
        <CartList
          items={items}
          currency={currency}
          locale={locale}
          onRemove={handleRemove}
        />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CartSummary items={items} currency={currency} locale={locale} />
        </div>
      </div>
    </div>
  );
}

export default CartClient;
