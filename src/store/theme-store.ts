import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/types/index'
import type { ThemeState } from '@/types/components'

export const useThemeStore = create<ThemeState>()(persist(
  (set) => ({
    theme: 'system',
    setTheme: (theme: Theme) => set({ theme }),
  }),
  {
    name: 'vite-ui-theme',
  }
))

// 应用主题到DOM
export const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    root.classList.add(systemTheme)
    return
  }

  root.classList.add(theme)
}