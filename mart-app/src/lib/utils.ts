import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 将 next-intl locale 字符串转为数据层使用的 "zh" | "en" */
export function toLocale(locale: string): "zh" | "en" {
  return locale === "en" ? "en" : "zh";
}
