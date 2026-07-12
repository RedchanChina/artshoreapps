"use client";

/**
 * 注册页客户端组件（3 步流程：账户信息 → 验证码 → 个人资料 → 完成）。
 *
 * Step 1: 输入邮箱 + 密码 + 确认密码 → 「发送验证码」（60s 倒计时）→ 自动进入 Step 2
 * Step 2: 输入 6 位验证码 → 「下一步」→ 进入 Step 3（「返回」可改邮箱）
 * Step 3: 头像（可选）+ 昵称（可选）→ 「完成注册」/「跳过」
 * 完成后调用 registerWithProfile Server Action，成功后整页跳转 callbackUrl。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { sendVerificationCode, registerWithProfile } from "@/lib/auth/actions";
import { EMAIL_RE, PASSWORD_RE, DEFAULT_AVATAR } from "@/lib/auth/constants";
import { cn, compressImage } from "@/lib/utils";

const LABEL_BASE =
  "mb-1.5 block text-[12px] uppercase tracking-[0.14em] text-gray-500";
const INPUT_BASE =
  "w-full border px-4 py-3 text-[14px] text-ink outline-none transition-colors duration-200 ease-mart placeholder:text-gray-400 focus:border-ink";

interface RegisterClientProps {
  callbackUrl: string;
}

type Step = 1 | 2 | 3;

export function RegisterClient({ callbackUrl }: RegisterClientProps) {
  const t = useTranslations("auth.register");
  const locale = useLocale() as "zh" | "en";

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

  // 头像预览 URL 清理
  useEffect(() => {
    if (!avatarPreview) return;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const validateEmail = (value: string) => EMAIL_RE.test(value);

  // Step 1 → 发送验证码（先校验邮箱格式 + 密码强度 + 确认密码一致）
  const handleSendCode = async () => {
    setFormError(null);
    // 1. 邮箱格式校验
    if (!validateEmail(email)) {
      setEmailError(t("errorEmailFormat"));
      return;
    }
    setEmailError(null);
    // 2. 密码强度校验（至少 8 位含字母和数字）
    if (!PASSWORD_RE.test(password)) {
      setFormError(t("errorPasswordWeak"));
      return;
    }
    // 3. 确认密码一致
    if (password !== confirmPassword) {
      setFormError(t("errorPasswordMismatch"));
      return;
    }

    setSendingCode(true);
    const result = await sendVerificationCode(email);
    setSendingCode(false);

    if (result.success) {
      setCountdown(60);
      setToast(t("codeShown", { code: result.code ?? "" }));
      setStep(2);
    } else if (result.error === "EMAIL_EXISTS") {
      setFormError(t("emailExists"));
    }
  };

  // Step 2 → 下一步（客户端校验验证码非空且 6 位）
  const handleNext = () => {
    setFormError(null);
    if (code.trim().length !== 6) {
      setFormError(t("errorCodeInvalid"));
      return;
    }
    setStep(3);
  };

  // Step 3 → 头像选择
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    // 超过 2MB 自动压缩
    const compressed = await compressImage(file);
    setAvatarFile(compressed);
    setAvatarPreview(URL.createObjectURL(compressed));
  };

  // 服务端错误 → 文案 key
  const mapError = (error?: string): string => {
    switch (error) {
      case "CODE_INVALID":
        return t("errorCodeInvalid");
      case "EMAIL_EXISTS":
        return t("emailExists");
      case "PASSWORD_WEAK":
        return t("errorPasswordWeak");
      default:
        return t("errorCreateFailed");
    }
  };

  // 提交注册（includeOptional=false 表示跳过昵称/头像，用默认值）
  // 密码已在 Step 1 客户端校验过，此处直接提交（服务端仍会做防御性校验）
  const submitRegistration = async (includeOptional: boolean) => {
    setFormError(null);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("code", code);
    formData.set("password", password);
    formData.set("locale", locale);
    formData.set("nickname", includeOptional ? nickname : "");
    if (includeOptional && avatarFile) {
      formData.set("avatar", avatarFile);
    }

    setSubmitting(true);
    const result = await registerWithProfile(formData);
    setSubmitting(false);

    if (result.success) {
      // 整页跳转，确保 useSession 立即读取新 cookie
      window.location.replace(callbackUrl);
      return;
    }
    setFormError(mapError(result.error));
    // 验证码失效则回到 Step 2
    if (result.error === "CODE_INVALID") setStep(2);
  };

  const loginHref = `/${locale}/auth/login?callbackUrl=${encodeURIComponent(
    callbackUrl,
  )}`;

  const steps: { num: Step; title: string }[] = [
    { num: 1, title: t("step1Title") },
    { num: 2, title: t("step2Title") },
    { num: 3, title: t("step3Title") },
  ];

  return (
    <main className="mx-auto max-w-[400px] px-4 pt-40 pb-16 md:pt-48">
      {/* 标题 */}
      <h1 className="mb-8 font-display text-[22px] font-light text-ink">
        {t("title")}
      </h1>

      {/* 步骤指示器 */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                  step >= s.num
                    ? "bg-ink text-paper"
                    : "border border-line bg-paper text-gray-400",
                )}
              >
                {s.num}
              </span>
              <span
                className={cn(
                  "text-[12px]",
                  step === s.num ? "text-ink" : "text-gray-400",
                )}
              >
                {s.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-6",
                  step > s.num ? "bg-ink" : "bg-line",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* 表单错误 */}
      {formError && (
        <p className="mb-4 text-[12px] text-danger">{formError}</p>
      )}

      {/* Step 1: 邮箱 + 密码 + 确认密码 → 发送验证码 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="reg-email" className={LABEL_BASE}>
              {t("email")}
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              onBlur={() => {
                // 邮箱失焦时检查格式
                if (email && !validateEmail(email)) {
                  setEmailError(t("errorEmailFormat"));
                }
              }}
              placeholder={t("emailPlaceholder")}
              disabled={sendingCode}
              className={cn(
                INPUT_BASE,
                emailError ? "border-danger" : "border-line",
              )}
            />
            {emailError && (
              <p className="mt-1.5 text-[12px] text-danger">{emailError}</p>
            )}
          </div>

          {/* 密码 */}
          <div>
            <label htmlFor="reg-password" className={LABEL_BASE}>
              {t("password")}
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              disabled={sendingCode}
              className={cn(INPUT_BASE, "border-line")}
            />
          </div>

          {/* 确认密码 */}
          <div>
            <label htmlFor="reg-confirm" className={LABEL_BASE}>
              {t("confirmPassword")}
            </label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPlaceholder")}
              disabled={sendingCode}
              className={cn(INPUT_BASE, "border-line")}
            />
          </div>

          <button
            type="button"
            onClick={handleSendCode}
            disabled={sendingCode || countdown > 0}
            className={cn(
              "w-full bg-ink py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90",
              (sendingCode || countdown > 0) &&
                "cursor-not-allowed opacity-60",
            )}
          >
            {countdown > 0
              ? t("resendCode", { seconds: countdown })
              : sendingCode
                ? t("submitting")
                : t("sendCode")}
          </button>

          {/* 邮箱已注册 → 登录链接 */}
          <p className="text-center text-[13px] text-gray-500">
            {t("haveAccount")}{" "}
            <Link
              href={loginHref}
              className="text-ink underline-offset-4 transition-colors duration-200 ease-mart hover:text-brand hover:underline"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: 验证码 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="reg-code" className={LABEL_BASE}>
              {t("code")}
            </label>
            <input
              id="reg-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                if (formError) setFormError(null);
              }}
              placeholder={t("codePlaceholder")}
              className={cn(
                INPUT_BASE,
                "text-center tracking-[0.5em]",
                formError ? "border-danger" : "border-line",
              )}
            />
          </div>

          {/* 邮箱 + 重新发送 */}
          <div className="flex items-center justify-between text-[12px] text-gray-500">
            <span className="truncate">{email}</span>
            <button
              type="button"
              onClick={handleSendCode}
              disabled={countdown > 0 || sendingCode}
              className={cn(
                "shrink-0 underline-offset-4 transition-colors duration-200 ease-mart hover:text-ink hover:underline",
                (countdown > 0 || sendingCode) &&
                  "cursor-not-allowed opacity-60",
              )}
            >
              {countdown > 0
                ? t("resendCode", { seconds: countdown })
                : t("sendCode")}
            </button>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full bg-ink py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90"
          >
            {t("nextStep")}
          </button>

          {/* 返回修改邮箱 */}
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setStep(1);
            }}
            className="w-full border border-line bg-paper py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-mart hover:bg-gray-50"
          >
            {t("step1Title")}
          </button>
        </div>
      )}

      {/* Step 3: 头像 + 昵称（密码已在 Step 1 收集） */}
      {step === 3 && (
        <div className="space-y-4">
          {/* 头像上传（圆形 120x120，点击选择文件，预览图片） */}
          <div className="flex flex-col items-center">
            <label htmlFor="reg-avatar" className="cursor-pointer">
              <div className="h-[120px] w-[120px] overflow-hidden rounded-full border border-line bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarPreview ?? DEFAULT_AVATAR}
                  alt={t("avatar")}
                  className="h-full w-full object-cover"
                />
              </div>
            </label>
            <input
              id="reg-avatar"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="mt-2 text-[12px] text-gray-500">{t("avatarHint")}</p>
          </div>

          {/* 昵称（可选） */}
          <div>
            <label htmlFor="reg-nickname" className={LABEL_BASE}>
              {t("nickname")}
            </label>
            <input
              id="reg-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t("nicknamePlaceholder")}
              disabled={submitting}
              className={cn(INPUT_BASE, "border-line")}
            />
          </div>

          {/* 完成注册 */}
          <button
            type="button"
            onClick={() => submitRegistration(true)}
            disabled={submitting}
            className={cn(
              "w-full bg-ink py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90",
              submitting && "cursor-not-allowed opacity-60",
            )}
          >
            {submitting ? t("submitting") : t("complete")}
          </button>

          {/* 跳过（跳过昵称头像，用默认值） */}
          <button
            type="button"
            onClick={() => submitRegistration(false)}
            disabled={submitting}
            className="w-full border border-line bg-paper py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-mart hover:bg-gray-50"
          >
            {t("skip")}
          </button>
        </div>
      )}

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

export default RegisterClient;
