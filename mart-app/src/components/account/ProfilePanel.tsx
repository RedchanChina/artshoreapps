"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { AccountUser } from "./AccountLayout";
import { updateProfile, changePassword, deleteAccount } from "@/lib/account/actions";
import { DEFAULT_AVATAR } from "@/lib/auth/constants";
import { cn, compressImage } from "@/lib/utils";

interface ProfilePanelProps {
  user: AccountUser;
}

export function ProfilePanel({ user }: ProfilePanelProps) {
  const t = useTranslations("account.profile");
  const router = useRouter();
  const { update: updateSession } = useSession();

  // 个人资料编辑
  const [nickname, setNickname] = useState(user.name ?? "");
  const [avatarPreview, setAvatarPreview] = useState(user.image ?? DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // 修改密码
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  // 注销账户
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 超过 2MB 自动压缩
      const compressed = await compressImage(file);
      setAvatarFile(compressed);
      setAvatarPreview(URL.createObjectURL(compressed));
    }
  };

  // 取消个人资料编辑：恢复查看态，清空临时状态
  const handleCancelProfile = () => {
    // 若存在临时创建的 Object URL，释放以避免内存泄漏
    if (avatarFile) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(user.image ?? DEFAULT_AVATAR);
    setNickname(user.name ?? "");
    setProfileError(null);
    setProfileSuccess(false);
    setEditingProfile(false);
  };

  // 取消修改密码：清空输入并收起表单
  const handleCancelPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setPasswordSuccess(false);
    setEditingPassword(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setSavingProfile(true);

    const formData = new FormData();
    formData.append("nickname", nickname);
    if (avatarFile) formData.append("avatar", avatarFile);

    const result = await updateProfile(formData);
    setSavingProfile(false);

    if (result.success) {
      // 传空对象触发 jwt callback 的 update 分支，从数据库重新读取最新的 name/image
      await updateSession({});
      setProfileSuccess(true);
      setAvatarFile(null);
      setEditingProfile(false);
      router.refresh();
    } else {
      const errorKey = result.error === "NICKNAME_EMPTY" ? "errorNicknameEmpty" : "errorUnknown";
      setProfileError(errorKey);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setSavingPassword(true);

    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    const result = await changePassword(formData);
    setSavingPassword(false);

    if (result.success) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEditingPassword(false);
    } else {
      const errorMap: Record<string, string> = {
        PASSWORD_WRONG: "errorPasswordWrong",
        PASSWORD_WEAK: "errorPasswordWeak",
        PASSWORD_MISMATCH: "errorPasswordMismatch",
        PASSWORD_SAME: "errorPasswordSame",
      };
      setPasswordError(errorMap[result.error ?? ""] ?? "errorUnknown");
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.replace("/");
  };

  // 注销账户：要求邮箱确认，成功后 signOut 并整页跳转首页
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeletingAccount(true);
    const result = await deleteAccount(deleteConfirmEmail);
    setDeletingAccount(false);
    if (result.success) {
      await signOut({ redirect: false });
      window.location.replace("/");
    } else {
      setDeleteError(result.error === "EMAIL_MISMATCH" ? "errorEmailMismatch" : "errorUnknown");
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(false);
    setDeleteConfirmEmail("");
    setDeleteError(null);
  };

  return (
    <div>
      {/* 用户信息卡片 */}
      <section>
        {!editingProfile ? (
          // 查看态：头像 + 用户名 + 邮箱 + 修改按钮
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarPreview}
              alt={nickname}
              className="h-16 w-16 rounded-full object-cover border border-line"
            />
            <div className="flex flex-1 flex-col">
              <span className="text-[16px] font-medium text-ink">
                {nickname || t("unnamed")}
              </span>
              <span className="text-[13px] text-gray-500">{user.email}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setProfileError(null);
                setProfileSuccess(false);
                setEditingProfile(true);
              }}
              className="border border-line px-4 py-1.5 text-[12px] uppercase tracking-[0.14em] text-ink hover:bg-gray-50"
            >
              {t("edit")}
            </button>
          </div>
        ) : (
          // 编辑态：头像选择 + 昵称输入 + 保存/取消
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* 头像 */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarPreview}
                  alt={nickname}
                  className="h-16 w-16 rounded-full object-cover border border-line"
                />
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-ink p-1.5 text-paper">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </label>
              </div>
              <div>
                <p className="text-[12px] text-gray-500">{t("avatarHint")}</p>
              </div>
            </div>
            {/* 昵称 */}
            <div>
              <label className="mb-1.5 block text-[12px] uppercase tracking-[0.14em] text-gray-500">
                {t("nickname")}
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full border border-line px-4 py-3 text-[14px] text-ink outline-none focus:border-ink"
              />
            </div>
            {profileError && <p className="text-[12px] text-danger">{t(profileError)}</p>}
            {profileSuccess && <p className="text-[12px] text-green-600">{t("profileUpdated")}</p>}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingProfile}
                className={cn(
                  "bg-ink px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-paper hover:bg-ink/90",
                  savingProfile && "opacity-60",
                )}
              >
                {savingProfile ? t("saving") : t("save")}
              </button>
              <button
                type="button"
                onClick={handleCancelProfile}
                className="border border-line px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-ink hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 操作项列表：每项以分割线分隔 */}
      <div className="mt-6">
        {/* 修改密码 */}
        <div className="border-t border-line">
          {!editingPassword ? (
            // 查看态：点击展开密码修改表单
            <button
              type="button"
              onClick={() => {
                setPasswordError(null);
                setPasswordSuccess(false);
                setEditingPassword(true);
              }}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="text-[14px] text-ink">{t("changePassword")}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ) : (
            // 编辑态：旧密码 + 新密码 + 确认 + 更新/取消
            <form onSubmit={handleChangePassword} className="space-y-4 py-4">
              <div>
                <label className="mb-1.5 block text-[12px] uppercase tracking-[0.14em] text-gray-500">
                  {t("currentPassword")}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full border border-line px-4 py-3 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] uppercase tracking-[0.14em] text-gray-500">
                  {t("newPassword")}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full border border-line px-4 py-3 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] uppercase tracking-[0.14em] text-gray-500">
                  {t("confirmPassword")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full border border-line px-4 py-3 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>
              {passwordError && <p className="text-[12px] text-danger">{t(passwordError)}</p>}
              {passwordSuccess && <p className="text-[12px] text-green-600">{t("passwordUpdated")}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className={cn(
                    "bg-ink px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-paper hover:bg-ink/90",
                    savingPassword && "opacity-60",
                  )}
                >
                  {t("submitPassword")}
                </button>
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="border border-line px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-ink hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 退出登录 */}
        <div className="border-t border-line">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-between py-4 text-left"
          >
            <span className="text-[14px] text-ink">{t("signOut")}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* 注销账户（红色文字，最底部） */}
        <div className="border-t border-line">
          {!confirmingDelete ? (
            // 查看态：红色文字按钮，点击展开确认区域
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="text-[14px] text-danger">{t("deleteAccount")}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ) : (
            // 确认态：提示文字 + 邮箱输入 + 确认/取消
            <form onSubmit={handleDeleteAccount} className="space-y-4 py-4">
              <p className="text-[13px] text-gray-600">{t("deleteAccountConfirm")}</p>
              <div>
                <label className="mb-1.5 block text-[12px] uppercase tracking-[0.14em] text-gray-500">
                  {t("emailConfirm")}
                </label>
                <input
                  type="email"
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  placeholder={t("emailConfirmPlaceholder")}
                  className="w-full border border-line px-4 py-3 text-[14px] text-ink outline-none focus:border-ink"
                />
              </div>
              {deleteError && <p className="text-[12px] text-danger">{t(deleteError)}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={deletingAccount}
                  className={cn(
                    "bg-danger px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-paper hover:bg-danger/90",
                    deletingAccount && "opacity-60",
                  )}
                >
                  {deletingAccount ? t("deleting") : t("confirmDelete")}
                </button>
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="border border-line px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-ink hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePanel;
