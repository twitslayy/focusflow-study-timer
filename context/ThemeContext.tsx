import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange'

const THEME_STORAGE_KEY = '@focusflow/theme_mode'
const ACCENT_STORAGE_KEY = '@focusflow/accent_color'

const ACCENT_PALETTES: Record<AccentColor, { primary: string; primaryLight: string; primaryDark: string; primaryTint: string }> = {
  blue:   { primary: '#2563EB', primaryLight: '#3B82F6', primaryDark: '#1D4ED8', primaryTint: '#DBEAFE' },
  purple: { primary: '#7C3AED', primaryLight: '#8B5CF6', primaryDark: '#6D28D9', primaryTint: '#EDE9FE' },
  green:  { primary: '#059669', primaryLight: '#10B981', primaryDark: '#047857', primaryTint: '#D1FAE5' },
  orange: { primary: '#EA580C', primaryLight: '#F97316', primaryDark: '#C2410C', primaryTint: '#FFEDD5' },
}

const LIGHT_COLORS = {
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  backgroundTertiary: '#F1F5F9',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
}

const DARK_COLORS = {
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',
  surface: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  border: '#334155',
}

export interface ThemedColors {
  background: string
  backgroundSecondary: string
  backgroundTertiary: string
  surface: string
  text: string
  textSecondary: string
  textTertiary: string
  border: string
  primary: string
  primaryLight: string
  primaryDark: string
  primaryTint: string
}

interface ThemeContextValue {
  themeMode: ThemeMode
  accentColor: AccentColor
  isDark: boolean
  colors: ThemedColors
  setThemeMode: (mode: ThemeMode) => void
  setAccentColor: (color: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue')

  useEffect(() => {
    const load = async () => {
      try {
        const [storedTheme, storedAccent] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(ACCENT_STORAGE_KEY),
        ])
        if (storedTheme) setThemeModeState(storedTheme as ThemeMode)
        if (storedAccent) setAccentColorState(storedAccent as AccentColor)
      } catch (_) {}
    }
    load()
  }, [])

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode)
    try { await AsyncStorage.setItem(THEME_STORAGE_KEY, mode) } catch (_) {}
  }, [])

  const setAccentColor = useCallback(async (color: AccentColor) => {
    setAccentColorState(color)
    try { await AsyncStorage.setItem(ACCENT_STORAGE_KEY, color) } catch (_) {}
  }, [])

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark')

  const baseColors = isDark ? DARK_COLORS : LIGHT_COLORS
  const accent = ACCENT_PALETTES[accentColor]

  const colors: ThemedColors = { ...baseColors, ...accent }

  return (
    <ThemeContext.Provider value={{ themeMode, accentColor, isDark, colors, setThemeMode, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
