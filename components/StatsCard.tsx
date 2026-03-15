/**
 * StatsCard – Reusable statistics card component
 * Shows an icon, large value, and label
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context/ThemeContext'
import { spacing, typography, borderRadius, shadows, withOpacity } from '@/constants/design'

interface StatsCardProps {
  icon: string
  label: string
  value: string
  color?: string
}

export default function StatsCard({ icon, label, value, color }: StatsCardProps) {
  const { colors } = useTheme()
  const iconColor = color ?? colors.primary

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}>
      <View style={[styles.iconCircle, { backgroundColor: withOpacity(iconColor, 0.12) }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 148,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h3,
    letterSpacing: -0.5,
  },
  label: {
    ...typography.small,
    fontWeight: '500',
  },
})
