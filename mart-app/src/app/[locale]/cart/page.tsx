/**
 * 购物车页（Phase 2 Task 4.1）。
 *
 * Server Component：调用 getCart() 获取购物车数据后交给 CartClient 渲染。
 * 过期项的懒删除由 getCart() 内部（checkAndReleaseExpired）处理。
 */
import { getCart } from "@/lib/cart/actions";
import { CartClient } from "@/components/cart/CartClient";

export default async function CartPage() {
  const items = await getCart();
  return <CartClient initialItems={items} />;
}
