"use server";

import { getCartId } from "@/lib/cart/cookie";
import { createOrder as createOrderRepo } from "./repository";
import type { CreateOrderInput, CreateOrderResult } from "./types";

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  try {
    const cartId = await getCartId();
    const orderNumber = await createOrderRepo(cartId, input);
    return { success: true, orderNumber };
  } catch (e) {
    const message = e instanceof Error ? e.message : "UNKNOWN_ERROR";
    if (message === "VERSION_UNAVAILABLE") {
      return { success: false, error: "VERSION_UNAVAILABLE" };
    }
    if (message === "EMPTY_CART") {
      return { success: false, error: "EMPTY_CART" };
    }
    return { success: false, error: "UNKNOWN_ERROR" };
  }
}
