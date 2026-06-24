import { cn } from "@/lib/utils";

export type LogoVariant = "light" | "dark";

interface LogoProps {
  /** 反白版（纸白色）用于深色 / 透明态背景；黑色版用于纸白背景 */
  variant?: LogoVariant;
  className?: string;
}

/**
 * M·art 图片 Logo。
 * - light：反白版图片，用于透明态导航栏、深色抽屉、深色订阅区
 * - dark：黑色版图片，用于固定态导航栏（纸白背景）
 * - 两张图片始终挂载，通过 variant 控制 block/hidden 切换
 */
export function Logo({ variant = "dark", className }: LogoProps) {
  return (
    <span
      className={cn("inline-flex items-center select-none", className)}
      aria-label="M·art"
      role="img"
    >
      {/* 黑色版：纸白背景使用 */}
      <img
        src="/logo-dark.png?v=3"
        alt="M·art"
        className={cn(
          "h-full w-auto",
          variant === "dark" ? "block" : "hidden"
        )}
      />
      {/* 反白版：深色/透明背景使用 */}
      <img
        src="/logo-light.png?v=3"
        alt="M·art"
        className={cn(
          "h-full w-auto",
          variant === "light" ? "block" : "hidden"
        )}
      />
    </span>
  );
}

export default Logo;
