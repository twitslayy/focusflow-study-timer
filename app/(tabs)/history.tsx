/**
 * FocusFlow – History & Statistics Screen
 * Shows stats cards, weekly bar chart, and session list filtered by date range.
 */

import React, { useMemo, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'

import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design'
import StatsCard from '@/components/StatsCard'
import WeeklyChart, { type ChartDay } from '@/components/WeeklyChart'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudySession {
  id: string
  user_id: string
  session_type: string
  duration_minutes: number
  completed: boolean
  started_at: string
  completed_at: string | null
}

interface StudyStreak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_study_date: string | null
  total_sessions: number
  total_focus_minutes: number
}

type FilterTab = 'today' | 'week' | 'month'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startOf(period: FilterTab): Date {
  const now = new Date()
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  if (period === 'week') {
    const day = now.getDay() // 0=Sun
    const diff = (day + 6) % 7 // days since Monday
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff)
  }
  // month
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function groupByDate(sessions: StudySession[]): { title: string; data: StudySession[] }[] {
  const map = new Map<string, StudySession[]>()
  sessions.forEach((s) => {
    const key = s.completed_at ? formatDate(s.completed_at) : 'In Progress'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  })
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }))
}

function getWeekChartData(sessions: StudySession[]): ChartDay[] {
  const now = new Date()
  const monday = new Date(now)
  const dayOfWeek = (now.getDay() + 6) % 7 // Mon=0
  monday.setDate(now.getDate() - dayOfWeek)
  monday.setHours(0, 0, 0, 0)

  const result: ChartDay[] = WEEK_DAYS.map((day, i) => {
    const dayStart = new Date(monday)
    dayStart.setDate(monday.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayStart.getDate() + 1)

    const mins = sessions
      .filter((s) => {
        if (!s.completed_at || s.session_type !== 'focus' || !s.completed) return false
        const d = new Date(s.completed_at)
        return d >= dayStart && d < dayEnd
      })
      .reduce((acc, s) => acc + s.duration_minutes, 0)

    return { day, minutes: mins }
  })
  return result
}

// ─── Session Item ─────────────────────────────────────────────────────────────

interface SessionItemProps {
  session: StudySession
}

function SessionItem({ session }: SessionItemProps) {
  const { colors } = useTheme()

  const isFocus = session.session_type === 'focus'
  const isShortBreak = session.session_type === 'shortBreak'
  const iconName = isFocus ? 'timer-outline' : isShortBreak ? 'cafe-outline' : 'leaf-outline'
  const iconColor = isFocus ? colors.primary : colors.textSecondary
  const typeLabel = isFocus ? 'Focus' : isShortBreak ? 'Short Break' : 'Long Break'

  return (
    <View style={[styles.sessionItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.sessionIconWrap, { backgroundColor: withOpacity(iconColor, 0.1) }]}>
        <Ionicons name={iconName as any} size={18} color={iconColor} />
      </View>
      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionType, { color: colors.text }]}>{typeLabel}</Text>
        <Text style={[styles.sessionTime, { color: colors.textTertiary }]}>
          {formatTime(session.completed_at)}
        </Text>
      </View>
      <Text style={[styles.sessionDuration, { color: colors.textSecondary }]}>
        {formatDuration(session.duration_minutes)}
      </Text>
    </View>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { colors } = useTheme()
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState<FilterTab>('week')

  // Fetch all sessions
  const {
    data: allSessions = [],
    isLoading: sessionsLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['study-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
      return (data ?? []) as StudySession[]
    },
    enabled: !!user?.id,
  })

  // Fetch streak
  const { data: streak } = useQuery({
    queryKey: ['study-streak', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      return (data as StudyStreak) ?? null
    },
    enabled: !!user?.id,
  })

  // Filtered sessions by active tab
  const filteredSessions = useMemo(() => {
    const cutoff = startOf(activeFilter)
    return allSessions.filter((s) => {
      if (!s.completed_at) return false
      return new Date(s.completed_at) >= cutoff
    })
  }, [allSessions, activeFilter])

  const focusSessions = useMemo(
    () => filteredSessions.filter((s) => s.session_type === 'focus' && s.completed),
    [filteredSessions],
  )

  const totalFocusMinutes = useMemo(
    () => focusSessions.reduce((acc, s) => acc + s.duration_minutes, 0),
    [focusSessions],
  )

  const weekChartData = useMemo(() => getWeekChartData(allSessions), [allSessions])

  const groupedSessions = useMemo(() => groupByDate(filteredSessions), [filteredSessions])

  // Flatten for FlatList with date headers
  type ListItem =
    | { type: 'header'; title: string; id: string }
    | { type: 'session'; session: StudySession; id: string }

  const listItems = useMemo<ListItem[]>(() => {
    const items: ListItem[] = []
    groupedSessions.forEach(({ title, data }) => {
      items.push({ type: 'header', title, id: `header-${title}` })
      data.forEach((s) => items.push({ type: 'session', session: s, id: s.id }))
    })
    return items
  }, [groupedSessions])

  const dailyGoal = 8
  const todaySessions = useMemo(() => {
    const cutoff = startOf('today')
    return allSessions.filter(
      (s) => s.session_type === 'focus' && s.completed_at && new Date(s.completed_at) >= cutoff,
    ).length
  }, [allSessions])

  const onRefresh = useCallback(() => { refetch() }, [refetch])

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') {
        return (
          <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>
            {item.title}
          </Text>
        )
      }
      return <SessionItem session={item.session} />
    },
    [colors],
  )

  const ListHeader = (
    <View>
      {/* Header row */}
      <View style={styles.screenHeader}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Statistics</Text>
        <View style={[styles.headerIcon, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        </View>
      </View>

      {/* Stats cards 2x2 grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatsCard
            icon="time-outline"
            label="Focus Time"
            value={formatDuration(totalFocusMinutes)}
            color={colors.primary}
          />
          <StatsCard
            icon="checkmark-circle-outline"
            label="Sessions"
            value={`${focusSessions.length}`}
            color="#059669"
          />
        </View>
        <View style={styles.statsRow}>
          <StatsCard
            icon="flame-outline"
            label="Current Streak"
            value={streak ? `${streak.current_streak}d 🔥` : '0d'}
            color="#EA580C"
          />
          <StatsCard
            icon="trophy-outline"
            label="Daily Goal"
            value={`${todaySessions}/${dailyGoal}`}
            color="#7C3AED"
          />
        </View>
      </View>

      {/* Weekly chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>WEEKLY ACTIVITY</Text>
        <WeeklyChart data={weekChartData} />
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterBar, { backgroundColor: colors.backgroundSecondary }]}>
        {FILTER_TABS.map(({ key, label }) => {
          const active = key === activeFilter
          return (
            <TouchableOpacity
              key={key}
              style={[styles.filterTab, active && { backgroundColor: colors.primary }]}
              onPress={() => setActiveFilter(key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: active ? '#fff' : colors.textSecondary },
                  active && { fontWeight: '700' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )

  const ListEmpty = (
    <View style={styles.emptyWrap}>
      <Ionicons name="book-outline" size={48} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No sessions yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start your first focus session!
      </Text>
    </View>
  )

  if (sessionsLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={listItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !sessionsLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: spacing.xxxl },

  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  screenTitle: {
    ...typography.h2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsGrid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.tiny,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },

  filterBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    padding: 4,
    marginBottom: spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  filterTabText: {
    ...typography.small,
    fontWeight: '500',
  },

  dateHeader: {
    ...typography.captionBold,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
    gap: spacing.md,
  },
  sessionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: { flex: 1 },
  sessionType: {
    ...typography.captionBold,
  },
  sessionTime: {
    ...typography.small,
    marginTop: 2,
  },
  sessionDuration: {
    ...typography.captionBold,
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
  },
})
