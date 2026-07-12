"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { signIn } from "./auth";
import type { AuthResult } from "./types";
import { generateCode, storeCode, verifyCode } from "./verification";
import { PASSWORD_RE } from "./constants";
import { uploadAvatar, DEFAULT_AVATAR } from "@/lib/storage/supabase";

// 自动生成昵称（locale === "en" 时使用英文）
function generateNickname(locale: string): string {
  // 8 位随机数字
  const random = String(Math.floor(Math.random() * 100000000)).padStart(8, "0");
  return locale === "en" ? `MartUser_${random}` : `莫阿特用户_${random}`;
}

// 注册（保留旧接口，单步注册）
export async function register(
  email: string,
  password: string
): Promise<AuthResult> {
  // 1. 检查邮箱是否已注册
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "EMAIL_EXISTS" };
  }

  // 2. bcrypt 哈希密码
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. 创建用户
  await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  // 4. 自动登录（用 Credentials signIn）
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch {
    return { success: false, error: "CREATE_FAILED" };
  }
}

// 发送验证码（Step 1）
export async function sendVerificationCode(
  email: string
): Promise<{ success: boolean; error?: string; code?: string }> {
  // 1. 检查邮箱是否已注册
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "EMAIL_EXISTS" };
  }

  // 2. 生成验证码并存入内存 Map（5 分钟过期）
  const code = generateCode();
  storeCode(email, code);

  // 3. 开发阶段：控制台输出验证码
  console.log(`[验证码] ${email}: ${code}`);

  // 4. 开发阶段：返回验证码给客户端，便于测试
  return { success: true, code };
}

// 找回密码 - 发送验证码（校验邮箱已注册）
export async function requestPasswordResetCode(
  email: string
): Promise<{ success: boolean; error?: string; code?: string }> {
  // 1. 检查邮箱是否已注册
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    return { success: false, error: "EMAIL_NOT_FOUND" };
  }

  // 2. 生成验证码并存入内存 Map（5 分钟过期）
  const code = generateCode();
  storeCode(email, code);

  // 3. 开发阶段：控制台输出验证码
  console.log(`[找回密码验证码] ${email}: ${code}`);

  // 4. 开发阶段：返回验证码给客户端，便于测试
  return { success: true, code };
}

// 找回密码 - 重置密码（校验验证码 + 密码强度 + 更新密码）
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. 校验验证码
    if (!verifyCode(email, code)) {
      return { success: false, error: "CODE_INVALID" };
    }

    // 2. 密码强度校验（至少 8 位含字母和数字）
    if (!PASSWORD_RE.test(newPassword)) {
      return { success: false, error: "PASSWORD_WEAK" };
    }

    // 3. bcrypt 哈希新密码
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 4. 更新用户密码
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    return { success: true };
  } catch {
    return { success: false, error: "CREATE_FAILED" };
  }
}

// 完成注册（Step 3）：校验验证码 + 创建用户 + 上传头像 + 自动登录
export async function registerWithProfile(
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") || "");
  const code = String(formData.get("code") || "");
  const password = String(formData.get("password") || "");
  const nickname = String(formData.get("nickname") || "").trim();
  const locale = String(formData.get("locale") || "zh");
  const avatarFile = formData.get("avatar") as File | null;

  // 1. 校验验证码
  if (!verifyCode(email, code)) {
    return { success: false, error: "CODE_INVALID" };
  }

  // 2. 密码强度校验（至少 8 位含字母和数字）
  if (!PASSWORD_RE.test(password)) {
    return { success: false, error: "PASSWORD_WEAK" };
  }

  // 3. 检查邮箱是否已注册（防御性，验证码发送后可能被注册）
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "EMAIL_EXISTS" };
  }

  // 4. bcrypt 哈希密码
  const passwordHash = await bcrypt.hash(password, 10);

  // 5. 昵称（未提供则自动生成）
  const name = nickname || generateNickname(locale);

  // 6. 创建用户（先用默认头像，若上传了头像则随后更新）
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      image: DEFAULT_AVATAR,
    },
  });

  // 7. 如果有头像文件，上传并更新 user.image
  if (avatarFile && avatarFile.size > 0) {
    try {
      const avatarUrl = await uploadAvatar(user.id, avatarFile);
      await prisma.user.update({
        where: { id: user.id },
        data: { image: avatarUrl },
      });
    } catch {
      // 头像上传失败不阻塞注册流程，保留默认头像
    }
  }

  // 8. 自动登录
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch {
    return { success: false, error: "CREATE_FAILED" };
  }
}

export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch {
    return { success: false, error: "INVALID" };
  }
}
