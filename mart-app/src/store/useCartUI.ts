import { create } from "zustand";

/**
 * 购物车滑出面板 UI 状态。
 *
 * 仅管理开合状态；购物车行项数据由 CartDrawer 自行通过
 * getCart() Server Action 从 Redis 读取。
 *
 * version 计数器用于通知 CartBadge 刷新：加购/移除成功后调用 bump()，
 * CartBadge 监听 version 变化即重新从 Redis 读取数量。
 */
interface CartUIState {
  isOpen: boolean;
  /** 购物车版本号，每次加购/移除时 +1 */
  version: number;
  open: () => void;
  close: () => void;
  /** 通知角标刷新 */
  bump: () => void;
}

export const useCartUI = create<CartUIState>()((set) => ({
  isOpen: false,
  version: 0,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  bump: () => set((s) => ({ version: s.version + 1 })),
}));
