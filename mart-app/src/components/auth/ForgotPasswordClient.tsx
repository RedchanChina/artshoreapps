"use client";

/**
 * 找回密码页客户端组件（Phase 4.3）。
 *
 * 表单含邮箱 + 发送验证码按钮（60s 倒计时）+ 验证码 + 新密码 + 确认密码 + 重置按钮。
 * 点击「发送验证码」调用 requestPasswordResetCode，成功后 toast 显示验证码并开始倒计时。
 * 点击「重置密码」前端先校验密码强度与一致，通过后调用 resetPassword，成功后 toast 提示并跳转登录页。
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { requestPasswordResetCode, resetPassword } from "@/lib/auth/actions";
import { EMAIL_RE, PASSWORD_RE } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

const LABEL_BASE =
  "mb-1.5 block text-[12px] uppercase tracking-[0.14em] text-gray-500";
const INPUT_BASE =
  "w-full border px-4 py-3 text-[14px] text-ink outline-none transition-colors duration-200 ease-mart placeholder:text-gray-400 focus:border-ink";

export function ForgotPasswordClient() {
  const t = useTranslations("auth.forgotPassword");
  const locale = useLocale() as "zh" | "en";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 60s 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // toast 3 秒后自动清除
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const validateEmail = (value: string) => EMAIL_RE.test(value);

  // 发送验证码
  const handleSendCode = async () => {
    setFormError(null);
    // 邮箱格式校验
    if (!email) {
      setEmailError(t("emailNotFound"));
      return;
    }
    if (!validateEmail(email)) {
      setEmailError(t("emailNotFound"));
      return;
    }
    setEmailError(null);

    setSendingCode(true);
    const result = await requestPasswordResetCode(email);
    setSendingCode(false);

    if (result.success) {
      setCountdown(60);
      setToast(t("codeSent", { code: result.code ?? "" }));
    } else if (result.error === "EMAIL_NOT_FOUND") {
      setFormError(t("emailNotFound"));
    }
  };

  // 服务端错误 → 文案 key
  const mapError = (error?: string): string => {
    switch (error) {
      case "CODE_INVALID":
        return t("errorCodeInvalid");
      case "PASSWORD_WEAK":
        return t("errorPasswordWeak");
      default:
        return t("errorCodeInvalid");
    }
  };

  // 重置密码
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. 密码强度校验
    if (!PASSWORD_RE.test(newPassword)) {
      setFormError(t("errorPasswordWeak"));
      return;
    }
    // 2. 两次密码一致
    if (newPassword !== confirmPassword) {
      setFormError(t("errorPasswordMismatch"));
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(email, code, newPassword);
    setSubmitting(false);

    if (result.success) {
      setToast(t("passwordReset"));
      setTimeout(() => {
        router.push(`/${locale}/auth/login`);
      }, 1500);
      return;
    }
    setFormError(mapError(result.error));
  };

  return (
    <main className="mx-auto max-w-[400px] px-4 pt-40 pb-16 md:pt-48">
      {/* 标题 */}
      <h1 className="mb-8 font-display text-[22px] font-light text-ink">
        {t("title")}
      </h1>

      {/* 表单错误 */}
      {formError && (
        <p className="mb-4 text-[12px] text-danger">{formError}</p>
      )}

      <form onSubmit={handleReset} className="space-y-4" noValidate>
        {/* 邮箱 */}
        <div>
          <label htmlFor="forgot-email" className={LABEL_BASE}>
            {t("email")}
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            placeholder={t("email")}
            disabled={sendingCode || submitting}
            className={cn(
              INPUT_BASE,
              emailError ? "border-danger" : "border-line",
            )}
          />
          {emailError && (
            <p className="mt-1.5 text-[12px] text-danger">{emailError}</p>
          )}
        </div>

        {/* 发送验证码按钮（带 60s 倒计时） */}
        <button
          type="button"
          onClick={handleSendCode}
          disabled={sendingCode || countdown > 0 || submitting}
          className={cn(
            "w-full bg-ink py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90",
            (sendingCode || countdown > 0 || submitting) &&
              "cursor-not-allowed opacity-60",
          )}
        >
          {countdown > 0
            ? t("resendCode", { seconds: countdown })
            : t("sendCode")}
        </button>

        {/* 验证码 */}
        <div>
          <label htmlFor="forgot-code" className={LABEL_BASE}>
            {t("code")}
          </label>
          <input
            id="forgot-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              if (formError) setFormError(null);
            }}
            placeholder={t("code")}
            disabled={submitting}
            className={cn(
              INPUT_BASE,
              "text-center tracking-[0.5em]",
              "border-line",
            )}
          />
        </div>

        {/* 新密码 */}
        <div>
          <label htmlFor="forgot-new-password" className={LABEL_BASE}>
            {t("newPassword")}
          </label>
          <input
            id="forgot-new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("newPassword")}
            disabled={submitting}
            className={cn(INPUT_BASE, "border-line")}
          />
        </div>

        {/* 确认新密码 */}
        <div>
          <label htmlFor="forgot-confirm-password" className={LABEL_BASE}>
            {t("confirmPassword")}
          </label>
          <input
            id="forgot-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("confirmPassword")}
            disabled={submitting}
            className={cn(INPUT_BASE, "border-line")}
          />
        </div>

        {/* 重置按钮 */}
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "w-full bg-ink py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90",
            submitting && "cursor-not-allowed opacity-60",
          )}
        >
          {t("reset")}
        </button>
      </form>

      {/* toast */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 bg-ink px-6 py-3 text-sm text-paper transition-opacity duration-300 ease-mart",
          toast ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        role="status"
        aria-live="polite"
      >
        {toast ?? ""}
      </div>
    </main>
  );
}

export default ForgotPasswordClient;
