/**
 * DailyProgressCard
 * Shows today's session count vs daily goal with an animated progress bar.
 */

import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { spacing, typography, borderRadius, shadows } from '@/constants/design'
import type { ThemedColors } from '@/context/ThemeContext'

interface DailyProgressCardProps {
  sessionsCompleted: number
  dailyGoal?: number
  colors: ThemedColors
  isDark: boolean
}

const DEFAULT_DAILY_GOAL = 8

export default function DailyProgressCard({
  sessionsCompleted,
  dailyGoal = DEFAULT_DAILY_GOAL,
  colors,
  isDark,
}: DailyProgressCardProps) {
  const progress = useSharedValue(0)
  const clampedProgress = Math.min(sessionsCompleted / dailyGoal, 1)

  useEffect(() => {
    progress.value = withTiming(clampedProgress, { duration: 600 })
  }, [clampedProgress])

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))

  const cardBg = isDark ? colors.backgroundSecondary : colors.backgroundSecondary
  const trackBg = isDark ? colors.backgroundTertiary : colors.backgroundTertiary

  return (
    <View style={[styles.card, { backgroundColor: cardBg }, shadows.sm]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>Today's Progress</Text>
        <Text style={[styles.count, { color: colors.primary }]}>
          {sessionsCompleted}/{dailyGoal}
        </Text>
      </View>

      {/* Progress bar track */}
      <View style={[styles.track, { backgroundColor: trackBg }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: colors.primary },
            barStyle,
          ]}
        />
      </View>

      <Text style={[styles.subtext, { color: colors.textSecondary }]}>
        {sessionsCompleted === 0
          ? 'Start your first session!'
          : sessionsCompleted === 1
          ? '1 session completed today'
          : `${sessionsCompleted} sessions completed today`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.captionBold,
    fontWeight: '600',
  },
  count: {
    ...typography.captionBold,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    minWidth: 4,
  },
  subtext: {
    ...typography.small,
  },
})
