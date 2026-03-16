import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
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
  user_id: string
  focus_duration: number
  short_break_duration: number
  long_break_duration: number
  long_break_interval: number
  theme_mode: string
  accent_color: string
  notification_sound: boolean
  auto_start_breaks: boolean
  auto_start_focus: boolean
  daily_goal_sessions: number
  created_at: string
  updated_at: string
}

function fromRaw(raw: RawSettings): UserSettings {
  return {
    focusDuration: raw.focus_duration,
    shortBreakDuration: raw.short_break_duration,
    longBreakDuration: raw.long_break_duration,
    longBreakInterval: raw.long_break_interval,
    themeMode: raw.theme_mode as ThemeMode,
    accentColor: raw.accent_color as AccentColor,
    notificationSound: !!raw.notification_sound,
    autoStartBreaks: !!raw.auto_start_breaks,
    autoStartFocus: !!raw.auto_start_focus,
    dailyGoalSessions: raw.daily_goal_sessions,
  }
}

export function useSettings() {
  const loadSettings = useCallback(async (userId: string): Promise<UserSettings> => {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single()

      if (data) {
        return fromRaw(data as RawSettings)
      }
      return { ...DEFAULT_SETTINGS }
    } catch (_) {
      return { ...DEFAULT_SETTINGS }
    }
  }, [])

  const saveSettings = useCallback(async (userId: string, settings: Partial<UserSettings>) => {
    try {
      const { data: existing } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single()

      const merged: UserSettings = {
        ...DEFAULT_SETTINGS,
        ...(existing ? fromRaw(existing as RawSettings) : {}),
        ...settings,
      }

      const payload = {
        id: existing ? (existing as RawSettings).id : `settings_${userId}`,
        user_id: userId,
        focus_duration: merged.focusDuration,
        short_break_duration: merged.shortBreakDuration,
        long_break_duration: merged.longBreakDuration,
        long_break_interval: merged.longBreakInterval,
        theme_mode: merged.themeMode,
        accent_color: merged.accentColor,
        notification_sound: merged.notificationSound,
        auto_start_breaks: merged.autoStartBreaks,
        auto_start_focus: merged.autoStartFocus,
        daily_goal_sessions: merged.dailyGoalSessions,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings'
      return { success: false, error: message }
    }
  }, [])

  return { loadSettings, saveSettings, DEFAULT_SETTINGS }
}
