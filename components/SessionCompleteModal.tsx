/**
 * SessionCompleteModal
 * Beautiful overlay shown when a focus session completes.
 * Auto-dismisses after 10 seconds.
 */

import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { spacing, typography, borderRadius, shadows } from '@/constants/design'
import type { ThemedColors } from '@/context/ThemeContext'

interface SessionCompleteModalProps {
  visible: boolean
  focusDuration: number
  colors: ThemedColors
  isDark: boolean
  onStartBreak: () => void
  onKeepGoing: () => void
}

const AUTO_DISMISS_MS = 10_000

export default function SessionCompleteModal({
  visible,
  focusDuration,
  colors,
  isDark,
  onStartBreak,
  onKeepGoing,
}: SessionCompleteModalProps) {
  const scale = useSharedValue(0.8)
  const cardOpacity = useSharedValue(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 })
      cardOpacity.value = withTiming(1, { duration: 250 })

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }

      timerRef.current = setTimeout(() => {
        onKeepGoing()
      }, AUTO_DISMISS_MS)
    } else {
      scale.value = withTiming(0.8, { duration: 200 })
      cardOpacity.value = withTiming(0, { duration: 200 })
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [visible])

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: cardOpacity.value,
  }))

  const cardBg = isDark ? colors.backgroundSecondary : colors.surface

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { backgroundColor: cardBg }, animatedCard]}>
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={48} color="#059669" />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Session Complete! 🎉
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            You completed a {focusDuration} minute focus session
          </Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline, { borderColor: colors.border }]}
              onPress={onKeepGoing}
              activeOpacity={0.75}
            >
              <Text style={[styles.btnText, { color: colors.text }]}>Keep Going</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnFilled, { backgroundColor: colors.primary }]}
              onPress={onStartBreak}
              activeOpacity={0.8}
            >
              <Ionicons name="cafe-outline" size={16} color="#fff" style={styles.btnIcon} />
              <Text style={[styles.btnText, { color: '#fff' }]}>Start Break</Text>
            </TouchableOpacity>
          </View>

          {/* Auto-dismiss hint */}
          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            Auto-dismisses in 10s
          </Text>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.xl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnOutline: {
    borderWidth: 1.5,
  },
  btnFilled: {},
  btnText: {
    ...typography.captionBold,
    fontWeight: '600',
  },
  btnIcon: {
    marginRight: spacing.xs,
  },
  hint: {
    ...typography.small,
    marginTop: spacing.md,
  },
})
