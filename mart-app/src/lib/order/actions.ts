"use server";

import { getCartId } from "@/lib/cart/cookie";
import { auth } from "@/lib/auth/auth";
import { getAddresses } from "@/lib/account/repository";
import { saveAddress } from "@/lib/account/actions";
import { createOrder as createOrderRepo } from "./repository";
import type { CreateOrderInput, CreateOrderResult } from "./types";

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  try {
    const cartId = await getCartId();
    // 获取登录用户 userId（游客为 undefined）
    const session = await auth();
    const userId = session?.user?.id;
    const orderNumber = await createOrderRepo(cartId, { ...input, userId });

    // 登录用户且勾选保存到地址簿时，保存收货地址（失败不影响订单）
    if (input.saveAddressToBook && userId) {
      try {
        // 查重：fullName + phone + address + city 相同则跳过
        const existingAddresses = await getAddresses(userId);
        const isDuplicate = existingAddresses.some(
          (addr) =>
            addr.fullName === input.shippingAddress.fullName &&
            addr.phone === input.shippingAddress.phone &&
            addr.address === input.shippingAddress.address &&
            addr.city === input.shippingAddress.city,
        );

        if (!isDuplicate) {
          const formData = new FormData();
          formData.append("fullName", input.shippingAddress.fullName);
          formData.append("phone", input.shippingAddress.phone);
          formData.append("email", input.shippingAddress.email ?? "");
          formData.append("countryCode", input.shippingAddress.countryCode);
          formData.append("state", input.shippingAddress.state);
          formData.append("city", input.shippingAddress.city);
          formData.append("address", input.shippingAddress.address);
          formData.append("zipCode", input.shippingAddress.zipCode ?? "");
          await saveAddress(formData);
        }
      } catch (e) {
        // 地址保存失败不影响订单创建
        console.error("保存地址到地址簿失败:", e);
      }
    }

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
