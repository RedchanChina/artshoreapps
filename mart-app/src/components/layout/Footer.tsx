import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  label: string;
  href: string;
}

export default function Footer() {
  const t = useTranslations("footer");
  const tSocial = useTranslations("social");
  const locale = useLocale();

  const socialLinks: SocialLink[] = [
    { label: tSocial("wechat"), href: "#" },
    { label: tSocial("xiaohongshu"), href: "#" },
    { label: tSocial("instagram"), href: "#" },
  ];

  const exploreLinks: FooterLink[] = [
    { label: t("explore.allWorks"), href: `/${locale}/works` },
    { label: t("explore.signedArtists"), href: `/${locale}/artists` },
  ];

  const accountLinks: FooterLink[] = [
    { label: t("account.myAccount"), href: `/${locale}/account` },
    { label: t("account.orderQuery"), href: `/${locale}/account/orders` },
    { label: t("account.myFavorites"), href: `/${locale}/account/wishlist` },
  ];

  const helpLinks: FooterLink[] = [
    { label: t("help.faq"), href: `/${locale}/faq` },
    { label: t("help.shipping"), href: `/${locale}/shipping` },
    { label: t("help.returns"), href: `/${locale}/returns` },
    { label: t("help.offlineStore"), href: `/${locale}/store` },
  ];

  const renderLinkList = (links: FooterLink[]) => (
    <ul>
      {links.map((link) => (
        <li key={link.href} className="mb-[5px] sm:mb-3">
          <Link
            href={link.href}
            className="text-[12px] text-gray-500 transition-colors duration-300 hover:text-ink sm:text-[14px]"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="bg-paper">
      <div className="mx-auto h-px w-[80vw] bg-line" />
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-10 sm:py-16">
        {/* 主网格：移动端品牌跨全宽 + 3 列链接，桌面端 4 列 */}
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-[1.5fr_1fr_1fr_1fr] sm:gap-12">
          {/* 品牌列 */}
          <div className="col-span-3 sm:col-span-1">
            <p className="mb-[22px] max-w-[280px] whitespace-pre-line text-[14px] font-light leading-[1.7] text-gray-500 tracking-[-0.01em]">
              {t("brandTagline")}
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="border-b border-gray-300 pb-[3px] text-[10px] font-medium uppercase tracking-[0.2em] text-gray-700 transition-colors duration-200 ease-mart hover:border-brand hover:text-brand"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* 探索列 */}
          <div>
            <h4 className="mb-[22px] text-[11px] font-medium uppercase tracking-[0.24em] text-ink">
              {t("explore.title")}
            </h4>
            {renderLinkList(exploreLinks)}
          </div>

          {/* 账户列 */}
          <div>
            <h4 className="mb-[22px] text-[11px] font-medium uppercase tracking-[0.24em] text-ink">
              {t("account.title")}
            </h4>
            {renderLinkList(accountLinks)}
          </div>

          {/* 帮助列 */}
          <div>
            <h4 className="mb-[22px] text-[11px] font-medium uppercase tracking-[0.24em] text-ink">
              {t("help.title")}
            </h4>
            {renderLinkList(helpLinks)}
          </div>
        </div>

        {/* 底部版权区 */}
        <div className="flex flex-col items-center gap-2 pt-6 mt-8 sm:flex-row sm:justify-between sm:gap-4">
          <div className="text-[11px] text-gray-500">{t("copyright")}</div>
          <div className="text-[11px] text-gray-500">{t("icp")}</div>
        </div>
      </div>
      <div className="mx-auto h-px w-[80vw] bg-line" />
    </footer>
  );
}
