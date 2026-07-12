"use server";

/**
 * 账户中心 Server Actions（Phase 2 Task 7/8/9）。
 *
 * 所有 Action 通过 auth() 校验登录态，未登录返回失败；
 * 数据库操作均按 session.user.id 隔离，避免越权。
 */
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/lib/auth/auth";
import { uploadAvatar } from "@/lib/storage/supabase";
import { prisma } from "@/lib/db/prisma";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getOrders,
  getOrderDetail,
  getWishlist,
  isWishlisted,
  toggleWishlist,
  removeWishlistItem,
  getUserPasswordHash,
  updateUserName,
  updateUserAvatar,
  updateUserPassword,
  deleteUser,
  shipOrder as shipOrderRepo,
  confirmDelivery as confirmDeliveryRepo,
  requestRefund as requestRefundRepo,
} from "./repository";
import type {
  AddressData,
  OrderListItem,
  OrderDetailData,
  WishlistItem,
} from "./repository";

export type { AddressData, OrderListItem, OrderDetailData, WishlistItem };

// ==================== Orders ====================

/** 获取当前登录用户的订单列表（未登录返回空数组） */
export async function fetchOrders(): Promise<OrderListItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getOrders(session.user.id);
}

/** 获取订单详情（含商品项，按 userId 隔离） */
export async function fetchOrderDetail(
  orderNumber: string,
): Promise<OrderDetailData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getOrderDetail(orderNumber, session.user.id);
}

// ==================== Addresses ====================

/** 获取当前登录用户的全部地址（未登录返回空数组） */
export async function fetchAddresses(): Promise<AddressData[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getAddresses(session.user.id);
}

/**
 * 新增或更新地址（依据 formData.id 是否存在判断）。
 * 字段：fullName / phone / email（可空）/ countryCode / state / city / address / zipCode。
 */
export async function saveAddress(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };

  const id = formData.get("id") as string | null;
  const data = {
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || null,
    countryCode: formData.get("countryCode") as string,
    state: formData.get("state") as string,
    city: formData.get("city") as string,
    address: formData.get("address") as string,
    zipCode: formData.get("zipCode") as string,
  };

  if (id) {
    await updateAddress(id, session.user.id, data);
  } else {
    await createAddress(session.user.id, data);
  }
  return { success: true };
}

/** 删除地址 */
export async function removeAddress(
  id: string,
): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  await deleteAddress(id, session.user.id);
  return { success: true };
}

/** 设为默认地址 */
export async function setDefault(
  id: string,
): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  await setDefaultAddress(id, session.user.id);
  return { success: true };
}

// ==================== Profile ====================

/**
 * 更新个人资料（昵称 + 头像）。
 * 错误码：NICKNAME_EMPTY
 */
export async function updateProfile(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };

  const nickname = (formData.get("nickname") as string)?.trim();
  if (!nickname) return { success: false, error: "NICKNAME_EMPTY" };

  const avatarFile = formData.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const avatarUrl = await uploadAvatar(session.user.id, avatarFile);
    await updateUserAvatar(session.user.id, avatarUrl);
  }

  await updateUserName(session.user.id, nickname);
  return { success: true };
}

/**
 * 修改密码。
 * 校验：当前密码正确 / 新密码强度（≥8 位且含字母+数字）/ 两次一致 / 新旧不同。
 * 错误码：PASSWORD_WRONG / PASSWORD_WEAK / PASSWORD_MISMATCH / PASSWORD_SAME
 */
export async function changePassword(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const passwordHash = await getUserPasswordHash(session.user.id);
  if (!passwordHash) return { success: false, error: "PASSWORD_WRONG" };

  const isValid = await bcrypt.compare(currentPassword, passwordHash);
  if (!isValid) return { success: false, error: "PASSWORD_WRONG" };

  if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return { success: false, error: "PASSWORD_WEAK" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "PASSWORD_MISMATCH" };
  }

  if (newPassword === currentPassword) {
    return { success: false, error: "PASSWORD_SAME" };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(session.user.id, newHash);
  return { success: true };
}

// ==================== Wishlist ====================

/** 获取当前登录用户的收藏列表（未登录返回空数组） */
export async function fetchWishlist(): Promise<WishlistItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getWishlist(session.user.id);
}

/** 检查当前登录用户是否已收藏某作品（未登录返回 false） */
export async function checkWishlisted(
  workSlug: string,
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  return isWishlisted(workSlug, session.user.id);
}

/** 切换当前登录用户对某作品的收藏状态（未登录返回失败） */
export async function toggleWishlistAction(
  workSlug: string,
): Promise<{ success: boolean; wishlisted: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, wishlisted: false };
  const wishlisted = await toggleWishlist(workSlug, session.user.id);
  return { success: true, wishlisted };
}

/** 移除当前登录用户的某条收藏（未登录返回失败） */
export async function removeWishlistAction(
  id: string,
): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  await removeWishlistItem(id, session.user.id);
  return { success: true };
}

/** 注销账户（要求邮箱确认，删除后 signOut） */
export async function deleteAccount(
  confirmEmail: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };

  // 获取用户当前邮箱
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (!user) return { success: false, error: "UNAUTHORIZED" };

  // 邮箱确认校验
  if (confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { success: false, error: "EMAIL_MISMATCH" };
  }

  // 删除用户（级联删除订单/地址/收藏）
  await deleteUser(session.user.id);

  // signOut
  await signOut({ redirect: false });

  return { success: true };
}

// ==================== Order Management ====================

/** 管理端发货：更新订单为已发货状态 */
export async function shipOrder(
  orderNumber: string,
  logisticsCompany: string,
  trackingNumber: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };

    return await shipOrderRepo(orderNumber, session.user.id, logisticsCompany, trackingNumber);
  } catch (e) {
    console.error("发货失败:", e);
    return { success: false, error: "UNKNOWN" };
  }
}

/** 用户确认收货：shipped → delivered */
export async function confirmDelivery(
  orderNumber: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };

    return await confirmDeliveryRepo(orderNumber, session.user.id);
  } catch (e) {
    console.error("确认收货失败:", e);
    return { success: false, error: "UNKNOWN" };
  }
}

/** 用户申请退款：paid → refunded + 版号释放 */
export async function requestRefund(
  orderNumber: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };

    return await requestRefundRepo(orderNumber, session.user.id, reason);
  } catch (e) {
    console.error("申请退款失败:", e);
    return { success: false, error: "UNKNOWN" };
  }
}
