import { create } from "zustand";
import { persist } from "zustand/middleware";

type Currency = "CNY" | "USD";

interface SettingsState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      currency: "CNY",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "mart-settings",
    }
  )
);
