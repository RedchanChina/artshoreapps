import { cookies } from "next/headers";

const CART_COOKIE = "mart-cart-id";
const MAX_AGE = 30 * 24 * 60 * 60; // 30 天

/** 只读 cartId，无 cookie 时返回 null（供 Server Component） */
export async function readCartId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}

/** 读写 cartId，无 cookie 时生成并设置（仅供 Server Action / Route Handler） */
export async function getCartId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const newId = crypto.randomUUID();
  cookieStore.set(CART_COOKIE, newId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return newId;
}
