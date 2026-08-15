import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  mobileNavOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  toggleLeftSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
}

function initialTheme(): Theme {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: initialTheme(),
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      mobileNavOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
      toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
      setRightSidebarOpen: (rightSidebarOpen) => set({ rightSidebarOpen }),
      toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
    }),
    {
      name: 'pdfstudio:ui',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
