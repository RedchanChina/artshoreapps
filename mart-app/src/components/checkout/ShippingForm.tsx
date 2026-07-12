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
import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import type { CountryOption, ShippingAddress } from "@/lib/checkout/types";
import type { AddressData } from "@/lib/account/repository";
import { getStatesByCountry, hasRegionDivisions } from "@/data/regions";
import { cn } from "@/lib/utils";
import { EMAIL_RE } from "@/lib/auth/constants";
import { useClickOutside } from "@/hooks/useClickOutside";

interface ShippingFormProps {
  address: ShippingAddress;
  countries: CountryOption[];
  onChange: (patch: Partial<ShippingAddress>) => void;
  isLoggedIn: boolean;
  onSaveToAddressBookChange?: (save: boolean) => void;
  savedAddresses?: AddressData[];
  onSelectAddress?: (addr: AddressData) => void;
}

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

export function ShippingForm({
  address,
  countries,
  onChange,
  isLoggedIn,
  onSaveToAddressBookChange,
  savedAddresses,
  onSelectAddress,
}: ShippingFormProps) {
  const t = useTranslations("checkout.shipping");
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);
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

  // 地址簿选择器：open / wrapRef / selectedAddressId（与 CheckoutClient 自动填充保持同步）
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses && savedAddresses.length > 0 ? savedAddresses[0].id : null,
  );
  // 选择态 vs 编辑态：有已保存地址时默认展示摘要卡片，否则进入编辑态
  const [mode, setMode] = useState<"selected" | "editing">(
    savedAddresses && savedAddresses.length > 0 ? "selected" : "editing",
  );

  // 点击外部 / ESC 关闭
  useClickOutside(wrapRef, () => setOpen(false), open);

  const selectedAddress = savedAddresses?.find((a) => a.id === selectedAddressId);

  // 选择「手动输入」：清空选中项 + 切换编辑态 + 关闭面板 + 清空所有字段
  const handleSelectManual = () => {
    setSelectedAddressId(null);
    setMode("editing");
    setOpen(false);
    onChange({
      fullName: "",
      phone: "",
      email: "",
      countryCode: "",
      state: "",
      city: "",
      address: "",
      zipCode: "",
    });
  };

  // 新增地址：清空选中项 + 切换编辑态 + 清空所有字段
  const handleAddNew = () => {
    setSelectedAddressId(null);
    setMode("editing");
    onChange({
      fullName: "",
      phone: "",
      email: "",
      countryCode: "",
      state: "",
      city: "",
      address: "",
      zipCode: "",
    });
  };

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

      {/* 地址簿选择器（登录且有保存地址时显示）：选择态摘要卡片 vs 编辑态触发器 */}
      {isLoggedIn && savedAddresses && savedAddresses.length > 0 && (
        <div ref={wrapRef} className="relative mb-4">
          {mode === "selected" && selectedAddress ? (
            // 选中态：地址摘要卡片
            <div>
              <div className="border border-line p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-ink">
                      {selectedAddress.fullName}
                    </p>
                    {selectedAddress.isDefault && (
                      <span className="bg-ink px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-paper">
                        {t("default")}
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-gray-600">
                    {selectedAddress.phone}
                  </p>
                  <p className="text-[14px] text-gray-600">
                    {selectedAddress.address}, {selectedAddress.city},{" "}
                    {selectedAddress.state} {selectedAddress.zipCode}
                  </p>
                  <p className="text-[14px] text-gray-600">
                    {selectedAddress.countryCode}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="border border-ink px-6 py-2 text-[12px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  {t("changeAddress")}
                </button>
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="border border-line px-6 py-2 text-[12px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gray-50"
                >
                  {t("addNewAddress")}
                </button>
              </div>
            </div>
          ) : (
            // 编辑态：下拉触发器
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-ink"
            >
              <span>
                {selectedAddress ? selectedAddress.fullName : t("selectAddress")}
              </span>
              <ChevronDown
                size={12}
                strokeWidth={1.2}
                className={cn(
                  "transition-transform duration-200 ease-mart",
                  open && "rotate-180",
                )}
              />
            </button>
          )}

          {/* 下拉面板：两种模式共享，由 open 控制 */}
          {open && (
            <ul
              role="listbox"
              className="absolute left-0 top-full z-50 mt-2 min-w-[280px] border border-line bg-paper py-1 shadow-[0_2px_12px_rgba(0,0,0,0.1)]"
            >
              {savedAddresses.map((addr) => {
                const isActive = addr.id === selectedAddressId;
                return (
                  <li key={addr.id} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        onSelectAddress?.(addr);
                        setSelectedAddressId(addr.id);
                        setMode("selected");
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[12px] transition-colors duration-200 ease-mart",
                        isActive
                          ? "bg-gray-100 text-ink"
                          : "text-gray-700 hover:bg-gray-100 hover:text-ink",
                      )}
                    >
                      <span className="flex items-center">
                        {addr.fullName} · {addr.phone}
                        {addr.isDefault && (
                          <span className="ml-2 bg-gray-200 px-1 text-[10px]">
                            {t("default")}
                          </span>
                        )}
                      </span>
                      <span className="text-gray-500">
                        {addr.address}, {addr.city}, {addr.state} {addr.zipCode}
                      </span>
                    </button>
                  </li>
                );
              })}
              {/* 手动输入 */}
              <li role="none" className="mt-1 border-t border-line pt-1">
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedAddressId === null}
                  onClick={handleSelectManual}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-[12px] transition-colors duration-200 ease-mart",
                    selectedAddressId === null
                      ? "bg-gray-100 text-ink"
                      : "text-gray-700 hover:bg-gray-100 hover:text-ink",
                  )}
                >
                  {t("addNew")}
                </button>
              </li>
            </ul>
          )}
        </div>
      )}

      {/* 表单 grid：选中态且有摘要时不渲染，其他情况（编辑态 / 无已保存地址 / 未登录）渲染 */}
      {!(mode === "selected" && selectedAddress) && (
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
      )}

      {/* 登录用户可勾选保存到地址簿（仅在编辑态显示，选中已有地址时隐藏） */}
      {isLoggedIn && !(mode === "selected" && selectedAddress) && (
        <label className="mt-4 flex items-center gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={saveToAddressBook}
            onChange={(e) => {
              setSaveToAddressBook(e.target.checked);
              onSaveToAddressBookChange?.(e.target.checked);
            }}
            className="h-4 w-4 rounded border-line"
          />
          {t("saveToAddressBook")}
        </label>
      )}
    </section>
  );
}

export default ShippingForm;
