/**
 * Auth 相关共享常量。
 *
 * 本模块为 isomorphic（不含 "use client" / "use server" 指令，不依赖 Node.js 或浏览器专属 API），
 * 可同时被客户端组件与服务端 Action 引用。
 */

// 邮箱格式校验：local@domain.tld
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 密码强度校验：至少 8 位，且同时包含字母与数字
export const PASSWORD_RE = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

// 浏览器安全的默认头像（data URI）。
// 使用 encodeURIComponent 方式编码，不依赖 Node.js Buffer（服务端版见 src/lib/storage/supabase.ts）。
export const DEFAULT_AVATAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#F3F3F3"/><circle cx="60" cy="45" r="20" fill="#D4D4D4"/><path d="M20 110 Q60 70 100 110 L100 120 L20 120 Z" fill="#D4D4D4"/></svg>`,
  );
