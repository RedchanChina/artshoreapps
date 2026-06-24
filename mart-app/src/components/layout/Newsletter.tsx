"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "./Logo";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Newsletter() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) return;
    setSubscribed(true);
  };

  return (
    <section
      aria-label={t("title")}
      className="bg-ink px-6 py-12 sm:px-10 sm:py-[72px]"
    >
      <div className="mx-auto max-w-[680px] text-center">
        {/* Logo 反白版 */}
        <div className="mb-6 flex justify-center">
          <Logo variant="light" className="h-[32px]" />
        </div>

        {/* 标题 */}
        <h2 className="mb-4 font-display font-normal text-[clamp(24px,3vw,38px)] leading-[1.25] tracking-[-0.02em] text-paper">
          {t("title")}
        </h2>

        {/* 描述 */}
        <p className="mx-auto mb-9 max-w-[480px] text-[14px] leading-[1.75] text-[rgba(250,250,247,0.62)]">
          {t("description")}
        </p>

        {/* 订阅表单 */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-[440px] items-center border-b border-[rgba(250,250,247,0.2)] transition-colors duration-300 focus-within:border-brand"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="flex-1 border-none bg-transparent px-0 py-[14px] text-[14px] text-paper outline-none placeholder:text-[rgba(250,250,247,0.4)]"
          />
          <button
            type="submit"
            disabled={subscribed}
            className="px-6 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-paper transition-colors duration-300 enabled:hover:text-brand disabled:cursor-default"
          >
            {subscribed ? t("subscribed") : t("subscribe")}
          </button>
        </form>
      </div>
    </section>
  );
}
