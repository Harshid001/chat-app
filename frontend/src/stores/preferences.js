import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePreferences = create(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "chat-appearance", partialize: ({ theme }) => ({ theme }) },
  ),
);
