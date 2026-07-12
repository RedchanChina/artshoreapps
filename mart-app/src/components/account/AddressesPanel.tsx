"use client";

/**
 * 地址簿面板（Phase 2 Task 8.3）。
 *
 * 功能：
 * - 列表展示用户所有地址（默认地址置顶 + 标记「默认」）
 * - 新增 / 编辑地址（国家/省/市 下拉级联，复用 ShippingForm 数据源）
 * - 删除地址（window.confirm 二次确认）
 * - 设为默认地址
 * - 新增地址时邮箱默认填充用户邮箱
 *
 * 样式参考 ShippingForm：border border-line px-4 py-3 text-[14px]。
 */
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

import {
  fetchAddresses,
  saveAddress,
  removeAddress,
  setDefault,
} from "@/lib/account/actions";
import type { AddressData } from "@/lib/account/repository";
import type { CountryOption } from "@/lib/checkout/types";
import { getStatesByCountry, hasRegionDivisions } from "@/data/regions";
import { cn } from "@/lib/utils";

interface AddressesPanelProps {
  userId: string;
  /** 新增地址时邮箱字段默认填充此值 */
  defaultEmail: string;
  /** 支持配送的国家列表（来自 getSupportedCountries） */
  supportedCountries: CountryOption[];
}

/** 生成空表单，email 默认填充用户邮箱 */
const createEmptyForm = (defaultEmail: string) => ({
  id: "",
  fullName: "",
  phone: "",
  email: defaultEmail,
  countryCode: "",
  state: "",
  city: "",
  address: "",
  zipCode: "",
});

type FormState = ReturnType<typeof createEmptyForm>;

const INPUT_BASE =
  "w-full border bg-paper px-4 py-3 text-[14px] text-ink outline-none transition-colors duration-200 ease-mart focus:border-ink";
const LABEL_BASE =
  "mb-2 block text-[12px] uppercase tracking-[0.14em] text-gray-500";
const BTN_PRIMARY =
  "bg-ink px-8 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 ease-mart hover:bg-ink/90 disabled:opacity-50";
const BTN_OUTLINE =
  "border border-ink px-8 py-3 text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-mart hover:bg-ink hover:text-paper";
const BTN_TEXT =
  "text-[12px] uppercase tracking-[0.14em] text-gray-500 transition-colors hover:text-ink";

export function AddressesPanel({
  userId,
  defaultEmail,
  supportedCountries,
}: AddressesPanelProps) {
  const t = useTranslations("account.addresses");
  const locale = useLocale();
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() => createEmptyForm(defaultEmail));
  const [saving, setSaving] = useState(false);

  const loadAddresses = () => {
    fetchAddresses().then((data) => {
      setAddresses(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleAdd = () => {
    // 新增地址：email 默认填充用户邮箱
    setForm(createEmptyForm(defaultEmail));
    setEditing(true);
  };

  const handleEdit = (addr: AddressData) => {
    setForm({
      id: addr.id,
      fullName: addr.fullName,
      phone: addr.phone,
      email: addr.email ?? defaultEmail,
      countryCode: addr.countryCode,
      state: addr.state,
      city: addr.city,
      address: addr.address,
      zipCode: addr.zipCode,
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setForm(createEmptyForm(defaultEmail));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    if (form.id) formData.append("id", form.id);
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "id") formData.append(key, value);
    });
    await saveAddress(formData);
    setSaving(false);
    setEditing(false);
    setForm(createEmptyForm(defaultEmail));
    loadAddresses();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("confirmDelete"))) return;
    await removeAddress(id);
    loadAddresses();
  };

  const handleSetDefault = async (id: string) => {
    await setDefault(id);
    loadAddresses();
  };

  // 当前国家的省/州列表与城市列表（级联）
  const regionDivisions = useMemo(
    () => (form.countryCode ? getStatesByCountry(form.countryCode) : []),
    [form.countryCode],
  );
  const useDropdown = hasRegionDivisions(form.countryCode);

  // 选中省/州对应的城市列表
  const cities = useMemo(() => {
    const found = regionDivisions.find((r) => r.state.zh === form.state);
    return found?.cities ?? [];
  }, [regionDivisions, form.state]);

  if (loading) {
    return (
      <div className="py-8 text-center text-[14px] text-gray-400">
        Loading...
      </div>
    );
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-6">
        <h2 className="text-[15px] font-medium text-ink">{t("title")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 姓名 */}
          <div className="sm:col-span-2">
            <label htmlFor="addr-fullName" className={LABEL_BASE}>
              {t("fullName")}
            </label>
            <input
              id="addr-fullName"
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={cn(INPUT_BASE, "border-line")}
            />
          </div>

          {/* 电话 */}
          <div>
            <label htmlFor="addr-phone" className={LABEL_BASE}>
              {t("phone")}
            </label>
            <input
              id="addr-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={cn(INPUT_BASE, "border-line")}
            />
          </div>

          {/* 邮箱（可选） */}
          <div>
            <label htmlFor="addr-email" className={LABEL_BASE}>
              {t("email")}
            </label>
            <input
              id="addr-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={cn(INPUT_BASE, "border-line")}
            />
          </div>

          {/* 国家 */}
          <div className="sm:col-span-2">
            <label htmlFor="addr-country" className={LABEL_BASE}>
              {t("country")}
            </label>
            <div className="relative">
              <select
                id="addr-country"
                required
                value={form.countryCode}
                onChange={(e) =>
                  // 切换国家时清空省/州 与 城市
                  setForm({
                    ...form,
                    countryCode: e.target.value,
                    state: "",
                    city: "",
                  })
                }
                className={cn(INPUT_BASE, "appearance-none border-line pr-10")}
              >
                <option value="" disabled>
                  {t("country")}
                </option>
                {supportedCountries.map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>
                    {locale === "zh" ? c.countryName.zh : c.countryName.en}
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
            <label htmlFor="addr-state" className={LABEL_BASE}>
              {t("state")}
            </label>
            {useDropdown ? (
              <div className="relative">
                <select
                  id="addr-state"
                  required
                  value={form.state}
                  onChange={(e) =>
                    // 切换省/州时清空城市
                    setForm({ ...form, state: e.target.value, city: "" })
                  }
                  className={cn(
                    INPUT_BASE,
                    "appearance-none border-line pr-10",
                  )}
                >
                  <option value="" disabled>
                    {t("state")}
                  </option>
                  {regionDivisions.map((r) => (
                    <option key={r.state.zh} value={r.state.zh}>
                      {locale === "zh" ? r.state.zh : r.state.en}
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
                id="addr-state"
                type="text"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className={cn(INPUT_BASE, "border-line")}
              />
            )}
          </div>

          {/* 城市 */}
          <div>
            <label htmlFor="addr-city" className={LABEL_BASE}>
              {t("city")}
            </label>
            {useDropdown && cities.length > 0 ? (
              <div className="relative">
                <select
                  id="addr-city"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  disabled={!form.state}
                  className={cn(
                    INPUT_BASE,
                    "appearance-none border-line pr-10",
                    !form.state && "cursor-not-allowed opacity-50",
                  )}
                >
                  <option value="" disabled>
                    {t("city")}
                  </option>
                  {cities.map((c) => (
                    <option key={c.zh} value={c.zh}>
                      {locale === "zh" ? c.zh : c.en}
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
                id="addr-city"
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                disabled={useDropdown && !form.state}
                className={cn(INPUT_BASE, "border-line")}
              />
            )}
          </div>

          {/* 详细地址 */}
          <div className="sm:col-span-2">
            <label htmlFor="addr-address" className={LABEL_BASE}>
              {t("address")}
            </label>
            <input
              id="addr-address"
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={cn(INPUT_BASE, "border-line")}
            />
          </div>

          {/* 邮编 */}
          <div className="sm:col-span-2">
            <label htmlFor="addr-zip" className={LABEL_BASE}>
              {t("zipCode")}
            </label>
            <input
              id="addr-zip"
              type="text"
              required
              value={form.zipCode}
              onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              className={cn(INPUT_BASE, "border-line")}
            />
          </div>
        </div>

        {/* 保存 / 取消 */}
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {t("save")}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={BTN_OUTLINE}
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-[14px] text-gray-500">{t("empty")}</p>
        <button onClick={handleAdd} className={BTN_PRIMARY}>
          {t("addNew")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-medium text-ink">{t("title")}</h2>
        <button onClick={handleAdd} className={BTN_OUTLINE}>
          {t("addNew")}
        </button>
      </div>

      {addresses.map((addr) => (
        <div key={addr.id} className="border border-line p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-medium text-ink">
                  {addr.fullName}
                </p>
                {addr.isDefault && (
                  <span className="bg-ink px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-paper">
                    {t("default")}
                  </span>
                )}
              </div>
              <p className="text-[14px] text-gray-600">{addr.phone}</p>
              {addr.email && (
                <p className="text-[14px] text-gray-600">{addr.email}</p>
              )}
              <p className="text-[14px] text-gray-600">
                {addr.address}, {addr.city}, {addr.state} {addr.zipCode}
              </p>
              <p className="text-[14px] text-gray-600">{addr.countryCode}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className={BTN_TEXT}
                >
                  {t("setDefault")}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleEdit(addr)}
                className={BTN_TEXT}
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                className={cn(BTN_TEXT, "hover:text-danger")}
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
