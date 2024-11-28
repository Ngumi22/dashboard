"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarToggleStore {
  isOpen: boolean;
  setIsOpen: () => void;
}

export const useSidebarToggle = create(
  persist<SidebarToggleStore>(
    (set) => ({
      isOpen: true, // Sidebar starts open
      setIsOpen: () => set((state) => ({ isOpen: !state.isOpen })), // Toggle state
    }),
    {
      name: "sidebar-state", // Key in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
);
