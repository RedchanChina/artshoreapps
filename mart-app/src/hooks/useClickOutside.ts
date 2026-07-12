"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * 点击元素外部或按下 ESC 时触发回调（用于关闭下拉 / 弹层）。
 *
 * 仅在 `active` 为 true 时挂载监听器，与原来内联的 `useEffect` 行为一致：
 * 监听器仅在开关打开期间存在，切换时重新订阅。
 *
 * @param ref     包裹元素的 ref
 * @param onClose 关闭回调
 * @param active  是否处于打开状态（为 false 时不挂载监听器）
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClose: () => void,
  active: boolean,
): void {
  // 用 ref 持有最新回调，避免将其放入 effect 依赖导致每次渲染重新订阅监听器
  const cbRef = useRef(onClose);
  cbRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        cbRef.current();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cbRef.current();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
    // ref / cbRef 为稳定 ref 对象，无需进入依赖；行为与原 `[open]` 写法一致
  }, [active, ref]);
}
