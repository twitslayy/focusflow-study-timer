import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { spacing, borderRadius, typography } from '@/constants/design'

interface AuthInputProps extends TextInputProps {
  label?: string
  icon: keyof typeof Ionicons.glyphMap
  error?: string
  rightIcon?: keyof typeof Ionicons.glyphMap
  onRightIconPress?: () => void
  isDark?: boolean
}

export function AuthInput({
  label,
  icon,
  error,
  rightIcon,
  onRightIconPress,
  isDark = true,
  ...props
}: AuthInputProps) {
  const [focused, setFocused] = useState(false)

  const textColor = isDark ? '#F1F5F9' : '#1E293B'
  const placeholderColor = isDark ? '#64748B' : '#94A3B8'
  const borderColor = error
    ? '#EF4444'
    : focused
    ? '#6366F1'
    : isDark
    ? '#334155'
    : '#E2E8F0'
  const bgColor = isDark ? '#1E293B' : '#F8FAFC'
  const iconColor = focused ? '#6366F1' : isDark ? '#64748B' : '#94A3B8'

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: isDark ? '#CBD5E1' : '#64748B' }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputRow,
          {
            borderColor,
            backgroundColor: bgColor,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} style={styles.leftIcon} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholderTextColor={placeholderColor}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon} hitSlop={8}>
            <Ionicons name={rightIcon} size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.captionBold,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
    padding: 4,
  },
  errorText: {
    ...typography.small,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },
})
