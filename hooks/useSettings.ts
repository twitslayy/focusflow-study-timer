import { useCallback } from 'react'
import { blink } from '@/lib/blink'
import type { ThemeMode, AccentColor } from '@/context/ThemeContext'

export interface UserSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  themeMode: ThemeMode
  accentColor: AccentColor
  notificationSound: boolean
  autoStartBreaks: boolean
  autoStartFocus: boolean
  dailyGoalSessions: number
}

export const DEFAULT_SETTINGS: UserSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  themeMode: 'system',
  accentColor: 'blue',
  notificationSound: true,
  autoStartBreaks: false,
  autoStartFocus: false,
  dailyGoalSessions: 8,
}

interface RawSettings {
  id: string
  userId: string
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  themeMode: string
  accentColor: string
  notificationSound: string | number
  autoStartBreaks: string | number
  autoStartFocus: string | number
  dailyGoalSessions: number
  createdAt: string
  updatedAt: string
}

function fromRaw(raw: RawSettings): UserSettings {
  return {
    focusDuration: raw.focusDuration,
    shortBreakDuration: raw.shortBreakDuration,
    longBreakDuration: raw.longBreakDuration,
    longBreakInterval: raw.longBreakInterval,
    themeMode: raw.themeMode as ThemeMode,
    accentColor: raw.accentColor as AccentColor,
    notificationSound: Number(raw.notificationSound) > 0,
    autoStartBreaks: Number(raw.autoStartBreaks) > 0,
    autoStartFocus: Number(raw.autoStartFocus) > 0,
    dailyGoalSessions: raw.dailyGoalSessions,
  }
}

export function useSettings() {
  const loadSettings = useCallback(async (userId: string): Promise<UserSettings> => {
    try {
      const rows = await blink.db.userSettings.list({
        where: { userId },
        limit: 1,
      }) as RawSettings[]

      if (rows.length > 0) {
        return fromRaw(rows[0])
      }
      return { ...DEFAULT_SETTINGS }
    } catch (_) {
      return { ...DEFAULT_SETTINGS }
    }
  }, [])

  const saveSettings = useCallback(async (userId: string, settings: Partial<UserSettings>) => {
    try {
      const existing = await blink.db.userSettings.list({
        where: { userId },
        limit: 1,
      }) as RawSettings[]

      const merged: UserSettings = {
        ...DEFAULT_SETTINGS,
        ...(existing.length > 0 ? fromRaw(existing[0]) : {}),
        ...settings,
      }

      const payload = {
        id: existing.length > 0 ? existing[0].id : `settings_${userId}`,
        userId,
        focusDuration: merged.focusDuration,
        shortBreakDuration: merged.shortBreakDuration,
        longBreakDuration: merged.longBreakDuration,
        longBreakInterval: merged.longBreakInterval,
        themeMode: merged.themeMode,
        accentColor: merged.accentColor,
        notificationSound: merged.notificationSound ? 1 : 0,
        autoStartBreaks: merged.autoStartBreaks ? 1 : 0,
        autoStartFocus: merged.autoStartFocus ? 1 : 0,
        dailyGoalSessions: merged.dailyGoalSessions,
        updatedAt: new Date().toISOString(),
      }

      await blink.db.userSettings.upsert(payload)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings'
      return { success: false, error: message }
    }
  }, [])

  return { loadSettings, saveSettings, DEFAULT_SETTINGS }
}
