import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { spacing, borderRadius, typography } from '@/constants/design'

interface AuthButtonProps {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'outline' | 'ghost'
}

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: AuthButtonProps) {
  const isDisabled = disabled || loading

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.wrapper, isDisabled && styles.disabled]}
      >
        <LinearGradient
          colors={isDisabled ? ['#475569', '#475569'] : ['#6366F1', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primary}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryLabel}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.75}
        style={[styles.outline, isDisabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color="#6366F1" size="small" />
        ) : (
          <Text style={styles.outlineLabel}>{label}</Text>
        )}
      </TouchableOpacity>
    )
  }

  // ghost
  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled} activeOpacity={0.7} style={styles.ghost}>
      <Text style={styles.ghostLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  primary: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primaryLabel: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  outline: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.6)',
    paddingHorizontal: spacing.xl,
  },
  outlineLabel: {
    ...typography.bodyBold,
    color: '#818CF8',
  },
  ghost: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
  },
  ghostLabel: {
    ...typography.caption,
    color: '#818CF8',
  },
  disabled: {
    opacity: 0.5,
  },
})
