/**
 * 信任信息条（work-detail 6.6）。
 *
 * 三项信任要素横向排列（桌面）/ 纵向堆叠（移动）：
 * 物理纸质证书 / 跨境配送 / 制作周期。
 *
 * Client Component（由 WorkDetailClient 渲染）。
 */
import { useTranslations } from "next-intl";
import { ShieldCheck, Truck, Clock } from "lucide-react";

interface TrustInfoProps {
  /** 制作周期（来自选中 tier），用于展示生产时长 */
  productionDays: number;
}

type IconType = typeof ShieldCheck;

export function TrustInfo({ productionDays }: TrustInfoProps) {
  const t = useTranslations("workDetail.trustInfo");

  const items: { icon: IconType; label: string }[] = [
    { icon: ShieldCheck, label: t("certificate") },
    { icon: Truck, label: t("crossBorder") },
    { icon: Clock, label: t("productionTime", { n: productionDays }) },
  ];

  return (
    <ul className="flex flex-col gap-3 sm:flex-row sm:gap-6">
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2 text-[12px] text-gray-500">
          <Icon size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

export default TrustInfo;
