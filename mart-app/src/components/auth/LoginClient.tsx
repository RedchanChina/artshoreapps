"use client";

/**
 * 登录页客户端组件（auth 5.2）。
 *
 * 表单含邮箱 + 密码 + 登录按钮 + 微信登录按钮 + 「没有账户？注册」链接。
 * 失焦校验邮箱格式与密码非空；提交调用 login Server Action，成功后跳转 callbackUrl。
 * 微信登录为占位，点击显示 toast「微信登录即将上线」。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { siWechat } from "simple-icons";
import { login } from "@/lib/auth/actions";
import { EMAIL_RE } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

interface LoginClientProps {
  callbackUrl: string;
}

function WechatIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={`#${siWechat.hex}`}
      aria-label={siWechat.title}
      className="flex-shrink-0"
    >
      <path d={siWechat.path} />
    </svg>
  );
}

export function LoginClient({ callbackUrl }: LoginClientProps) {
  const t = useTranslations("auth.login");
  const locale = useLocale() as "zh" | "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // toast 3 秒后自动清除
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const validateEmail = (value: string) => EMAIL_RE.test(value);

  const handleEmailBlur = () => {
    if (!email) {
      setEmailError(t("errorEmailEmpty"));
      return;
    }
    if (!validateEmail(email)) {
      setEmailError(t("errorEmailFormat"));
      return;
    }
    setEmailError(null);
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError(t("errorPasswordEmpty"));
      return;
    }
    setPasswordError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 提交前重新校验
    if (!validateEmail(email)) {
      setEmailError(t("errorEmailFormat"));
      return;
    }
    if (!password) {
      setPasswordError(t("errorPasswordEmpty"));
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      // 整页跳转，确保 useSession 立即读取新 cookie
      window.location.replace(callbackUrl);
      return;
    } else {
      setFormError(
        result.error === "INVALID" ? t("errorInvalid") : t("errorSignIn")
      );
    }
  };

  const handleWechat = () => {
    setToast(t("wechatComingSoon"));
  };

  const registerHref = `/${locale}/auth/register${
    callbackUrl && callbackUrl !== "/"
      ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : ""
  }`;

  return (
    <div className="mx-auto max-w-[400px] px-4 pb-16 pt-40 md:pt-48">
      {/* 标题 */}
      <h1 className="mb-8 font-display text-[22px] font-light text-ink">
        {t("title")}
      </h1>

      {/* 表单错误 */}
      {formError && (
        <p className="mb-4 text-[12px] text-danger">{formError}</p>
      )}

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {/* 邮箱 */}
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-[12px] uppercase tracking-[0.14em] text-gray-500"
          >
            {t("email")}
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            onBlur={handleEmailBlur}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            className={cn(
              "w-full border px-4 py-3 text-[14px] text-ink outline-none transition-colors duration-200 ease-mart placeholder:text-gray-400 focus:border-ink",
              emailError ? "border-danger" : "border-line"
            )}
          />
          {emailError && (
            <p className="mt-1.5 text-[12px] text-danger">{emailError}</p>
          )}
        </div>

        {/* 密码 */}
        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-[12px] uppercase tracking-[0.14em] text-gray-500"
          >
            {t("password")}
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            onBlur={handlePasswordBlur}
            placeholder={t("passwordPlaceholder")}
            autoComplete="current-password"
            className={cn(
              "w-full border px-4 py-3 text-[14px] text-ink outline-none transition-colors duration-200 ease-mart placeholder:text-gray-400 focus:border-ink",
              passwordError ? "border-danger" : "border-line"
            )}
          />
          {passwordError && (
            <p className="mt-1.5 text-[12px] text-danger">{passwordError}</p>
          )}
        </div>

        {/* 忘记密码 */}
        <div className="-mt-2 text-right">
          <Link
            href={`/${locale}/auth/forgot-password`}
            className="text-[12px] text-ink underline-offset-4 transition-colors duration-200 ease-mart hover:text-brand hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {/* 登录按钮 */}
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "w-full bg-ink py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90",
            submitting && "cursor-not-allowed opacity-60"
          )}
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </form>

      {/* 分隔线 */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[12px] text-gray-400">{t("or")}</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* 微信登录按钮 */}
      <button
        type="button"
        onClick={handleWechat}
        className="flex w-full items-center justify-center gap-2 border border-line bg-paper py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-mart hover:bg-gray-50"
      >
        <WechatIcon size={18} />
        {t("wechat")}
      </button>

      {/* 没有账户？注册 */}
      <p className="mt-8 text-center text-[13px] text-gray-500">
        {t("noAccount")}{" "}
        <Link
          href={registerHref}
          className="text-ink underline-offset-4 transition-colors duration-200 ease-mart hover:text-brand hover:underline"
        >
          {t("register")}
        </Link>
      </p>

      {/* toast */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 bg-ink px-6 py-3 text-sm text-paper transition-opacity duration-300 ease-mart",
          toast ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        role="status"
        aria-live="polite"
      >
        {toast ?? ""}
      </div>
    </div>
  );
}

export default LoginClient;
