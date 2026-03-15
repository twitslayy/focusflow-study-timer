/**
 * FocusFlow – Profile Screen
 * Displays user info, stats grid, achievement badges, and logout.
 */

import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'

import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { blink } from '@/lib/blink'
import { spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudyStreak {
  id: string
  userId: string
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
  totalSessions: number
  totalFocusMinutes: number
}

interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  earned: boolean
  color: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTotalTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function getMemberSince(createdAt?: string | null): string {
  if (!createdAt) return 'Recently'
  return new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getInitials(displayName?: string | null, email?: string | null): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return '?'
}

// ─── Stat Cell ────────────────────────────────────────────────────────────────

interface StatCellProps {
  emoji: string
  label: string
  value: string
}

function StatCell({ emoji, label, value }: StatCellProps) {
  const { colors } = useTheme()
  return (
    <View style={[styles.statCell, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  )
}

// ─── Achievement Badge ────────────────────────────────────────────────────────

interface BadgeProps {
  achievement: Achievement
}

function AchievementBadge({ achievement }: BadgeProps) {
  const { colors } = useTheme()
  const { earned, icon, title, description, color } = achievement

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: earned ? withOpacity(color, 0.1) : colors.backgroundSecondary,
          borderColor: earned ? withOpacity(color, 0.3) : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.badgeIcon,
          {
            backgroundColor: earned ? withOpacity(color, 0.15) : withOpacity(colors.textTertiary, 0.1),
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={22}
          color={earned ? color : colors.textTertiary}
        />
      </View>
      <Text style={[styles.badgeTitle, { color: earned ? colors.text : colors.textTertiary }]}>
        {title}
      </Text>
      <Text style={[styles.badgeDesc, { color: earned ? colors.textSecondary : colors.textTertiary }]} numberOfLines={2}>
        {description}
      </Text>
      {!earned && (
        <View style={[styles.badgeLock, { backgroundColor: withOpacity(colors.textTertiary, 0.1) }]}>
          <Ionicons name="lock-closed" size={10} color={colors.textTertiary} />
        </View>
      )}
    </View>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { colors } = useTheme()
  const { user, signOut } = useAuth()

  const { data: streak, isLoading } = useQuery({
    queryKey: ['study-streak', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const rows = await (blink.db as any).studyStreaks.list({
        where: { userId: user.id },
        limit: 1,
      })
      return (rows[0] as StudyStreak) ?? null
    },
    enabled: !!user?.id,
  })

  const achievements = useMemo<Achievement[]>(() => {
    const total = streak?.totalSessions ?? 0
    const currentStreak = streak?.currentStreak ?? 0
    const longestStreak = streak?.longestStreak ?? 0
    const totalMinutes = streak?.totalFocusMinutes ?? 0

    return [
      {
        id: 'first',
        icon: 'star-outline',
        title: 'First Session',
        description: 'Complete your first focus session',
        earned: total >= 1,
        color: '#F59E0B',
      },
      {
        id: 'week_warrior',
        icon: 'flame-outline',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        earned: longestStreak >= 7,
        color: '#EA580C',
      },
      {
        id: 'century',
        icon: 'trophy-outline',
        title: 'Century',
        description: 'Complete 100 sessions',
        earned: total >= 100,
        color: '#7C3AED',
      },
      {
        id: 'focus_master',
        icon: 'medal-outline',
        title: 'Focus Master',
        description: 'Accumulate 50 hours of focus time',
        earned: totalMinutes >= 3000,
        color: '#059669',
      },
    ]
  }, [streak])

  const handleLogout = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
    await signOut()
    router.replace('/auth/splash')
  }

  const displayName = (user as any)?.displayName ?? (user as any)?.email?.split('@')[0] ?? 'User'
  const email = (user as any)?.email ?? ''
  const initials = getInitials((user as any)?.displayName, email)
  const memberSince = getMemberSince((user as any)?.createdAt)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.screenHeader}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.backgroundSecondary }]}
            onPress={handleLogout}
            activeOpacity={0.7}
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.md]}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{email}</Text>
          <View style={[styles.memberChip, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
            <Text style={[styles.memberText, { color: colors.textTertiary }]}>
              Member since {memberSince}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>YOUR STATS</Text>
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCell
                emoji="🔥"
                label="Current Streak"
                value={`${streak?.currentStreak ?? 0} days`}
              />
              <StatCell
                emoji="⏱️"
                label="Total Focus"
                value={formatTotalTime(streak?.totalFocusMinutes ?? 0)}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCell
                emoji="📚"
                label="Total Sessions"
                value={`${streak?.totalSessions ?? 0}`}
              />
              <StatCell
                emoji="🏆"
                label="Longest Streak"
                value={`${streak?.longestStreak ?? 0} days`}
              />
            </View>
          </View>
        )}

        {/* Achievements */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACHIEVEMENTS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesScroll}
        >
          {achievements.map((a) => (
            <AchievementBadge key={a.id} achievement={a} />
          ))}
        </ScrollView>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: '#EF4444' }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },

  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  screenTitle: { ...typography.h2 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  userCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  userName: { ...typography.h3 },
  userEmail: { ...typography.caption },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  memberText: { ...typography.tiny, fontWeight: '500' },

  sectionLabel: {
    ...typography.tiny,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },

  loadingRow: { paddingVertical: spacing.xl, alignItems: 'center' },

  statsGrid: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCell: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { ...typography.h4 },
  statLabel: { ...typography.small, fontWeight: '500' },

  badgesScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  badge: {
    width: 140,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badgeTitle: { ...typography.captionBold },
  badgeDesc: { ...typography.tiny, lineHeight: 14 },
  badgeLock: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    minHeight: 52,
  },
  logoutText: {
    ...typography.bodyBold,
  },
})
