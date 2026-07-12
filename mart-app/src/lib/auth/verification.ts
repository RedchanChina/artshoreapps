// 验证码存储：key=email, value={code, expiresAt}
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export function generateCode(): string {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

export function storeCode(email: string, code: string): void {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 分钟
  verificationCodes.set(email, { code, expiresAt });
}

export function verifyCode(email: string, code: string): boolean {
  const stored = verificationCodes.get(email);
  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return false;
  }
  if (stored.code !== code) return false;
  // 校验通过后删除
  verificationCodes.delete(email);
  return true;
}
