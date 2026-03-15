import { useCallback } from 'react'
import { blink } from '@/lib/blink'

export type SessionType = 'focus' | 'shortBreak' | 'longBreak'

interface StudySession {
  id: string
  userId: string
  sessionType: SessionType
  durationMinutes: number
  completed: string | number
  startedAt: string
  completedAt: string | null
  notes: string | null
  createdAt: string
}

interface StudyStreak {
  id: string
  userId: string
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
  totalSessions: number
  totalFocusMinutes: number
  createdAt: string
  updatedAt: string
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
      await blink.db.studySessions.create({
        id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId,
        sessionType: type,
        durationMinutes,
        completed: 1,
        startedAt: started,
        completedAt,
        notes: null,
      })
    },
    [],
  )

  const updateStreak = useCallback(async (userId: string, addMinutes: number = 0) => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const existing = await blink.db.studyStreaks.list({
      where: { userId },
      limit: 1,
    }) as StudyStreak[]

    if (existing.length === 0) {
      await blink.db.studyStreaks.create({
        id: `streak_${userId}`,
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastStudyDate: todayStr,
        totalSessions: 1,
        totalFocusMinutes: addMinutes,
        updatedAt: new Date().toISOString(),
      })
      return
    }

    const record = existing[0]
    const lastDate = record.lastStudyDate ? new Date(record.lastStudyDate) : null

    let newStreak = record.currentStreak
    if (!lastDate) {
      newStreak = 1
    } else if (isSameDay(lastDate, today)) {
      // same day – maintain streak
    } else if (isYesterday(lastDate)) {
      newStreak += 1
    } else {
      newStreak = 1
    }

    const longestStreak = Math.max(newStreak, record.longestStreak)
    const totalSessions = record.totalSessions + 1
    const totalFocusMinutes = record.totalFocusMinutes + addMinutes

    await blink.db.studyStreaks.update(record.id, {
      currentStreak: newStreak,
      longestStreak,
      lastStudyDate: todayStr,
      totalSessions,
      totalFocusMinutes,
      updatedAt: new Date().toISOString(),
    })
  }, [])

  const getUserStats = useCallback(
    async (userId: string): Promise<{ today: DayStats; week: DayStats; streak: StudyStreak | null }> => {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()

      const [allSessions, streakRows] = await Promise.all([
        blink.db.studySessions.list({ where: { userId } }) as Promise<StudySession[]>,
        blink.db.studyStreaks.list({ where: { userId }, limit: 1 }) as Promise<StudyStreak[]>,
      ])

      const focusSessions = allSessions.filter(
        (s) => s.sessionType === 'focus' && Number(s.completed) > 0,
      )

      const todaySessions = focusSessions.filter(
        (s) => s.completedAt && s.completedAt >= startOfToday,
      )
      const weekSessions = focusSessions.filter(
        (s) => s.completedAt && s.completedAt >= startOfWeek,
      )

      return {
        today: {
          totalSessions: todaySessions.length,
          focusMinutes: todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0),
        },
        week: {
          totalSessions: weekSessions.length,
          focusMinutes: weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0),
        },
        streak: streakRows[0] ?? null,
      }
    },
    [],
  )

  return { saveSession, updateStreak, getUserStats }
}
