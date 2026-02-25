'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'auto' | 'dark'

const STORAGE_KEY = 'theme'

function readStored(): ThemeMode {
  if (typeof window === 'undefined') return 'auto'
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'light' || v === 'dark' || v === 'auto') return v
  return 'auto'
}

function applyTheme(mode: ThemeMode) {
  const el = document.documentElement
  el.classList.remove('theme-light', 'theme-dark')
  if (mode === 'light') el.classList.add('theme-light')
  else if (mode === 'dark') el.classList.add('theme-dark')
  localStorage.setItem(STORAGE_KEY, mode)
}

const ThemeContext = createContext<{
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('auto')

  useEffect(() => {
    setThemeState(readStored())
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
    applyTheme(mode)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
