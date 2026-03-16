import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type SessionType = 'focus' | 'shortBreak' | 'longBreak'

interface StudySession {
  id: string
  user_id: string
  session_type: string
  duration_minutes: number
  completed: boolean
  started_at: string
  completed_at: string | null
  notes: string | null
  created_at: string
}

interface StudyStreak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_study_date: string | null
  total_sessions: number
  total_focus_minutes: number
  created_at: string
  updated_at: string
}

interface DayStats {
  totalSessions: number
  focusMinutes: number
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return isSameDay(date, yesterday)
}

export function useStudySession() {
  const saveSession = useCallback(
    async (
      userId: string,
      type: SessionType,
      durationMinutes: number,
      completedAt: string,
      startedAt?: string,
    ) => {
      const started = startedAt ?? new Date(Date.now() - durationMinutes * 60 * 1000).toISOString()
      const { error } = await supabase.from('study_sessions').insert({
        id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        user_id: userId,
        session_type: type,
        duration_minutes: durationMinutes,
        completed: true,
        started_at: started,
        completed_at: completedAt,
        notes: null,
      })
      if (error) throw error
    },
    [],
  )

  const updateStreak = useCallback(async (userId: string, addMinutes: number = 0) => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (!existing) {
      await supabase.from('study_streaks').insert({
        id: `streak_${userId}`,
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_study_date: todayStr,
        total_sessions: 1,
        total_focus_minutes: addMinutes,
        updated_at: new Date().toISOString(),
      })
      return
    }

    const record = existing as StudyStreak
    const lastDate = record.last_study_date ? new Date(record.last_study_date) : null

    let newStreak = record.current_streak
    if (!lastDate) {
      newStreak = 1
    } else if (isSameDay(lastDate, today)) {
      // same day – maintain streak
    } else if (isYesterday(lastDate)) {
      newStreak += 1
    } else {
      newStreak = 1
    }

    const longestStreak = Math.max(newStreak, record.longest_streak)
    const totalSessions = record.total_sessions + 1
    const totalFocusMinutes = record.total_focus_minutes + addMinutes

    await supabase
      .from('study_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_study_date: todayStr,
        total_sessions: totalSessions,
        total_focus_minutes: totalFocusMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id)
  }, [])

  const getUserStats = useCallback(
    async (userId: string): Promise<{ today: DayStats; week: DayStats; streak: StudyStreak | null }> => {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()

      const [sessionsResult, streakResult] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('completed', true)
          .eq('session_type', 'focus'),
        supabase
          .from('study_streaks')
          .select('*')
          .eq('user_id', userId)
          .limit(1)
          .single(),
      ])

      const allSessions = (sessionsResult.data ?? []) as StudySession[]

      const todaySessions = allSessions.filter(
        (s) => s.completed_at && s.completed_at >= startOfToday,
      )
      const weekSessions = allSessions.filter(
        (s) => s.completed_at && s.completed_at >= startOfWeek,
      )

      return {
        today: {
          totalSessions: todaySessions.length,
          focusMinutes: todaySessions.reduce((acc, s) => acc + s.duration_minutes, 0),
        },
        week: {
          totalSessions: weekSessions.length,
          focusMinutes: weekSessions.reduce((acc, s) => acc + s.duration_minutes, 0),
        },
        streak: (streakResult.data as StudyStreak) ?? null,
      }
    },
    [],
  )

  return { saveSession, updateStreak, getUserStats }
}
