"use client";

/**
 * 收货信息表单（Phase 2 Task 4.3）。
 *
 * 字段：姓名 / 电话 / 邮箱 / 国家（下拉）/ 省/州（下拉）/ 城市（级联下拉）/ 详细地址 / 邮编。
 * 国家下拉联动 onChange 通知父组件重新计算运费。
 * 省/州 与 城市 下拉数据来自 src/data/regions.ts（覆盖 13 个支持配送的国家）。
 * 字段失焦后展示错误样式。
 *
 * Client Component（需 useTranslations）。
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import type { CountryOption, ShippingAddress } from "@/lib/checkout/types";
import { getStatesByCountry, hasRegionDivisions } from "@/data/regions";
import { cn } from "@/lib/utils";

interface ShippingFormProps {
  address: ShippingAddress;
  countries: CountryOption[];
  onChange: (patch: Partial<ShippingAddress>) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d(][\d\s()-]{5,}$/;

/** 校验整张表单是否可提交（供父组件判断按钮是否禁用）。 */
export function validateShippingAddress(address: ShippingAddress): boolean {
  return (
    address.fullName.trim().length > 0 &&
    address.phone.trim().length > 0 &&
    PHONE_RE.test(address.phone) &&
    EMAIL_RE.test(address.email) &&
    address.countryCode.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.address.trim().length > 0 &&
    address.zipCode.trim().length > 0
  );
}

function fieldErrors(
  address: ShippingAddress,
): Record<keyof ShippingAddress, boolean> {
  return {
    fullName: address.fullName.trim().length === 0,
    phone: address.phone.trim().length === 0 || !PHONE_RE.test(address.phone),
    email: address.email.trim().length === 0 || !EMAIL_RE.test(address.email),
    countryCode: address.countryCode.trim().length === 0,
    state: address.state.trim().length === 0,
    city: address.city.trim().length === 0,
    address: address.address.trim().length === 0,
    zipCode: address.zipCode.trim().length === 0,
  };
}

const INPUT_BASE =
  "w-full border bg-paper px-4 py-3 text-[14px] text-ink outline-none transition-colors duration-200 ease-mart focus:border-ink";
const LABEL_BASE =
  "mb-2 block text-[12px] uppercase tracking-[0.14em] text-gray-500";

export function ShippingForm({ address, countries, onChange }: ShippingFormProps) {
  const t = useTranslations("checkout.shipping");
  const [touched, setTouched] = useState<Record<keyof ShippingAddress, boolean>>({
    fullName: false,
    phone: false,
    email: false,
    countryCode: false,
    state: false,
    city: false,
    address: false,
    zipCode: false,
  });
  const errors = fieldErrors(address);

  const handleBlur = (field: keyof ShippingAddress) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const inputClass = (field: keyof ShippingAddress) =>
    cn(INPUT_BASE, touched[field] && errors[field] ? "border-danger" : "border-line");

  // 当前国家的省/州列表与城市列表（级联）
  const regionDivisions = useMemo(
    () => (address.countryCode ? getStatesByCountry(address.countryCode) : []),
    [address.countryCode],
  );
  const useDropdown = hasRegionDivisions(address.countryCode);

  // 选中省/州对应的城市列表
  const cities = useMemo(() => {
    const found = regionDivisions.find((r) => r.state.zh === address.state);
    return found?.cities ?? [];
  }, [regionDivisions, address.state]);

  return (
    <section>
      <h2 className="mb-6 text-[15px] font-medium text-ink">{t("title")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 姓名 */}
        <div className="sm:col-span-2">
          <label htmlFor="chk-fullName" className={LABEL_BASE}>
            {t("fullName")}
          </label>
          <input
            id="chk-fullName"
            type="text"
            value={address.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            onBlur={() => handleBlur("fullName")}
            className={inputClass("fullName")}
          />
        </div>

        {/* 电话 */}
        <div>
          <label htmlFor="chk-phone" className={LABEL_BASE}>
            {t("phone")}
          </label>
          <input
            id="chk-phone"
            type="tel"
            value={address.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            onBlur={() => handleBlur("phone")}
            className={inputClass("phone")}
          />
          {touched.phone && errors.phone && (
            <p className="mt-1 text-[12px] text-danger">
              {t("errorPhoneFormat")}
            </p>
          )}
        </div>

        {/* 邮箱 */}
        <div>
          <label htmlFor="chk-email" className={LABEL_BASE}>
            {t("email")}
          </label>
          <input
            id="chk-email"
            type="email"
            value={address.email}
            onChange={(e) => onChange({ email: e.target.value })}
            onBlur={() => handleBlur("email")}
            className={inputClass("email")}
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-[12px] text-danger">
              {t("errorEmailFormat")}
            </p>
          )}
        </div>

        {/* 国家 */}
        <div className="sm:col-span-2">
          <label htmlFor="chk-country" className={LABEL_BASE}>
            {t("country")}
          </label>
          <div className="relative">
            <select
              id="chk-country"
              value={address.countryCode}
              onChange={(e) =>
                // 切换国家时清空省/州 与 城市
                onChange({ countryCode: e.target.value, state: "", city: "" })
              }
              onBlur={() => handleBlur("countryCode")}
              className={cn(inputClass("countryCode"), "appearance-none pr-10")}
            >
              <option value="" disabled>
                {t("selectCountry")}
              </option>
              {countries.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {c.countryName.zh} / {c.countryName.en}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        {/* 省/州 */}
        <div>
          <label htmlFor="chk-state" className={LABEL_BASE}>
            {t("state")}
          </label>
          {useDropdown ? (
            <div className="relative">
              <select
                id="chk-state"
                value={address.state}
                onChange={(e) =>
                  // 切换省/州时清空城市
                  onChange({ state: e.target.value, city: "" })
                }
                onBlur={() => handleBlur("state")}
                className={cn(inputClass("state"), "appearance-none pr-10")}
              >
                <option value="" disabled>
                  {t("selectState")}
                </option>
                {regionDivisions.map((r) => (
                  <option key={r.state.zh} value={r.state.zh}>
                    {r.state.zh} / {r.state.en}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          ) : (
            <input
              id="chk-state"
              type="text"
              value={address.state}
              onChange={(e) => onChange({ state: e.target.value })}
              onBlur={() => handleBlur("state")}
              placeholder={t("selectState")}
              className={inputClass("state")}
            />
          )}
        </div>

        {/* 城市 */}
        <div>
          <label htmlFor="chk-city" className={LABEL_BASE}>
            {t("city")}
          </label>
          {useDropdown && cities.length > 0 ? (
            <div className="relative">
              <select
                id="chk-city"
                value={address.city}
                onChange={(e) => onChange({ city: e.target.value })}
                onBlur={() => handleBlur("city")}
                disabled={!address.state}
                className={cn(
                  inputClass("city"),
                  "appearance-none pr-10",
                  !address.state && "cursor-not-allowed opacity-50",
                )}
              >
                <option value="" disabled>
                  {address.state ? t("selectCity") : t("selectStateFirst")}
                </option>
                {cities.map((c) => (
                  <option key={c.zh} value={c.zh}>
                    {c.zh} / {c.en}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          ) : (
            <input
              id="chk-city"
              type="text"
              value={address.city}
              onChange={(e) => onChange({ city: e.target.value })}
              onBlur={() => handleBlur("city")}
              placeholder={t("selectCity")}
              className={inputClass("city")}
              disabled={useDropdown && !address.state}
            />
          )}
        </div>

        {/* 详细地址 */}
        <div className="sm:col-span-2">
          <label htmlFor="chk-address" className={LABEL_BASE}>
            {t("address")}
          </label>
          <input
            id="chk-address"
            type="text"
            value={address.address}
            onChange={(e) => onChange({ address: e.target.value })}
            onBlur={() => handleBlur("address")}
            className={inputClass("address")}
          />
        </div>

        {/* 邮编 */}
        <div className="sm:col-span-2">
          <label htmlFor="chk-zip" className={LABEL_BASE}>
            {t("zipCode")}
          </label>
          <input
            id="chk-zip"
            type="text"
            value={address.zipCode}
            onChange={(e) => onChange({ zipCode: e.target.value })}
            onBlur={() => handleBlur("zipCode")}
            className={inputClass("zipCode")}
          />
        </div>
      </div>
    </section>
  );
}

export default ShippingForm;
